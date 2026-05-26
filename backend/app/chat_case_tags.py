"""Scene tags for case retrieval — aligned with triage intent signals, not a parallel taxonomy."""

from __future__ import annotations

import re
from typing import Final

from app.chat_prompt_layers import strip_negated_signals

# Canonical tags (subset per counselor). Used in chat_case_examples.scene_tags and infer_scene_tags().
SCENE_TAGS: Final[frozenset[str]] = frozenset(
    {
        # haven
        "breakup",
        "emotional_crisis",
        "grief_companion",
        # oracle
        "signal_judgment",
        "worth_it",
        "dignity",
        "should_initiate",
        # darwin
        "sunk_cost",
        "relationship_position",
        "cognitive_dissonance",
        # sage
        "pattern_why_always",
        "attachment_roots",
    }
)

COUNSELOR_SCENE_TAGS: Final[dict[str, frozenset[str]]] = {
    "haven": frozenset({"breakup", "emotional_crisis", "grief_companion"}),
    "oracle": frozenset({"signal_judgment", "worth_it", "dignity", "should_initiate"}),
    "darwin": frozenset({"sunk_cost", "relationship_position", "cognitive_dissonance"}),
    "sage": frozenset({"pattern_why_always", "attachment_roots"}),
}

# (tag, regex, weight) — mirrors INTENT_TEMPLATES / TRIAGE_INTENT_BOOSTS phrasing
SCENE_TAG_PATTERNS: tuple[tuple[str, str, float], ...] = (
    ("breakup", r"(刚|刚刚).*(分手|被甩|被拒)|刚分手|分手了|失恋了|走不出来", 0.9),
    ("emotional_crisis", r"(陪|陪我|在吗|撑不住|崩|难受|睡不着|心好痛|好痛)", 0.85),
    ("grief_companion", r"(忘不掉|想他|想她|失去|哀伤|去世|离世)", 0.8),
    ("worth_it", r"(值不值得|要不要继续|还有没有必要|值不值得继续|值不值得追)", 0.9),
    ("signal_judgment", r"(他到底|她到底).*(喜不喜欢|什么意思|啥意思|爱不爱)|信号|看不懂|搞不清|忽冷忽热|已读不回", 0.85),
    ("should_initiate", r"(追|表白|要不要).*(时机|时间|现在)|要不要继续发|要不要告白", 0.75),
    ("dignity", r"(卑微|不尊重|太敏感|是不是我的问题|尊严|讨好)", 0.85),
    ("sunk_cost", r"(沉没成本|放不下|走不了|离不开|恋爱脑|付出很多)", 0.9),
    ("relationship_position", r"(我是不是.*(备胎|将就|凑合))|消耗|内耗|错配", 0.85),
    ("cognitive_dissonance", r"(知道.*(不好|有问题)|明明.*(不对|不合适)).*(就是|但是|可是)", 0.9),
    ("pattern_why_always", r"(为什么.*(总是|一直|反复|每次))|老是这样|重复出现", 0.9),
    ("attachment_roots", r"(依恋|模式|根源|深层|结构|为什么我.*(这样|会这样))", 0.85),
)


def infer_scene_tags(message: str, *, counselor_slug: str | None = None) -> list[str]:
    """Return up to 3 scene tags for the current user turn (triage-aligned)."""
    clean = strip_negated_signals(message)
    scores: dict[str, float] = {}
    allowed = COUNSELOR_SCENE_TAGS.get((counselor_slug or "").strip().lower())

    for tag, pattern, weight in SCENE_TAG_PATTERNS:
        if allowed is not None and tag not in allowed:
            continue
        if re.search(pattern, clean, re.IGNORECASE):
            scores[tag] = max(scores.get(tag, 0.0), weight)

    ranked = sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    return [tag for tag, w in ranked[:3] if w >= 0.5]


def filter_tags_for_counselor(tags: list[str], counselor_slug: str) -> list[str]:
    allowed = COUNSELOR_SCENE_TAGS.get(counselor_slug.strip().lower())
    if not allowed:
        return [t for t in tags if t in SCENE_TAGS]
    return [t for t in tags if t in allowed]
