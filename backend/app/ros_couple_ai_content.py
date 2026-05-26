"""ROS 双人报告 Layer C：层间差距解读、洞察四卡、处方签、pattern 缓存。"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any

from psycopg.types.json import Jsonb

from app.ai_adapter import get_ai_adapter
from app.ai_context_assembler import AssembledAIContext, assemble_ros_pair_context
from app.ai_director import build_director_prompt
from app.core_traits import load_attempt_answer_rows
from app.report_utils import looks_like_placeholder_report
from app.ros_ai_content import compute_score_pattern
from app.ros_couple_content import normalize_attachment
from app.ros_scoring import ROS_LAYER_CODES

ROS_COUPLE_OUTPUT_RULES = """
# Output JSON
{
  "insights": [
    {"kind":"strength","title":"","body":""},
    {"kind":"watch","title":"","body":""},
    {"kind":"advice","title":"","body":""},
    {"kind":"action","title":"","body":""}
  ],
  "layer_gaps": {
    "ev": {"gap_text":"","you_evidence":"","ta_evidence":""}
  },
  "prescription": {"complaint":"","prescription":"","followup":""},
  "highlights": {"glow":"","shadow":""},
  "bridge": "",
  "shareLine": ""
}
4 条洞察各 100-130 字；layer_gaps 仅填差距最大的一层；prescription 主诉 10-20 字、建议 20-35 字。
禁止 AT–RK 编号与裸分；禁止劝分；禁止创造输入之外的新标签。
""".strip()


def couple_payload_is_legacy(payload: dict[str, Any] | None) -> bool:
    if not isinstance(payload, dict) or not payload:
        return True
    if not isinstance(payload.get("layerCompare"), dict):
        return True
    if not isinstance(payload.get("perspectives"), dict):
        return True
    if not payload.get("insights"):
        return True
    return False


def couple_payload_needs_attach(payload: dict[str, Any]) -> bool:
    if couple_payload_is_legacy(payload):
        return False
    ai = payload.get("ai_content") or {}
    if not isinstance(ai, dict) or not ai.get("generated_at"):
        return True
    if not ai.get("layer_compare") and payload.get("layerCompare"):
        return True
    if "gap_evidences" not in ai and payload.get("layerCompare"):
        return True
    return False


def couple_pattern_cache_key(
    rel_type: str,
    you_attachment: str | None,
    ta_attachment: str | None,
    you_layers: dict[str, float] | None,
    ta_layers: dict[str, float] | None,
) -> str:
    bond = f"{normalize_attachment(you_attachment)}×{normalize_attachment(ta_attachment)}"
    you_pat = compute_score_pattern(you_layers)
    ta_pat = compute_score_pattern(ta_layers)
    return f"{rel_type.strip()}:{bond}:{you_pat}:{ta_pat}"


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


def _pick_evidence_row(rows: list[dict[str, Any]], layer: str) -> dict[str, Any] | None:
    layer = layer.upper()
    picked = [
        r
        for r in rows
        if str(r.get("dimension_code") or "").upper() == layer
        and str(r.get("direction") or "") != "auxiliary"
    ]
    picked.sort(key=lambda r: float(r.get("weight") or 1), reverse=True)
    return picked[0] if picked else None


def _evidence_line(row: dict[str, Any] | None, who: str) -> str:
    if not row:
        return ""
    qpayload = row.get("question_payload") or {}
    if not isinstance(qpayload, dict):
        qpayload = {}
    answer = row.get("answer_payload") or {}
    if not isinstance(answer, dict):
        answer = {}
    scene = str(qpayload.get("scene") or row.get("question_text") or "这道题").strip()
    scene_short = scene[:24] + ("…" if len(scene) > 24 else "")

    options = qpayload.get("options") or []
    chosen = ""
    key = answer.get("optionKey")
    idx = answer.get("optionIndex")
    if key:
        opt = next((o for o in options if str(o.get("key")) == str(key)), None)
        if opt:
            chosen = str(opt.get("label") or opt.get("text") or "")
    if not chosen and idx is not None and 0 <= int(idx) < len(options):
        chosen = str(options[int(idx)].get("label") or options[int(idx)].get("text") or "")

    if chosen:
        return f"{who}在「{scene_short}」选了「{chosen}」"
    return f"{who}在「{scene_short}」的作答模式"


def build_gap_evidences(
    *,
    you_rows: list[dict[str, Any]],
    ta_rows: list[dict[str, Any]],
    layer_compare: dict[str, Any],
) -> dict[str, Any]:
    out: dict[str, Any] = {}
    if not isinstance(layer_compare, dict):
        return out
    for code in ROS_LAYER_CODES:
        key = code.lower()
        layer = layer_compare.get(key)
        if not isinstance(layer, dict):
            continue
        you_line = _evidence_line(_pick_evidence_row(you_rows, code), "你")
        ta_line = _evidence_line(_pick_evidence_row(ta_rows, code), "对方")
        if you_line or ta_line:
            out[key] = {
                "you_evidence": you_line,
                "ta_evidence": ta_line,
            }
    return out


def merge_gap_evidences_into_compare(
    layer_compare: dict[str, Any],
    gap_evidences: dict[str, Any],
) -> dict[str, Any]:
    merged = dict(layer_compare)
    for key, evidence in gap_evidences.items():
        if key not in merged or not isinstance(merged[key], dict):
            continue
        item = dict(merged[key])
        if evidence.get("you_evidence"):
            item["you_evidence"] = evidence["you_evidence"]
        if evidence.get("ta_evidence"):
            item["ta_evidence"] = evidence["ta_evidence"]
        merged[key] = item
    return merged


def build_couple_prescription_deterministic(couple_payload: dict[str, Any]) -> dict[str, str]:
    rx = couple_payload.get("prescription") or {}
    if not isinstance(rx, dict):
        rx = {}
    gap = couple_payload.get("gap") or {}
    layer_compare = couple_payload.get("layerCompare") or {}
    biggest_key = str((couple_payload.get("computed") or {}).get("biggest_gap_layer") or gap.get("dimKey") or "ev")
    layer = layer_compare.get(biggest_key) if isinstance(layer_compare, dict) else {}
    gap_val = layer.get("gap") if isinstance(layer, dict) else ""
    label = layer.get("label") if isinstance(layer, dict) else gap.get("dimLabel") or "关系走向"
    complaint = str(rx.get("chiefComplaint") or f"{label}层感知差距{gap_val} 分").strip()
    prescription = str(rx.get("rx") or "每周一次\n各说一件「想说但没说的话」").strip()
    followup = str(rx.get("followUp") or "三个月后").strip()
    return {"complaint": complaint, "prescription": prescription, "followup": followup}


def fetch_couple_pattern_cache(conn: Any, pattern_key: str) -> dict[str, Any] | None:
    try:
        row = conn.execute(
            """
            SELECT insights, layer_gaps, prescription, highlights, bridge, share_line, generation_mode, hit_count
            FROM public.ros_couple_ai_pattern_cache
            WHERE pattern_key = %s
            """,
            (pattern_key,),
        ).fetchone()
    except Exception:
        return None
    if not row:
        return None
    try:
        conn.execute(
            "UPDATE public.ros_couple_ai_pattern_cache SET hit_count = hit_count + 1 WHERE pattern_key = %s",
            (pattern_key,),
        )
    except Exception:
        pass
    return dict(row)


def save_couple_pattern_cache(
    conn: Any,
    *,
    pattern_key: str,
    rel_type: str,
    bond_combo: str,
    you_pattern: str,
    ta_pattern: str,
    ai_bundle: dict[str, Any],
) -> None:
    try:
        conn.execute(
            """
            INSERT INTO public.ros_couple_ai_pattern_cache(
              pattern_key, relationship_type, bond_combo,
              you_score_pattern, ta_score_pattern,
              insights, layer_gaps, prescription, highlights, bridge, share_line, generation_mode
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (pattern_key) DO UPDATE SET
              insights = EXCLUDED.insights,
              layer_gaps = EXCLUDED.layer_gaps,
              prescription = EXCLUDED.prescription,
              highlights = EXCLUDED.highlights,
              bridge = EXCLUDED.bridge,
              share_line = EXCLUDED.share_line,
              generation_mode = EXCLUDED.generation_mode,
              updated_at = now()
            """,
            (
                pattern_key,
                rel_type,
                bond_combo,
                you_pattern,
                ta_pattern,
                Jsonb(ai_bundle.get("insights") or []),
                Jsonb(ai_bundle.get("layer_gaps") or {}),
                Jsonb(ai_bundle.get("prescription") or {}),
                Jsonb(ai_bundle.get("highlights") or {}),
                ai_bundle.get("bridge"),
                ai_bundle.get("shareLine"),
                ai_bundle.get("mode") or "deterministic",
            ),
        )
    except Exception:
        return


def _apply_cached_couple_ai(payload: dict[str, Any], cached: dict[str, Any]) -> dict[str, Any]:
    out = dict(payload)
    insights_raw = cached.get("insights")
    if isinstance(insights_raw, list) and len(insights_raw) >= 4:
        out["insights"] = [dict(i) for i in insights_raw if isinstance(i, dict)]

    layer_gaps = cached.get("layer_gaps") or {}
    if isinstance(layer_gaps, dict) and out.get("layerCompare"):
        compare = dict(out["layerCompare"])
        for key, gap_item in layer_gaps.items():
            if key in compare and isinstance(compare[key], dict) and isinstance(gap_item, dict):
                merged = dict(compare[key])
                if gap_item.get("gap_text"):
                    merged["gap_text"] = gap_item["gap_text"]
                if gap_item.get("you_evidence"):
                    merged["you_evidence"] = gap_item["you_evidence"]
                if gap_item.get("ta_evidence"):
                    merged["ta_evidence"] = gap_item["ta_evidence"]
                compare[key] = merged
        out["layerCompare"] = compare

    rx = cached.get("prescription") or {}
    if isinstance(rx, dict) and rx.get("complaint"):
        pres = dict(out.get("prescription") or {})
        pres["chiefComplaint"] = rx.get("complaint") or pres.get("chiefComplaint")
        pres["rx"] = rx.get("prescription") or pres.get("rx")
        pres["followUp"] = rx.get("followup") or pres.get("followUp")
        out["prescription"] = pres

    highlights = cached.get("highlights")
    if isinstance(highlights, dict):
        merged_h = dict(out.get("highlights") or {})
        if highlights.get("glow"):
            merged_h["glow"] = highlights["glow"]
        if highlights.get("shadow"):
            merged_h["shadow"] = highlights["shadow"]
        out["highlights"] = merged_h

    if cached.get("bridge"):
        out["bridge"] = cached["bridge"]
    if cached.get("share_line"):
        out["shareLine"] = cached["share_line"]

    out["ai_content"] = {
        **(out.get("ai_content") or {}),
        "insights_list": out.get("insights") or [],
        "layer_compare": out.get("layerCompare") or {},
        "prescription": rx if isinstance(rx, dict) else {},
        "mode": cached.get("generation_mode") or "cached",
        "cached": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    return out


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
        out: dict[str, Any] = {
            "insights": insights,
            "insights_list": insights,
            "mode": "ai",
        }

        layer_gaps = parsed.get("layer_gaps")
        if isinstance(layer_gaps, dict):
            out["layer_gaps"] = layer_gaps

        prescription = parsed.get("prescription")
        if isinstance(prescription, dict):
            out["prescription"] = {
                "complaint": str(prescription.get("complaint") or ""),
                "prescription": str(prescription.get("prescription") or prescription.get("prescription_text") or ""),
                "followup": str(prescription.get("followup") or prescription.get("followUp") or ""),
            }

        highlights = parsed.get("highlights")
        if isinstance(highlights, dict):
            out["highlights"] = highlights

        if parsed.get("bridge"):
            out["bridge"] = str(parsed["bridge"])
        if parsed.get("shareLine"):
            out["shareLine"] = str(parsed["shareLine"])

        return out, "ai"
    except Exception:
        return {}, "deterministic"


def _apply_ai_bundle(payload: dict[str, Any], extra: dict[str, Any]) -> dict[str, Any]:
    out = dict(payload)
    if extra.get("insights"):
        out["insights"] = extra["insights"]

    layer_gaps = extra.get("layer_gaps") or {}
    if isinstance(layer_gaps, dict) and out.get("layerCompare"):
        compare = dict(out["layerCompare"])
        for key, gap_item in layer_gaps.items():
            if key in compare and isinstance(compare[key], dict) and isinstance(gap_item, dict):
                merged = dict(compare[key])
                if gap_item.get("gap_text"):
                    merged["gap_text"] = gap_item["gap_text"]
                if gap_item.get("you_evidence"):
                    merged["you_evidence"] = gap_item["you_evidence"]
                if gap_item.get("ta_evidence"):
                    merged["ta_evidence"] = gap_item["ta_evidence"]
                compare[key] = merged
        out["layerCompare"] = compare

    rx = extra.get("prescription") or {}
    if isinstance(rx, dict) and rx.get("complaint"):
        pres = dict(out.get("prescription") or {})
        pres["chiefComplaint"] = rx.get("complaint") or pres.get("chiefComplaint")
        pres["rx"] = rx.get("prescription") or pres.get("rx")
        pres["followUp"] = rx.get("followup") or pres.get("followUp")
        out["prescription"] = pres

    if extra.get("highlights"):
        merged_h = dict(out.get("highlights") or {})
        hl = extra["highlights"]
        if isinstance(hl, dict):
            if hl.get("glow"):
                merged_h["glow"] = hl["glow"]
            if hl.get("shadow"):
                merged_h["shadow"] = hl["shadow"]
        out["highlights"] = merged_h

    if extra.get("bridge"):
        out["bridge"] = extra["bridge"]
    if extra.get("shareLine"):
        out["shareLine"] = extra["shareLine"]
    return out


def _layer_scores_from_dims(dims: Any) -> tuple[dict[str, float], dict[str, float]]:
    you: dict[str, float] = {}
    ta: dict[str, float] = {}
    if not isinstance(dims, list):
        return you, ta
    for item in dims:
        if not isinstance(item, dict):
            continue
        key = str(item.get("key") or "").upper()
        if key not in ROS_LAYER_CODES:
            continue
        try:
            you[key] = float(item.get("you") or 0)
            ta[key] = float(item.get("ta") or 0)
        except (TypeError, ValueError):
            continue
    return you, ta


def attach_ros_couple_ai_content(
    couple_payload: dict[str, Any],
    *,
    conn: Any | None = None,
    initiator_attempt_id: str | None = None,
    partner_attempt_id: str | None = None,
    use_ai: bool = False,
    force: bool = False,
) -> dict[str, Any]:
    payload = dict(couple_payload)
    existing = payload.get("ai_content") or {}
    if isinstance(existing, dict) and existing.get("mode") in {"ai", "cached"} and not force:
        return payload

    rel = payload.get("type") or {}
    rel_name = str((rel or {}).get("name") or "温水同行")
    bond = payload.get("bond") or {}
    you_att = bond.get("you_type") if isinstance(bond, dict) else None
    ta_att = bond.get("ta_type") if isinstance(bond, dict) else None
    you_layers, ta_layers = _layer_scores_from_dims(payload.get("dims"))

    you_rows: list[dict[str, Any]] = []
    ta_rows: list[dict[str, Any]] = []
    if conn and initiator_attempt_id:
        you_rows = load_attempt_answer_rows(conn, initiator_attempt_id)
    if conn and partner_attempt_id:
        ta_rows = load_attempt_answer_rows(conn, partner_attempt_id)

    layer_compare = payload.get("layerCompare") or {}
    gap_evidences = build_gap_evidences(
        you_rows=you_rows,
        ta_rows=ta_rows,
        layer_compare=layer_compare if isinstance(layer_compare, dict) else {},
    )
    if gap_evidences:
        payload["layerCompare"] = merge_gap_evidences_into_compare(
            layer_compare if isinstance(layer_compare, dict) else {},
            gap_evidences,
        )

    pattern_key = couple_pattern_cache_key(rel_name, you_att, ta_att, you_layers, ta_layers)
    cached = fetch_couple_pattern_cache(conn, pattern_key) if conn else None
    if cached and not use_ai and not force:
        return _apply_cached_couple_ai(payload, cached)

    context = assemble_ros_pair_context(payload)
    mode = "deterministic"
    extra: dict[str, Any] = {}
    rx_det = build_couple_prescription_deterministic(payload)

    if use_ai and os.getenv("AI_PROVIDER", "mock").strip().lower() == "zhipu":
        extra, mode = try_enhance_ros_couple_with_ai(context=context, couple_payload=payload)
        if mode == "ai" and conn:
            save_couple_pattern_cache(
                conn,
                pattern_key=pattern_key,
                rel_type=rel_name,
                bond_combo=f"{normalize_attachment(you_att)}×{normalize_attachment(ta_att)}",
                you_pattern=compute_score_pattern(you_layers),
                ta_pattern=compute_score_pattern(ta_layers),
                ai_bundle={**extra, "mode": mode},
            )

    payload = _apply_ai_bundle(payload, extra)

    ai_content = {
        "insights_list": payload.get("insights") or [],
        "layer_compare": payload.get("layerCompare") or {},
        "gap_evidences": gap_evidences,
        "prescription": rx_det if mode != "ai" else extra.get("prescription") or rx_det,
        "assembled_context": context.to_model_safe_prompt_dict(),
        "mode": mode,
        "cached": False,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    payload["ai_content"] = ai_content
    payload["assembledAiContext"] = context.to_model_safe_prompt_dict()
    return payload


def enhance_ros_couple_for_session(
    conn: Any,
    session_id: Any,
    *,
    use_ai: bool = True,
    force: bool = False,
) -> dict[str, Any] | None:
    row = conn.execute(
        "SELECT couple_payload, initiator_attempt_id, partner_attempt_id FROM public.ros_relation_sessions WHERE id = %s",
        (session_id,),
    ).fetchone()
    if not row:
        return None
    payload = row.get("couple_payload") or {}
    if not isinstance(payload, dict) or not payload:
        return None
    existing = payload.get("ai_content") or {}
    if not force and isinstance(existing, dict) and existing.get("mode") in {"ai", "cached"}:
        return None

    updated = attach_ros_couple_ai_content(
        payload,
        conn=conn,
        initiator_attempt_id=str(row.get("initiator_attempt_id") or ""),
        partner_attempt_id=str(row.get("partner_attempt_id") or ""),
        use_ai=use_ai,
        force=force,
    )
    return updated


def enhance_ros_couple_session_background(session_id: str) -> None:
    """Background upgrade: deterministic → AI + pattern cache."""
    if os.getenv("AI_PROVIDER", "mock").strip().lower() != "zhipu":
        return
    try:
        from app.db import get_conn

        with get_conn() as conn:
            updated = enhance_ros_couple_for_session(conn, session_id, use_ai=True, force=False)
            if not updated:
                return
            conn.execute(
                "UPDATE public.ros_relation_sessions SET couple_payload = %s WHERE id = %s",
                (Jsonb(updated), session_id),
            )
            conn.commit()
    except Exception:
        return
