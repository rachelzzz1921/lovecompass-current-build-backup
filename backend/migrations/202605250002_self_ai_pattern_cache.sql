-- SELF Layer C pattern cache (score band × character × gender)

CREATE TABLE IF NOT EXISTS public.self_ai_pattern_cache (
  pattern_key text PRIMARY KEY,
  character_code text NOT NULL,
  gender text NOT NULL,
  score_pattern text NOT NULL,
  traits jsonb NOT NULL DEFAULT '[]'::jsonb,
  insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  growth_path text,
  generation_mode text NOT NULL DEFAULT 'deterministic',
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_self_ai_pattern_cache_lookup
  ON public.self_ai_pattern_cache (character_code, gender, score_pattern);

DROP TRIGGER IF EXISTS trg_self_ai_pattern_cache_updated_at ON public.self_ai_pattern_cache;
CREATE TRIGGER trg_self_ai_pattern_cache_updated_at
BEFORE UPDATE ON public.self_ai_pattern_cache
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.self_ai_pattern_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'self_ai_pattern_cache' AND policyname = 'self_ai_pattern_cache_service'
  ) THEN
    CREATE POLICY self_ai_pattern_cache_service ON public.self_ai_pattern_cache
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;
