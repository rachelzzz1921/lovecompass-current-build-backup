from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any, Protocol

from app.semantic_translation import guard_ai_json, guard_ai_output


class AIAdapter(Protocol):
    """统一 AI 文本生成接口。

    业务层只依赖 generate(prompt)，不依赖具体模型供应商、SDK、鉴权或响应结构。
    """

    def generate(self, prompt: str, *, json_mode: bool = False) -> str:
        ...


@dataclass
class MockAIAdapter:
    """开发期降级适配器。

    当本地没有配置 ZHIPU_API_KEY 时，接口仍能完成闭环，方便前端联调。
    """

    prefix: str = "【AI 占位回复】"

    def generate(self, prompt: str, *, json_mode: bool = False) -> str:
        excerpt = prompt.strip().replace("\n", " ")[:240]
        raw = f"{self.prefix} 当前尚未配置正式模型 Key。已收到上下文：{excerpt}"
        return guard_ai_json(raw) if json_mode else guard_ai_output(raw)


@dataclass
class ZhipuAIAdapter:
    """智谱 AI 适配器。

    默认使用 OpenAI-compatible 的 chat/completions 形态。若后续更换模型或 SDK，
    只需要替换本类实现，业务入口保持不变。
    """

    api_key: str
    base_url: str = "https://open.bigmodel.cn/api/paas/v4"
    model: str = "glm-4-flash"
    timeout_seconds: int = 45

    def generate(self, prompt: str, *, json_mode: bool = False) -> str:
        url = self.base_url.rstrip("/") + "/chat/completions"
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "你是 LoveCompass 婚恋档案导演。后端已完成计算；你只负责基于给定原子与素材表达，禁止重新算分或创造新标签。"},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
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
                data = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"智谱 API 请求失败：HTTP {exc.code} {body[:300]}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"智谱 API 网络请求失败：{exc.reason}") from exc

        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise RuntimeError(f"智谱 API 响应结构不符合预期：{json.dumps(data, ensure_ascii=False)[:500]}") from exc

        if json_mode:
            return guard_ai_json(content)
        return guard_ai_output(content)


def get_ai_adapter() -> AIAdapter:
    provider = os.getenv("AI_PROVIDER", "mock").strip().lower()
    if provider == "zhipu":
        api_key = os.getenv("ZHIPU_API_KEY", "").strip()
        if not api_key:
            return MockAIAdapter(prefix="【智谱未配置】")
        return ZhipuAIAdapter(
            api_key=api_key,
            base_url=os.getenv("ZHIPU_BASE_URL", "https://open.bigmodel.cn/api/paas/v4"),
            model=os.getenv("ZHIPU_MODEL", "glm-4-flash"),
        )
    return MockAIAdapter()
