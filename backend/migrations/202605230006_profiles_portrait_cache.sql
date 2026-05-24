-- Cache aggregated portrait for profile center (个人信息中心)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS portrait_cache JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_portrait_cache_gin
  ON public.profiles USING GIN (portrait_cache);
