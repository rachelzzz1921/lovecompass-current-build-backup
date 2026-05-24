#!/usr/bin/env bash
# Post-deploy smoke checks for LoveCompass (backend + optional frontend).
# Usage:
#   ./scripts/smoke-production.sh
#   BACKEND_URL=https://lovecompass-api-backend.vercel.app FRONTEND_URL=https://your-app.vercel.app ./scripts/smoke-production.sh
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-https://lovecompass-api-backend.vercel.app}"
FRONTEND_URL="${FRONTEND_URL:-}"

pass() { printf "  ✓ %s\n" "$1"; }
fail() { printf "  ✗ %s\n" "$1"; exit 1; }

echo "LoveCompass production smoke"
echo "Backend: $BACKEND_URL"

echo ""
echo "1. Health"
health="$(curl -fsS "$BACKEND_URL/health")"
[[ "$health" == *'"ok":true'* ]] || fail "health: $health"
pass "GET /health"

db_health="$(curl -fsS "$BACKEND_URL/health?db=1")"
[[ "$db_health" == *'"database":"connected"'* ]] || fail "health?db=1: $db_health"
pass "GET /health?db=1"

config_health="$(curl -fsS "$BACKEND_URL/health?config=1" 2>/dev/null || echo '{}')"
if [[ "$config_health" == *'"authVersion":"jwks-v2"'* ]]; then
  pass "GET /health?config=1 (JWKS v2 auth)"
elif [[ "$config_health" == *'"jwtVerifyJwks":true'* ]]; then
  pass "GET /health?config=1 (JWKS JWT verify ready)"
elif [[ "$config_health" == *'"jwtSecretLegacy":true'* ]] || [[ "$config_health" == *'"jwtSecret":true'* ]]; then
  pass "GET /health?config=1 (legacy jwt secret only — prefer SUPABASE_URL for ES256)"
else
  printf "  ! GET /health?config=1 — set SUPABASE_URL on backend for login-protected routes\n"
fi

jwks_health="$(curl -fsS "$BACKEND_URL/health?jwt=1" 2>/dev/null || echo '{}')"
if [[ "$jwks_health" == *'"jwks":'*'"ok":true'* ]]; then
  pass "GET /health?jwt=1 (JWKS fetch OK)"
else
  printf "  ! GET /health?jwt=1 — JWKS probe failed: %s\n" "$jwks_health"
fi

echo ""
echo "2. Question bank"
q="$(curl -fsS "$BACKEND_URL/tests/s01_self_female/questions")"
count="$(python3 -c "import json,sys; print(len(json.load(sys.stdin).get('questions',[])))" <<<"$q")"
[[ "$count" == "50" ]] || fail "expected 50 questions, got $count"
pass "GET /tests/s01_self_female/questions ($count items)"

echo ""
echo "3. ROS question bank"
ros_q="$(curl -fsS "$BACKEND_URL/tests/s02_ros_female/questions")"
ros_count="$(python3 -c "import json,sys; print(len(json.load(sys.stdin).get('questions',[])))" <<<"$ros_q")"
[[ "$ros_count" == "62" ]] || fail "expected 62 ROS questions, got $ros_count"
pass "GET /tests/s02_ros_female/questions ($ros_count items)"

echo ""
echo "4. Auth guard (expect 401 without token)"
status="$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BACKEND_URL/redemption/verify" \
  -H 'Content-Type: application/json' \
  -d '{"code":"LC-E2E-F-20260523","product":"self"}')"
[[ "$status" == "401" ]] || fail "redemption/verify without token returned $status (expected 401)"
pass "POST /redemption/verify without Bearer → 401"

if [[ -n "$FRONTEND_URL" ]]; then
  echo ""
  echo "5. Frontend"
  front_status="$(curl -sS -o /dev/null -w '%{http_code}' "$FRONTEND_URL/")"
  [[ "$front_status" == "200" ]] || fail "frontend home returned $front_status"
  pass "GET $FRONTEND_URL/ → $front_status"

  tests_status="$(curl -sS -o /dev/null -w '%{http_code}' "$FRONTEND_URL/tests/self")"
  [[ "$tests_status" == "200" ]] || fail "/tests/self returned $tests_status"
  pass "GET /tests/self → $tests_status"
else
  echo ""
  echo "5. Frontend (skipped — set FRONTEND_URL to check)"
fi

echo ""
echo "Smoke complete."
