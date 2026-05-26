#!/usr/bin/env bash
# Local full-stack: FastAPI :8000 + Vite :5173 (remote Supabase DB + Auth)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
FRONTEND_HOST="${FRONTEND_HOST:-localhost}"

echo "[dev-local] Bootstrapping env …"
node "$ROOT/scripts/bootstrap-local-env.mjs"

if ! command -v python3 >/dev/null 2>&1; then
  echo "[dev-local] python3 not found"
  exit 1
fi

PY=python3
if command -v python3.12 >/dev/null 2>&1; then PY=python3.12
elif command -v python3.11 >/dev/null 2>&1; then PY=python3.11
elif command -v python3.10 >/dev/null 2>&1; then PY=python3.10
fi
echo "[dev-local] Using $PY ($($PY --version))"

cd "$ROOT/backend"
if ! $PY -c "import uvicorn" 2>/dev/null; then
  echo "[dev-local] Installing backend deps …"
  $PY -m pip install -q -r requirements.txt
fi

echo "[dev-local] Checking backend env …"
if ! $PY scripts/check_env.py; then
  echo ""
  echo "[dev-local] Fix backend/.env then re-run: ./scripts/dev-local.sh"
  exit 1
fi

echo "[dev-local] Testing database …"
if ! $PY scripts/test_db_connection.py; then
  echo ""
  echo "[dev-local] DATABASE_URL cannot connect — update backend/.env"
  exit 1
fi

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "[dev-local] Stopping backend (pid $BACKEND_PID)"
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "[dev-local] Starting backend on :$BACKEND_PORT …"
$PY -m uvicorn app.main:app --reload --host 127.0.0.1 --port "$BACKEND_PORT" &
BACKEND_PID=$!

for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${BACKEND_PORT}/health" >/dev/null 2>&1; then
    echo "[dev-local] Backend ready → http://127.0.0.1:${BACKEND_PORT}/health"
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo "[dev-local] Backend failed to start"
    exit 1
  fi
  sleep 0.4
done

cd "$ROOT/frontend"
if [[ ! -d node_modules ]]; then
  echo "[dev-local] Installing frontend deps …"
  npm ci || npm install
fi

echo "[dev-local] Starting frontend → http://${FRONTEND_HOST}:${FRONTEND_PORT}/"
echo "[dev-local] 套一 lite: /tests/self  → 选性别 → 开始测试"
echo "[dev-local] 万能码: MIRROR-ALL-ACCESS"
export PREVIEW_HOST="$FRONTEND_HOST"
export PREVIEW_PORT="$FRONTEND_PORT"
exec npm run dev:preview
