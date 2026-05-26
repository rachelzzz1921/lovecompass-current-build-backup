from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from collections.abc import Iterator
from dataclasses import dataclass
from typing import Any, Protocol

from app.semantic_translation import guard_ai_json, guard_ai_output

ChatMessage = dict[str, str]

logger = logging.getLogger(__name__)

REPORT_SYSTEM_PROMPT = (
    "你是 LoveCompass 婚恋分析引擎的表达层。后端已完成全部计算；"
    "你只负责基于给定原子与词库素材，严格按 JSON 结构输出。"
    "优先级：指令遵循 > 结构化 > 不创造新标签 > 文风。"
    "禁止重新算分、禁止恋爱剧情、禁止编造输入中不存在的信息。"
)


class AIAdapter(Protocol):
    """统一 AI 文本生成接口。"""

    def generate(self, prompt: str, *, json_mode: bool = False) -> str:
        ...

    def generate_messages(self, messages: list[ChatMessage], *, json_mode: bool = False) -> str:
        ...

    def stream_messages(self, messages: list[ChatMessage], *, json_mode: bool = False) -> Iterator[str]:
        ...


def _request_payload(
    messages: list[ChatMessage],
    *,
    json_mode: bool,
    stream: bool,
    model: str,
    temperature: float,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "stream": stream,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    return payload


def _parse_sse_chunk(line: bytes) -> str | None:
    text = line.decode("utf-8", errors="ignore").strip()
    if not text.startswith("data:"):
        return None
    data = text[5:].strip()
    if not data or data == "[DONE]":
        return None
    try:
        payload = json.loads(data)
    except json.JSONDecodeError:
        return None
    choices = payload.get("choices") or []
    if not choices:
        return None
    delta = choices[0].get("delta") or {}
    content = delta.get("content")
    return content if isinstance(content, str) and content else None


@dataclass
class MockAIAdapter:
    """开发期降级适配器。"""

    prefix: str = "【AI 占位回复】"

    def generate(self, prompt: str, *, json_mode: bool = False) -> str:
        excerpt = prompt.strip().replace("\n", " ")[:240]
        raw = f"{self.prefix} 当前尚未配置正式模型 Key。已收到上下文：{excerpt}"
        return guard_ai_json(raw) if json_mode else guard_ai_output(raw)

    def generate_messages(self, messages: list[ChatMessage], *, json_mode: bool = False) -> str:
        excerpt = _messages_excerpt(messages)
        raw = f"{self.prefix} 当前尚未配置正式模型 Key。已收到上下文：{excerpt}"
        return guard_ai_json(raw) if json_mode else guard_ai_output(raw)

    def stream_messages(self, messages: list[ChatMessage], *, json_mode: bool = False) -> Iterator[str]:
        full = self.generate_messages(messages, json_mode=json_mode)
        step = 12
        for i in range(0, len(full), step):
            yield full[i : i + step]


def _messages_excerpt(messages: list[ChatMessage], limit: int = 240) -> str:
    parts: list[str] = []
    for item in messages:
        role = item.get("role", "")
        content = (item.get("content") or "").replace("\n", " ")
        if content:
            parts.append(f"{role}:{content[:80]}")
    return " ".join(parts)[:limit]


@dataclass
class ZhipuAIAdapter:
    """智谱 OpenAI-compatible chat/completions。"""

    api_key: str
    base_url: str = "https://open.bigmodel.cn/api/paas/v4"
    model: str = "glm-4.5-air"
    timeout_seconds: int = 45

    def generate(self, prompt: str, *, json_mode: bool = False) -> str:
        messages: list[ChatMessage] = [
            {"role": "system", "content": REPORT_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]
        return self.generate_messages(messages, json_mode=json_mode)

    def generate_messages(self, messages: list[ChatMessage], *, json_mode: bool = False) -> str:
        api_messages = messages
        if json_mode and (not messages or messages[0].get("role") != "system"):
            api_messages = [{"role": "system", "content": REPORT_SYSTEM_PROMPT}, *messages]

        payload = _request_payload(
            api_messages,
            json_mode=json_mode,
            stream=False,
            model=self.model,
            temperature=0.25 if json_mode else 0.45,
        )
        data = self._post_json(payload)
        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError(
                f"智谱 API 响应结构不符合预期：{json.dumps(data, ensure_ascii=False)[:500]}"
            ) from exc
        if json_mode:
            return guard_ai_json(content)
        return guard_ai_output(content)

    def stream_messages(self, messages: list[ChatMessage], *, json_mode: bool = False) -> Iterator[str]:
        if json_mode:
            yield self.generate_messages(messages, json_mode=True)
            return

        payload = _request_payload(
            messages,
            json_mode=False,
            stream=True,
            model=self.model,
            temperature=0.45,
        )
        url = self.base_url.rstrip("/") + "/chat/completions"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                for raw_line in resp:
                    chunk = _parse_sse_chunk(raw_line)
                    if chunk:
                        yield chunk
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"智谱 API 流式请求失败：HTTP {exc.code} {body[:300]}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"智谱 API 网络请求失败：{exc.reason}") from exc

    def _post_json(self, payload: dict[str, Any]) -> dict[str, Any]:
        url = self.base_url.rstrip("/") + "/chat/completions"
        logger.info(
            "zhipu chat/completions model=%s stream=%s json_mode=%s",
            payload.get("model"),
            payload.get("stream"),
            bool(payload.get("response_format")),
        )
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"智谱 API 请求失败：HTTP {exc.code} {body[:300]}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"智谱 API 网络请求失败：{exc.reason}") from exc


def get_ai_adapter() -> AIAdapter:
    provider = os.getenv("AI_PROVIDER", "mock").strip().lower()
    if provider == "zhipu":
        api_key = os.getenv("ZHIPU_API_KEY", "").strip()
        if not api_key:
            return MockAIAdapter(prefix="【智谱未配置】")
        return ZhipuAIAdapter(
            api_key=api_key,
            base_url=os.getenv("ZHIPU_BASE_URL", "https://open.bigmodel.cn/api/paas/v4"),
            model=os.getenv("ZHIPU_MODEL", "glm-4.5-air"),
        )
    return MockAIAdapter()
