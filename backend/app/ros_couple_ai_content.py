"""ROS 双人报告 AI 增强 — 基于 pair 原子上下文 + 导演层。"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from app.ai_adapter import get_ai_adapter
from app.ai_context_assembler import AssembledAIContext, assemble_ros_pair_context
from app.ai_director import build_director_prompt
from app.report_utils import looks_like_placeholder_report

ROS_COUPLE_OUTPUT_RULES = """
# Output JSON
{
  "insights": [
    {"kind":"strength","title":"","body":""},
    {"kind":"watch","title":"","body":""},
    {"kind":"advice","title":"","body":""},
    {"kind":"action","title":"","body":""}
  ],
  "highlights": {"glow":"","shadow":""},
  "bridge": "",
  "shareLine": ""
}
4 条洞察各 100-130 字；highlights 各一句；bridge 一句打破循环的话；shareLine 20 字内。
禁止 AT–RK 编号与裸分；禁止劝分；禁止创造输入之外的新标签。
""".strip()


def _parse_json_object(raw: str) -> dict[str, Any] | None:
    text = raw.strip()
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        data = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


def _normalize_insights(raw: Any, fallback: list[dict[str, str]]) -> list[dict[str, str]]:
    if not isinstance(raw, list):
        return fallback
    kinds = {"strength", "watch", "advice", "action"}
    out: list[dict[str, str]] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        kind = str(item.get("kind") or "")
        if kind not in kinds:
            continue
        body = str(item.get("body") or "").strip()
        if not body:
            continue
        out.append({"kind": kind, "title": str(item.get("title") or ""), "body": body})
    return out if len(out) >= 4 else fallback


def try_enhance_ros_couple_with_ai(
    *,
    context: AssembledAIContext,
    couple_payload: dict[str, Any],
) -> tuple[dict[str, Any], str]:
    prompt = build_director_prompt(
        task="mate-lens",
        context=context,
        extra_rules=ROS_COUPLE_OUTPUT_RULES,
    )
    fallback_insights = couple_payload.get("insights") or []
    if not isinstance(fallback_insights, list):
        fallback_insights = []

    try:
        raw = get_ai_adapter().generate(prompt, json_mode=True)
        if looks_like_placeholder_report(raw):
            return {}, "deterministic"
        parsed = _parse_json_object(raw)
        if not parsed:
            return {}, "deterministic"

        insights = _normalize_insights(parsed.get("insights"), fallback_insights)
        out: dict[str, Any] = {"insights": insights, "insights_list": insights}

        highlights = parsed.get("highlights")
        if isinstance(highlights, dict):
            merged = dict(couple_payload.get("highlights") or {})
            if highlights.get("glow"):
                merged["glow"] = str(highlights["glow"])
            if highlights.get("shadow"):
                merged["shadow"] = str(highlights["shadow"])
            out["highlights"] = merged

        if parsed.get("bridge"):
            out["bridge"] = str(parsed["bridge"])
        if parsed.get("shareLine"):
            out["shareLine"] = str(parsed["shareLine"])

        return out, "ai"
    except Exception:
        return {}, "deterministic"


def attach_ros_couple_ai_content(
    couple_payload: dict[str, Any],
    *,
    use_ai: bool = False,
    force: bool = False,
) -> dict[str, Any]:
    payload = dict(couple_payload)
    existing = payload.get("ai_content") or {}
    if isinstance(existing, dict) and existing.get("mode") == "ai" and not force:
        return payload

    context = assemble_ros_pair_context(payload)
    mode = "deterministic"
    extra: dict[str, Any] = {}

    if use_ai:
        extra, mode = try_enhance_ros_couple_with_ai(context=context, couple_payload=payload)

    ai_content = {
        "insights_list": extra.get("insights") or payload.get("insights") or [],
        "layer_compare": payload.get("layerCompare") or {},
        "assembled_context": context.to_model_safe_prompt_dict(),
        "mode": mode,
        "cached": False,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    if extra.get("insights"):
        payload["insights"] = extra["insights"]
    if extra.get("highlights"):
        payload["highlights"] = extra["highlights"]
    if extra.get("bridge"):
        payload["bridge"] = extra["bridge"]
    if extra.get("shareLine"):
        payload["shareLine"] = extra["shareLine"]

    payload["ai_content"] = ai_content
    payload["assembledAiContext"] = context.to_model_safe_prompt_dict()
    return payload
