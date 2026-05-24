#!/usr/bin/env python3
"""ROS Phase 2 E2E validation against live or local API.

Usage:
  python3 scripts/validate_ros_e2e_flow.py
  LOVECOMPASS_API_BASE=https://lovecompass-api-backend.vercel.app python3 scripts/validate_ros_e2e_flow.py

Env (optional):
  LOVECOMPASS_API_BASE — default http://127.0.0.1:8000
  SUPABASE_URL, SUPABASE_ANON_KEY — for password login tokens
  INITIATOR_EMAIL / INITIATOR_PASSWORD
  PARTNER_EMAIL / PARTNER_PASSWORD
"""
from __future__ import annotations

import json
import os
import sys
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

INITIATOR_EMAIL = os.getenv("INITIATOR_EMAIL", "lovecompass.test@example.com")
INITIATOR_PASSWORD = os.getenv("INITIATOR_PASSWORD", "LoveCompassTest2026!")
PARTNER_EMAIL = os.getenv("PARTNER_EMAIL", "lovecompass.partner.test@example.com")
PARTNER_PASSWORD = os.getenv("PARTNER_PASSWORD", "LoveCompassTest2026!")

ROS_CODES = {
    "s02_ros_female": os.getenv("ROS_FEMALE_CODE", "LC-ROS-F-20260524"),
    "s02_ros_male": os.getenv("ROS_MALE_CODE", "LC-ROS-M-20260524"),
}


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
        items = ui.get("items") or question.get("items") or []
        return {"orderedItemIds": [str(item.get("id") or item.get("key")) for item in items]}

    if kind in {"scale", "slider", "likert"}:
        minimum = ui.get("min", 1)
        maximum = ui.get("max", 5)
        value = ui.get("default")
        if value is None:
            value = round((float(minimum) + float(maximum)) / 2)
            if float(value).is_integer():
                value = int(value)
        return {"value": value}

    if options:
        pick = options[1] if len(options) > 1 else options[0]
        return {"optionKey": pick.get("key"), "optionIndex": 1 if len(options) > 1 else 0}

    return {"value": 3}


def _submit_ros_attempt(*, token: str, suite_slug: str, redemption_code: str | None, partner_code: str | None) -> dict[str, Any]:
    redemption_event_id = None
    if not partner_code:
        verify = _assert_ok(
            *_request("POST", "/redemption/verify", payload={"code": redemption_code, "product": "ros"}, token=token),
            "redemption",
        )
        suite_slug = verify["suiteSlug"]
        redemption_event_id = verify["redemptionEventId"]

    questions_payload = _assert_ok(
        *_request("GET", f"/tests/{suite_slug}/questions", token=token),
        "questions",
    )
    questions = questions_payload["questions"]
    answers = [
        {
            "questionId": q["id"],
            "externalId": q["externalId"],
            "kind": q.get("kind") or q.get("type") or "unknown",
            "answerPayload": _build_answer(q),
            "durationMs": 800,
        }
        for q in questions
    ]
    body: dict[str, Any] = {"suiteSlug": suite_slug, "answers": answers}
    if partner_code:
        body["partnerRelationCode"] = partner_code
    else:
        body["redemptionEventId"] = redemption_event_id

    attempt = _assert_ok(*_request("POST", "/attempts", payload=body, token=token), "attempt")
    return {"attempt": attempt, "question_count": len(questions), "suite_slug": suite_slug}


def main() -> None:
    print({"api": API_BASE, "supabase": SUPABASE_URL})

    health = _assert_ok(*_request("GET", "/health"), "health")
    print({"health": health})

    story_status, story = _request(
        "POST",
        "/ros/story/analyze",
        payload={
            "timeline": [{"label": "A", "value": 60}, {"label": "B", "value": 72}],
            "milestones": [],
            "stageName": "磨合阵痛",
        },
    )
    if story_status >= 400:
        raise AssertionError(f"story_analyze failed: {story_status} {story}")
    if story.get("mode") != "template":
        print({"story_analyze": "warn", "detail": "expected mode=template (redeploy backend if missing)"})
    else:
        print({"story_analyze": "ok", "mode": story["mode"]})

    initiator_token = _login(INITIATOR_EMAIL, INITIATOR_PASSWORD)
    partner_token = _login(PARTNER_EMAIL, PARTNER_PASSWORD)

    initiator = _submit_ros_attempt(
        token=initiator_token,
        suite_slug="s02_ros_female",
        redemption_code=ROS_CODES["s02_ros_female"],
        partner_code=None,
    )
    attempt = initiator["attempt"]
    assert attempt.get("relationCode", "").startswith("ROS-"), attempt
    assert attempt.get("next"), attempt
    relation_code = attempt["relationCode"]
    attempt_id = attempt["attemptId"]
    print(
        {
            "initiator": "ok",
            "attemptId": attempt_id,
            "relationCode": relation_code,
            "next": attempt["next"],
            "questions": initiator["question_count"],
        }
    )

    single = _assert_ok(
        *_request("GET", f"/ros/attempts/{attempt_id}/single", token=initiator_token),
        "single_result",
    )
    payload = single["single"]
    if not payload.get("layerDetails"):
        print({"single_result": "warn", "detail": "layerDetails missing — redeploy backend fe9ad53+"})
    assert payload.get("timeTag"), single
    layers = payload.get("layers") or []
    layer_keys = {str(item.get("code", "")).upper() for item in layers if isinstance(item, dict)}
    assert {"AT", "IN", "CO", "EV", "RK"}.issubset(layer_keys), single
    print(
        {
            "single_result": "ok",
            "rosIndex": payload.get("resonance", {}).get("score"),
            "timeTag": payload.get("timeTag"),
            "layerDetails": bool(payload.get("layerDetails")),
        }
    )

    code_preview = _assert_ok(*_request("GET", f"/ros/codes/{relation_code}", token=partner_token), "code_preview")
    assert code_preview.get("invitePath") == f"/ros/invite/{relation_code}", code_preview
    print({"code_preview": "ok", "status": code_preview.get("status")})

    waiting = _request("GET", f"/ros/couple/{relation_code}", token=initiator_token)
    if waiting[0] == 409 or (waiting[0] >= 400 and "等待" in str(waiting[1])):
        print({"couple_waiting": "ok", "status": waiting[0]})
    elif waiting[0] == 200:
        print({"couple_waiting": "already_complete?", "status": waiting[0]})
    else:
        print({"couple_waiting": waiting})

    partner = _submit_ros_attempt(
        token=partner_token,
        suite_slug="s02_ros_male",
        redemption_code=None,
        partner_code=relation_code,
    )
    print({"partner": "ok", "attemptId": partner["attempt"]["attemptId"], "next": partner["attempt"].get("next")})

    couple_resp = _assert_ok(
        *_request("GET", f"/ros/couple/{relation_code}", token=partner_token),
        "couple_result",
    )
    couple = couple_resp.get("couple") or {}
    assert couple.get("resonance", {}).get("score") is not None, couple_resp
    assert len(couple.get("dims") or []) == 5, couple_resp
    print(
        {
            "couple_result": "ok",
            "resonance": couple["resonance"]["score"],
            "tier": couple["resonance"].get("tier"),
            "collision": couple.get("collision", {}).get("name"),
        }
    )

    print("ros_e2e_flow=ok")


if __name__ == "__main__":
    main()
