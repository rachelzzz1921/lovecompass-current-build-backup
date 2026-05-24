-- ROS 套二：关系码与会话配对（双人报告）
-- 依赖：202605230001_lovecompass_v1_core_schema.sql

CREATE TABLE IF NOT EXISTS public.ros_relation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  initiator_attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  partner_attempt_id UUID REFERENCES public.test_attempts(id) ON DELETE SET NULL,
  initiator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  initiator_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  partner_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  couple_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'waiting_partner'
    CHECK (status IN ('waiting_partner', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ros_relation_sessions_initiator
  ON public.ros_relation_sessions(initiator_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ros_relation_sessions_partner
  ON public.ros_relation_sessions(partner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ros_relation_sessions_status
  ON public.ros_relation_sessions(status, updated_at DESC);

DROP TRIGGER IF EXISTS trg_ros_relation_sessions_updated_at ON public.ros_relation_sessions;
CREATE TRIGGER trg_ros_relation_sessions_updated_at
BEFORE UPDATE ON public.ros_relation_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.test_attempts
  ADD COLUMN IF NOT EXISTS relation_code TEXT,
  ADD COLUMN IF NOT EXISTS partner_relation_code TEXT;

CREATE INDEX IF NOT EXISTS idx_attempts_relation_code
  ON public.test_attempts(relation_code)
  WHERE relation_code IS NOT NULL;

ALTER TABLE public.ros_relation_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ros_relation_sessions'
      AND policyname = 'ros_relation_sessions_read_participants'
  ) THEN
    CREATE POLICY ros_relation_sessions_read_participants ON public.ros_relation_sessions
      FOR SELECT USING (
        auth.uid() = initiator_user_id
        OR auth.uid() = partner_user_id
        OR public.is_admin()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ros_relation_sessions'
      AND policyname = 'ros_relation_sessions_insert_service'
  ) THEN
    CREATE POLICY ros_relation_sessions_insert_service ON public.ros_relation_sessions
      FOR INSERT WITH CHECK (auth.uid() = initiator_user_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ros_relation_sessions'
      AND policyname = 'ros_relation_sessions_update_service'
  ) THEN
    CREATE POLICY ros_relation_sessions_update_service ON public.ros_relation_sessions
      FOR UPDATE USING (
        auth.uid() IN (initiator_user_id, partner_user_id) OR public.is_admin()
      );
  END IF;
END $$;
