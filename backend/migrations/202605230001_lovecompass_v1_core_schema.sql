-- LoveCompass V1 Core Schema
-- 目标：题库、评分公式、结果画像、兑换码、AI 分析与聊天分析师全部数据化；业务代码只读取配置，不硬编码题目或模型规则。
-- 兼容：Supabase PostgreSQL。若已有 profiles/test_attempts 表，本迁移采用 ALTER/CREATE IF NOT EXISTS 方式增量扩展。

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1. 枚举类型
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.test_gender AS ENUM ('female', 'male', 'neutral');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.test_attempt_status AS ENUM ('in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.redemption_code_kind AS ENUM ('common', 'single_use', 'gift', 'admin_grant');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.redemption_code_status AS ENUM ('active', 'inactive', 'expired', 'exhausted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ai_job_status AS ENUM ('pending', 'running', 'succeeded', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- 2. 通用更新时间函数
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- 3. 用户资料与管理员判断
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- =========================================================
-- 4. 测试套件、维度、题目、评分模型与结果画像
-- =========================================================
CREATE TABLE IF NOT EXISTS public.test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1',
  gender public.test_gender NOT NULL DEFAULT 'neutral',
  description TEXT,
  total_questions INTEGER NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
  estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  source_suite_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_suites_active ON public.test_suites(is_active, display_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_suites_gender ON public.test_suites(gender);

DROP TRIGGER IF EXISTS trg_test_suites_updated_at ON public.test_suites;
CREATE TRIGGER trg_test_suites_updated_at
BEFORE UPDATE ON public.test_suites
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.metric_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  layer_code TEXT,
  layer_name TEXT,
  description TEXT,
  behavior_anchor TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_metric_dimensions_updated_at ON public.metric_dimensions;
CREATE TRIGGER trg_metric_dimensions_updated_at
BEFORE UPDATE ON public.metric_dimensions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES public.test_suites(id) ON DELETE CASCADE,
  external_question_id TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  dimension_code TEXT NOT NULL REFERENCES public.metric_dimensions(code),
  question_type TEXT NOT NULL,
  weight NUMERIC(8,4) NOT NULL DEFAULT 1,
  direction TEXT NOT NULL DEFAULT 'positive' CHECK (direction IN ('positive', 'negative', 'neutral')),
  question_text TEXT NOT NULL,
  question_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  scoring_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (suite_id, external_question_id),
  UNIQUE (suite_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_test_questions_suite_order ON public.test_questions(suite_id, display_order);
CREATE INDEX IF NOT EXISTS idx_test_questions_dimension ON public.test_questions(dimension_code);
CREATE INDEX IF NOT EXISTS idx_test_questions_payload_gin ON public.test_questions USING GIN (question_payload);

DROP TRIGGER IF EXISTS trg_test_questions_updated_at ON public.test_questions;
CREATE TRIGGER trg_test_questions_updated_at
BEFORE UPDATE ON public.test_questions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.scoring_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES public.test_suites(id) ON DELETE CASCADE,
  model_key TEXT NOT NULL DEFAULT 'ROS_V3',
  model_version TEXT NOT NULL DEFAULT 'v1',
  scoring_formula JSONB NOT NULL DEFAULT '{}'::jsonb,
  type_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  ros_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (suite_id, model_key, model_version)
);

CREATE INDEX IF NOT EXISTS idx_scoring_models_suite_active ON public.scoring_models(suite_id, is_active);
CREATE INDEX IF NOT EXISTS idx_scoring_models_formula_gin ON public.scoring_models USING GIN (scoring_formula);

DROP TRIGGER IF EXISTS trg_scoring_models_updated_at ON public.scoring_models;
CREATE TRIGGER trg_scoring_models_updated_at
BEFORE UPDATE ON public.scoring_models
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.result_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES public.test_suites(id) ON DELETE CASCADE,
  archetype_code TEXT NOT NULL,
  archetype_name TEXT NOT NULL,
  gender public.test_gender NOT NULL DEFAULT 'neutral',
  profile_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (suite_id, archetype_code)
);

CREATE INDEX IF NOT EXISTS idx_result_archetypes_suite ON public.result_archetypes(suite_id, display_order);
CREATE INDEX IF NOT EXISTS idx_result_archetypes_payload_gin ON public.result_archetypes USING GIN (profile_payload);

DROP TRIGGER IF EXISTS trg_result_archetypes_updated_at ON public.result_archetypes;
CREATE TRIGGER trg_result_archetypes_updated_at
BEFORE UPDATE ON public.result_archetypes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- 5. 兑换码批次、兑换码与兑换记录
-- =========================================================
CREATE TABLE IF NOT EXISTS public.redemption_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  suite_id UUID REFERENCES public.test_suites(id) ON DELETE SET NULL,
  code_kind public.redemption_code_kind NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  max_uses_per_code INTEGER CHECK (max_uses_per_code IS NULL OR max_uses_per_code > 0),
  max_uses_per_user_per_suite INTEGER NOT NULL DEFAULT 1 CHECK (max_uses_per_user_per_suite > 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemption_batches_suite ON public.redemption_batches(suite_id);
CREATE INDEX IF NOT EXISTS idx_redemption_batches_active ON public.redemption_batches(is_active, expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_redemption_batches_unique_name_suite_kind
  ON public.redemption_batches(name, suite_id, code_kind);

DROP TRIGGER IF EXISTS trg_redemption_batches_updated_at ON public.redemption_batches;
CREATE TRIGGER trg_redemption_batches_updated_at
BEFORE UPDATE ON public.redemption_batches
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.redemption_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.redemption_batches(id) ON DELETE CASCADE,
  suite_id UUID NOT NULL REFERENCES public.test_suites(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  code_hash TEXT,
  code_kind public.redemption_code_kind NOT NULL,
  status public.redemption_code_status NOT NULL DEFAULT 'active',
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemption_codes_code ON public.redemption_codes(code);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_suite_active ON public.redemption_codes(suite_id, is_active, status);
CREATE INDEX IF NOT EXISTS idx_redemption_codes_batch ON public.redemption_codes(batch_id);

DROP TRIGGER IF EXISTS trg_redemption_codes_updated_at ON public.redemption_codes;
CREATE TRIGGER trg_redemption_codes_updated_at
BEFORE UPDATE ON public.redemption_codes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.redemption_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suite_id UUID NOT NULL REFERENCES public.test_suites(id) ON DELETE CASCADE,
  redemption_code_id UUID NOT NULL REFERENCES public.redemption_codes(id) ON DELETE RESTRICT,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempt_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, suite_id, redemption_code_id)
);

CREATE INDEX IF NOT EXISTS idx_redemption_events_user ON public.redemption_events(user_id, redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemption_events_suite ON public.redemption_events(suite_id, redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemption_events_code ON public.redemption_events(redemption_code_id);

-- =========================================================
-- 6. 测试作答、评分结果与 AI 分析报告
-- =========================================================
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  scores JSONB,
  archetype_code TEXT,
  archetype_gender TEXT,
  ros_index NUMERIC,
  rk_score NUMERIC,
  risk_alert BOOLEAN DEFAULT false,
  ai_report TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.test_attempts
  ADD COLUMN IF NOT EXISTS suite_id UUID REFERENCES public.test_suites(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS redemption_event_id UUID REFERENCES public.redemption_events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS scoring_model_id UUID REFERENCES public.scoring_models(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS raw_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dimension_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS result_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS risk_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.test_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_suite_user ON public.test_attempts(suite_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_redemption ON public.test_attempts(redemption_event_id);
CREATE INDEX IF NOT EXISTS idx_attempts_result_gin ON public.test_attempts USING GIN (result_payload);

DROP TRIGGER IF EXISTS trg_test_attempts_updated_at ON public.test_attempts;
CREATE TRIGGER trg_test_attempts_updated_at
BEFORE UPDATE ON public.test_attempts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.redemption_events
  DROP CONSTRAINT IF EXISTS redemption_events_attempt_id_fkey;
ALTER TABLE public.redemption_events
  ADD CONSTRAINT redemption_events_attempt_id_fkey
  FOREIGN KEY (attempt_id) REFERENCES public.test_attempts(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.test_attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.test_questions(id) ON DELETE RESTRICT,
  external_question_id TEXT NOT NULL,
  answer_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  numeric_score NUMERIC(10,4),
  dimension_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON public.test_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_dimension ON public.test_attempt_answers(dimension_code);

CREATE TABLE IF NOT EXISTS public.ai_result_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL UNIQUE REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suite_id UUID NOT NULL REFERENCES public.test_suites(id) ON DELETE CASCADE,
  model_provider TEXT,
  model_name TEXT,
  prompt_version TEXT,
  status public.ai_job_status NOT NULL DEFAULT 'pending',
  summary TEXT,
  report_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  prompt_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_user ON public.ai_result_reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_suite ON public.ai_result_reports(suite_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_payload_gin ON public.ai_result_reports USING GIN (report_payload);

DROP TRIGGER IF EXISTS trg_ai_result_reports_updated_at ON public.ai_result_reports;
CREATE TRIGGER trg_ai_result_reports_updated_at
BEFORE UPDATE ON public.ai_result_reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- 7. 聊天分析师、会话与消息
-- =========================================================
CREATE TABLE IF NOT EXISTS public.chat_analysts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  title TEXT,
  avatar_url TEXT,
  description TEXT,
  persona_prompt TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  model_provider TEXT NOT NULL DEFAULT 'openai_compatible',
  model_name TEXT NOT NULL,
  model_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_unlock BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_analysts_active ON public.chat_analysts(is_active, display_order);

DROP TRIGGER IF EXISTS trg_chat_analysts_updated_at ON public.chat_analysts;
CREATE TRIGGER trg_chat_analysts_updated_at
BEFORE UPDATE ON public.chat_analysts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES public.test_attempts(id) ON DELETE SET NULL,
  analyst_id UUID NOT NULL REFERENCES public.chat_analysts(id) ON DELETE RESTRICT,
  title TEXT,
  memory_summary TEXT,
  context_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_attempt ON public.chat_sessions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_analyst ON public.chat_sessions(analyst_id);

DROP TRIGGER IF EXISTS trg_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER trg_chat_sessions_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_provider TEXT,
  model_name TEXT,
  token_usage JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, created_at);

-- =========================================================
-- 8. 后台操作审计
-- =========================================================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  before_payload JSONB,
  after_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON public.admin_audit_logs(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target ON public.admin_audit_logs(target_table, target_id);

-- =========================================================
-- 9. RLS 策略：前台用户只能读自己的业务数据；后台 admin 可管理配置
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_result_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_analysts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 为避免重复创建策略，统一通过 pg_policies 检查。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_select_own_or_admin') THEN
    CREATE POLICY profiles_select_own_or_admin ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_update_own_or_admin') THEN
    CREATE POLICY profiles_update_own_or_admin ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_insert_own') THEN
    CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='test_suites' AND policyname='test_suites_read_active') THEN
    CREATE POLICY test_suites_read_active ON public.test_suites FOR SELECT USING (is_active = true OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='metric_dimensions' AND policyname='metric_dimensions_read_all') THEN
    CREATE POLICY metric_dimensions_read_all ON public.metric_dimensions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='test_questions' AND policyname='test_questions_read_active') THEN
    CREATE POLICY test_questions_read_active ON public.test_questions FOR SELECT USING (is_active = true OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='scoring_models' AND policyname='scoring_models_admin_only') THEN
    CREATE POLICY scoring_models_admin_only ON public.scoring_models FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='result_archetypes' AND policyname='result_archetypes_read_active') THEN
    CREATE POLICY result_archetypes_read_active ON public.result_archetypes FOR SELECT USING (is_active = true OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='redemption_batches' AND policyname='redemption_batches_admin_only') THEN
    CREATE POLICY redemption_batches_admin_only ON public.redemption_batches FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='redemption_codes' AND policyname='redemption_codes_admin_only') THEN
    CREATE POLICY redemption_codes_admin_only ON public.redemption_codes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='redemption_events' AND policyname='redemption_events_own_or_admin') THEN
    CREATE POLICY redemption_events_own_or_admin ON public.redemption_events FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='test_attempts' AND policyname='test_attempts_own_or_admin') THEN
    CREATE POLICY test_attempts_own_or_admin ON public.test_attempts FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='test_attempts' AND policyname='test_attempts_insert_own') THEN
    CREATE POLICY test_attempts_insert_own ON public.test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='test_attempts' AND policyname='test_attempts_update_own_or_admin') THEN
    CREATE POLICY test_attempts_update_own_or_admin ON public.test_attempts FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='test_attempt_answers' AND policyname='attempt_answers_own_or_admin') THEN
    CREATE POLICY attempt_answers_own_or_admin ON public.test_attempt_answers FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.test_attempts a WHERE a.id = attempt_id AND (a.user_id = auth.uid() OR public.is_admin()))
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ai_result_reports' AND policyname='ai_reports_own_or_admin') THEN
    CREATE POLICY ai_reports_own_or_admin ON public.ai_result_reports FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_analysts' AND policyname='chat_analysts_read_active') THEN
    CREATE POLICY chat_analysts_read_active ON public.chat_analysts FOR SELECT USING (is_active = true OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_sessions' AND policyname='chat_sessions_own_or_admin') THEN
    CREATE POLICY chat_sessions_own_or_admin ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_sessions' AND policyname='chat_sessions_insert_own') THEN
    CREATE POLICY chat_sessions_insert_own ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_sessions' AND policyname='chat_sessions_update_own_or_admin') THEN
    CREATE POLICY chat_sessions_update_own_or_admin ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='chat_messages' AND policyname='chat_messages_own_or_admin') THEN
    CREATE POLICY chat_messages_own_or_admin ON public.chat_messages FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.is_admin()))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_audit_logs' AND policyname='admin_audit_logs_admin_only') THEN
    CREATE POLICY admin_audit_logs_admin_only ON public.admin_audit_logs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- 管理员写入配置表。实际生产建议由后端 service role 完成写入，前台不直接写配置。
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['test_suites','metric_dimensions','test_questions','result_archetypes','chat_analysts'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t || '_admin_write') THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())', t || '_admin_write', t);
    END IF;
  END LOOP;
END $$;

-- =========================================================
-- 10. 注册新用户时自动创建 profile
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
