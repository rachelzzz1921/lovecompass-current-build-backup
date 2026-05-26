"""Tests for slider guidance merge + validation."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.question_bank_guidance import (
    enrich_questions_slider_guidance,
    merge_slider_guidance,
    slider_has_guidance,
    validate_bank_slider_guidance,
)

DATA_DIR = ROOT / "data"


def test_merge_slider_guidance_copies_feedback():
    target = {
        "id": "AT-F-01",
        "type": "slider",
        "text": "你现在对他的吸引感",
        "slider": {"min": 0, "max": 100, "min_label": "a", "max_label": "b"},
    }
    source = {
        "id": "AT-F-01",
        "type": "slider",
        "slider": {
            "feedback": [{"range": [0, 50], "text": "引导文案"}],
            "footnote": "脚注",
        },
    }
    assert merge_slider_guidance(target, source) is True
    assert slider_has_guidance(target["slider"])
    assert target["slider"]["feedback"][0]["text"] == "引导文案"


def test_enrich_by_question_text():
    lite = [
        {
            "id": "IN-F-05",
            "type": "slider",
            "text": "跟他在一起，你整体的感觉是轻松还是有负担？",
            "slider": {"min": 0, "max": 100},
        }
    ]
    full = [
        {
            "id": "IN-M-12",
            "type": "slider",
            "text": "跟她在一起，你整体的感觉是轻松还是有负担？",
            "slider": {
                "feedback": [{"range": [0, 25], "text": "相处本身对你是一种消耗，这很重要"}],
            },
        }
    ]
    enrich_questions_slider_guidance(lite, full)
    assert slider_has_guidance(lite[0]["slider"])


def test_all_banks_have_slider_guidance():
    errors: list[str] = []
    for path in sorted(DATA_DIR.glob("suite*.json")):
        bank = json.loads(path.read_text(encoding="utf-8"))
        errors.extend(validate_bank_slider_guidance(bank, suite_label=path.name))
    assert not errors, "\n".join(errors)


if __name__ == "__main__":
    test_merge_slider_guidance_copies_feedback()
    test_enrich_by_question_text()
    test_all_banks_have_slider_guidance()
    print("test_slider_guidance=ok")
