#!/usr/bin/env python3
"""Validate all lite suite banks can submit and reach completed results.

Usage:
  LOVECOMPASS_API_BASE=https://lovecompass-api-backend.vercel.app python3 scripts/validate_lite_suites.py
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

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
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

API_BASE = os.getenv("LOVECOMPASS_API_BASE", "http://127.0.0.1:8000").rstrip("/")
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://wjfpglsygkbpubanylug.supabase.co").rstrip("/")
SUPABASE_ANON_KEY = os.getenv(
    "SUPABASE_ANON_KEY",
    os.getenv(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZnBnbHN5Z2ticHViYW55bHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODIzMDUsImV4cCI6MjA5NTA1ODMwNX0.a38qw2kaeEZ-T2N5gTLKwQWdBb02iV1riHWhstbqptk",
    ),
)

EMAIL = os.getenv("INITIATOR_EMAIL", "lovecompass.test@example.com")
PASSWORD = os.getenv("INITIATOR_PASSWORD", "LoveCompassTest2026!")

UNIVERSAL_CODE = os.getenv("LOVECOMPASS_UNIVERSAL_CODE", "MIRROR-ALL-ACCESS")

LITE_CASES = [
    {"product": "self", "suite": "s01_self_female_lite", "code": None, "gender": "female"},
    {"product": "self", "suite": "s01_self_male_lite", "code": None, "gender": "male"},
    {
        "product": "ros",
        "suite": "s02_ros_female_lite",
        "code": os.getenv("ROS_FEMALE_CODE", "LC-ROS-F-20260524"),
        "gender": "female",
    },
    {
        "product": "ros",
        "suite": "s02_ros_male_lite",
        "code": os.getenv("ROS_MALE_CODE", "LC-ROS-M-20260524"),
        "gender": "male",
    },
    {
        "product": "mate",
        "suite": "s03_mate_female_lite",
        "code": os.getenv("MATE_FEMALE_CODE", UNIVERSAL_CODE),
        "gender": "female",
    },
    {
        "product": "mate",
        "suite": "s03_mate_male_lite",
        "code": os.getenv("MATE_MALE_CODE", UNIVERSAL_CODE),
        "gender": "male",
    },
]


def _request(
    method: str,
    path: str,
    *,
    payload: dict | None = None,
    token: str | None = None,
) -> tuple[int, dict[str, Any]]:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(f"{API_BASE}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError:
            parsed = {"raw": body}
        return exc.code, parsed


def _login(email: str, password: str) -> str:
    payload = json.dumps({"email": email, "password": password}).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        data=payload,
        headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    token = data.get("access_token")
    if not token:
        raise RuntimeError(f"login failed for {email}: {data}")
    return token


def _assert_ok(status: int, data: dict[str, Any], label: str) -> dict[str, Any]:
    if status >= 400:
        raise AssertionError(f"{label} failed: status={status}, body={data}")
    return data


def _build_answer(question: dict[str, Any]) -> dict[str, Any]:
    kind = question.get("kind") or question.get("type") or "unknown"
    ui = question.get("ui") or {}
    options = question.get("options") or []

    if kind == "rank":
        items = ui.get("items") or []
        return {"orderedItemIds": [str(item.get("id") or item.get("key")) for item in items]}

    if kind in {"scale", "slider", "likert"}:
        minimum = ui.get("min", 1)
        maximum = ui.get("max", 5)
        value = round((float(minimum) + float(maximum)) / 2)
        if float(value).is_integer():
            value = int(value)
        return {"value": value}

    if options:
        pick = options[0]
        return {"optionKey": pick.get("key"), "optionIndex": 0}

    return {"value": 3}


def _wait_completed(token: str, attempt_id: str) -> dict[str, Any]:
    deadline = time.time() + 120
    while time.time() < deadline:
        result = _assert_ok(
            *_request("GET", f"/attempts/{attempt_id}/result", token=token),
            "result",
        )
        attempt = result.get("attempt") or {}
        if attempt.get("status") == "completed":
            return attempt
        time.sleep(0.45)
    raise AssertionError(f"attempt {attempt_id} did not complete in time")


def run_case(token: str, case: dict[str, Any]) -> dict[str, Any]:
    suite_slug = case["suite"]
    redemption_event_id = None

    if case["code"]:
        verify = _assert_ok(
            *_request(
                "POST",
                "/redemption/verify",
                payload={
                    "code": case["code"],
                    "product": case["product"],
                    "suiteSlug": suite_slug,
                    "gender": case["gender"],
                },
                token=token,
            ),
            f"verify:{suite_slug}",
        )
        if verify.get("suiteSlug") != suite_slug:
            raise AssertionError(
                f"verify returned wrong suite: expected {suite_slug}, got {verify.get('suiteSlug')}"
            )
        redemption_event_id = verify.get("redemptionEventId")

    questions_payload = _assert_ok(
        *_request("GET", f"/tests/{suite_slug}/questions", token=token),
        f"questions:{suite_slug}",
    )
    questions = questions_payload["questions"]
    answers = [
        {
            "questionId": q["id"],
            "externalId": q["externalId"],
            "kind": q.get("kind") or q.get("type") or "unknown",
            "answerPayload": _build_answer(q),
            "durationMs": 600,
        }
        for q in questions
    ]
    body: dict[str, Any] = {"suiteSlug": suite_slug, "answers": answers}
    if redemption_event_id:
        body["redemptionEventId"] = redemption_event_id

    attempt = _assert_ok(
        *_request("POST", "/attempts", payload=body, token=token),
        f"submit:{suite_slug}",
    )
    attempt_id = attempt["attemptId"]
    completed = _wait_completed(token, attempt_id)

    product_set = case["product"].upper()
    if product_set == "ROS":
        _assert_ok(*_request("GET", f"/ros/attempts/{attempt_id}/single", token=token), f"ros-single:{suite_slug}")
    elif product_set == "MATE":
        _assert_ok(*_request("GET", f"/mate/attempts/{attempt_id}/single", token=token), f"mate-single:{suite_slug}")

    payload = completed.get("result_payload") or {}
    if payload.get("suiteTier") != "lite":
        raise AssertionError(f"{suite_slug} missing suiteTier=lite in result_payload")

    return {
        "suite": suite_slug,
        "attemptId": attempt_id,
        "questionCount": len(questions),
        "status": completed.get("status"),
        "productSet": payload.get("productSet") or product_set,
    }


def main() -> None:
    print({"api": API_BASE})
    _assert_ok(*_request("GET", "/health"), "health")
    token = _login(EMAIL, PASSWORD)
    results = []
    for case in LITE_CASES:
        item = run_case(token, case)
        results.append(item)
        print(item)
    print("lite_suites=ok")


if __name__ == "__main__":
    main()
