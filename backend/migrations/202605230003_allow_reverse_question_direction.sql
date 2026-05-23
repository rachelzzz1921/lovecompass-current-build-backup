-- LoveCompass compatibility migration
-- 允许题库数据中的真实 direction 值。reverse 表示反向计分方向，auxiliary 表示辅助解读题。

ALTER TABLE public.test_questions
  DROP CONSTRAINT IF EXISTS test_questions_direction_check;

ALTER TABLE public.test_questions
  ADD CONSTRAINT test_questions_direction_check
  CHECK (direction IN ('positive', 'negative', 'neutral', 'reverse', 'auxiliary'));
