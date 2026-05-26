"""MATE 双人报告 AI 增强 — v4 仅润色 action_item 与高分 texture。"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any

from psycopg.types.json import Jsonb

from app.ai_adapter import get_ai_adapter
from app.ai_context_assembler import AssembledAIContext, assemble_pair_context
from app.ai_director import build_director_prompt
from app.report_utils import looks_like_placeholder_report

MATE_COUPLE_V4_OUTPUT_RULES = """
# Output JSON
{
  "action_item": "",
  "texture": ""
}
action_item：基于 problem + base_suggestion 润色成口语化建议，≤40字，只输出一句。
texture：仅当 score≥80 时输出关系质感描述，≤50字；否则留空字符串。
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


def try_enhance_mate_couple_v4_with_ai(
    *,
    context: AssembledAIContext,
    couple_payload: dict[str, Any],
) -> tuple[dict[str, Any], str]:
    ai_ctx = couple_payload.get("ai_context") or {}
    score = int((couple_payload.get("verdict") or {}).get("score") or ai_ctx.get("score") or 0)
    problem = str(ai_ctx.get("problem") or "")
    base = str(ai_ctx.get("base_suggestion") or "")
    if not problem and score < 80:
        return {}, "deterministic"

    prompt = build_director_prompt(
        task="mate-rehearse",
        context=context,
        extra_rules=MATE_COUPLE_V4_OUTPUT_RULES
        + f"\n\nproblem: {problem}\nbase_suggestion: {base}\nscore: {score}",
    )
    try:
        raw = get_ai_adapter().generate(prompt, json_mode=True)
        if looks_like_placeholder_report(raw):
            return {}, "deterministic"
        parsed = _parse_json_object(raw)
        if not parsed:
            return {}, "deterministic"

        out: dict[str, Any] = {}
        if parsed.get("action_item"):
            out["action_item"] = str(parsed["action_item"])[:40]
        if score >= 80 and parsed.get("texture"):
            out["texture"] = str(parsed["texture"])[:50]
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
    existing = payload.get("ai_enrichment") or {}
    if isinstance(existing, dict) and existing.get("mode") == "ai" and not force:
        return payload

    context = assemble_pair_context(payload, product_set="MATE")
    mode = "deterministic"
    extra: dict[str, Any] = {}

    if use_ai:
        extra, mode = try_enhance_mate_couple_v4_with_ai(context=context, couple_payload=payload)

    if extra.get("action_item"):
        conclusion = dict(payload.get("conclusion") or {})
        conclusion["action_item"] = extra["action_item"]
        conclusion["ai_pending"] = False
        payload["conclusion"] = conclusion

    if extra.get("texture"):
        verdict = dict(payload.get("verdict") or {})
        verdict["texture"] = extra["texture"]
        payload["verdict"] = verdict

    payload["ai_enrichment"] = {
        **(existing if isinstance(existing, dict) else {}),
        "mode": mode,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    payload["assembledAiContext"] = context.to_model_safe_prompt_dict()
    return payload


def enhance_mate_couple_for_session(
    conn: Any,
    session_id: str,
    *,
    use_ai: bool = True,
    force: bool = False,
) -> dict[str, Any] | None:
    row = conn.execute(
        "SELECT couple_payload FROM public.mate_relation_sessions WHERE id = %s",
        (session_id,),
    ).fetchone()
    if not row:
        return None
    payload = row.get("couple_payload") or {}
    if not isinstance(payload, dict) or not payload:
        return None
    updated = attach_mate_couple_ai_content(payload, use_ai=use_ai, force=force)
    return updated if updated != payload else None


def enhance_mate_couple_session_background(session_id: str) -> None:
    if os.getenv("AI_PROVIDER", "mock").strip().lower() != "zhipu":
        return
    try:
        from app.db import get_conn

        with get_conn() as conn:
            updated = enhance_mate_couple_for_session(conn, session_id, use_ai=True, force=False)
            if not updated:
                return
            conn.execute(
                "UPDATE public.mate_relation_sessions SET couple_payload = %s WHERE id = %s",
                (Jsonb(updated), session_id),
            )
            conn.commit()
    except Exception:
        return
