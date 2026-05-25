-- MATE AI pattern cache (position × sub_type × gender × score band)

CREATE TABLE IF NOT EXISTS public.mate_ai_pattern_cache (
  pattern_key text PRIMARY KEY,
  position_name text NOT NULL,
  sub_type text NOT NULL DEFAULT 'default',
  gender text NOT NULL,
  score_pattern text NOT NULL,
  reverse jsonb NOT NULL DEFAULT '{}'::jsonb,
  observe_slices jsonb NOT NULL DEFAULT '[]'::jsonb,
  advice_v4 jsonb NOT NULL DEFAULT '{}'::jsonb,
  lens_grid jsonb NOT NULL DEFAULT '[]'::jsonb,
  insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  generation_mode text NOT NULL DEFAULT 'deterministic',
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mate_ai_pattern_cache_lookup
  ON public.mate_ai_pattern_cache (position_name, sub_type, gender, score_pattern);

DROP TRIGGER IF EXISTS trg_mate_ai_pattern_cache_updated_at ON public.mate_ai_pattern_cache;
CREATE TRIGGER trg_mate_ai_pattern_cache_updated_at
BEFORE UPDATE ON public.mate_ai_pattern_cache
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.mate_ai_pattern_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mate_ai_pattern_cache'
      AND policyname = 'mate_ai_pattern_cache_service'
  ) THEN
    CREATE POLICY mate_ai_pattern_cache_service ON public.mate_ai_pattern_cache
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;
