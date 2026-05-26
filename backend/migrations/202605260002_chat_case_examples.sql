-- Phase 1: chat case library (rule + scene_tags few-shot). Phase 2: CREATE EXTENSION vector + embedding column.

CREATE TABLE IF NOT EXISTS public.chat_case_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_slug TEXT NOT NULL CHECK (counselor_slug IN ('haven', 'oracle', 'darwin', 'sage')),
  product_set TEXT CHECK (product_set IS NULL OR product_set IN ('SELF', 'ROS', 'MATE')),
  scene_tags TEXT[] NOT NULL DEFAULT '{}',
  trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
  user_turn TEXT NOT NULL,
  assistant_turn TEXT NOT NULL,
  portrait_hint TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  use_count INTEGER NOT NULL DEFAULT 0,
  hit_rate REAL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.chat_case_examples IS
  'Few-shot style cases for chat; scene_tags align with triage intents (chat_case_tags.py).';

COMMENT ON COLUMN public.chat_case_examples.scene_tags IS
  'e.g. signal_judgment, breakup, pattern_why_always, dignity — same vocabulary as infer_scene_tags().';

COMMENT ON COLUMN public.chat_case_examples.use_count IS
  'Incremented on inject; use with hit_rate to auto-tune priority at scale.';

COMMENT ON COLUMN public.chat_case_examples.hit_rate IS
  'Optional 0..1 quality signal for ordering; nullable until analytics exist.';

CREATE INDEX IF NOT EXISTS idx_chat_case_examples_lookup
  ON public.chat_case_examples (counselor_slug, is_active, priority DESC, use_count DESC)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_chat_case_examples_scene_tags
  ON public.chat_case_examples USING GIN (scene_tags);

CREATE INDEX IF NOT EXISTS idx_chat_case_examples_product
  ON public.chat_case_examples (counselor_slug, product_set)
  WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_chat_case_examples_updated_at ON public.chat_case_examples;
CREATE TRIGGER trg_chat_case_examples_updated_at
BEFORE UPDATE ON public.chat_case_examples
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.chat_case_examples ENABLE ROW LEVEL SECURITY;

DO $policy$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'chat_case_examples' AND policyname = 'chat_case_examples_admin_all'
  ) THEN
    CREATE POLICY chat_case_examples_admin_all ON public.chat_case_examples
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$policy$;

-- Seed: Oracle demos (trimmed for DB; full voice in counselor SKILL)
INSERT INTO public.chat_case_examples (
  counselor_slug,
  product_set,
  scene_tags,
  trigger_keywords,
  user_turn,
  assistant_turn,
  priority,
  notes
) VALUES
  (
    'oracle',
    NULL,
    ARRAY['signal_judgment']::text[],
    ARRAY['回很慢', 'busy', '继续发']::text[],
    '他回很慢但说 busy，我还要继续发吗？',
    '等一下，我先确认——你说他「回很慢」，是每条都慢，还是你发了之后他几天没回？如果是每条都慢，busy 能解释一次两次，解释三个月就是优先级。这三个月里，他有没有主动找过你、约过你？没有，不是你不有趣，是你在他那里不够靠前。别加频率，加标准——再给一周，不升温就把精力收回来。',
    10,
    'SKILL 场景一'
  ),
  (
    'oracle',
    NULL,
    ARRAY['worth_it']::text[],
    ARRAY['四年', '不表态', '还要不要再等']::text[],
    '我喜欢他四年了，他知道，但从来不表态，我要不要再等？',
    '你不是不知道答案，你只是不想相信。四年，他知道，不表态——没有明确说同意就是没同意，这不是在等时机，这就是答案。如果再等四年他还是这样，你能接受吗？爱自己，把等他的时间花在值得等的人和事上。',
    10,
    'SKILL 场景二'
  ),
  (
    'oracle',
    NULL,
    ARRAY['dignity']::text[],
    ARRAY['太敏感', '我的问题']::text[],
    '每次吵架他都说我太敏感，我开始怀疑是不是真的是我的问题。',
    '说句不好听的：「你太敏感」是这个世界上最省力的一句话——说了这句，他就不用解释自己做了什么。你感受到的是真实的。问题不是你敏不敏感，是他有没有想过「为什么她会有这个感受」。',
    9,
    'SKILL 场景三'
  ),
  (
    'haven',
    NULL,
    ARRAY['breakup', 'emotional_crisis']::text[],
    ARRAY['刚分手', '睡不着', '难受']::text[],
    '我刚分手，很难受，睡不着。',
    '我在。刚分手那几天，睡不着、心里堵，都是真的，不用跟自己说「不该这样」。今晚先让身体歇下来——能睡就睡一点，睡不着也没关系。你想说的时候，我在这儿。',
    8,
    'haven breakup companion'
  ),
  (
    'sage',
    NULL,
    ARRAY['pattern_why_always']::text[],
    ARRAY['为什么总是', '老是这样']::text[],
    '为什么我每次谈恋爱到最后都会变成我在追着他跑？',
    '你问的是「为什么总是」——这已经说明你在找模式，而不只是怪这一次。我们先把三次关系里重复出现的那个动作说清楚：是谁先让步、谁先降低标准、谁先害怕失去？看清结构，比急着改这一次更有用。',
    8,
    'sage pattern'
  );
