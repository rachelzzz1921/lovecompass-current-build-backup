#!/usr/bin/env python3
"""Fail if any question bank slider is missing user-facing guidance."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.question_bank_guidance import validate_bank_slider_guidance

DATA_DIR = ROOT / "data"

BANK_FILES = sorted(DATA_DIR.glob("suite*.json"))


def main() -> None:
    errors: list[str] = []
    for path in BANK_FILES:
        bank = json.loads(path.read_text(encoding="utf-8"))
        errors.extend(validate_bank_slider_guidance(bank, suite_label=path.name))
    if errors:
        print("slider_guidance=fail")
        for line in errors:
            print(line)
        raise SystemExit(1)
    print(f"slider_guidance=ok ({len(BANK_FILES)} banks)")


if __name__ == "__main__":
    main()
