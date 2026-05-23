-- LoveCompass E2E demo user seed
-- Purpose: current FastAPI prototype writes redemption_events/test_attempts with LOVECOMPASS_DEMO_USER_ID.
-- Supabase foreign keys point to auth.users, so backend E2E validation needs this deterministic demo user.

BEGIN;

INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'lovecompass-demo-user@example.invalid',
  NULL,
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"LoveCompass Demo User","source":"e2e_seed"}'::jsonb,
  now(),
  now(),
  false,
  false
)
ON CONFLICT (id) DO UPDATE SET
  aud = EXCLUDED.aud,
  role = EXCLUDED.role,
  email = EXCLUDED.email,
  updated_at = now(),
  raw_user_meta_data = auth.users.raw_user_meta_data || EXCLUDED.raw_user_meta_data;

COMMIT;
