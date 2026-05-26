#!/usr/bin/env python3
"""Static copy attaches match_suggestions with deepExplore bodies."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.self_static_copy import attach_static_copy_to_payload


def main() -> None:
    payload = attach_static_copy_to_payload(
        {
            "archetype_code": "林黛玉",
            "attachment_type": "焦虑型",
            "archetype_profile": {"attachment_type": "焦虑型"},
        }
    )
    suggestions = (payload.get("static_copy") or {}).get("match_suggestions") or []
    assert len(suggestions) == 3, suggestions
    assert suggestions[0].get("deepExplore", {}).get("body"), suggestions[0]
    type_copy = (payload.get("static_copy") or {}).get("type") or {}
    assert type_copy.get("code", "").startswith("SELF-"), type_copy
    print("ok match_suggestions", len(suggestions), type_copy.get("code"))


if __name__ == "__main__":
    main()
