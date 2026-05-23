from __future__ import annotations

import json
import urllib.error
import urllib.request
from collections import Counter

BASE = "http://127.0.0.1:8000"


def request(method: str, path: str, payload: dict | None = None) -> tuple[int, dict]:
    data = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError:
            parsed = {"raw": body}
        return exc.code, parsed


def pick_answer(question: dict) -> dict:
    kind = question.get("kind")
    if kind in {"choice", "binary", "card", "mood"}:
        option = question.get("options", [])[0]
        return {
            "questionId": question["id"],
            "externalId": question.get("externalId"),
            "kind": kind,
            "answerPayload": {"optionKey": option.get("key"), "optionIndex": 0},
        }
    if kind in {"scale", "slider"}:
        ui = question.get("ui") or {}
        value = ui.get("default")
        if value is None:
            minimum = ui.get("min", 1)
            maximum = ui.get("max", 5)
            value = round((minimum + maximum) / 2)
        return {
            "questionId": question["id"],
            "externalId": question.get("externalId"),
            "kind": kind,
            "answerPayload": {"value": value},
        }
    if kind == "rank":
        items = question.get("items") or question.get("ui", {}).get("items") or []
        ordered = [item.get("id") or item.get("key") or str(index) for index, item in enumerate(items)]
        return {
            "questionId": question["id"],
            "externalId": question.get("externalId"),
            "kind": kind,
            "answerPayload": {"orderedItemIds": ordered},
        }
    raise ValueError(f"unsupported kind: {kind}")


print("HEALTH")
print(request("GET", "/health"))

for slug, code in [("s01_self_female", "LC-E2E-F-20260523"), ("s01_self_male", "LC-E2E-M-20260523")]:
    print(f"\nSUITE {slug}")
    status, data = request("GET", f"/tests/{slug}/questions")
    print("questions_status", status)
    if status != 200:
        print(data)
        continue
    questions = data["questions"]
    print("suite", data["suite"]["slug"], "total", data["suite"]["totalQuestions"], "loaded", len(questions))
    print("kinds", dict(sorted(Counter(q["kind"] for q in questions).items())))

    status, redemption = request("POST", "/redemption/verify", {"product": "self", "code": code})
    print("redeem_status", status, redemption.get("success"), redemption.get("redemptionEventId"))
    if status != 200:
        print(redemption)
        continue

    answers = [pick_answer(q) for q in questions]
    status, attempt = request(
        "POST",
        "/attempts",
        {"suiteSlug": slug, "redemptionEventId": redemption.get("redemptionEventId"), "answers": answers},
    )
    print("attempt_status", status, attempt.get("attemptId"), attempt.get("next"))
    if status != 200:
        print(attempt)
        continue

    status, result = request("GET", f"/attempts/{attempt['attemptId']}/result")
    print("result_status", status)
    if status == 200:
        print("result_keys", sorted(result.keys()))
        print("overall", result.get("overallScore"), "attachment", result.get("attachmentType"))
    else:
        print(result)
