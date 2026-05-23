-- LoveCompass generated redemption-code import SQL

-- 此文件由 scripts/generate_redemption_code_sql.py 根据外部 CSV 生成；兑换码没有硬编码在业务代码中。

BEGIN;

WITH target_suite AS (
  SELECT id FROM public.test_suites WHERE slug = 's01_self_female'
), upsert_batch AS (
  INSERT INTO public.redemption_batches (name, suite_id, code_kind, is_active, expires_at, max_uses_per_code, max_uses_per_user_per_suite, metadata)
  SELECT 'E2E-20260523', id, 'common'::public.redemption_code_kind, true, NULL, 999999, 1, '{"note":"端到端联调女性套件测试码"}'::jsonb
  FROM target_suite
  ON CONFLICT DO NOTHING
  RETURNING id
), target_batch AS (
  SELECT id FROM upsert_batch
  UNION ALL
  SELECT rb.id FROM public.redemption_batches rb JOIN target_suite ts ON rb.suite_id = ts.id
  WHERE rb.name = 'E2E-20260523' AND rb.code_kind = 'common'::public.redemption_code_kind
  ORDER BY id LIMIT 1
)
INSERT INTO public.redemption_codes (batch_id, suite_id, code, code_kind, max_uses, expires_at, is_active, metadata)
SELECT tb.id, ts.id, 'LC-E2E-F-20260523', 'common'::public.redemption_code_kind, 999999, NULL, true, '{"note":"端到端联调女性套件测试码"}'::jsonb
FROM target_suite ts CROSS JOIN target_batch tb
ON CONFLICT (code) DO UPDATE SET
  batch_id = EXCLUDED.batch_id,
  suite_id = EXCLUDED.suite_id,
  code_kind = EXCLUDED.code_kind,
  max_uses = EXCLUDED.max_uses,
  expires_at = EXCLUDED.expires_at,
  is_active = EXCLUDED.is_active,
  metadata = EXCLUDED.metadata,
  updated_at = now();

WITH target_suite AS (
  SELECT id FROM public.test_suites WHERE slug = 's01_self_male'
), upsert_batch AS (
  INSERT INTO public.redemption_batches (name, suite_id, code_kind, is_active, expires_at, max_uses_per_code, max_uses_per_user_per_suite, metadata)
  SELECT 'E2E-20260523', id, 'common'::public.redemption_code_kind, true, NULL, 999999, 1, '{"note":"端到端联调男性套件测试码"}'::jsonb
  FROM target_suite
  ON CONFLICT DO NOTHING
  RETURNING id
), target_batch AS (
  SELECT id FROM upsert_batch
  UNION ALL
  SELECT rb.id FROM public.redemption_batches rb JOIN target_suite ts ON rb.suite_id = ts.id
  WHERE rb.name = 'E2E-20260523' AND rb.code_kind = 'common'::public.redemption_code_kind
  ORDER BY id LIMIT 1
)
INSERT INTO public.redemption_codes (batch_id, suite_id, code, code_kind, max_uses, expires_at, is_active, metadata)
SELECT tb.id, ts.id, 'LC-E2E-M-20260523', 'common'::public.redemption_code_kind, 999999, NULL, true, '{"note":"端到端联调男性套件测试码"}'::jsonb
FROM target_suite ts CROSS JOIN target_batch tb
ON CONFLICT (code) DO UPDATE SET
  batch_id = EXCLUDED.batch_id,
  suite_id = EXCLUDED.suite_id,
  code_kind = EXCLUDED.code_kind,
  max_uses = EXCLUDED.max_uses,
  expires_at = EXCLUDED.expires_at,
  is_active = EXCLUDED.is_active,
  metadata = EXCLUDED.metadata,
  updated_at = now();

COMMIT;
