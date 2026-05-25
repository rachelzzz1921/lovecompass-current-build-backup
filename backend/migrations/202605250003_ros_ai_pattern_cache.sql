-- ROS Layer C pattern cache (score band × relationship type × gender)

CREATE TABLE IF NOT EXISTS public.ros_ai_pattern_cache (
  pattern_key text PRIMARY KEY,
  relationship_type text NOT NULL,
  gender text NOT NULL,
  score_pattern text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  prescription jsonb NOT NULL DEFAULT '{}'::jsonb,
  blind_spot text,
  generation_mode text NOT NULL DEFAULT 'deterministic',
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ros_ai_pattern_cache_lookup
  ON public.ros_ai_pattern_cache (relationship_type, gender, score_pattern);

DROP TRIGGER IF EXISTS trg_ros_ai_pattern_cache_updated_at ON public.ros_ai_pattern_cache;
CREATE TRIGGER trg_ros_ai_pattern_cache_updated_at
BEFORE UPDATE ON public.ros_ai_pattern_cache
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.ros_ai_pattern_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ros_ai_pattern_cache' AND policyname = 'ros_ai_pattern_cache_service'
  ) THEN
    CREATE POLICY ros_ai_pattern_cache_service ON public.ros_ai_pattern_cache
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;
