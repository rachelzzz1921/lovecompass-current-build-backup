-- ROS 双人报告 Layer C pattern cache（关系类型 × 依恋组合 × 双轨分数带）

CREATE TABLE IF NOT EXISTS public.ros_couple_ai_pattern_cache (
  pattern_key text PRIMARY KEY,
  relationship_type text NOT NULL,
  bond_combo text NOT NULL,
  you_score_pattern text NOT NULL,
  ta_score_pattern text NOT NULL,
  insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  layer_gaps jsonb NOT NULL DEFAULT '{}'::jsonb,
  prescription jsonb NOT NULL DEFAULT '{}'::jsonb,
  highlights jsonb NOT NULL DEFAULT '{}'::jsonb,
  bridge text,
  share_line text,
  generation_mode text NOT NULL DEFAULT 'deterministic',
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ros_couple_ai_pattern_cache_lookup
  ON public.ros_couple_ai_pattern_cache (relationship_type, bond_combo);

DROP TRIGGER IF EXISTS trg_ros_couple_ai_pattern_cache_updated_at ON public.ros_couple_ai_pattern_cache;
CREATE TRIGGER trg_ros_couple_ai_pattern_cache_updated_at
BEFORE UPDATE ON public.ros_couple_ai_pattern_cache
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.ros_couple_ai_pattern_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ros_couple_ai_pattern_cache' AND policyname = 'ros_couple_ai_pattern_cache_service'
  ) THEN
    CREATE POLICY ros_couple_ai_pattern_cache_service ON public.ros_couple_ai_pattern_cache
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;
