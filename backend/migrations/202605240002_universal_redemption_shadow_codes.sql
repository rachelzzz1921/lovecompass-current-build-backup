-- Shadow redemption codes for LOVECOMPASS_UNIVERSAL_CODE (MIRROR-ALL-ACCESS).
-- User-facing master code is handled in backend/app/universal_redemption.py.

BEGIN;

DO $$
DECLARE
  suite_rec RECORD;
  batch_id UUID;
  shadow_code TEXT;
BEGIN
  FOR suite_rec IN
    SELECT id, slug FROM public.test_suites
    WHERE slug IN (
      's01_self_female', 's01_self_male',
      's02_ros_female', 's02_ros_male',
      's03_mate_female', 's03_mate_male'
    )
  LOOP
    shadow_code := '__UNIVERSAL__' || suite_rec.slug;

    INSERT INTO public.redemption_batches(
      name, suite_id, code_kind, is_active, max_uses_per_code, max_uses_per_user_per_suite, metadata
    )
    VALUES (
      'UNIVERSAL-SHADOW', suite_rec.id, 'admin_grant', true, NULL, 999999,
      jsonb_build_object('universal', true, 'suiteSlug', suite_rec.slug)
    )
    ON CONFLICT DO NOTHING;

    SELECT rb.id INTO batch_id
    FROM public.redemption_batches rb
    WHERE rb.name = 'UNIVERSAL-SHADOW'
      AND rb.suite_id = suite_rec.id
      AND rb.code_kind = 'admin_grant'
    LIMIT 1;

    INSERT INTO public.redemption_codes(
      batch_id, suite_id, code, code_kind, max_uses, is_active, metadata
    )
    VALUES (
      batch_id, suite_rec.id, shadow_code, 'admin_grant', NULL, true,
      jsonb_build_object('universal', true, 'suiteSlug', suite_rec.slug)
    )
    ON CONFLICT (code) DO UPDATE SET
      is_active = true,
      max_uses = NULL,
      metadata = EXCLUDED.metadata,
      updated_at = now();
  END LOOP;
END $$;

COMMIT;
