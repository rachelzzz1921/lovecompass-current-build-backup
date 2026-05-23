from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
ENV = ROOT / ".env"
if ENV.exists():
    for raw in ENV.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), value)

from app.main import app  # noqa: E402

client = TestClient(app)

CASES = [
    {"suite": "s01_self_female", "code": "LC-E2E-F-20260523"},
    {"suite": "s01_self_male", "code": "LC-E2E-M-20260523"},
]


def build_answer(question: dict[str, Any]) -> dict[str, Any]:
    qtype = question.get("type")
    kind = question.get("kind")
    ui = question.get("ui") or {}
    options = question.get("options") or []

    if qtype == "rank" or kind == "rank":
        items = ui.get("items") or []
        return {"orderedItemIds": [str(item.get("id")) for item in items]}

    if qtype in {"likert", "scale", "slider"} or kind in {"scale", "slider"}:
        min_v = ui.get("min", 1)
        max_v = ui.get("max", 5)
        try:
            value = (float(min_v) + float(max_v)) / 2
            if float(value).is_integer():
                value = int(value)
        except Exception:
            value = 3
        return {"value": value}

    if options:
        option = options[0]
        return {"optionKey": option.get("key"), "optionIndex": 0}

    return {"value": 3}


def assert_ok(resp, label: str) -> dict[str, Any]:
    if resp.status_code >= 400:
        raise AssertionError(f"{label} failed: status={resp.status_code}, body={resp.text}")
    return resp.json()


def run_case(case: dict[str, str]) -> dict[str, Any]:
    verify = assert_ok(client.post("/redemption/verify", json={"code": case["code"], "product": case["suite"]}), "redemption")
    suite_slug = verify["suiteSlug"]
    questions_payload = assert_ok(client.get(f"/tests/{suite_slug}/questions"), "questions")
    questions = questions_payload["questions"]
    answers = [
        {
            "questionId": q["id"],
            "externalId": q["externalId"],
            "kind": q.get("kind") or q.get("type") or "unknown",
            "answerPayload": build_answer(q),
            "durationMs": 1000,
        }
        for q in questions
    ]
    attempt = assert_ok(
        client.post(
            "/attempts",
            json={
                "suiteSlug": suite_slug,
                "redemptionEventId": verify["redemptionEventId"],
                "answers": answers,
            },
        ),
        "attempt",
    )
    result = assert_ok(client.get(f"/attempts/{attempt['attemptId']}/result"), "result")
    attempt_payload = result["attempt"]
    return {
        "inputSuite": case["suite"],
        "suiteSlug": suite_slug,
        "code": case["code"],
        "redemptionEventId": verify["redemptionEventId"],
        "questionCount": len(questions),
        "attemptId": attempt["attemptId"],
        "status": attempt["status"],
        "resultArchetype": attempt_payload.get("archetype_code"),
        "rosIndex": attempt_payload.get("ros_index"),
        "dimensionKeys": sorted((attempt_payload.get("dimension_scores") or {}).keys()),
    }


def main() -> None:
    health = assert_ok(client.get("/health"), "health")
    print({"health": health})
    results = [run_case(case) for case in CASES]
    for item in results:
        print(item)
    print("e2e_attempt_flow=ok")


if __name__ == "__main__":
    main()
