#!/usr/bin/env python3
"""Bond advice covers full attachment_collision_map."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ros_couple_content import FULL_BOND_ADVICE, get_bond_advice

COLLISION_PATH = ROOT / "data" / "suite2_ros_female.json"


def main() -> None:
    collision = json.loads(COLLISION_PATH.read_text(encoding="utf-8")).get("attachment_collision_map") or {}
    assert len(collision) >= 15, f"expected >=15 collision combos, got {len(collision)}"
    assert len(FULL_BOND_ADVICE) >= len(collision), (
        f"FULL_BOND_ADVICE {len(FULL_BOND_ADVICE)} < collision map {len(collision)}"
    )
    for key in collision:
        if key == "低自我高投入型×任意":
            advice = get_bond_advice("低自我高投入型", "回避型")
        else:
            you, ta = key.split("×", 1)
            advice = get_bond_advice(you, ta)
        assert advice.get("gap_reason"), f"missing gap_reason for {key}"
        assert advice.get("advice_you"), f"missing advice_you for {key}"
        assert advice.get("advice_ta"), f"missing advice_ta for {key}"
    print(f"ok bond advice keys={len(FULL_BOND_ADVICE)} collision={len(collision)}")


if __name__ == "__main__":
    main()
