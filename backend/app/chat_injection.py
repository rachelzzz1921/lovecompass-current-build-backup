"""Chat context injection contract — single source of truth for portrait/profile layers."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from app.profile_center import load_portrait_for_chat
from app.suite_context import resolve_attempt_product_set


@dataclass(frozen=True)
class ChatInjectionState:
    """What was actually sent to the model for this turn."""

    has_portrait_layer: bool
    has_profile_block: bool
    has_completed_tests: bool
    bound_product_set: str | None

    @property
    def profile_ready(self) -> bool:
        return self.has_profile_block or self.has_portrait_layer

    def to_meta(self) -> dict[str, Any]:
        return {
            "hasPortraitLayer": self.has_portrait_layer,
            "hasProfileBlock": self.has_profile_block,
            "hasCompletedTests": self.has_completed_tests,
            "boundProductSet": self.bound_product_set,
            "profileReady": self.profile_ready,
        }


def portrait_has_completed_tests(portrait: dict[str, Any] | None) -> bool:
    if not portrait:
        return False
    for product in portrait.get("products") or []:
        if isinstance(product.get("latest"), dict):
            return True
    return False


def load_portrait_bundle(
    conn: Any,
    user_id: str,
    attempt: dict[str, Any] | None,
    *,
    refresh: bool = False,
) -> tuple[dict[str, Any] | None, str | None]:
    """Load portrait once per chat turn; return (portrait, bound_product_set)."""
    if conn is None or not user_id:
        return None, None
    portrait = load_portrait_for_chat(conn, user_id, refresh=refresh)
    bound: str | None = None
    if attempt:
        try:
            bound = resolve_attempt_product_set(attempt)
        except Exception:
            bound = None
    return portrait, bound


_PROFILE_DENIAL_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(p, re.IGNORECASE)
    for p in (
        r"尚未接入[^。；\n]{0,24}",
        r"接入不了[^。；\n]{0,24}",
        r"没法接入[^。；\n]{0,24}",
        r"没有接入[^。；\n]{0,24}",
        r"还没有(?:你的)?数据",
        r"画像(?:还)?没(?:有)?(?:接|连)上",
        r"测评(?:数据|结果)?(?:还)?未接入",
    )
)


def guard_chat_output(text: str, *, injection: ChatInjectionState | None) -> str:
    """Strip false「未接入画像」claims when context was actually injected."""
    if not text or not injection or not injection.profile_ready:
        return text
    cleaned = text
    for pattern in _PROFILE_DENIAL_PATTERNS:
        cleaned = pattern.sub("", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    if len(cleaned) < 12:
        return (
            "你的测评画像已在对话上下文里，我直接按你的问题说——"
            "你具体想聊信号、值不值得继续，还是尊严和节奏？"
        )
    return cleaned


def profile_ready_requirement(injection: ChatInjectionState) -> str:
    if not injection.profile_ready:
        return ""
    return (
        "\n- 用户测评画像已在上方 user 消息中注入；禁止说「尚未接入数据」「接入不了」「没有你的数据」"
        "；必须至少引用一条画像线索作答"
    )
