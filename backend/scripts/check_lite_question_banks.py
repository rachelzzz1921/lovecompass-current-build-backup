#!/usr/bin/env python3
"""Verify lite question bank JSON matches the generator and has slider guidance.

Usage:
  cd backend && python3 scripts/check_lite_question_banks.py

If this fails with "stale", regenerate:
  python3 scripts/build_lite_question_banks.py
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


def _load_build_module():
    path = ROOT / "scripts" / "build_lite_question_banks.py"
    spec = importlib.util.spec_from_file_location("build_lite_question_banks", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    builder = _load_build_module()
    expected_banks = builder.all_lite_banks()

    guidance_errors = builder.validate_lite_bank_guidance(expected_banks)
    if guidance_errors:
        print("lite_question_banks=fail (slider guidance)")
        for line in guidance_errors:
            print(line)
        raise SystemExit(1)

    stale: list[str] = []
    for filename, expected in expected_banks:
        path = DATA_DIR / filename
        if not path.is_file():
            stale.append(f"missing {filename}")
            continue
        actual = _load_json(path)
        if actual != expected:
            stale.append(filename)

    if stale:
        print("lite_question_banks=fail (stale JSON — run build script)")
        for name in stale:
            print(f"  stale: {name}")
        print("\nFix:")
        print("  cd backend && python3 scripts/build_lite_question_banks.py")
        print("  git add backend/data/*_lite.json")
        raise SystemExit(1)

    print(f"lite_question_banks=ok ({len(expected_banks)} banks)")


if __name__ == "__main__":
    main()
