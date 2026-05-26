"""Suite-aware context, dimensions, and report prompts for SELF / ROS / MATE."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from app.chat_prompt_layers import load_phrase_library, score_band_label
from app.semantic_translation import FORBIDDEN_RULES_MARKDOWN
from app.ai_context_assembler import assemble_from_attempt, format_assembled_context_block
from app.profile_center import resolve_product_set
from app.result_page_specs import get_product_set_spec
from app.ros_scoring import ROS_LAYER_CODES, ROS_LAYER_LABELS

SELF_DIMENSION_META: dict[str, tuple[str, str]] = {
    "SA1": ("自我吸引感知", "我相信自己值得被爱吗？"),
    "SA2": ("依恋焦虑", "我在关系里容易不安全感吗？"),
    "SA3": ("依恋回避", "我在关系里容易逃避亲密吗？"),
    "SA4": ("自我边界", "我能守住自己吗？"),
    "SA5": ("情绪调节", "我能好好处理关系里的情绪吗？"),
    "SA6": ("关系投入模式", "我是怎么爱人的？"),
}

ROS_DIMENSION_META: dict[str, tuple[str, str]] = {
    code: (ROS_LAYER_LABELS[code], ROS_LAYER_LABELS[code])
    for code in ROS_LAYER_CODES
}

MATE_FEMALE_META: dict[str, tuple[str, str]] = {
    "FS1": ("吸引力资产", "第一眼和相处后你让人感觉怎样"),
    "FS2": ("情感价值输出", "你让对方觉得跟你在一起值不值"),
    "FS3": ("现实自主性", "你有多独立，带不带负担"),
    "FS4": ("关系成熟度", "你在关系里的模式是不是健康的"),
    "FS5": ("风险净值", "你身上有哪些让人犹豫的信号"),
}

MATE_MALE_META: dict[str, tuple[str, str]] = {
    "MS1": ("资源与事业轨道", "你现在和未来能给对方什么托底"),
    "MS2": ("稳定性与可靠度", "你说到做不做得到，靠不靠得住"),
    "MS3": ("情感供给能力", "你让对方感觉怎么样，够不够有趣"),
    "MS4": ("门面与社交资本", "第一眼和社交场合里你是什么形象"),
    "MS5": ("风险净值", "你身上有哪些让人犹豫的信号"),
}


def resolve_attempt_product_set(attempt: dict[str, Any]) -> str:
    payload = attempt.get("result_payload") or {}
    if isinstance(payload, dict) and payload.get("productSet") in {"SELF", "ROS", "MATE"}:
        return str(payload["productSet"])
    return resolve_product_set(
        attempt.get("suite_slug"),
        attempt.get("suite_name"),
        attempt.get("test_id"),
    )


def _mate_dimension_meta(gender: str | None) -> dict[str, tuple[str, str]]:
    return MATE_MALE_META if gender == "male" else MATE_FEMALE_META


def _dimension_meta_for_product(product_set: str, gender: str | None) -> dict[str, tuple[str, str]]:
    if product_set == "ROS":
        return ROS_DIMENSION_META
    if product_set == "MATE":
        return _mate_dimension_meta(gender)
    return SELF_DIMENSION_META


def _display_summaries_from_payload(result_payload: dict[str, Any]) -> dict[str, str]:
    summaries = result_payload.get("display_summaries")
    if isinstance(summaries, dict):
        return {str(k): str(v) for k, v in summaries.items() if v}
    out: dict[str, str] = {}
    for layer in result_payload.get("layers") or []:
        if isinstance(layer, dict) and layer.get("code") and layer.get("displaySummary"):
            out[str(layer["code"])] = str(layer["displaySummary"])
    for module in result_payload.get("modules") or []:
        if isinstance(module, dict) and module.get("code") and module.get("displaySummary"):
            out[str(module["code"])] = str(module["displaySummary"])
    return out


def extract_suite_dimensions(
    attempt: dict[str, Any],
    *,
    product_set: str | None = None,
) -> list[dict[str, Any]]:
    result_payload = attempt.get("result_payload") or {}
    if not isinstance(result_payload, dict):
        result_payload = {}
    product_set = product_set or resolve_attempt_product_set(attempt)
    gender = attempt.get("suite_gender") or attempt.get("archetype_gender") or result_payload.get("gender")

    dimensions = result_payload.get("dimensions")
    if isinstance(dimensions, list) and dimensions:
        return [d for d in dimensions if isinstance(d, dict)]

    if product_set == "ROS":
        layers = result_payload.get("layers")
        if isinstance(layers, list) and layers:
            return [
                {
                    "code": item.get("code"),
                    "name": item.get("name") or ROS_LAYER_LABELS.get(str(item.get("code")), str(item.get("code"))),
                    "core": ROS_LAYER_LABELS.get(str(item.get("code")), ""),
                    "score": item.get("score"),
                    "displaySummary": item.get("displaySummary"),
                }
                for item in layers
                if isinstance(item, dict)
            ]

    if product_set == "MATE":
        modules = result_payload.get("modules")
        if isinstance(modules, list) and modules:
            return [
                {
                    "code": item.get("code"),
                    "name": item.get("label") or item.get("name"),
                    "core": item.get("label") or "",
                    "score": None,
                    "displaySummary": item.get("displaySummary"),
                }
                for item in modules
                if isinstance(item, dict)
            ]

    dimension_scores = attempt.get("dimension_scores")
    if not isinstance(dimension_scores, dict):
        return []

    meta = _dimension_meta_for_product(product_set, str(gender) if gender else None)
    display_map = _display_summaries_from_payload(result_payload)
    extracted: list[dict[str, Any]] = []
    for code, score in dimension_scores.items():
        code_str = str(code)
        name, core = meta.get(code_str, (code_str, ""))
        extracted.append(
            {
                "code": code_str,
                "name": name,
                "core": core,
                "score": score,
                "displaySummary": display_map.get(code_str) or score_band_label(score),
            }
        )
    return extracted


def _float_score(value: Any) -> float | None:
    if isinstance(value, (int, float, Decimal)):
        return float(value)
    return None


def summarize_suite_context(attempt: dict[str, Any]) -> dict[str, Any]:
    result_payload = attempt.get("result_payload") or {}
    if not isinstance(result_payload, dict):
        result_payload = {}
    profile = result_payload.get("archetype_profile") or {}
    if not isinstance(profile, dict):
        profile = {}

    product_set = resolve_attempt_product_set(attempt)
    dimensions = extract_suite_dimensions(attempt, product_set=product_set)

    base: dict[str, Any] = {
        "attemptId": str(attempt["id"]),
        "productSet": product_set,
        "suiteSlug": attempt.get("suite_slug") or attempt.get("test_id"),
        "suiteName": attempt.get("suite_name") or attempt.get("test_id"),
        "rosIndex": _float_score(attempt.get("ros_index")),
        "completedAt": str(attempt["completed_at"]) if attempt.get("completed_at") else None,
        "dimensions": [
            {
                "code": item.get("code"),
                "name": item.get("name"),
                "score": _float_score(item.get("score")) if item.get("score") is not None else None,
                "displaySummary": item.get("displaySummary"),
            }
            for item in dimensions
        ],
        "hasAiReport": bool(attempt.get("ai_report")),
    }

    if product_set == "SELF":
        archetype = str(result_payload.get("archetype_code") or attempt.get("archetype_code") or "你的关系画像")
        attachment = str(
            result_payload.get("attachment_type") or profile.get("attachment_type") or "待判断"
        )
        base.update(
            {
                "primaryMetric": attachment,
                "primaryMetricLabel": "依恋类型",
                "archetype": archetype,
                "attachmentType": attachment,
                "redChamberArchetype": archetype,
                "tagline": profile.get("tagline"),
                "description": profile.get("description"),
                "matchingLogic": profile.get("matching_logic"),
            }
        )
        return base

    if product_set == "ROS":
        rel_type = result_payload.get("relationshipType") or {}
        stage = result_payload.get("relationshipStage") or {}
        resonance = result_payload.get("resonance") or {}
        if not isinstance(rel_type, dict):
            rel_type = {}
        if not isinstance(stage, dict):
            stage = {}
        if not isinstance(resonance, dict):
            resonance = {}
        rel_name = str(rel_type.get("name") or attempt.get("archetype_code") or "这段关系")
        base.update(
            {
                "primaryMetric": rel_name,
                "primaryMetricLabel": "关系类型",
                "archetype": rel_name,
                "relationshipType": rel_name,
                "relationshipStage": stage.get("name"),
                "resonanceTier": resonance.get("tier"),
                "tagline": rel_type.get("one_liner") or rel_type.get("tagline"),
                "description": rel_type.get("description"),
                "matchingLogic": None,
                "attachmentType": None,
            }
        )
        return base

    pos = result_payload.get("positionType") or {}
    if not isinstance(pos, dict):
        pos = {}
    position_name = str(
        pos.get("name")
        or result_payload.get("position_type")
        or attempt.get("archetype_code")
        or "择偶定位"
    )
    base.update(
        {
            "primaryMetric": position_name,
            "primaryMetricLabel": "市场定位",
            "archetype": position_name,
            "matePosition": position_name,
            "quadrant": result_payload.get("quadrant"),
            "tagline": pos.get("tagline") or pos.get("subtitle"),
            "description": pos.get("marketRead") or pos.get("market_read"),
            "matchingLogic": None,
            "attachmentType": None,
        }
    )
    return base


def _report_excerpt(attempt: dict[str, Any]) -> str:
    report = attempt.get("ai_report") or ""
    placeholders = ("正式 AI 深度报告可由后台任务继续生成", "【AI 占位回复】", "【智谱未配置】")
    if not report or any(marker in report for marker in placeholders):
        return ""
    excerpt = str(report).strip()
    if len(excerpt) > 2200:
        excerpt = excerpt[:2200] + "\n…（报告已截断）"
    return f"\n\n已有 AI 深度报告摘要（可引用但不要逐字复读）：\n{excerpt}"


def _dimension_lines(dimensions: list[dict[str, Any]], *, use_display_summary: bool) -> str:
    lines: list[str] = []
    for item in dimensions:
        name = item.get("name") or item.get("label") or "该维度"
        if use_display_summary and item.get("displaySummary"):
            lines.append(f"- {name}：{item['displaySummary']}")
        else:
            summary = item.get("displaySummary") or score_band_label(item.get("score"))
            core = item.get("core") or ""
            lines.append(f"- {name}：{core}；{summary}")
    return "\n".join(lines) or "- 暂无完整维度明细"


def build_suite_profile_context_block(attempt: dict[str, Any]) -> str:
    product_set = resolve_attempt_product_set(attempt)
    summary = summarize_suite_context(attempt)
    dimensions = extract_suite_dimensions(attempt, product_set=product_set)
    dimension_text = _dimension_lines(dimensions, use_display_summary=True)
    report_block = _report_excerpt(attempt)
    suite_name = attempt.get("suite_name") or attempt.get("test_id") or product_set
    completed = attempt.get("completed_at") or "未知"

    payload = attempt.get("result_payload") or {}
    if not isinstance(payload, dict):
        payload = {}
    assembled_block = ""
    if payload.get("assembledAiContext"):
        from app.ai_context_assembler import context_from_dict, format_assembled_context_block

        assembled_block = "\n\n" + format_assembled_context_block(context_from_dict(payload["assembledAiContext"]))
    else:
        try:
            from app.ai_context_assembler import assemble_from_attempt, format_assembled_context_block

            assembled_block = "\n\n" + format_assembled_context_block(assemble_from_attempt(attempt))
        except Exception:
            assembled_block = ""

    if product_set == "SELF":
        return f"""
【用户已完成的真实测试画像 — 套一 SELF · 必须作为回答依据】
测试套件：{suite_name}
完成时间：{completed}
主结果（依恋类型）：{summary.get("primaryMetric")}
红楼人格（隐藏揭晓项，勿当作 Hero）：{summary.get("archetype")}
一句话主题：{summary.get("tagline") or "（无）"}
画像描述：{summary.get("description") or "（无）"}
人格/匹配关键词：{summary.get("matchingLogic") or "（无）"}
综合指数（内部参考，勿直接报具体数字）：{summary.get("rosIndex")}

六维自我关系线索（内部参考，回答时用自然语言，不要暴露 SA 编号或具体分数）：
{dimension_text}
{assembled_block}
{report_block}
""".strip()

    if product_set == "ROS":
        resonance = (attempt.get("result_payload") or {}).get("resonance") or {}
        if not isinstance(resonance, dict):
            resonance = {}
        return f"""
【用户已完成的真实测试画像 — 套二 ROS · 必须作为回答依据】
测试套件：{suite_name}
完成时间：{completed}
主结果：关系类型「{summary.get("relationshipType")}」· 阶段「{summary.get("relationshipStage") or "待判断"}」
共鸣层级：{summary.get("resonanceTier") or resonance.get("tier") or "待判断"}（内部参考指数 {summary.get("rosIndex")}，勿裸报分数）
关系一句话：{summary.get("tagline") or "（无）"}
关系描述：{summary.get("description") or "（无）"}

五层关系线索 AT–RK（内部参考，用自然语言，禁止劝分，不要暴露编号或裸分）：
{dimension_text}
{assembled_block}
{report_block}
""".strip()

    matchmaker = (attempt.get("result_payload") or {}).get("matchmaker") or {}
    if not isinstance(matchmaker, dict):
        matchmaker = {}
    upper = matchmaker.get("upper_match") or (attempt.get("result_payload") or {}).get("upperMatch") or {}
    sweet = matchmaker.get("sweet_spot") or (attempt.get("result_payload") or {}).get("sweetSpot") or {}
    lower = matchmaker.get("lower_match") or (attempt.get("result_payload") or {}).get("lowerMatch") or {}

    def _mm_snippet(block: Any) -> str:
        if isinstance(block, dict):
            return str(block.get("title") or block.get("headline") or block.get("summary") or "")[:120]
        return str(block)[:120] if block else "（无）"

    return f"""
【用户已完成的真实测试画像 — 套三 MATE · 必须作为回答依据】
测试套件：{suite_name}
完成时间：{completed}
主结果（市场定位）：{summary.get("matePosition")}
四象限：{summary.get("quadrant") or payload.get("quadrant") or "待判断"}
坐标（内部参考，勿裸报）：市场显示度 {payload.get("axisX")} · 现实支撑力 {payload.get("axisY")}
一句话：{summary.get("tagline") or "（无）"}
市场读法：{summary.get("description") or "（无）"}

五模块 FS/MS 线索（内部参考，用描述性语言，不要暴露编号或裸分）：
{dimension_text}

红娘三区（上限 / 经济适用区 / 下限，表述用区间勿用「你只配」）：
- 上限区：{_mm_snippet(upper)}
- 经济适用区：{_mm_snippet(sweet)}
- 下限区：{_mm_snippet(lower)}
{assembled_block}
{report_block}
""".strip()


def build_unbound_context_message() -> str:
    lib = load_phrase_library()
    hooks = lib.get("suiteHooks") or {}
    self_hook = hooks.get("SELF", {}).get("primaryOutput", "依恋类型")
    ros_hook = hooks.get("ROS", {}).get("primaryOutput", "关系类型 + 阶段 + 共鸣")
    mate_hook = hooks.get("MATE", {}).get("primaryOutput", "市场定位 + 四象限")
    return (
        "【当前未绑定具体测试画像】用户可能尚未完成测试；只能做一般性关系建议。"
        f"可邀请用户先完成套一 SELF（{self_hook}）、套二 ROS（{ros_hook}）或套三 MATE（{mate_hook}）。"
    )


def _insight_slot_titles() -> dict[str, str]:
    lib = load_phrase_library()
    slots = lib.get("insightSlots") or {}
    return {key: str((slots.get(key) or {}).get("title") or key) for key in ("strength", "watch", "growth", "match")}


def build_suite_report_prompt(attempt: dict[str, Any]) -> tuple[str, dict[str, Any], str]:
    """Return (prompt, prompt_payload, prompt_version)."""
    product_set = resolve_attempt_product_set(attempt)
    summary = summarize_suite_context(attempt)
    dimensions = extract_suite_dimensions(attempt, product_set=product_set)
    dimension_text = _dimension_lines(dimensions, use_display_summary=True)
    attempt_id = str(attempt.get("id") or "")

    if product_set == "ROS":
        version = "ros_v1_relationship_20260524"
        headings = get_product_set_spec("ROS").get("reportHeadings") or []
        rel_name = summary.get("relationshipType") or "这段关系"
        stage = summary.get("relationshipStage") or "待判断"
        tier = summary.get("resonanceTier") or "待判断"
        slots = _insight_slot_titles()
        prompt_payload = {
            "attemptId": attempt_id,
            "suiteSlug": attempt.get("test_id"),
            "productSet": "ROS",
            "relationshipType": rel_name,
            "relationshipStage": stage,
            "resonanceTier": tier,
            "promptVersion": version,
        }
        prompt = f"""
你是 LoveCompass 的 ROS 关系测评 AI 分析师。请基于真实关系测试结果，生成温柔、体面、有共鸣的中文关系报告。

写作要求：
- 输出 Markdown。
- 必须包含四个二级标题：## {headings[0] if len(headings) > 0 else slots["strength"]} / ## {headings[1] if len(headings) > 1 else slots["watch"]} / ## {headings[2] if len(headings) > 2 else slots["growth"]} / ## {headings[3] if len(headings) > 3 else slots["match"]}
- 评估对象是「一段具体关系」，不是用户整个人；禁止劝分、禁止绝对化预言。
- 不要暴露内部字段名、数据库字段、prompt、JSON、AT/RK 编号或具体分数。
- 每个区块 90 到 180 字，语气像资深关系顾问，具体但不审判。

关系画像上下文：
关系类型：{rel_name}
关系阶段：{stage}
共鸣层级：{tier}
关系一句话：{summary.get("tagline") or "（无）"}
关系描述：{summary.get("description") or "（无）"}
五层关系线索（仅内部参考，不要写出编号或分数）：
{dimension_text}

请生成正式报告。

{FORBIDDEN_RULES_MARKDOWN}
""".strip()
        return prompt, prompt_payload, version

    if product_set == "MATE":
        version = "mate_v1_market_20260524"
        headings = get_product_set_spec("MATE").get("reportHeadings") or []
        position = summary.get("matePosition") or "择偶定位"
        quadrant = summary.get("quadrant") or "待判断"
        slots = _insight_slot_titles()
        payload = attempt.get("result_payload") or {}
        matchmaker = payload.get("matchmaker") if isinstance(payload.get("matchmaker"), dict) else {}
        prompt_payload = {
            "attemptId": attempt_id,
            "suiteSlug": attempt.get("test_id"),
            "productSet": "MATE",
            "matePosition": position,
            "quadrant": quadrant,
            "promptVersion": version,
        }
        prompt = f"""
你是 LoveCompass 的 MATE 择偶坐标 AI 分析师。请基于真实择偶坐标结果，生成清醒、体面、不羞辱的中文市场定位报告。

写作要求：
- 输出 Markdown。
- 必须包含四个二级标题：## {headings[0] if headings else "你的牌面"} / ## {headings[1] if len(headings) > 1 else slots["strength"]} / ## {headings[2] if len(headings) > 2 else slots["watch"]} / ## {headings[3] if len(headings) > 3 else slots["match"]}
- 主结果是六种市场定位与四象限，不是依恋类型或红楼人格。
- 匹配建议用「上限 / 经济适用区 / 下限」框架，禁止「你只配 xxx」。
- 不要暴露内部字段名、裸分数、FS/MS 编号；颜值/收入/学历不做裸标签。
- 每个区块 90 到 180 字。

择偶坐标上下文：
市场定位：{position}
四象限：{quadrant}
一句话：{summary.get("tagline") or "（无）"}
市场读法：{summary.get("description") or "（无）"}
五模块线索（仅内部参考）：
{dimension_text}
红娘上限区：{matchmaker.get("upper_match") or "（无）"}
红娘经济适用区：{matchmaker.get("sweet_spot") or "（无）"}
红娘下限区：{matchmaker.get("lower_match") or "（无）"}

请生成正式报告。

{FORBIDDEN_RULES_MARKDOWN}
""".strip()
        return prompt, prompt_payload, version

    version = "self_v1_red_chamber_20260523"
    headings = get_product_set_spec("SELF").get("reportHeadings") or []
    archetype = summary.get("archetype") or "未知画像"
    attachment = summary.get("attachmentType") or "待判断"
    prompt_payload = {
        "attemptId": attempt_id,
        "suiteSlug": attempt.get("test_id"),
        "productSet": "SELF",
        "archetype": archetype,
        "attachmentType": attachment,
        "tagline": summary.get("tagline"),
        "promptVersion": version,
    }
    prompt = f"""
你是 LoveCompass 的婚恋画像 AI 分析师。请基于真实 SELF 测试结果，生成温柔、体面、有共鸣的中文个人化关系画像报告。

写作要求：
- 输出 Markdown。
- 必须包含四个二级标题：## {headings[0] if headings else "你此刻的样子"} / ## {headings[1] if len(headings) > 1 else "关系里的高光"} / ## {headings[2] if len(headings) > 2 else "可以温柔留意的地方"} / ## {headings[3] if len(headings) > 3 else "给你下一段关系的建议"}
- Hero 主结果是依恋类型；红楼人格可自然提及但不要当作唯一标签。
- 不要暴露内部字段名、数据库字段、prompt、JSON、SA 编号或具体分数。
- 每个区块 90 到 180 字。

用户画像上下文：
依恋类型：{attachment}
红楼人格：{archetype}
一句话主题：{summary.get("tagline") or "（无）"}
画像描述：{summary.get("description") or "（无）"}
六维关系线索（仅内部参考）：
{dimension_text}

请生成正式报告。

{FORBIDDEN_RULES_MARKDOWN}
""".strip()
    return prompt, prompt_payload, version


def fallback_suite_report(attempt: dict[str, Any]) -> tuple[str, str, dict[str, Any]]:
    """Deterministic fallback report when AI is unavailable."""
    product_set = resolve_attempt_product_set(attempt)
    summary = summarize_suite_context(attempt)

    if product_set == "ROS":
        rel = summary.get("relationshipType") or "这段关系"
        stage = summary.get("relationshipStage") or "仍在展开"
        tier = summary.get("resonanceTier") or "温柔磨合"
        tagline = summary.get("tagline") or "你们之间的质地，值得被认真看见。"
        report = f"""## 你的高光

你们的关系更接近 **{rel}**，当前阶段在「{stage}」附近。{tagline} 这说明你们之间已经有真实联结的痕迹，不必用完美标准否定正在发生的靠近。

## 可以温柔留意

共鸣层级在 **{tier}** 一带时，细节里的摩擦往往比大问题更早出现。值得留意的不是「对不对」，而是冲突之后有没有修复、日常里有没有被听见。

## 下一段关系里

把「我们怎么了」拆成可观察的信号：沟通后身体是放松还是更紧、争执后谁先靠近、未来话题是回避还是能聊。好的关系不一定没有波动，但应该有回弹。

## 匹配建议

这段关系不是要你立刻下结论，而是帮你看清相处模式。若你同时有套一 SELF 画像，可以把依恋底色和这段 ROS 结果叠在一起读——你会更知道该调整期待，还是该调整表达方式。
"""
        one_line = f"{rel} · {stage} · {tier}"
        return report.strip(), one_line, {"generationMode": "deterministic_fallback", "productSet": "ROS"}

    if product_set == "MATE":
        pos = summary.get("matePosition") or "你的择偶定位"
        quadrant = summary.get("quadrant") or "四象限"
        tagline = summary.get("tagline") or "你的牌面值得被更准确地表达。"
        report = f"""## 你的牌面

你的市场定位更接近 **{pos}**，落在 {quadrant}。{tagline} 这不是终身标签，而是当前阶段别人最容易如何感知你、如何筛你。

## 你的高光

你最稳定的资产，往往来自你得分最稳的模块——那是已经能支撑长期关系的部分。把它从「自我感觉」变成「可被看见的表达」，市场读数会跟着变。

## 可以温柔留意

风险净值或短板模块不是在否定你，而是在提醒：哪些信号容易让别人犹豫。温柔地补强，比硬撑完美更有效。

## 匹配建议

用红娘三区来想：上限区代表值得争取的方向，经济适用区是日常最省心的匹配带，下限区是明确不建议消耗的位置。完成套一 SELF 后，可以把依恋模式与这套坐标合并解读。
"""
        one_line = f"{pos} · {quadrant}"
        return report.strip(), one_line, {"generationMode": "deterministic_fallback", "productSet": "MATE"}

    archetype = summary.get("archetype") or "你的关系画像"
    attachment = summary.get("attachmentType") or "独特关系模式"
    tagline = summary.get("tagline") or "你正在靠近更清醒的亲密关系"
    description = summary.get("description") or "你对关系有自己的节奏。"
    dimensions = extract_suite_dimensions(attempt, product_set="SELF")
    stable = [d for d in dimensions if _float_score(d.get("score")) is not None and float(d.get("score")) >= 65]
    tender = [d for d in dimensions if _float_score(d.get("score")) is not None and float(d.get("score")) < 55]
    stable_text = "、".join(str(d.get("name")) for d in stable[:2]) or "对关系保持认真与觉察"
    tender_text = "、".join(str(d.get("name")) for d in tender[:2]) or "在不确定时更温柔地安放自己的感受"
    report = f"""## 你此刻的样子

你最贴近的依恋底色是 **{attachment}**，红楼人格 **{archetype}** 提醒你：{tagline}。{description}

## 关系里的高光

你在关系里的亮点，常常来自 **{stable_text}**。当你处在被尊重的关系中，你会更愿意拿出稳定、真诚和有质量的投入。

## 可以温柔留意的地方

你可以留意 **{tender_text}**。真正重要的不是立刻完美，而是在情绪升起时多停一步，分辨眼前的人和过去的经验是否被混在一起。

## 给你下一段关系的建议

请继续把自己的感受当回事，也把对方的真实行动看清楚。好的亲密关系不需要你持续压抑或猜测；它会让你更像自己。
"""
    one_line = f"{archetype} · {attachment}：{tagline}"
    return report.strip(), one_line, {"generationMode": "deterministic_fallback", "productSet": "SELF"}


def build_display_summaries_from_layers(layers: list[dict[str, Any]]) -> dict[str, str]:
    out: dict[str, str] = {}
    for item in layers:
        if isinstance(item, dict) and item.get("code") and item.get("displaySummary"):
            out[str(item["code"])] = str(item["displaySummary"])
    return out


def build_display_summaries_from_modules(modules: list[dict[str, Any]]) -> dict[str, str]:
    out: dict[str, str] = {}
    for item in modules:
        if isinstance(item, dict) and item.get("code") and item.get("displaySummary"):
            out[str(item["code"])] = str(item["displaySummary"])
    return out
