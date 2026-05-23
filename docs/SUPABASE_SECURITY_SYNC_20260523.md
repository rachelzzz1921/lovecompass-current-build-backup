# Supabase security sync (2026-05-23)

Project: `wjfpglsygkbpubanylug` (LoveCompass).

## Applied on Supabase (via SQL)

- Dropped leftover Lovable table `public."love compass"`.
- Recreated `public.set_updated_at()` with fixed `search_path` (`public`, `pg_temp`).
- Restricted PostgREST RPC on `public.is_admin()`: revoked from `PUBLIC` and `anon`; granted to `authenticated` and `service_role` (RLS policies can still call it for signed-in users).
- Revoked execute on `public.rls_auto_enable()` from all roles exposed to PostgREST (event-trigger helper only).

Repo migration: `backend/migrations/202605230005_lovecompass_security_hardening.sql`.

## Remaining (Supabase Dashboard)

- **Leaked password protection**: enable under Authentication → Providers → Email (HaveIBeenPwned check). Not enforceable via SQL migration in this repo.

## Env / connection strings

- Runtime API: use pooler port **6543** with `?pgbouncer=true` (`DATABASE_URL` in `backend/.env.example`).
- Migrations: use direct host `db.<PROJECT_REF>.supabase.co` port **5432** (`DIRECT_URL`).
