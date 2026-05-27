#!/usr/bin/env bash
# Enable Supabase email/password auth (+ optional Google OAuth) and create a confirmed test user.
#
# Required env:
#   SUPABASE_ACCESS_TOKEN  — https://supabase.com/dashboard/account/tokens
#   SUPABASE_SERVICE_ROLE_KEY — Project Settings → API → service_role (secret)
#
# Optional:
#   PROJECT_REF (default: wjfpglsygkbpubanylug)
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET — enable Google provider when both set
#   TEST_EMAIL (default: lovecompass.test@example.com)
#   TEST_PASSWORD (default: LoveCompassTest2026!)
set -euo pipefail

PROJECT_REF="${PROJECT_REF:-wjfpglsygkbpubanylug}"
TEST_EMAIL="${TEST_EMAIL:-lovecompass.test@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-LoveCompassTest2026!}"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Missing SUPABASE_ACCESS_TOKEN (Dashboard → Account → Access Tokens)" >&2
  exit 1
fi
if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  echo "Missing SUPABASE_SERVICE_ROLE_KEY (Project → Settings → API)" >&2
  exit 1
fi

AUTH_PATCH='{
  "external_email_enabled": true,
  "mailer_autoconfirm": true,
  "disable_signup": false
}'

if [[ -n "${GOOGLE_CLIENT_ID:-}" && -n "${GOOGLE_CLIENT_SECRET:-}" ]]; then
  AUTH_PATCH="$(python3 - <<PY
import json, os
base = json.loads(os.environ["AUTH_PATCH"])
base.update({
  "external_google_enabled": True,
  "external_google_client_id": os.environ["GOOGLE_CLIENT_ID"],
  "external_google_secret": os.environ["GOOGLE_CLIENT_SECRET"],
})
print(json.dumps(base))
PY
)"
  export AUTH_PATCH
  echo "==> Enabling Email + auto-confirm + Google OAuth on ${PROJECT_REF}..."
else
  echo "==> Enabling Email + auto-confirm on ${PROJECT_REF} (Google skipped — set GOOGLE_CLIENT_ID/SECRET to enable)..."
fi

curl -fsS -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${AUTH_PATCH}" | python3 -m json.tool | head -40

echo
echo "==> Creating confirmed test user ${TEST_EMAIL}..."
curl -fsS -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(python3 - <<PY
import json, os
print(json.dumps({
  "email": os.environ["TEST_EMAIL"],
  "password": os.environ["TEST_PASSWORD"],
  "email_confirm": True,
  "user_metadata": {"name": "LoveCompass Test User", "source": "setup_script"},
}))
PY
)" | python3 -m json.tool

echo
echo "==> Verifying password login..."
ANON_KEY="$(curl -fsS "https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  | python3 -c "import sys,json; keys=json.load(sys.stdin); print(next(k['api_key'] for k in keys if k.get('name') in ('anon','publishable') or k.get('type')=='anon'))")"

curl -fsS -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(python3 - <<PY
import json, os
print(json.dumps({"email": os.environ["TEST_EMAIL"], "password": os.environ["TEST_PASSWORD"]}))
PY
)" | python3 -c "import sys,json; d=json.load(sys.stdin); print('login_ok', bool(d.get('access_token')))"

echo
echo "Done. Use these credentials on https://lovecompass-web.vercel.app/auth"
echo "  Email:    ${TEST_EMAIL}"
echo "  Password: ${TEST_PASSWORD}"
