-- LoveCompass branded redemption codes (2026)
-- Applied to Supabase via migration lovecompass_redemption_codes_love_mirror_2026

BEGIN;

-- Female · 镜映
WITH target_suite AS (
  SELECT id FROM public.test_suites WHERE slug = 's01_self_female'
), upsert_batch AS (
  INSERT INTO public.redemption_batches (name, suite_id, code_kind, is_active, expires_at, max_uses_per_code, max_uses_per_user_per_suite, metadata)
  SELECT 'LOVE-MIRROR-2026', id, 'common'::public.redemption_code_kind, true, NULL, 999999, 1, '{"note":"LoveCompass 女性自我测试 · 镜映码"}'::jsonb
  FROM target_suite
  ON CONFLICT DO NOTHING
  RETURNING id
), target_batch AS (
  SELECT id FROM upsert_batch
  UNION ALL
  SELECT rb.id FROM public.redemption_batches rb JOIN target_suite ts ON rb.suite_id = ts.id
  WHERE rb.name = 'LOVE-MIRROR-2026' AND rb.code_kind = 'common'::public.redemption_code_kind
  ORDER BY id LIMIT 1
)
INSERT INTO public.redemption_codes (batch_id, suite_id, code, code_kind, max_uses, expires_at, is_active, metadata)
SELECT tb.id, ts.id, 'LOVE-MIRROR-26', 'common'::public.redemption_code_kind, 999999, NULL, true, '{"label":"镜映 · 女性版","channel":"test"}'::jsonb
FROM target_suite ts CROSS JOIN target_batch tb
ON CONFLICT (code) DO UPDATE SET
  batch_id = EXCLUDED.batch_id,
  suite_id = EXCLUDED.suite_id,
  is_active = true,
  status = 'active',
  max_uses = EXCLUDED.max_uses,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Male · 北极星
WITH target_suite AS (
  SELECT id FROM public.test_suites WHERE slug = 's01_self_male'
), upsert_batch AS (
  INSERT INTO public.redemption_batches (name, suite_id, code_kind, is_active, expires_at, max_uses_per_code, max_uses_per_user_per_suite, metadata)
  SELECT 'LOVE-NORTH-2026', id, 'common'::public.redemption_code_kind, true, NULL, 999999, 1, '{"note":"LoveCompass 男性自我测试 · 北极星码"}'::jsonb
  FROM target_suite
  ON CONFLICT DO NOTHING
  RETURNING id
), target_batch AS (
  SELECT id FROM upsert_batch
  UNION ALL
  SELECT rb.id FROM public.redemption_batches rb JOIN target_suite ts ON rb.suite_id = ts.id
  WHERE rb.name = 'LOVE-NORTH-2026' AND rb.code_kind = 'common'::public.redemption_code_kind
  ORDER BY id LIMIT 1
)
INSERT INTO public.redemption_codes (batch_id, suite_id, code, code_kind, max_uses, expires_at, is_active, metadata)
SELECT tb.id, ts.id, 'LOVE-NORTH-26', 'common'::public.redemption_code_kind, 999999, NULL, true, '{"label":"北极星 · 男性版","channel":"test"}'::jsonb
FROM target_suite ts CROSS JOIN target_batch tb
ON CONFLICT (code) DO UPDATE SET
  batch_id = EXCLUDED.batch_id,
  suite_id = EXCLUDED.suite_id,
  is_active = true,
  status = 'active',
  max_uses = EXCLUDED.max_uses,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Primary demo code
WITH target_suite AS (
  SELECT id FROM public.test_suites WHERE slug = 's01_self_female'
), upsert_batch AS (
  INSERT INTO public.redemption_batches (name, suite_id, code_kind, is_active, expires_at, max_uses_per_code, max_uses_per_user_per_suite, metadata)
  SELECT 'LOVE-COMPASS-2026', id, 'common'::public.redemption_code_kind, true, NULL, 999999, 1, '{"note":"LoveCompass 主测试码"}'::jsonb
  FROM target_suite
  ON CONFLICT DO NOTHING
  RETURNING id
), target_batch AS (
  SELECT id FROM upsert_batch
  UNION ALL
  SELECT rb.id FROM public.redemption_batches rb JOIN target_suite ts ON rb.suite_id = ts.id
  WHERE rb.name = 'LOVE-COMPASS-2026' AND rb.code_kind = 'common'::public.redemption_code_kind
  ORDER BY id LIMIT 1
)
INSERT INTO public.redemption_codes (batch_id, suite_id, code, code_kind, max_uses, expires_at, is_active, metadata)
SELECT tb.id, ts.id, 'LOVE-COMPASS', 'common'::public.redemption_code_kind, 999999, NULL, true, '{"label":"LoveCompass 通用测试","channel":"demo"}'::jsonb
FROM target_suite ts CROSS JOIN target_batch tb
ON CONFLICT (code) DO UPDATE SET
  batch_id = EXCLUDED.batch_id,
  suite_id = EXCLUDED.suite_id,
  is_active = true,
  status = 'active',
  max_uses = EXCLUDED.max_uses,
  metadata = EXCLUDED.metadata,
  updated_at = now();

COMMIT;
