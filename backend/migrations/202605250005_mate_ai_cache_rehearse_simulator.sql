-- Extend MATE AI pattern cache: rehearse + simulator narrative

ALTER TABLE public.mate_ai_pattern_cache
  ADD COLUMN IF NOT EXISTS rehearse_episodes jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.mate_ai_pattern_cache
  ADD COLUMN IF NOT EXISTS simulator jsonb NOT NULL DEFAULT '{}'::jsonb;
