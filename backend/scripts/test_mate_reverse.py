from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_reverse import build_reverse_card, load_reverse_library


def test_library_loads() -> None:
    lib = load_reverse_library()
    assert lib.get("engine") == "MATE_REVERSE_V1"
    assert "被读懂之前的人" in (lib.get("by_position") or {})


def test_position_specific_copy() -> None:
    low = build_reverse_card({"trait_atoms": ["低显示"]}, "被读懂之前的人")
    open_type = build_reverse_card({"trait_atoms": []}, "需要被正确打开的人")
    assert low["front"]["content"] != open_type["front"]["content"]
    assert "你" in open_type["back"]["content"] or "真实" in open_type["back"]["mechanism"]


if __name__ == "__main__":
    test_library_loads()
    test_position_specific_copy()
    print("mate reverse tests passed")
