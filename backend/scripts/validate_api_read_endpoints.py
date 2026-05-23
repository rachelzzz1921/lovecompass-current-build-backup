from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / '.env')

from app.main import app


def main() -> None:
    client = TestClient(app)
    health = client.get('/health')
    print(f'GET /health status={health.status_code} body={health.json()}')
    if health.status_code != 200 or not health.json().get('ok'):
        raise SystemExit('health endpoint failed')

    expected = {
        's01_self_female': 50,
        's01_self_male': 50,
    }
    for slug, expected_count in expected.items():
        response = client.get(f'/tests/{slug}/questions')
        print(f'GET /tests/{slug}/questions status={response.status_code}')
        if response.status_code != 200:
            print(response.text)
            raise SystemExit(f'questions endpoint failed for {slug}')
        payload = response.json()
        count = len(payload.get('questions') or [])
        suite = payload.get('suite') or {}
        print(f'{slug}: suite_name={suite.get("name")} gender={suite.get("gender")} questions={count}')
        if count != expected_count:
            raise SystemExit(f'{slug} expected {expected_count} questions, got {count}')

    print('api_read_validation=ok')


if __name__ == '__main__':
    main()
