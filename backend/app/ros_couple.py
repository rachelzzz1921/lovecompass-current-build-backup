from __future__ import annotations

from typing import Any

from app.ros_scoring import (
    ROS_LAYER_CODES,
    ROS_LAYER_LABELS,
    ROS_LAYER_COLORS,
    STAGE_NAMES,
    _apply_display_adjustment,
    _prescription_warmup,
    _raw_overall_index,
    _resonance_tier,
)


def _weather_from_score(score: float) -> dict[str, str]:
    if score >= 85:
        return {"icon": "sun", "label": "晴朗", "sub": "整体稳定，阳光充足"}
    if score >= 75:
        return {"icon": "cloud-sun", "label": "多云转晴", "sub": "有阴影，但阳光更多"}
    if score >= 65:
        return {"icon": "cloud", "label": "多云", "sub": "有些不确定，但仍在彼此靠近"}
    if score >= 55:
        return {"icon": "cloud-rain", "label": "小雨", "sub": "需要一点修复和耐心"}
    return {"icon": "cloud-lightning", "label": "风雨欲来", "sub": "值得认真谈一谈，但不是终点"}


def _keywords_from_layers(you: dict[str, float], ta: dict[str, float], rel_type: str) -> list[str]:
    avg_at = (you.get("AT", 0) + ta.get("AT", 0)) / 2
    avg_in = (you.get("IN", 0) + ta.get("IN", 0)) / 2
    avg_rk = (you.get("RK", 0) + ta.get("RK", 0)) / 2
    words: list[str] = []
    if avg_at >= 75:
        words.append("心跳感")
    if avg_in >= 70:
        words.append("真实")
    if avg_rk >= 50:
        words.append("待修复")
    else:
        words.append("低风险")
    if rel_type in {"grow", "fire"}:
        words.append("潜力股")
    if rel_type == "warm":
        words.append("安稳")
    if not words:
        words = ["真实", "敏感", "潜力股"]
    return words[:5]


def _attachment_combo_key(left: str | None, right: str | None) -> str:
    a = (left or "混合型").strip()
    b = (right or "混合型").strip()
    return f"{a}×{b}"


def _lookup_collision(
    you_attachment: str | None,
    ta_attachment: str | None,
    collision_map: dict[str, Any],
) -> dict[str, str]:
    keys = [
        _attachment_combo_key(you_attachment, ta_attachment),
        _attachment_combo_key(ta_attachment, you_attachment),
    ]
    for key in keys:
        hit = collision_map.get(key)
        if isinstance(hit, dict):
            return {
                "combo": key.replace("×", " × "),
                "name": str(hit.get("name") or "独特组合"),
                "body": str(hit.get("desc") or hit.get("body") or ""),
            }
    return {
        "combo": _attachment_combo_key(you_attachment, ta_attachment).replace("×", " × "),
        "name": "独特组合",
        "body": "你们的依恋组合没有标准模板——这意味着你们需要更多真实的沟通，而不是套用别人的剧本。",
    }


def _couple_resonance(
    you_layers: dict[str, float],
    ta_layers: dict[str, float],
    scoring_formula: dict[str, Any],
) -> tuple[float, float]:
    merged = {
        code: round((float(you_layers.get(code, 0)) + float(ta_layers.get(code, 0))) / 2, 2)
        for code in ROS_LAYER_CODES
    }
    raw = _raw_overall_index(merged, scoring_formula)
    penalty = sum(
        3
        for code in ROS_LAYER_CODES
        if abs(float(you_layers.get(code, 0)) - float(ta_layers.get(code, 0))) > 20
    )
    raw = max(0, raw - penalty)
    display = _apply_display_adjustment(raw, scoring_formula)
    return raw, display


def _gap_analysis(
    you_layers: dict[str, float],
    ta_layers: dict[str, float],
) -> dict[str, str]:
    diffs = {
        code: float(you_layers.get(code, 0)) - float(ta_layers.get(code, 0))
        for code in ROS_LAYER_CODES
    }
    gap_code = max(diffs, key=lambda c: abs(diffs[c]))
    label = ROS_LAYER_LABELS[gap_code]
    diff = diffs[gap_code]
    if abs(diff) <= 8:
        body = f"你们在「{label}」上的感受比较接近——这是很难得的同频。"
    elif diff > 0:
        body = (
            f"你们对{label}的感受不太一样——TA 感受到的轻松和被接住，比你感受到的多一些。\n"
            "这不代表谁对谁错，更可能的是你比 TA 更敏感地接收信号。\n"
            "试着让 TA 知道，你在意哪些细节。"
        )
    else:
        body = (
            f"你们对{label}的感受不太一样——你感受到的联结，比 TA 表达出来的更多。\n"
            "这不代表 TA 不在意，更可能是 TA 习惯用不同方式表达。\n"
            "试着用具体事例告诉 TA，你需要的回应是什么。"
        )
    return {"dimKey": gap_code.lower(), "dimLabel": label, "body": body}


def _consensus_analysis(you_layers: dict[str, float], ta_layers: dict[str, float]) -> dict[str, str]:
    diffs = {
        code: abs(float(you_layers.get(code, 0)) - float(ta_layers.get(code, 0)))
        for code in ROS_LAYER_CODES
    }
    code = min(diffs, key=diffs.get)
    label = ROS_LAYER_LABELS[code]
    return {
        "dimLabel": label,
        "body": f"你们对「{label}」几乎在同一频道——这是关系最稳的地基，吵再凶也不容易从这里松动。",
    }


def _next_signal(stage_id: int, gap_code: str) -> str:
    next_stage = STAGE_NAMES[min(stage_id, 8)] if stage_id < 9 else STAGE_NAMES[8]
    if gap_code.lower() == "in":
        return (
            f"如果接下来一个月你们能完成 2 次完整的「冲突—修复」循环，"
            f"就会自然进入「{next_stage}」阶段。"
        )
    return f"如果接下来一个月你们能就「{ROS_LAYER_LABELS.get(gap_code.upper(), '互动质量')}」聊清楚一次，关系会自然进入「{next_stage}」阶段。"


def _normalize_layer_scores(raw: Any) -> dict[str, float]:
    if not isinstance(raw, dict):
        return {}
    out: dict[str, float] = {}
    for code in ROS_LAYER_CODES:
        val = raw.get(code)
        if val is None:
            continue
        try:
            out[code] = float(val)
        except (TypeError, ValueError):
            continue
    return out


def build_couple_payload(
    *,
    code: str,
    initiator: dict[str, Any],
    partner: dict[str, Any],
    scoring_formula: dict[str, Any],
    type_rules: dict[str, Any],
) -> dict[str, Any]:
    you_payload = initiator.get("result_payload") or {}
    ta_payload = partner.get("result_payload") or {}
    you_layers = _normalize_layer_scores(initiator.get("dimension_scores"))
    ta_layers = _normalize_layer_scores(partner.get("dimension_scores"))

    rel_type = (you_payload.get("relationshipType") or {}).get("key") or "warm"
    stage_id = int((you_payload.get("relationshipStage") or {}).get("id") or 4)
    _, display_score = _couple_resonance(you_layers, ta_layers, scoring_formula)
    resonance = _resonance_tier(display_score, scoring_formula)

    dims = [
        {
            "key": code.lower(),
            "label": ROS_LAYER_LABELS[code],
            "you": round(float(you_layers.get(code, 0))),
            "ta": round(float(ta_layers.get(code, 0))),
            "color": ROS_LAYER_COLORS[code],
        }
        for code in ROS_LAYER_CODES
    ]

    gap = _gap_analysis(you_layers, ta_layers)
    consensus = _consensus_analysis(you_layers, ta_layers)
    collision_map = type_rules.get("attachment_collision_map") or {}
    collision = _lookup_collision(
        _attachment_from_attempt(initiator),
        _attachment_from_attempt(partner),
        collision_map,
    )

    type_name = (you_payload.get("relationshipType") or {}).get("name") or "彼此生长"
    type_one_liner = (you_payload.get("relationshipType") or {}).get("one_liner") or ""
    time_tag = you_payload.get("timeTag") or ta_payload.get("timeTag")

    return {
        "code": code,
        "resonance": {
            "score": round(display_score),
            "tier": resonance["tier"],
            "desc": resonance["desc"],
        },
        "weather": _weather_from_score(display_score),
        "stageId": stage_id,
        "type": {
            "key": rel_type,
            "name": type_name,
            "one_liner": type_one_liner,
            "description": (you_payload.get("relationshipType") or {}).get("description") or "",
        },
        "dims": dims,
        "keywords": _keywords_from_layers(you_layers, ta_layers, rel_type),
        "highlights": {
            "glow": "你们能在沉默里也不完全尴尬——这本身就是一种默契。",
            "shadow": "争执后有时各自消化，缺一个「谁先靠近」的默契。",
        },
        "timeline": [
            {"label": "三月前", "value": max(55, round(display_score - 13))},
            {"label": "两月前", "value": max(55, round(display_score - 7))},
            {"label": "一月前", "value": max(55, round(display_score - 19))},
            {"label": "两周前", "value": max(55, round(display_score - 11))},
            {"label": "本周", "value": round(display_score), "note": "重新靠近"},
        ],
        "milestones": [
            {"when": "0–1 月", "title": "强烈吸引 · 一拍即合", "tone": "spark"},
            {"when": "1–3 月", "title": "第一次真正吵架", "tone": "cool"},
            {"when": "3–6 月", "title": "学会道歉与拥抱", "tone": "warm"},
            {"when": "现在", "title": f"{STAGE_NAMES[stage_id - 1]} · 重建中", "tone": "warm"},
        ],
        "nextSignal": _next_signal(stage_id, gap["dimKey"]),
        "gap": gap,
        "consensus": consensus,
        "strengths": [
            {"who": "both", "text": "化学反应真实，不是错觉。"},
            {"who": "ta", "text": "TA 在日常里更愿意主动靠近、给反馈。"},
            {"who": "you", "text": "你对关系节奏的觉察比 TA 更细腻。"},
        ],
        "blindspots": [
            {"who": "you", "text": "容易把「TA 没回应」解读成「TA 不在意」。"},
            {"who": "ta", "text": "可能没意识到你的失望，已经积攒到要爆发的程度。"},
            {"who": "both", "text": "缺少一个固定的「复盘时刻」把小情绪说出来。"},
        ],
        "collision": collision,
        "triggers": {
            "you": "TA 突然变安静 / 回消息变慢 / 取消计划",
            "ta": "被反复追问感受 / 被要求立刻回应 / 被指责不够主动",
        },
        "loop": [
            {"actor": "you", "action": "察觉到距离变远，开始焦虑"},
            {"actor": "you", "action": "用更多消息和确认去抓住 TA"},
            {"actor": "ta", "action": "感到压力，本能往后退一步"},
            {"actor": "you", "action": "把退一步解读成「不爱了」，焦虑放大，循环开始"},
        ],
        "bridge": "打破循环的关键——你先说「我现在很慌」，而不是去抓 TA；TA 收到信号后回一句「我没走，只是需要安静一会儿」。",
        "advice": [
            {
                "title": "把「修复」变成习惯",
                "body": "争吵之后 24 小时内主动靠近——不一定要道歉，一个拥抱、一句「我们刚才有点凶」就够。",
            },
            {
                "title": "给彼此一个「暂停词」",
                "body": "约一个只属于你们的词，当任何一方说出来时，对话立刻停止，等情绪过了再回来。",
            },
            {
                "title": "每周一次「不带手机」的两小时",
                "body": "不一定要做什么，吃饭散步都行，重点是把彼此从信息流里捞出来。",
            },
        ],
        "horizons": [
            {"when": "今晚", "title": "一个拥抱 + 一句感谢", "body": "具体到一件 TA 本周做的小事，告诉 TA 你注意到了。"},
            {"when": "本周", "title": "约一次「不带手机」散步", "body": "60 分钟就够，重点是把彼此从信息流里捞出来。"},
            {"when": "本月", "title": "完成一次完整的「冲突—修复」", "body": "下次争执后 24h 内主动靠近，把「谁先低头」变成默契。"},
            {"when": "三个月", "title": "重新做一次 ROS", "body": "用同样的题再测一次，看共鸣指数是否进入下一段位。"},
        ],
        "doDont": {
            "do": ["先说情绪，再说事情", "用「我感觉…」开头", "争执后 24h 内靠近"],
            "dont": ["用沉默惩罚对方", "翻旧账", "在公开场合争执"],
        },
        "prescription": {
            "warmup": _prescription_warmup(stage_id, time_tag, display_score),
            "chiefComplaint": gap["dimLabel"] + "感知不一致",
            "rx": "每周一次\n不带手机的\n两小时对话",
            "followUp": "三个月后",
        },
        "shareLine": "我们之间，是一种很难被替代的默契。",
        "participants": {
            "initiatorAttemptId": str(initiator.get("id") or ""),
            "partnerAttemptId": str(partner.get("id") or ""),
        },
    }


def _attachment_from_attempt(attempt: dict[str, Any]) -> str | None:
    payload = attempt.get("result_payload") or {}
    if isinstance(payload, dict):
        attachment = payload.get("attachment_type")
        if attachment:
            return str(attachment)
    return None


def attempt_snapshot(attempt: dict[str, Any]) -> dict[str, Any]:
    payload = attempt.get("result_payload") or {}
    return {
        "attemptId": str(attempt.get("id") or ""),
        "userId": str(attempt.get("user_id") or ""),
        "dimensionScores": attempt.get("dimension_scores") or {},
        "rosIndex": attempt.get("ros_index"),
        "relationshipType": (payload or {}).get("relationshipType"),
        "relationshipStage": (payload or {}).get("relationshipStage"),
        "timeTag": (payload or {}).get("timeTag"),
    }
