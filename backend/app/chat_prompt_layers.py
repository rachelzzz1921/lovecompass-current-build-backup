"""Shared chat prompt layers: mirror-tone, crisis-guard, portrait-reader, triage."""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

from app.profile_center import PRODUCT_SETS, build_portrait, rebuild_and_cache_portrait

PHRASE_LIBRARY_PATH = Path(__file__).resolve().parents[1] / "data" / "analysis_phrase_library_v1.json"
SHARED_SKILLS_DIR = Path(__file__).resolve().parent / "shared_skills"
REPO_SKILLS_DIR = Path(__file__).resolve().parents[2] / ".cursor" / "skills"

CrisisLevel = Literal["none", "elevated", "high"]

HIGH_CRISIS_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(p, re.IGNORECASE)
    for p in (
        r"不想活",
        r"想死",
        r"自杀",
        r"自[杀残]",
        r"割腕",
        r"跳楼",
        r"结束生命",
        r"了结(自己|此生|生命)?",
        r"活不下去",
        r"杀了自己",
        r"伤害自己",
        r"结束一切",
    )
)

ELEVATED_CRISIS_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(p, re.IGNORECASE)
    for p in (
        r"撑不下去",
        r"绝望",
        r"没有希望",
        r"彻底崩溃",
        r"想消失",
        r"人间不值得",
    )
)

TRIAGE_RULES: tuple[tuple[str, tuple[str, ...], str, str], ...] = (
        (
            "haven",
            (
                "分手",
                "失恋",
                "走不出来",
                "崩溃",
                "哭",
                "哀伤",
                "失去",
            "去世",
            "离世",
            "忘不掉",
            "想他",
            "想她",
            "睡不着",
            "难受",
            "撑不住",
            "陪陪我",
            "好痛",
            "心好痛",
        ),
        "港湾 · 是妻子也是母亲",
        "情绪需要先被接住，适合温柔陪伴而非分析或策略。",
    ),
    (
        "oracle",
        (
            "什么意思",
            "喜不喜欢",
            "爱不爱",
            "信号",
            "暧昧",
            "忽冷忽热",
            "已读不回",
            "吊着",
            "备胎",
            "舔",
            "讨好",
            "说真话",
            "直说",
            "他到底",
            "她到底",
            "要不要继续发",
            "值不值得追",
        ),
        "祖师爷 · Oracle",
        "需要直球判断、读懂信号与进退分寸。",
    ),
    (
        "darwin",
        (
            "恋爱脑",
            "沉没成本",
            "投入产出",
            "错配",
            "止损",
            "观察窗",
            "值不值得继续",
            "要不要分手",
            "该不该分",
            "消耗型",
            "依赖",
            "将就",
            "清醒",
            "策略",
            "筹码",
        ),
        "进化论 · Darwin",
        "需要认知升维、看清关系位置与投入逻辑。",
    ),
    (
        "sage",
        (
            "为什么总是",
            "又一次",
            "模式",
            "结构",
            "依恋",
            "根源",
            "本质",
            "权力",
            "边界",
            "脚本",
            "重复",
            "老问题",
            "每次都",
        ),
        "学者 · Sage",
        "需要看见结构与重复模式，而非快速给答案。",
    ),
)


@lru_cache(maxsize=1)
def load_phrase_library() -> dict[str, Any]:
    if not PHRASE_LIBRARY_PATH.is_file():
        return {}
    return json.loads(PHRASE_LIBRARY_PATH.read_text(encoding="utf-8"))


def score_band_label(score: Any, library: dict[str, Any] | None = None) -> str:
    lib = library or load_phrase_library()
    try:
        numeric = float(score)
    except (TypeError, ValueError):
        return "需要结合更多相处经验继续观察。"
    for band in lib.get("sharedScoreBands", {}).get("ranges", []):
        if band.get("min", 0) <= numeric <= band.get("max", 100):
            return str(band.get("label") or "表现稳定")
    if numeric >= 80:
        return "这个维度是你的核心竞争力"
    if numeric >= 65:
        return "这个维度是你的重要资产"
    if numeric >= 51:
        return "这个维度表现稳定"
    if numeric >= 31:
        return "这个维度还在发展阶段"
    return "这个维度还有很大的成长空间"


def _strip_frontmatter(text: str) -> str:
    if not text.startswith("---"):
        return text.strip()
    end = text.find("---", 3)
    if end == -1:
        return text.strip()
    return text[end + 3 :].strip()


def load_shared_skill(slug: str) -> str:
    for base in (SHARED_SKILLS_DIR, REPO_SKILLS_DIR):
        path = base / slug / "SKILL.md"
        if path.is_file():
            return _strip_frontmatter(path.read_text(encoding="utf-8"))
    return ""


def build_mirror_tone_layer() -> str:
    lib = load_phrase_library()
    principles = lib.get("tonePrinciples") or []
    forbidden = (lib.get("aiPromptHints") or {}).get("forbiddenOutputs") or []
    bands = lib.get("sharedScoreBands", {}).get("ranges") or []
    band_lines = [
        f"- {b.get('min')}–{b.get('max')} 分 → {b.get('label')}"
        + (f"（禁止：{'、'.join(b['avoid'])}）" if b.get("avoid") else "")
        for b in bands
    ]
    skill = load_shared_skill("mirror-tone")
    skill_block = f"\n{skill}\n" if skill else ""
    return f"""
【MIRROR 共用语气层 — mirror-tone · 所有顾问必须遵守】
{chr(10).join(f"- {p}" for p in principles) or "- 用描述性语言，不用伤人标签"}

分数转述（禁止裸报 SA/RK/FS 等编号与具体数字）：
{chr(10).join(band_lines) or "- 低分用「成长空间」「还在路上」等正向包装"}

禁止输出：{'、'.join(forbidden) or "原始分数、你只配、裸标签"}
{skill_block}
""".strip()


def assess_crisis(message: str, history: list[dict[str, str]] | None = None) -> CrisisLevel:
    blob = message
    if history:
        blob = "\n".join(item.get("content", "") for item in history[-4:]) + "\n" + message
    if any(p.search(blob) for p in HIGH_CRISIS_PATTERNS):
        return "high"
    if any(p.search(blob) for p in ELEVATED_CRISIS_PATTERNS):
        return "elevated"
    return "none"


def build_crisis_response() -> str:
    return (
        "我听见你现在非常痛苦。你的安全比任何关系问题都重要。\n\n"
        "请现在就联系专业支持：\n"
        "· 全国心理援助热线 **12356**（24 小时）\n"
        "· 生命热线 **400-161-9995**\n\n"
        "如果身边有人，请告诉 ta 你需要陪伴；如有立即危险，请拨打 **120** 或前往最近急诊。\n\n"
        "我还在。你可以继续说说发生了什么，但请先确保自己是安全的。"
    )


def build_crisis_guard_layer(level: CrisisLevel) -> str:
    if level == "none":
        return ""
    skill = load_shared_skill("crisis-guard")
    if level == "high":
        return (
            "【危机护栏 — crisis-guard · 最高优先级】\n"
            "用户出现自伤/自杀相关表达。立即停止关系分析、策略与结构解读。\n"
            "只做：验证痛苦、强调安全、提供 12356 / 400-161-9995、建议联系身边人或急诊。\n"
            "禁止：说教、最小化、转移话题、「你应该坚强」。"
            + (f"\n{skill}" if skill else "")
        )
    return (
        "【危机护栏 —  elevated】\n"
        "用户情绪极度低落。先简短验证与稳定，再谈关系；若持续恶化，主动提供 12356 等资源。"
        + (f"\n{skill}" if skill else "")
    )


def _mate_position_from_summary(summary: dict[str, Any] | None) -> str:
    if not summary:
        return ""
    for key in ("matePosition", "positionType", "marketPosition"):
        val = summary.get(key)
        if val:
            return str(val)
    return ""


def _build_linkage_lines(
    self_s: dict[str, Any] | None,
    ros_s: dict[str, Any] | None,
    mate_s: dict[str, Any] | None,
    lib: dict[str, Any],
) -> list[str]:
    lines: list[str] = []
    templates = lib.get("crossSuiteTemplates") or {}

    if self_s and mate_s:
        tpl = (templates.get("SELF_MATE") or {}).get("template") or ""
        attachment = self_s.get("attachmentType") or "待判断"
        archetype = self_s.get("archetypeCode") or "你的画像"
        mate_pos = _mate_position_from_summary(mate_s) or "待定位"
        positive = (
            (lib.get("suiteHooks") or {})
            .get("SELF", {})
            .get("positiveFramingByAttachment", {})
            .get(str(attachment), "")
        )
        linkage = positive or "先肯定已有优势，再谈择偶标准与依恋模式是否同向。"
        if tpl:
            lines.append(
                tpl.format(
                    attachmentType=attachment,
                    archetypeCode=archetype,
                    matePosition=mate_pos,
                    linkageInsight=linkage,
                )
            )
        else:
            lines.append(f"SELF×MATE：{attachment}（{archetype}）×「{mate_pos}」。{linkage}")

    if self_s and ros_s:
        tpl = (templates.get("SELF_ROS") or {}).get("template") or ""
        attachment = self_s.get("attachmentType") or "待判断"
        rel_type = ros_s.get("relationshipType") or "这段关系"
        layer_insight = ros_s.get("description") or ros_s.get("tagline") or "结合相处质量综合看。"
        if tpl:
            lines.append(
                tpl.format(
                    attachmentType=attachment,
                    rosLayer=rel_type,
                    layerInsight=layer_insight,
                )
            )
        else:
            lines.append(f"SELF×ROS：依恋底色 {attachment}；关系侧 {rel_type}。{layer_insight}")

    if self_s and ros_s and mate_s:
        tpl = (templates.get("SELF_ROS_MATE") or {}).get("template") or ""
        one_line = f"{self_s.get('attachmentType')} · {ros_s.get('relationshipType') or '关系评估'} · {_mate_position_from_summary(mate_s) or '择偶定位'}"
        if tpl:
            lines.append(tpl.format(oneLineSummary=one_line))
        else:
            lines.append(f"三套齐全：{one_line}")

    return lines


def _format_suite_summary(label: str, summary: dict[str, Any] | None) -> str:
    if not summary:
        return f"- {label}：（尚未完成）"
    parts = [f"- {label}："]
    if summary.get("attachmentType"):
        parts.append(f"依恋 {summary['attachmentType']}")
    if summary.get("archetypeCode"):
        parts.append(f"原型 {summary['archetypeCode']}")
    if summary.get("relationshipType"):
        parts.append(f"关系类型 {summary['relationshipType']}")
    if summary.get("relationshipStage"):
        parts.append(f"阶段 {summary['relationshipStage']}")
    if summary.get("resonanceTier"):
        parts.append(f"共鸣 {summary['resonanceTier']}")
    mate_pos = _mate_position_from_summary(summary)
    if mate_pos:
        parts.append(f"定位 {mate_pos}")
    if summary.get("tagline"):
        parts.append(f"「{summary['tagline']}」")
    if summary.get("index") is not None:
        parts.append(f"（综合指数内部参考 {summary['index']}，勿裸报）")
    return " · ".join(parts)


def build_portrait_reader_layer(conn: Any, user_id: str) -> str:
    try:
        portrait = rebuild_and_cache_portrait(conn, user_id)
    except Exception:
        portrait = build_portrait(conn, user_id)

    lib = load_phrase_library()
    latest: dict[str, dict[str, Any] | None] = {key: None for key in PRODUCT_SETS}
    for product in portrait.get("products") or []:
        ps = product.get("productSet")
        if ps in latest and product.get("latest"):
            latest[ps] = product["latest"]

    completeness = portrait.get("completeness") or {}
    linkage = _build_linkage_lines(latest.get("SELF"), latest.get("ROS"), latest.get("MATE"), lib)
    skill = load_shared_skill("portrait-reader")

    lines = [
        "【MIRROR 完整画像摘要 — portrait-reader · 跨套联动，必须作为依据】",
        f"画像完整度：{completeness.get('percent', 0)}% · {completeness.get('label', '等待测试')}",
        _format_suite_summary("套一 SELF", latest.get("SELF")),
        _format_suite_summary("套二 ROS", latest.get("ROS")),
        _format_suite_summary("套三 MATE", latest.get("MATE")),
    ]
    if linkage:
        lines.append("套间联动：")
        lines.extend(f"  · {item}" for item in linkage)
    if skill:
        lines.append(skill)
    return "\n".join(lines)


def triage_counselor(message: str) -> dict[str, Any]:
    text = message.strip().lower()
    scores: dict[str, int] = {slug: 0 for slug, _, _, _ in TRIAGE_RULES}
    hits: dict[str, list[str]] = {slug: [] for slug, _, _, _ in TRIAGE_RULES}

    for slug, keywords, _, _ in TRIAGE_RULES:
        for kw in keywords:
            if kw.lower() in text:
                scores[slug] += 1
                hits[slug].append(kw)

    best_slug = max(scores, key=lambda s: scores[s])
    if scores[best_slug] == 0:
        return {
            "counselorId": "sage",
            "counselorName": "学者 · Sage",
            "confidence": "low",
            "reason": "暂未识别明确意图，默认从结构看见入手；你也可以直接选四位顾问之一。",
            "matchedSignals": [],
            "alternatives": [
                {"counselorId": "oracle", "label": "祖师爷 · 直球真话"},
                {"counselorId": "haven", "label": "港湾 · 陪伴"},
                {"counselorId": "darwin", "label": "进化论 · 策略"},
            ],
        }

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    second = ranked[1] if len(ranked) > 1 else ("sage", 0)
    confidence = "high" if scores[best_slug] >= 2 else "medium"
    if scores[best_slug] == scores.get(second[0], 0) and second[1] > 0:
        confidence = "medium"

    name, reason = "学者 · Sage", "需要深度看见关系结构与重复模式。"

    for slug, _, cname, creason in TRIAGE_RULES:
        if slug == best_slug:
            name, reason = cname, creason
            break

    alts = [
        {"counselorId": slug, "label": cname, "score": scores[slug]}
        for slug, _, cname, _ in TRIAGE_RULES
        if slug != best_slug and scores[slug] > 0
    ][:2]

    return {
        "counselorId": best_slug,
        "counselorName": name,
        "confidence": confidence,
        "reason": reason,
        "matchedSignals": hits[best_slug][:5],
        "alternatives": alts,
    }
