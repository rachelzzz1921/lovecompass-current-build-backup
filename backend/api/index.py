"""Vercel Python serverless entry for LoveCompass FastAPI backend.

Deploy the `backend/` directory as a separate Vercel project. Vercel imports this
module and serves the exported ASGI `app`.
"""

from __future__ import annotations

import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.main import app  # noqa: E402
