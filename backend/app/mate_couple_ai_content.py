"""MATE 双人报告 AI 增强 — 基于 pair 原子上下文 + 导演层。"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from app.ai_adapter import get_ai_adapter
from app.ai_context_assembler import AssembledAIContext, assemble_pair_context
from app.ai_director import build_director_prompt
from app.report_utils import looks_like_placeholder_report

MATE_COUPLE_OUTPUT_RULES = """
# Output JSON
{
  "matchmaker_advice": {
    "goodNews": "",
    "caution": "",
    "oneChange": ""
  },
  "relationship_portrait": {
    "portrait_line": ""
  },
  "share_line": ""
}
goodNews / caution / oneChange 各 80-120 字；portrait_line 一句双人画像；share_line 20 字内口语化。
禁止 FS/MS 编号与裸分；禁止创造输入之外的新标签。
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


def try_enhance_mate_couple_with_ai(
    *,
    context: AssembledAIContext,
    couple_payload: dict[str, Any],
) -> tuple[dict[str, Any], str]:
    prompt = build_director_prompt(
        task="mate-rehearse",
        context=context,
        extra_rules=MATE_COUPLE_OUTPUT_RULES,
    )
    try:
        raw = get_ai_adapter().generate(prompt, json_mode=True)
        if looks_like_placeholder_report(raw):
            return {}, "deterministic"
        parsed = _parse_json_object(raw)
        if not parsed:
            return {}, "deterministic"

        out: dict[str, Any] = {}
        advice = parsed.get("matchmaker_advice")
        if isinstance(advice, dict):
            merged = dict(couple_payload.get("matchmaker_advice") or {})
            for key in ("goodNews", "caution", "oneChange"):
                if advice.get(key):
                    merged[key] = str(advice[key])
            out["matchmaker_advice"] = merged

        portrait = parsed.get("relationship_portrait")
        if isinstance(portrait, dict) and portrait.get("portrait_line"):
            out["portrait_line"] = str(portrait["portrait_line"])

        if parsed.get("share_line"):
            out["share_line"] = str(parsed["share_line"])

        return out, "ai" if out else "deterministic"
    except Exception:
        return {}, "deterministic"


def attach_mate_couple_ai_content(
    couple_payload: dict[str, Any],
    *,
    use_ai: bool = False,
    force: bool = False,
) -> dict[str, Any]:
    payload = dict(couple_payload)
    existing = payload.get("ai_content") or {}
    if isinstance(existing, dict) and existing.get("mode") == "ai" and not force:
        return payload

    context = assemble_pair_context(payload, product_set="MATE")
    mode = "deterministic"
    extra: dict[str, Any] = {}

    if use_ai:
        extra, mode = try_enhance_mate_couple_with_ai(context=context, couple_payload=payload)

    ai_content = {
        "assembled_context": context.to_prompt_dict(),
        "mode": mode,
        "cached": False,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    if extra.get("matchmaker_advice"):
        payload["matchmaker_advice"] = extra["matchmaker_advice"]
    if extra.get("portrait_line"):
        portrait = dict(payload.get("relationship_portrait") or {})
        portrait["ai_line"] = extra["portrait_line"]
        payload["relationship_portrait"] = portrait
    if extra.get("share_line"):
        payload["shareLine"] = extra["share_line"]

    payload["ai_content"] = {**(existing if isinstance(existing, dict) else {}), **ai_content}
    payload["assembledAiContext"] = context.to_prompt_dict()
    return payload
