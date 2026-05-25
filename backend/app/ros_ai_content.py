"""ROS 结果页 Layer B/C：五维证据、洞察四卡、处方签、盲区提示。"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from app.ai_context_assembler import assemble_ros_context
from app.ai_director import build_director_prompt
from app.ai_adapter import get_ai_adapter
from app.core_traits import load_attempt_answer_rows
from app.report_utils import looks_like_placeholder_report
from app.ros_scoring import ROS_LAYER_CODES, ROS_LAYER_LABELS, resolve_weather
from app.ros_static_copy import (
    attach_static_copy_to_payload,
    layer_probe,
    layer_subdim_defs,
    subdim_summary,
    tier_label,
)
from app.scoring import _clamp

LAYER_ORDER = ROS_LAYER_CODES


def compute_score_pattern(layer_scores: dict[str, float] | None) -> str:
    scores = {str(k).upper(): float(v) for k, v in (layer_scores or {}).items()}
    parts: list[str] = []
    for code in LAYER_ORDER:
        raw = scores.get(code, 0.0)
        band = int(max(0, min(100, round(raw))) // 5 * 5)
        parts.append(str(band))
    return "_".join(parts)


def pattern_cache_key(rel_type: str, gender: str, layer_scores: dict[str, float] | None) -> str:
    return f"{rel_type.strip()}:{gender.strip()}:{compute_score_pattern(layer_scores)}"


def build_layer_subdims(layer: str, layer_score: float) -> list[dict[str, Any]]:
    base = float(layer_score)
    out: list[dict[str, Any]] = []
    for item in layer_subdim_defs(layer):
        offset = float(item.get("offset") or 0)
        score = round(_clamp(base + offset))
        out.append(
            {
                "key": str(item.get("key") or ""),
                "label": str(item.get("label") or ""),
                "score": score,
                "summary": subdim_summary(score),
            }
        )
    return out


def _pick_evidence_rows(rows: list[dict[str, Any]], layer: str, limit: int = 3) -> list[dict[str, Any]]:
    layer = layer.upper()
    picked: list[dict[str, Any]] = []
    for row in rows:
        if str(row.get("dimension_code") or "").upper() != layer:
            continue
        if str(row.get("direction") or "") == "auxiliary":
            continue
        picked.append(row)
    picked.sort(key=lambda r: float(r.get("weight") or 1), reverse=True)
    return picked[:limit]


def _evidence_from_row(row: dict[str, Any]) -> dict[str, str]:
    qpayload = row.get("question_payload") or {}
    if not isinstance(qpayload, dict):
        qpayload = {}
    answer = row.get("answer_payload") or {}
    if not isinstance(answer, dict):
        answer = {}
    scene = str(qpayload.get("scene") or row.get("question_text") or "这道题").strip()
    scene_short = scene[:28] + ("…" if len(scene) > 28 else "")

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

    if not chosen and "value" in answer:
        chosen = f"你的回答落在 {int(float(answer['value']))} 这个位置"

    body = (
        f"你在「{scene_short}」那题选了「{chosen}」——"
        if chosen
        else f"你在「{scene_short}」那题的作答模式，"
    )
    layer = str(row.get("dimension_code") or "").upper()
    score = float(row.get("numeric_score") or 50)
    if layer == "RK":
        tail = "这说明你们对风险信号并非完全无感，值得把感受说具体。"
    elif score >= 65:
        tail = "这背后有一种想把关系守住的意愿，也在慢慢形成你们的相处节奏。"
    else:
        tail = "这背后有一个值得被看见的模式——不是缺陷，而是你们还在找更合适的靠近方式。"
    return {
        "question_short": scene_short,
        "chosen_label": chosen,
        "evidence_text": body + tail,
    }


def build_layer_evidence(
    rows: list[dict[str, Any]],
    layer: str,
    layer_score: float,
) -> str:
    picks = _pick_evidence_rows(rows, layer)
    if picks:
        return _evidence_from_row(picks[0])["evidence_text"]
    label = ROS_LAYER_LABELS.get(layer.upper(), layer)
    summary = tier_label(layer, layer_score)
    return f"从你在「{label}」相关题目上的整体作答看，{summary}——这是你们目前这段关系在这个维度上的真实底色。"


def build_all_evidence(
    rows: list[dict[str, Any]],
    layer_scores: dict[str, float],
) -> dict[str, str]:
    scores = {str(k).upper(): float(v) for k, v in (layer_scores or {}).items()}
    return {
        code: build_layer_evidence(rows, code, scores.get(code, 0))
        for code in LAYER_ORDER
    }


def _behavior_implied_score(rows: list[dict[str, Any]], layer: str) -> float | None:
    layer = layer.upper()
    values: list[float] = []
    for row in rows:
        if str(row.get("dimension_code") or "").upper() != layer:
            continue
        numeric = row.get("numeric_score")
        if numeric is None:
            continue
        values.append(float(numeric))
    if not values:
        return None
    return round(sum(min(100, max(0, v * 20 if v <= 5 else v)) for v in values) / len(values))


def build_blind_spot(
    layer_scores: dict[str, float],
    rows: list[dict[str, Any]],
) -> dict[str, Any] | None:
    scores = {str(k).upper(): float(v) for k, v in (layer_scores or {}).items()}
    best_gap = 0.0
    best_layer = ""
    best_self = 0.0
    best_implied = 0.0
    for code in ("AT", "IN", "CO", "EV"):
        self_score = scores.get(code, 0)
        implied = _behavior_implied_score(rows, code)
        if implied is None:
            continue
        gap = self_score - implied
        if gap >= 15 and gap > best_gap:
            best_gap = gap
            best_layer = code
            best_self = self_score
            best_implied = implied
    if not best_layer:
        return None
    label = ROS_LAYER_LABELS[best_layer]
    text = (
        f"你给{label}打了{round(best_self)}分，但你的答题模式显示，"
        f"你对「被真正理解」的需求其实高于{round(best_self)}分能反映的——"
        f"这个缺口比你意识到的要大一些。"
    )
    return {
        "layer": best_layer,
        "self_reported_score": round(best_self),
        "behavior_implied_score": round(best_implied),
        "gap": round(best_gap),
        "blind_spot_text": text,
    }


def build_ros_insights(
    *,
    layer_scores: dict[str, float],
    relationship_type: dict[str, str],
    stage_name: str,
    display_resonance: float,
) -> list[dict[str, str]]:
    scores = {str(k).upper(): float(v) for k, v in (layer_scores or {}).items()}
    positive = [c for c in ("AT", "IN", "CO", "EV") if c in scores]
    highest = max(positive, key=lambda c: scores.get(c, 0), default="AT")
    lowest = min(positive, key=lambda c: scores.get(c, 100), default="IN")
    h_label = ROS_LAYER_LABELS[highest]
    l_label = ROS_LAYER_LABELS[lowest]
    h_score = round(scores.get(highest, 0))
    l_score = round(scores.get(lowest, 0))
    type_name = relationship_type.get("name") or "这段关系"
    advice_by_stage = {
        "重建信任": "你们现在在重建信任阶段，最需要的不是更多热度，而是一套两个人都认可的沟通规则——从说清楚一件小事开始。",
        "磨合阵痛": "把一次争执拆成「情绪」和「事实」两部分聊——先确认彼此还在，再谈具体的事。",
        "并肩同行": "继续保持那些让彼此靠近的小仪式——稳定的关系靠重复的好细节，不靠偶尔的大浪漫。",
    }
    advice = advice_by_stage.get(
        stage_name,
        f"作为「{type_name}」类型的关系，下一次相处里，先把感受说具体，比猜更有用。",
    )
    return [
        {
            "kind": "strength",
            "title": "你们的高光",
            "body": f"{h_label}层（{h_score}）很扎实——你们最初的心动是真实的，这不是错觉。",
        },
        {
            "kind": "watch",
            "title": "值得留意的地方",
            "body": (
                f"{l_label}有一个值得正视的缺口（{l_score}），"
                f"有些矛盾可能在以「和好了」的形式积累，而不是真正解决。"
            ),
        },
        {
            "kind": "advice",
            "title": "给你们的建议",
            "body": advice,
        },
        {
            "kind": "action",
            "title": "接下来可以做什么",
            "body": (
                "邀请对方也来做这道题，看看他/她眼中的关系是什么样的。"
                "两份视角叠加，才能看见真正的你们。"
            ),
        },
    ]


def build_prescription_content(
    *,
    layer_scores: dict[str, float],
    relationship_type: dict[str, str],
    followup: str,
) -> dict[str, str]:
    rk = layer_scores.get("RK", 0)
    in_score = layer_scores.get("IN", 0)
    if rk >= 60:
        complaint = "争执后修复在发生，但温度有时降不下来"
        rx = "下次矛盾后，各自说一件「我其实想说的话」"
    elif in_score < 55:
        complaint = "联结感不均衡，有些话还没说出口"
        rx = "每周一次不带手机的两小时对话"
    elif layer_scores.get("EV", 0) < 55:
        complaint = "未来感待对齐，方向感还在模糊地带"
        rx = "诚实聊一次「三年后我们希望是什么样子」"
    else:
        complaint = "日常磨合中的细节，需要被温柔看见"
        rx = "每周一次不带手机的两小时散步，只聊最近一件小事"
    return {
        "complaint": complaint,
        "prescription_text": rx,
        "followup": followup,
    }


def _insights_ai_prompt(
    *,
    rel_type: str,
    stage: str,
    layer_scores: dict[str, float],
    evidence: dict[str, str],
    result_payload: dict[str, Any] | None = None,
) -> str:
    payload = result_payload if isinstance(result_payload, dict) else {}
    context = assemble_ros_context(
        payload,
        layer_scores=layer_scores,
        task="ros-insights",
    )
    if not context.evidence and evidence:
        context.evidence = [str(v)[:120] for v in list(evidence.values())[:3]]

    extra = """
# Output JSON
{"insights":[
  {"kind":"strength","title":"你们的高光","body":""},
  {"kind":"watch","title":"值得留意的地方","body":""},
  {"kind":"advice","title":"给你们的建议","body":""},
  {"kind":"action","title":"接下来可以做什么","body":""}
]}
4 条洞察：strength / watch / advice / action；禁止 AT–RK 编号与裸分；禁止劝分。
""".strip()
    return build_director_prompt(task="mate-lens", context=context, extra_rules=extra)


def _parse_insights_json(raw: str) -> list[dict[str, str]] | None:
    text = raw.strip()
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        data = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    items = data.get("insights")
    if not isinstance(items, list):
        return None
    kinds = {"strength", "watch", "advice", "action"}
    out: list[dict[str, str]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        kind = str(item.get("kind") or "")
        if kind not in kinds:
            continue
        out.append(
            {
                "kind": kind,
                "title": str(item.get("title") or ""),
                "body": str(item.get("body") or "").strip(),
            }
        )
    return out if len(out) >= 4 else None


def fetch_pattern_cache(conn: Any, pattern_key: str) -> dict[str, Any] | None:
    try:
        row = conn.execute(
            """
            SELECT evidence, insights, prescription, blind_spot, generation_mode, hit_count
            FROM public.ros_ai_pattern_cache
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
            "UPDATE public.ros_ai_pattern_cache SET hit_count = hit_count + 1 WHERE pattern_key = %s",
            (pattern_key,),
        )
    except Exception:
        pass
    return dict(row)


def save_pattern_cache(
    conn: Any,
    *,
    pattern_key: str,
    rel_type: str,
    gender: str,
    score_pattern: str,
    ai_content: dict[str, Any],
) -> None:
    try:
        conn.execute(
            """
            INSERT INTO public.ros_ai_pattern_cache(
              pattern_key, relationship_type, gender, score_pattern,
              evidence, insights, prescription, blind_spot, generation_mode
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (pattern_key) DO UPDATE SET
              evidence = EXCLUDED.evidence,
              insights = EXCLUDED.insights,
              prescription = EXCLUDED.prescription,
              blind_spot = EXCLUDED.blind_spot,
              generation_mode = EXCLUDED.generation_mode,
              updated_at = now()
            """,
            (
                pattern_key,
                rel_type,
                gender,
                score_pattern,
                Jsonb(ai_content.get("evidence") or {}),
                Jsonb(ai_content.get("insights") or []),
                Jsonb(ai_content.get("prescription") or {}),
                Jsonb(ai_content.get("blind_spot")) if ai_content.get("blind_spot") else None,
                ai_content.get("mode") or "deterministic",
            ),
        )
    except Exception:
        return


# late import for Jsonb used in save_pattern_cache
from psycopg.types.json import Jsonb  # noqa: E402


def build_ros_ai_content(
    *,
    result_payload: dict[str, Any],
    layer_scores: dict[str, float] | None,
    answer_rows: list[dict[str, Any]],
    gender: str = "female",
    use_ai: bool = False,
) -> dict[str, Any]:
    payload = dict(result_payload)
    scores = {str(k).upper(): float(v) for k, v in (layer_scores or {}).items()}
    rel = payload.get("relationshipType") or {}
    if not isinstance(rel, dict):
        rel = {}
    stage = payload.get("relationshipStage") or {}
    if not isinstance(stage, dict):
        stage = {}
    computed = payload.get("computed") or {}
    if not isinstance(computed, dict):
        computed = {}

    resonance = payload.get("resonance") or {}
    display = float(resonance.get("score") or computed.get("display_resonance") or 0)
    followup = str((payload.get("prescription") or {}).get("followUp") or computed.get("followup_time") or "三个月后")

    evidence = build_all_evidence(answer_rows, scores)
    insights = build_ros_insights(
        layer_scores=scores,
        relationship_type=rel,
        stage_name=str(stage.get("name") or ""),
        display_resonance=display,
    )
    prescription = build_prescription_content(
        layer_scores=scores,
        relationship_type=rel,
        followup=followup,
    )
    blind = build_blind_spot(scores, answer_rows)

    layer_expansion: dict[str, Any] = {}
    for code in LAYER_ORDER:
        layer_expansion[code.lower()] = {
            "subdims": build_layer_subdims(code, scores.get(code, 0)),
            "probe_question": layer_probe(code),
            "evidence_text": evidence.get(code, ""),
            "tier_label": tier_label(code, scores.get(code, 0)),
        }

    mode = "deterministic"
    assembled = assemble_ros_context(payload, layer_scores=scores, task="ros-insights")
    if use_ai:
        try:
            prompt = _insights_ai_prompt(
                rel_type=str(rel.get("name") or ""),
                stage=str(stage.get("name") or ""),
                layer_scores=scores,
                evidence=evidence,
                result_payload=payload,
            )
            raw = get_ai_adapter().generate(prompt, json_mode=True)
            if not looks_like_placeholder_report(raw):
                parsed = _parse_insights_json(raw)
                if parsed:
                    insights = parsed
                    mode = "ai"
        except Exception:
            pass

    ai_content: dict[str, Any] = {
        "evidence": evidence,
        "insights": {item["kind"]: {"title": item["title"], "body": item["body"]} for item in insights},
        "assembled_context": assembled.to_prompt_dict(),
        "insights_list": insights,
        "prescription": prescription,
        "layer_expansion": layer_expansion,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "mode": mode,
        "cached": False,
    }
    if blind:
        ai_content["blind_spot"] = blind["blind_spot_text"]
        ai_content["blind_spot_meta"] = blind
        computed = {**computed, "blind_spot_layer": blind["layer"], "blind_spot_gap": blind["gap"]}
        payload["computed"] = computed

    return ai_content


def attach_ros_ai_content_to_payload(
    conn: Any,
    attempt_id: str,
    result_payload: dict[str, Any],
    layer_scores: dict[str, float] | None,
    *,
    use_ai: bool = False,
    gender: str = "female",
) -> dict[str, Any]:
    payload = attach_static_copy_to_payload(dict(result_payload))
    rows = load_attempt_answer_rows(conn, attempt_id)
    rel = payload.get("relationshipType") or {}
    rel_name = str((rel or {}).get("name") or "温水同行")
    pattern_key = pattern_cache_key(rel_name, gender, layer_scores)
    cached = fetch_pattern_cache(conn, pattern_key)

    if cached and not use_ai:
        insights_raw = cached.get("insights")
        insights_list: list[dict[str, str]] = []
        if isinstance(insights_raw, list):
            insights_list = [dict(i) for i in insights_raw if isinstance(i, dict)]
        elif isinstance(insights_raw, dict):
            for kind, item in insights_raw.items():
                if isinstance(item, dict):
                    insights_list.append({"kind": kind, **item})
        ai_content = {
            "evidence": cached.get("evidence") or {},
            "insights": insights_raw if isinstance(insights_raw, dict) else {},
            "insights_list": insights_list or payload.get("insights") or [],
            "prescription": cached.get("prescription") or {},
            "blind_spot": cached.get("blind_spot"),
            "mode": cached.get("generation_mode") or "cached",
            "cached": True,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
        layer_expansion: dict[str, Any] = {}
        scores = {str(k).upper(): float(v) for k, v in (layer_scores or {}).items()}
        for code in LAYER_ORDER:
            layer_expansion[code.lower()] = {
                "subdims": build_layer_subdims(code, scores.get(code, 0)),
                "probe_question": layer_probe(code),
                "evidence_text": (cached.get("evidence") or {}).get(code, ""),
                "tier_label": tier_label(code, scores.get(code, 0)),
            }
        ai_content["layer_expansion"] = layer_expansion
        scores = {str(k).upper(): float(v) for k, v in (layer_scores or {}).items()}
        blind = build_blind_spot(scores, rows)
        if blind:
            ai_content["blind_spot"] = blind["blind_spot_text"]
            ai_content["blind_spot_meta"] = {
                "layer": blind.get("layer"),
                "self_reported_score": blind.get("self_reported_score"),
                "behavior_implied_score": blind.get("behavior_implied_score"),
                "gap": blind.get("gap"),
            }
        elif cached.get("blind_spot"):
            ai_content["blind_spot"] = cached.get("blind_spot")
    else:
        ai_content = build_ros_ai_content(
            result_payload=payload,
            layer_scores=layer_scores,
            answer_rows=rows,
            gender=gender,
            use_ai=use_ai,
        )
        if use_ai and ai_content.get("mode") == "ai":
            save_pattern_cache(
                conn,
                pattern_key=pattern_key,
                rel_type=rel_name,
                gender=gender,
                score_pattern=compute_score_pattern(layer_scores),
                ai_content=ai_content,
            )

    if ai_content.get("insights_list"):
        payload["insights"] = ai_content["insights_list"]
    payload["ai_content"] = ai_content
    return payload


def enhance_ros_ai_for_attempt(
    conn: Any,
    attempt_id: str,
    *,
    use_ai: bool = True,
    force: bool = False,
) -> dict[str, Any] | None:
    row = conn.execute(
        """
        SELECT result_payload, dimension_scores, archetype_gender, test_id
        FROM public.test_attempts
        WHERE id = %s
        """,
        (attempt_id,),
    ).fetchone()
    if not row:
        return None
    payload = row.get("result_payload") or {}
    if not isinstance(payload, dict):
        payload = {}
    existing = payload.get("ai_content") or {}
    if not force and isinstance(existing, dict) and existing.get("mode") == "ai":
        return None
    gender = str(row.get("archetype_gender") or "female")
    updated = attach_ros_ai_content_to_payload(
        conn,
        attempt_id,
        payload,
        row.get("dimension_scores"),
        use_ai=use_ai,
        gender=gender,
    )
    return updated
