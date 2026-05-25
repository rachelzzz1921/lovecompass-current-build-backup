-- MATE 套三：关系码双人会话（与 ros_relation_sessions 独立存储）
-- 关系码格式与 ROS 共用 ROS-XXXX-XXXX，但会话与 payload 分表隔离

CREATE TABLE IF NOT EXISTS public.mate_relation_sessions (
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

CREATE INDEX IF NOT EXISTS idx_mate_relation_sessions_initiator
  ON public.mate_relation_sessions(initiator_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mate_relation_sessions_partner
  ON public.mate_relation_sessions(partner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mate_relation_sessions_status
  ON public.mate_relation_sessions(status, updated_at DESC);

DROP TRIGGER IF EXISTS trg_mate_relation_sessions_updated_at ON public.mate_relation_sessions;
CREATE TRIGGER trg_mate_relation_sessions_updated_at
BEFORE UPDATE ON public.mate_relation_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.mate_relation_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mate_relation_sessions'
      AND policyname = 'mate_relation_sessions_read_participants'
  ) THEN
    CREATE POLICY mate_relation_sessions_read_participants ON public.mate_relation_sessions
      FOR SELECT USING (
        auth.uid() = initiator_user_id OR auth.uid() = partner_user_id
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mate_relation_sessions'
      AND policyname = 'mate_relation_sessions_insert_service'
  ) THEN
    CREATE POLICY mate_relation_sessions_insert_service ON public.mate_relation_sessions
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mate_relation_sessions'
      AND policyname = 'mate_relation_sessions_update_service'
  ) THEN
    CREATE POLICY mate_relation_sessions_update_service ON public.mate_relation_sessions
      FOR UPDATE USING (true);
  END IF;
END $$;
