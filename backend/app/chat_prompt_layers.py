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
    from app.semantic_translation import FORBIDDEN_RULES_MARKDOWN

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

{FORBIDDEN_RULES_MARKDOWN}
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
    if summary.get("primaryMetric") and summary.get("primaryMetricLabel"):
        parts.append(f"{summary['primaryMetricLabel']} {summary['primaryMetric']}")
    elif summary.get("primaryMetric"):
        parts.append(str(summary["primaryMetric"]))
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


SUITE_LABELS = {
    "SELF": "套一 SELF",
    "ROS": "套二 ROS",
    "MATE": "套三 MATE",
}

PORTRAIT_READER_WITH_ATTEMPT = """
【跨套画像摘要 · 补充视角层】
当前对话已绑定：{bound_suite_label}（详细画像见下一条 profile_block）
以下为其他已完成套件的摘要，仅作补充，不重复 profile_block 内容

{other_suite_headlines}

跨套联动线索（优先用于「为什么总是这样」类模式追问）：
{cross_model_summary}

使用规范：
- 用户问当前套（{bound_suite_label}）相关问题：不引用本层，以 profile_block 为准
- 用户问模式/根源/为什么反复：优先引用跨套联动线索
- 用户问其他套细节：可轻度引用 other_suite_headlines，但提醒「这套没有绑定，细节有限」
- 禁止报具体分数和维度编号；禁止说「根据你的测试」「你的数据显示」
  → 改用：「从你描述的方式来看」「你提到的这个倾向」
""".strip()

PORTRAIT_READER_NO_ATTEMPT = """
【跨套画像摘要 · 主要画像层】
用户已完成以下套件，以下为综合摘要（画像完整度 {completeness_percent}% · {completeness_label}）：

{all_suite_headlines}

跨套联动线索：
{cross_model_summary}

使用规范：
- 回答时优先织入与用户问题最相关的套件线索
- 跨套联动线索用于模式类、根源类问题
- 禁止报具体分数和维度编号
- 禁止说「尚未接入数据」
""".strip()

PORTRAIT_READER_NO_DATA = """
【画像状态：用户尚未完成任何套件】
- 完全基于对话内容回答
- 不说「你还没有画像」「等你完成测试」等催促话术
- 可在合适时机自然提及：「如果你做过 SELF 测评，我们可以看得更深」
- 禁止说「尚未接入数据」
""".strip()


def _suite_label(product_set: str) -> str:
    return SUITE_LABELS.get(product_set.upper(), product_set)


def _build_suite_headline_natural(product_set: str, summary: dict[str, Any]) -> str:
    ps = product_set.upper()
    theme = str(summary.get("tagline") or summary.get("description") or "").strip()
    theme_bit = f"——{theme[:40]}" if theme else ""

    if ps == "SELF":
        attachment = summary.get("attachmentType") or summary.get("primaryMetric") or "待判断"
        return f"· SELF：你在自我关系上的底色是「{attachment}」{theme_bit}"
    if ps == "ROS":
        rel = summary.get("relationshipType") or summary.get("primaryMetric") or "这段关系"
        stage = summary.get("relationshipStage") or "进行中"
        return f"· ROS：这段关系目前的主型是「{rel}」，处于「{stage}」阶段{theme_bit}"
    if ps == "MATE":
        pos = _mate_position_from_summary(summary) or summary.get("primaryMetric") or "待定位"
        return f"· MATE：在择偶市场上，你的位置偏向「{pos}」{theme_bit}"
    return f"· {ps}：{summary.get('primaryMetric') or '已完成'}{theme_bit}"


def _format_cross_summary(linkage: list[str]) -> str:
    if not linkage:
        return "（暂无跨套联动，可仅依据各套摘要回答）"
    return "\n".join(f"  · {line}" for line in linkage)


def _portrait_latest_map(portrait: dict[str, Any]) -> dict[str, dict[str, Any] | None]:
    latest: dict[str, dict[str, Any] | None] = {key: None for key in PRODUCT_SETS}
    for product in portrait.get("products") or []:
        ps = product.get("productSet")
        if ps in latest and product.get("latest"):
            latest[ps] = product["latest"]
    return latest


def build_portrait_reader_layer(
    conn: Any,
    user_id: str,
    *,
    exclude_product_set: str | None = None,
) -> str:
    """跨套画像摘要；exclude_product_set = 当前绑定套（详情在 profile_block，此处只列其他套）。"""
    try:
        portrait = rebuild_and_cache_portrait(conn, user_id)
    except Exception:
        portrait = build_portrait(conn, user_id)

    latest = _portrait_latest_map(portrait)
    if not any(latest.values()):
        return PORTRAIT_READER_NO_DATA

    lib = load_phrase_library()
    linkage = _build_linkage_lines(latest.get("SELF"), latest.get("ROS"), latest.get("MATE"), lib)
    cross_summary = _format_cross_summary(linkage)
    completeness = portrait.get("completeness") or {}
    bound = (exclude_product_set or "").strip().upper() or None

    if bound:
        other_lines: list[str] = []
        for key in PRODUCT_SETS:
            if key == bound:
                continue
            summary = latest.get(key)
            if summary:
                other_lines.append(_build_suite_headline_natural(key, summary))
        return PORTRAIT_READER_WITH_ATTEMPT.format(
            bound_suite_label=_suite_label(bound),
            other_suite_headlines="\n".join(other_lines) if other_lines else "（暂无其他已完成套件）",
            cross_model_summary=cross_summary,
        )

    all_lines = []
    for key in PRODUCT_SETS:
        summary = latest.get(key)
        if summary:
            all_lines.append(_build_suite_headline_natural(key, summary))
    return PORTRAIT_READER_NO_ATTEMPT.format(
        completeness_percent=completeness.get("percent", 0),
        completeness_label=completeness.get("label", "等待测试"),
        all_suite_headlines="\n".join(all_lines) if all_lines else "（暂无摘要）",
        cross_model_summary=cross_summary,
    )


# --- Triage v2: 否定词 mask + 意图模板 + 关键词融合 ---

NEGATION_PATTERNS: tuple[str, ...] = (
    r"不想(分手|崩溃|哭|放弃|离婚)",
    r"不要(分手|离婚)",
    r"没有(在哭|崩|失恋|分手)",
    r"还没(分手|离婚)",
    r"不是(分手|离婚|备胎)",
    r"只是想(分析|聊聊|了解|说说)",
    r"不是.*问题.*是.*",
)

INTENT_TEMPLATES: dict[str, list[tuple[str, float]]] = {
    "haven": [
        (r"(刚|刚刚).*(分手|被甩|被拒)", 0.9),
        (r"(哭|崩|难受|睡不着).*(好久|很久|一直|整晚)", 0.85),
        (r"(陪|陪我|在吗|我很难受|撑不住)", 0.8),
        (r"(憋|压抑|说不出口).*(好久|很久|一直)", 0.75),
    ],
    "oracle": [
        (r"(值不值得|要不要继续|还有没有必要)", 0.9),
        (r"(他到底|她到底).*(喜不喜欢|什么意思|啥意思|爱不爱)", 0.85),
        (r"(信号|暗示|什么意思).*(看不懂|不确定|搞不清)", 0.8),
        (r"(追|表白|要不要).*(时机|时间|现在)", 0.75),
    ],
    "darwin": [
        (r"(知道.*(不好|有问题)|明明.*(不对|不合适)).*(就是|但是|可是)", 0.9),
        (r"(沉没成本|放不下|走不了|离不开|恋爱脑)", 0.85),
        (r"(消耗|内耗|很累).*(还在|还没走|不知道怎么)", 0.8),
        (r"(我是不是.*(备胎|将就|凑合))", 0.85),
    ],
    "sage": [
        (r"(为什么.*(总是|一直|反复|每次))", 0.9),
        (r"(依恋|模式|根源|深层|结构)", 0.85),
        (r"(为什么我.*(这样|会这样|老是这样))", 0.8),
    ],
}

# 关键词命中时若同时出现否定短语，则不计分（兼容旧逻辑）
TRIAGE_KEYWORD_NEGATIONS: dict[str, dict[str, tuple[str, ...]]] = {
    "haven": {
        "分手": ("不想分手", "不要分手", "还没分手", "不是分手", "没有分手", "没分手", "并未分手"),
        "离婚": ("不想离婚", "不要离婚", "还没离婚", "不是离婚"),
        "失去": ("不想失去", "怕失去", "害怕失去"),
    },
    "darwin": {
        "分手": ("不想分手", "不要分手", "还没分手"),
        "止损": ("不想止损", "不必止损"),
    },
    "oracle": {
        "备胎": ("不是备胎", "不想当备胎", "不愿当备胎"),
    },
}

TRIAGE_INTENT_BOOSTS: tuple[tuple[str, str, int], ...] = (
    ("haven", r"刚分手|分手了|失恋了|走不出来", 2),
    ("oracle", r"他到底|她到底|什么意思|爱不爱我", 2),
    ("darwin", r"恋爱脑|沉没成本|值不值得继续", 2),
    ("sage", r"为什么总是|老是这样|重复出现", 2),
)


def _triage_keyword_counts(text: str) -> tuple[dict[str, int], dict[str, list[str]]]:
    scores: dict[str, int] = {slug: 0 for slug, _, _, _ in TRIAGE_RULES}
    hits: dict[str, list[str]] = {slug: [] for slug, _, _, _ in TRIAGE_RULES}

    for slug, keywords, _, _ in TRIAGE_RULES:
        neg_map = TRIAGE_KEYWORD_NEGATIONS.get(slug, {})
        for kw in keywords:
            kw_l = kw.lower()
            if kw_l not in text:
                continue
            blocked = False
            for neg in neg_map.get(kw, ()):
                if neg in text:
                    blocked = True
                    break
            if blocked:
                continue
            scores[slug] += 1
            hits[slug].append(kw)

    for slug, pattern, boost in TRIAGE_INTENT_BOOSTS:
        if re.search(pattern, text):
            scores[slug] += boost
            hits[slug].append(f"intent:{pattern[:24]}")

    return scores, hits


def strip_negated_signals(message: str) -> str:
    """把否定语境里的关键词 mask 掉再做关键词匹配。"""
    text = message
    for pattern in NEGATION_PATTERNS:
        text = re.sub(pattern, "[NEGATED]", text, flags=re.IGNORECASE)
    return text


def match_intent_templates(message: str) -> dict[str, float]:
    scores = {slug: 0.0 for slug, _, _, _ in TRIAGE_RULES}
    clean = strip_negated_signals(message)
    for counselor, patterns in INTENT_TEMPLATES.items():
        for pattern, weight in patterns:
            if re.search(pattern, clean, re.IGNORECASE):
                scores[counselor] = max(scores[counselor], weight)
    return scores


TRIAGE_LLM_THRESHOLD = 0.65
TRIAGE_VALID_SLUGS = frozenset({"haven", "oracle", "darwin", "sage"})

TRIAGE_LLM_PROMPT = """
你是 MIRROR 平台的分诊系统。根据用户消息，判断最适合的顾问。

四位顾问核心定位：
- haven：情绪崩溃、失恋、需要先被接住、长期压抑
- oracle：值不值得、信号判断、择偶策略、尊严问题
- darwin：恋爱脑、依赖模式、止损判断、关系位置
- sage：为什么总这样、依恋根源、模式分析、深层结构

用户消息：{message}

只输出 JSON，不要 markdown 代码块，格式：
{{"counselor":"haven|oracle|darwin|sage","confidence":0.0,"reason":"10字以内"}}
""".strip()


def _triage_meta_for_slug(slug: str) -> tuple[str, str]:
    for s, _, cname, creason in TRIAGE_RULES:
        if s == slug:
            return cname, creason
    return "学者 · Sage", "需要深度看见关系结构与重复模式。"


def _confidence_label(score: float) -> str:
    if score >= 0.85:
        return "high"
    if score >= 0.55:
        return "medium"
    return "low"


def _triage_result_payload(
    slug: str,
    *,
    confidence: str,
    reason: str | None = None,
    matched_signals: list[str] | None = None,
    fused: dict[str, float] | None = None,
    alternatives: list[dict[str, Any]] | None = None,
    source: str = "rules",
) -> dict[str, Any]:
    name, default_reason = _triage_meta_for_slug(slug)
    alts: list[dict[str, Any]] = list(alternatives or [])
    if not alts and fused:
        alts = [
            {"counselorId": s, "label": cname, "score": round(fused[s], 2)}
            for s, _, cname, _ in TRIAGE_RULES
            if s != slug and fused.get(s, 0) >= 0.35
        ][:2]
    signals = list(matched_signals or [])
    if source == "llm":
        signals.append("triage:llm")
    return {
        "counselorId": slug,
        "counselorName": name,
        "confidence": confidence,
        "reason": reason or default_reason,
        "matchedSignals": signals[:5],
        "alternatives": alts,
    }


def _triage_llm_enabled() -> bool:
    import os

    flag = os.getenv("TRIAGE_USE_LLM", "1").strip().lower()
    return flag not in ("0", "false", "no", "off")


def triage_with_llm(message: str) -> dict[str, Any] | None:
    """轻量 LLM 分诊；失败时返回 None 由规则兜底。"""
    if not _triage_llm_enabled():
        return None
    text = (message or "").strip()
    if not text:
        return None

    try:
        from app.ai_adapter import get_ai_adapter
        from app.semantic_translation import guard_ai_json

        adapter = get_ai_adapter()
        prompt = TRIAGE_LLM_PROMPT.format(message=text[:800])
        raw = adapter.generate(prompt, json_mode=True)
        payload = json.loads(guard_ai_json(raw) if raw.strip().startswith("{") else raw)
    except Exception:
        return None

    counselor = str(payload.get("counselor") or payload.get("counselorId") or "sage").strip().lower()
    if counselor not in TRIAGE_VALID_SLUGS:
        counselor = "sage"

    try:
        conf_num = float(payload.get("confidence", 0.7))
    except (TypeError, ValueError):
        conf_num = 0.7
    conf_num = max(0.0, min(1.0, conf_num))
    reason = str(payload.get("reason") or "").strip()[:80]

    return _triage_result_payload(
        counselor,
        confidence=_confidence_label(conf_num),
        reason=reason or None,
        source="llm",
    )


def _triage_fused_scores(message: str) -> tuple[dict[str, float], dict[str, list[str]]]:
    raw = message.strip().lower()
    clean = strip_negated_signals(raw)
    keyword_scores, hits = _triage_keyword_counts(clean)
    template_scores = match_intent_templates(raw)

    slugs = [slug for slug, _, _, _ in TRIAGE_RULES]
    fused: dict[str, float] = {}
    for slug in slugs:
        kw = keyword_scores.get(slug, 0)
        tpl = template_scores.get(slug, 0.0)
        fused[slug] = kw * 0.3 + tpl * 0.7
        if tpl >= 0.85:
            fused[slug] += 0.5
    return fused, hits


def triage_counselor(message: str) -> dict[str, Any]:
    text = message.strip().lower()
    if not text:
        return _triage_result_payload(
            "sage",
            confidence="low",
            reason="暂未识别明确意图，默认从结构看见入手。",
        )

    fused, hits = _triage_fused_scores(text)
    best_slug = max(fused, key=lambda s: fused[s])
    top_score = fused[best_slug]

    if top_score < TRIAGE_LLM_THRESHOLD:
        llm_result = triage_with_llm(message)
        if llm_result:
            return llm_result

    if top_score < 0.35:
        return _triage_result_payload(
            "sage",
            confidence="low",
            reason="暂未识别明确意图，默认从结构看见入手；你也可以直接选四位顾问之一。",
            alternatives=[
                {"counselorId": "oracle", "label": "祖师爷 · 直球真话"},
                {"counselorId": "haven", "label": "港湾 · 陪伴"},
                {"counselorId": "darwin", "label": "进化论 · 策略"},
            ],
        )

    ranked = sorted(fused.items(), key=lambda x: x[1], reverse=True)
    second = ranked[1] if len(ranked) > 1 else ("sage", 0.0)
    confidence = _confidence_label(top_score)
    if fused.get(second[0], 0) >= top_score - 0.15 and second[1] > 0:
        confidence = "medium" if confidence == "high" else confidence

    matched = hits.get(best_slug, [])[:5]
    if not matched:
        tpl_score = match_intent_templates(text).get(best_slug, 0.0)
        if tpl_score > 0:
            matched.append(f"intent:{tpl_score:.2f}")

    _, reason = _triage_meta_for_slug(best_slug)
    return _triage_result_payload(
        best_slug,
        confidence=confidence,
        reason=reason,
        matched_signals=matched,
        fused=fused,
    )
