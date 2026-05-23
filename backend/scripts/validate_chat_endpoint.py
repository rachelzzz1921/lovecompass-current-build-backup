from __future__ import annotations

import os
import sys
from pathlib import Path

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
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

from app.db import get_conn  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


def latest_attempt_id() -> str:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT id
            FROM public.test_attempts
            WHERE status = 'completed'
            ORDER BY completed_at DESC NULLS LAST, created_at DESC
            LIMIT 1
            """
        ).fetchone()
    if not row:
        raise AssertionError("没有可用于聊天联调的 completed attempt")
    return str(row["id"])


def main() -> None:
    provider = os.getenv("AI_PROVIDER", "mock").strip().lower() or "mock"
    has_zhipu_key = bool(os.getenv("ZHIPU_API_KEY", "").strip())
    attempt_id = latest_attempt_id()
    resp = client.post(
        "/chat/message",
        json={
            "attemptId": attempt_id,
            "analystId": "mirror",
            "message": "请用三句话总结我的关系画像，并给一个下一步建议。",
        },
    )
    if resp.status_code >= 400:
        raise AssertionError(f"chat failed: status={resp.status_code}, body={resp.text}")
    data = resp.json()
    message = data.get("message") or ""
    if not message.strip():
        raise AssertionError("chat message is empty")
    print({
        "aiProvider": provider,
        "zhipuKeyConfigured": has_zhipu_key,
        "attemptId": attempt_id,
        "conversationId": data.get("conversationId"),
        "messagePrefix": message[:80],
        "messageLength": len(message),
    })
    print("chat_endpoint=ok")


if __name__ == "__main__":
    main()
