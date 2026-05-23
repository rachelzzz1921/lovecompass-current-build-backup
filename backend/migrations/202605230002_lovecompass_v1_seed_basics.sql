-- LoveCompass V1 Seed Basics
-- 说明：本文件只放全局基础配置，不硬编码题目。题目、题目选项、评分公式、结果画像由导入脚本从 JSON 数据文件写入。

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, description, display_order, config)
VALUES
  ('SA1', '自我吸引感知', 'SELF_ATTACHMENT', '自我关系模式', '衡量个体对自身吸引力、被认真对待价值与自我认可的感知。', 1, '{"direction":"positive"}'::jsonb),
  ('SA2', '依恋焦虑', 'SELF_ATTACHMENT', '自我关系模式', '衡量亲密关系中的不确定感、担心失去、过度确认需求等焦虑倾向。', 2, '{"direction":"reverse"}'::jsonb),
  ('SA3', '依恋回避', 'SELF_ATTACHMENT', '自我关系模式', '衡量亲密关系中的距离控制、防御、回避暴露与独立化倾向。', 3, '{"direction":"reverse"}'::jsonb),
  ('SA4', '边界感', 'SELF_ATTACHMENT', '自我关系模式', '衡量个体在亲密关系中表达需求、设定边界与维持自我位置的能力。', 4, '{"direction":"positive"}'::jsonb),
  ('SA5', '关系投入模式', 'SELF_ATTACHMENT', '自我关系模式', '衡量个体在关系中的投入节奏、付出模式、情绪与行动参与方式。', 5, '{"direction":"positive"}'::jsonb),
  ('SA6', '关系修复能力', 'SELF_ATTACHMENT', '自我关系模式', '衡量冲突后沟通、复盘、修复连接与重新建立信任的能力。', 6, '{"direction":"positive"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.chat_analysts (
  slug,
  name,
  title,
  description,
  persona_prompt,
  system_prompt,
  model_provider,
  model_name,
  model_params,
  is_default,
  is_active,
  requires_unlock,
  display_order
)
VALUES (
  'default_relationship_analyst',
  '默认关系分析师',
  '关系模式解读与陪伴分析',
  'V1 默认聊天分析师。进入聊天时会继承用户的测试结果、维度分数、人格画像和 AI 结果分析，在此基础上进行解释、追问和陪伴式对话。',
  '你是一位温和、清醒、边界感明确的亲密关系分析师。你不替用户做人生决定，不制造恐惧，也不做医疗或心理诊断。你会基于用户的测试结果帮助用户理解自己的关系模式。',
  '你正在为 LoveCompass 用户提供测试后的关系分析对话。你必须基于传入的测试结果、维度分数、结果画像和 AI 分析摘要回答。避免编造未提供的个人经历。输出应具体、克制、尊重用户主体性。',
  'openai_compatible',
  'gpt-4.1-mini',
  '{"temperature":0.7,"max_tokens":1200}'::jsonb,
  true,
  true,
  false,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  persona_prompt = EXCLUDED.persona_prompt,
  system_prompt = EXCLUDED.system_prompt,
  model_provider = EXCLUDED.model_provider,
  model_name = EXCLUDED.model_name,
  model_params = EXCLUDED.model_params,
  is_default = EXCLUDED.is_default,
  is_active = EXCLUDED.is_active,
  requires_unlock = EXCLUDED.requires_unlock,
  display_order = EXCLUDED.display_order,
  updated_at = now();
