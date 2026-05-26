-- LoveCompass generated data import SQL

-- 此文件由 scripts/generate_import_sql.py 根据外部 JSON 数据生成；题目内容没有硬编码在脚本中。

BEGIN;


-- Source: suite1_self_female_lite.json

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA1', '自我吸引感知', 'SELF_ATTACHMENT', '自我关系模式', 1, '{"label":"自我吸引感知","direction":"positive","formula":"weighted_avg * 20","weight_sum":2.7}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA2', '依恋焦虑', 'SELF_ATTACHMENT', '自我关系模式', 2, '{"label":"依恋焦虑","direction":"reverse","formula":"weighted_avg * 20","weight_sum":5.6}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA3', '依恋回避', 'SELF_ATTACHMENT', '自我关系模式', 3, '{"label":"依恋回避","direction":"reverse","formula":"weighted_avg * 20","weight_sum":5.6}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA4', '自我边界', 'SELF_ATTACHMENT', '自我关系模式', 4, '{"label":"自我边界","direction":"positive","formula":"weighted_avg * 20","weight_sum":4.1}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA5', '情绪调节', 'SELF_ATTACHMENT', '自我关系模式', 5, '{"label":"情绪调节","direction":"positive","formula":"weighted_avg * 20","weight_sum":3.8}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA6', '关系投入模式', 'SELF_ATTACHMENT', '自我关系模式', 6, '{"label":"关系投入模式","direction":"positive","formula":"weighted_avg * 20","weight_sum":4.3}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.test_suites (slug, name, version, gender, total_questions, estimated_minutes, is_free, is_active, source_suite_config)
VALUES ('s01_self_female_lite', '自我关系模式测试 · 快速版', '1.0-lite', 'female'::public.test_gender, 20, 4, true, true, '{"id":"S01_SELF_FEMALE_LITE","name":"自我关系模式测试 · 快速版","gender":"female","version":"1.0-lite","total_questions":20,"estimated_minutes":4,"is_free":true,"dimensions":["SA1","SA2","SA3","SA4","SA5","SA6"],"result_types":["薛宝钗","林黛玉","妙玉","史湘云","王熙凤","袭人"],"tier":"lite","full_suite_id":"S01_SELF_FEMALE","question_types_used":["slider","scenario","binary","choice"]}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  version = EXCLUDED.version,
  gender = EXCLUDED.gender,
  total_questions = EXCLUDED.total_questions,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_free = EXCLUDED.is_free,
  is_active = EXCLUDED.is_active,
  source_suite_config = EXCLUDED.source_suite_config,
  updated_at = now();

INSERT INTO public.scoring_models (suite_id, model_key, model_version, scoring_formula, type_rules, ros_config, is_active)
SELECT id, 'ROS_V3', '1.0-lite', '{"SA1":{"label":"自我吸引感知","direction":"positive","formula":"weighted_avg * 20","weights":{"SA1-F-01":1.5,"SA1-F-02":1.2},"weight_sum":2.7},"SA2":{"label":"依恋焦虑","direction":"reverse","formula":"weighted_avg * 20","weights":{"SA2-F-03":1.5,"SA2-F-04":1.5,"SA2-F-05":1.3,"SA2-F-06":1.3},"weight_sum":5.6},"SA3":{"label":"依恋回避","direction":"reverse","formula":"weighted_avg * 20","weights":{"SA3-F-07":1.5,"SA3-F-08":1.5,"SA3-F-09":1.3,"SA3-F-10":1.3},"weight_sum":5.6},"SA4":{"label":"自我边界","direction":"positive","formula":"weighted_avg * 20","weights":{"SA4-F-11":1.5,"SA4-F-12":1.3,"SA4-F-13":1.3},"weight_sum":4.1},"SA5":{"label":"情绪调节","direction":"positive","formula":"weighted_avg * 20","weights":{"SA5-F-14":1.3,"SA5-F-15":1.3,"SA5-F-16":1.2},"weight_sum":3.8},"SA6":{"label":"关系投入模式","direction":"positive","formula":"weighted_avg * 20","weights":{"SA6-F-17":1.3,"SA6-F-18":1.5,"SA6-F-19":1.5},"weight_sum":4.3}}'::jsonb, '{"primary":[{"condition":"SA2 < 45 && SA3 < 45","type":"史湘云","attachment":"混合型"},{"condition":"SA2 < 45 && SA3 >= 60","type":"林黛玉","attachment":"焦虑型"},{"condition":"SA2 >= 60 && SA3 < 45","type":"妙玉","attachment":"回避型"},{"condition":"SA2 >= 60 && SA3 >= 60","type":"薛宝钗","attachment":"安全型"}],"override":[{"condition":"SA1 < 40","type":"袭人","note":"低自我高投入修正，优先级高于primary"},{"condition":"SA4 >= 80 && primary_type == ''薛宝钗''","type":"王熙凤","note":"高边界安全修正"}],"grey_zone":{"note":"SA2或SA3在45-60之间为灰色地带，保留primary类型但在报告中注明临界状态"}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"SELF"}'::jsonb, true
FROM public.test_suites WHERE slug = 's01_self_female_lite'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '薛宝钗', '薛宝钗', 'female'::public.test_gender, '{"attachment_type":"安全型","tagline":"你是关系里最稀有的人","description":"你是关系里最稀有的人。清醒但不冷漠，温柔但有边界。不会因为爱一个人而失去自己，也不需要对方时刻确认才能安心。你给的安全感是真实的，不是表演出来的。","matching_logic":"情绪稳定、边界清晰、能给能收、不因爱失去自我","radar_baseline":{"SA1":72,"SA2":75,"SA3":70,"SA4":78,"SA5":74,"SA6":68}}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's01_self_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '林黛玉', '林黛玉', 'female'::public.test_gender, '{"attachment_type":"焦虑型","tagline":"你的敏感是一种天赋，不是缺陷","description":"你的敏感是一种天赋，不是缺陷。你比任何人都更能感受到关系里的细微变化，爱得深、想得多，是因为你把感情当真。这世上最难得的，是你这种真心。","matching_logic":"高敏感、需要被确认、爱得深但安全感弱、把感情当真的人","radar_baseline":{"SA1":58,"SA2":35,"SA3":65,"SA4":52,"SA5":48,"SA6":62}}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's01_self_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '妙玉', '妙玉', 'female'::public.test_gender, '{"attachment_type":"回避型","tagline":"你不是不懂爱，你只是对平庸的亲密没有兴趣","description":"你不是不懂爱，你只是对平庸的亲密没有兴趣。你有极高的精神标准，不轻易让人靠近，是因为你深知自己值得真正懂你的人。等到了，你会是最深情的那个。","matching_logic":"高冷疏离、精神标准极高、渴望亲密却主动筑墙、等到懂的人才开放","radar_baseline":{"SA1":68,"SA2":72,"SA3":28,"SA4":74,"SA5":60,"SA6":55}}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's01_self_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '史湘云', '史湘云', 'female'::public.test_gender, '{"attachment_type":"混合型","tagline":"你是关系里最有生命力的那种人","description":"你是关系里最有生命力的那种人。时而热烈时而需要空间，不是因为你不稳定，而是因为你足够真实。你从不表演，这反而是最珍贵的事。","matching_logic":"时而热烈时而需要空间、情绪真实不表演、足够复杂才足够有趣","radar_baseline":{"SA1":60,"SA2":42,"SA3":42,"SA4":55,"SA5":52,"SA6":58}}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's01_self_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '王熙凤', '王熙凤', 'female'::public.test_gender, '{"attachment_type":"高边界安全型","tagline":"你是感情里最有掌控力的人","description":"你是感情里最有掌控力的人。清楚自己要什么，不会被情绪带着走，爱得现实但绝对忠诚。你的边界不是冷漠，是尊重——包括对自己的尊重。","matching_logic":"掌控感强、边界极硬、爱得现实但绝对忠诚、尊重自己才能尊重感情","radar_baseline":{"SA1":75,"SA2":78,"SA3":72,"SA4":88,"SA5":76,"SA6":65}}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's01_self_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '袭人', '袭人', 'female'::public.test_gender, '{"attachment_type":"低自我高投入型","tagline":"你是感情里最有温度的人","description":"你是感情里最有温度的人。你的爱是具体的、日常的、落在每一个细节里的。你懂得如何让一个人感到被珍视——这种能力，是很多人一生都学不会的。","matching_logic":"爱得具体日常、落在细节里、温度最高、懂得让人感到被珍视","radar_baseline":{"SA1":32,"SA2":38,"SA3":60,"SA4":35,"SA5":55,"SA6":45}}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's01_self_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA1-F-01', 1, 'SA1', 'slider', 1.5, 'positive', '你觉得自己值得被一个很好的人认真对待吗？', '{"slider":{"min":0,"max":100,"min_label":"不太确定，觉得自己还不够好","max_label":"完全值得，我对自己有信心"},"source_question":{"id":"SA1-F-01","order":1,"dimension":"SA1","type":"slider","weight":1.5,"direction":"positive","text":"你觉得自己值得被一个很好的人认真对待吗？","slider":{"min":0,"max":100,"min_label":"不太确定，觉得自己还不够好","max_label":"完全值得，我对自己有信心"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA1-F-02', 2, 'SA1', 'choice', 1.2, 'positive', '你上一次被人真心喜欢，你的第一反应是？', '{"options":[{"key":"A","text":"有点意外，觉得对方可能不了解真实的我","score":1.0},{"key":"B","text":"开心，但很快开始担心自己配不上","score":2.25},{"key":"C","text":"感觉还好，挺自然的","score":4.0},{"key":"D","text":"当然了，我值得被喜欢","score":4.5}],"source_question":{"id":"SA1-F-02","order":2,"dimension":"SA1","type":"choice","weight":1.2,"direction":"positive","text":"你上一次被人真心喜欢，你的第一反应是？","options":[{"key":"A","text":"有点意外，觉得对方可能不了解真实的我","score":1.0},{"key":"B","text":"开心，但很快开始担心自己配不上","score":2.25},{"key":"C","text":"感觉还好，挺自然的","score":4.0},{"key":"D","text":"当然了，我值得被喜欢","score":4.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA2-F-03', 3, 'SA2', 'scenario', 1.5, 'positive', '你发了一条消息给他，两个小时没有回复。你的状态最接近？', '{"options":[{"key":"A","text":"没什么，他可能在忙","score":4.5},{"key":"B","text":"有点在意，但能控制住","score":3.5},{"key":"C","text":"开始反复回看自己发的内容，想是不是说错了","score":1.5},{"key":"D","text":"非常不安，忍不住又发了一条","score":0.5}],"source_question":{"id":"SA2-F-03","order":3,"dimension":"SA2","type":"scenario","weight":1.5,"direction":"positive","text":"你发了一条消息给他，两个小时没有回复。你的状态最接近？","options":[{"key":"A","text":"没什么，他可能在忙","score":4.5},{"key":"B","text":"有点在意，但能控制住","score":3.5},{"key":"C","text":"开始反复回看自己发的内容，想是不是说错了","score":1.5},{"key":"D","text":"非常不安，忍不住又发了一条","score":0.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA2-F-04', 4, 'SA2', 'binary', 1.5, 'positive', '在关系里，你需要对方经常主动确认「我喜欢你/我在这里」才能安心吗？', '{"options":[{"key":"left","text":"不太需要，我内心比较稳","score":4.25},{"key":"right","text":"需要，不确认就会开始担心","score":1.0}],"source_question":{"id":"SA2-F-04","order":4,"dimension":"SA2","type":"binary","weight":1.5,"direction":"positive","text":"在关系里，你需要对方经常主动确认「我喜欢你/我在这里」才能安心吗？","options":[{"key":"left","text":"不太需要，我内心比较稳","score":4.25},{"key":"right","text":"需要，不确认就会开始担心","score":1.0}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA2-F-05', 5, 'SA2', 'scenario', 1.3, 'positive', '他今天语气比平时冷淡了一些。你最可能做的是？', '{"options":[{"key":"A","text":"观察一下，可能他只是今天状态不好","score":4.25},{"key":"B","text":"主动问他怎么了","score":3.5},{"key":"C","text":"开始反思最近是不是自己哪里出了问题","score":1.25},{"key":"D","text":"情绪受影响，开始担心关系出了问题","score":0.5}],"source_question":{"id":"SA2-F-05","order":5,"dimension":"SA2","type":"scenario","weight":1.3,"direction":"positive","text":"他今天语气比平时冷淡了一些。你最可能做的是？","options":[{"key":"A","text":"观察一下，可能他只是今天状态不好","score":4.25},{"key":"B","text":"主动问他怎么了","score":3.5},{"key":"C","text":"开始反思最近是不是自己哪里出了问题","score":1.25},{"key":"D","text":"情绪受影响，开始担心关系出了问题","score":0.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA2-F-06', 6, 'SA2', 'choice', 1.3, 'positive', '在一段关系里，你的安全感主要来自？', '{"options":[{"key":"A","text":"自己内心，他稳不稳定影响不了我太多","score":4.5},{"key":"B","text":"对方稳定的行动，时间久了我会慢慢安心","score":3.5},{"key":"C","text":"对方频繁的回应和表达，他少说一句我就会想太多","score":1.0},{"key":"D","text":"说实话我不知道，可能来自任何地方","score":2.5}],"source_question":{"id":"SA2-F-06","order":6,"dimension":"SA2","type":"choice","weight":1.3,"direction":"positive","text":"在一段关系里，你的安全感主要来自？","options":[{"key":"A","text":"自己内心，他稳不稳定影响不了我太多","score":4.5},{"key":"B","text":"对方稳定的行动，时间久了我会慢慢安心","score":3.5},{"key":"C","text":"对方频繁的回应和表达，他少说一句我就会想太多","score":1.0},{"key":"D","text":"说实话我不知道，可能来自任何地方","score":2.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA3-F-07', 7, 'SA3', 'scenario', 1.5, 'positive', '一个你有好感的人突然对你表白了。你的第一反应是？', '{"options":[{"key":"A","text":"开心，愿意认真考虑","score":4.25},{"key":"B","text":"有些意外，需要时间想一想","score":3.25},{"key":"C","text":"有点慌，本能地想后退一步","score":1.25},{"key":"D","text":"感觉压力很大，想找理由回避","score":0.5}],"source_question":{"id":"SA3-F-07","order":7,"dimension":"SA3","type":"scenario","weight":1.5,"direction":"positive","text":"一个你有好感的人突然对你表白了。你的第一反应是？","options":[{"key":"A","text":"开心，愿意认真考虑","score":4.25},{"key":"B","text":"有些意外，需要时间想一想","score":3.25},{"key":"C","text":"有点慌，本能地想后退一步","score":1.25},{"key":"D","text":"感觉压力很大，想找理由回避","score":0.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA3-F-08', 8, 'SA3', 'binary', 1.5, 'positive', '当关系变得很亲密、对方开始非常依赖你的时候，你通常会？', '{"options":[{"key":"left","text":"感到被珍视，挺好的","score":4.0},{"key":"right","text":"感到有点窒息，需要一些距离","score":1.0}],"source_question":{"id":"SA3-F-08","order":8,"dimension":"SA3","type":"binary","weight":1.5,"direction":"positive","text":"当关系变得很亲密、对方开始非常依赖你的时候，你通常会？","options":[{"key":"left","text":"感到被珍视，挺好的","score":4.0},{"key":"right","text":"感到有点窒息，需要一些距离","score":1.0}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA3-F-09', 9, 'SA3', 'choice', 1.3, 'positive', '你在关系里愿意让对方真正了解你吗？', '{"options":[{"key":"A","text":"愿意，我喜欢被真正看见","score":4.25},{"key":"B","text":"愿意，但需要慢慢来，不能太快","score":3.25},{"key":"C","text":"有一些部分我不太想让人看见","score":1.75},{"key":"D","text":"很难，展示真实的自己让我很不舒服","score":0.5}],"source_question":{"id":"SA3-F-09","order":9,"dimension":"SA3","type":"choice","weight":1.3,"direction":"positive","text":"你在关系里愿意让对方真正了解你吗？","options":[{"key":"A","text":"愿意，我喜欢被真正看见","score":4.25},{"key":"B","text":"愿意，但需要慢慢来，不能太快","score":3.25},{"key":"C","text":"有一些部分我不太想让人看见","score":1.75},{"key":"D","text":"很难，展示真实的自己让我很不舒服","score":0.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA3-F-10', 10, 'SA3', 'scenario', 1.3, 'positive', '你们吵架了，他说想冷静一下，今晚不想说话。你会？', '{"options":[{"key":"A","text":"好，给他时间，我也去做自己的事","score":4.25},{"key":"B","text":"忍着，但心里很不安","score":2.5},{"key":"C","text":"给他发消息确认他还好","score":1.75},{"key":"D","text":"很快就先联系他，不能接受冷战","score":2.75}],"source_question":{"id":"SA3-F-10","order":10,"dimension":"SA3","type":"scenario","weight":1.3,"direction":"positive","text":"你们吵架了，他说想冷静一下，今晚不想说话。你会？","options":[{"key":"A","text":"好，给他时间，我也去做自己的事","score":4.25},{"key":"B","text":"忍着，但心里很不安","score":2.5},{"key":"C","text":"给他发消息确认他还好","score":1.75},{"key":"D","text":"很快就先联系他，不能接受冷战","score":2.75}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA4-F-11', 11, 'SA4', 'scenario', 1.5, 'positive', '他希望你减少跟某个异性朋友的联系，你认为那是正常的朋友。你会？', '{"options":[{"key":"A","text":"直接告诉他这是我的朋友，不会改变","score":4.5},{"key":"B","text":"跟他解释，但也会稍微减少让他安心","score":3.0},{"key":"C","text":"算了，为了不让他不高兴就少联系了","score":1.0},{"key":"D","text":"嘴上答应，实际没有改变","score":1.5}],"source_question":{"id":"SA4-F-11","order":11,"dimension":"SA4","type":"scenario","weight":1.5,"direction":"positive","text":"他希望你减少跟某个异性朋友的联系，你认为那是正常的朋友。你会？","options":[{"key":"A","text":"直接告诉他这是我的朋友，不会改变","score":4.5},{"key":"B","text":"跟他解释，但也会稍微减少让他安心","score":3.0},{"key":"C","text":"算了，为了不让他不高兴就少联系了","score":1.0},{"key":"D","text":"嘴上答应，实际没有改变","score":1.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA4-F-12', 12, 'SA4', 'binary', 1.3, 'positive', '你在关系里说「没事」的时候，通常是？', '{"options":[{"key":"left","text":"真的没事，我不会憋着不说","score":4.5},{"key":"right","text":"有事但不想说，或者说了也没用","score":1.0}],"source_question":{"id":"SA4-F-12","order":12,"dimension":"SA4","type":"binary","weight":1.3,"direction":"positive","text":"你在关系里说「没事」的时候，通常是？","options":[{"key":"left","text":"真的没事，我不会憋着不说","score":4.5},{"key":"right","text":"有事但不想说，或者说了也没用","score":1.0}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA4-F-13', 13, 'SA4', 'choice', 1.3, 'positive', '对方做了一件让你很不舒服的事，但他没有意识到。你通常会？', '{"options":[{"key":"A","text":"直接告诉他，这件事让我不舒服","score":4.5},{"key":"B","text":"暗示一下，希望他能自己意识到","score":2.75},{"key":"C","text":"忍着，不想因为这个起摩擦","score":1.0},{"key":"D","text":"冷处理，等他自己发现","score":1.5}],"source_question":{"id":"SA4-F-13","order":13,"dimension":"SA4","type":"choice","weight":1.3,"direction":"positive","text":"对方做了一件让你很不舒服的事，但他没有意识到。你通常会？","options":[{"key":"A","text":"直接告诉他，这件事让我不舒服","score":4.5},{"key":"B","text":"暗示一下，希望他能自己意识到","score":2.75},{"key":"C","text":"忍着，不想因为这个起摩擦","score":1.0},{"key":"D","text":"冷处理，等他自己发现","score":1.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA5-F-14', 14, 'SA5', 'slider', 1.3, 'positive', '当你在关系里情绪很差时，你能不能把它说清楚，而不是冷战或者爆发？', '{"slider":{"min":0,"max":100,"min_label":"很难，情绪一来就失控或者憋着","max_label":"能，我可以直接说出来"},"source_question":{"id":"SA5-F-14","order":14,"dimension":"SA5","type":"slider","weight":1.3,"direction":"positive","text":"当你在关系里情绪很差时，你能不能把它说清楚，而不是冷战或者爆发？","slider":{"min":0,"max":100,"min_label":"很难，情绪一来就失控或者憋着","max_label":"能，我可以直接说出来"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA5-F-15', 15, 'SA5', 'scenario', 1.3, 'positive', '你工作上受了委屈，回家后他随口说了一句让你不舒服的话（他不是故意的）。你会？', '{"options":[{"key":"A","text":"告诉他我今天状态不好，那句话让我有点难受","score":4.5},{"key":"B","text":"比平时敏感，但事后知道是自己的问题","score":3.25},{"key":"C","text":"直接爆发，后来才意识到是工作的事","score":1.5},{"key":"D","text":"心里憋着，开始冷战","score":1.0}],"source_question":{"id":"SA5-F-15","order":15,"dimension":"SA5","type":"scenario","weight":1.3,"direction":"positive","text":"你工作上受了委屈，回家后他随口说了一句让你不舒服的话（他不是故意的）。你会？","options":[{"key":"A","text":"告诉他我今天状态不好，那句话让我有点难受","score":4.5},{"key":"B","text":"比平时敏感，但事后知道是自己的问题","score":3.25},{"key":"C","text":"直接爆发，后来才意识到是工作的事","score":1.5},{"key":"D","text":"心里憋着，开始冷战","score":1.0}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA5-F-16', 16, 'SA5', 'binary', 1.2, 'positive', '你委屈了，你更倾向于？', '{"options":[{"key":"left","text":"直接说出来，我不憋着","score":4.25},{"key":"right","text":"等他自己发现，或者等我气消了再说","score":2.0}],"source_question":{"id":"SA5-F-16","order":16,"dimension":"SA5","type":"binary","weight":1.2,"direction":"positive","text":"你委屈了，你更倾向于？","options":[{"key":"left","text":"直接说出来，我不憋着","score":4.25},{"key":"right","text":"等他自己发现，或者等我气消了再说","score":2.0}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA6-F-17', 17, 'SA6', 'scenario', 1.3, 'positive', '你喜欢一个人，你通常是怎么表达的？', '{"options":[{"key":"A","text":"主动说出来，直接表达","score":3.75},{"key":"B","text":"用行动表达，记住他说过的事，在细节里","score":4.25},{"key":"C","text":"等他先表达，我再回应","score":2.5},{"key":"D","text":"喜欢但藏着，怕说了被拒绝","score":1.75}],"source_question":{"id":"SA6-F-17","order":17,"dimension":"SA6","type":"scenario","weight":1.3,"direction":"positive","text":"你喜欢一个人，你通常是怎么表达的？","options":[{"key":"A","text":"主动说出来，直接表达","score":3.75},{"key":"B","text":"用行动表达，记住他说过的事，在细节里","score":4.25},{"key":"C","text":"等他先表达，我再回应","score":2.5},{"key":"D","text":"喜欢但藏着，怕说了被拒绝","score":1.75}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA6-F-18', 18, 'SA6', 'choice', 1.5, 'positive', '你在关系里付出的动力，更多来自？', '{"options":[{"key":"A","text":"真心喜欢他，想让他好，主动的","score":4.25},{"key":"B","text":"喜欢他，但也怕他离开，两者都有","score":2.75},{"key":"C","text":"害怕孤独，需要有人在","score":1.0},{"key":"D","text":"觉得这是关系里应该做的","score":2.25}],"source_question":{"id":"SA6-F-18","order":18,"dimension":"SA6","type":"choice","weight":1.5,"direction":"positive","text":"你在关系里付出的动力，更多来自？","options":[{"key":"A","text":"真心喜欢他，想让他好，主动的","score":4.25},{"key":"B","text":"喜欢他，但也怕他离开，两者都有","score":2.75},{"key":"C","text":"害怕孤独，需要有人在","score":1.0},{"key":"D","text":"觉得这是关系里应该做的","score":2.25}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA6-F-19', 19, 'SA6', 'binary', 1.5, 'positive', '如果你全力付出但对方没有同等回应，你会？', '{"options":[{"key":"left","text":"说出来，或者调整自己的投入程度","score":4.25},{"key":"right","text":"继续付出，觉得对方总有一天会感受到","score":1.5}],"source_question":{"id":"SA6-F-19","order":19,"dimension":"SA6","type":"binary","weight":1.5,"direction":"positive","text":"如果你全力付出但对方没有同等回应，你会？","options":[{"key":"left","text":"说出来，或者调整自己的投入程度","score":4.25},{"key":"right","text":"继续付出，觉得对方总有一天会感受到","score":1.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA6-F-20', 20, 'SA6', 'choice', 1.2, 'auxiliary', '你在一段关系里最在意的是？', '{"options":[{"key":"A","text":"对方真的懂我，我们有真实的联结","score":4.0},{"key":"B","text":"对方稳定可靠，我能放心依赖他","score":3.5},{"key":"C","text":"对方很爱我，我能感受到被珍视","score":3.0},{"key":"D","text":"我们在一起，不孤单","score":1.75}],"note":"辅助类型判断","source_question":{"id":"SA6-F-20","order":20,"dimension":"SA6","type":"choice","weight":1.2,"direction":"auxiliary","text":"你在一段关系里最在意的是？","options":[{"key":"A","text":"对方真的懂我，我们有真实的联结","score":4.0},{"key":"B","text":"对方稳定可靠，我能放心依赖他","score":3.5},{"key":"C","text":"对方很爱我，我能感受到被珍视","score":3.0},{"key":"D","text":"我们在一起，不孤单","score":1.75}],"scoring":{"method":"direct"},"note":"辅助类型判断"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();


-- Source: suite1_self_male_lite.json

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA1', '自我吸引感知', 'SELF_ATTACHMENT', '自我关系模式', 1, '{"label":"自我吸引感知","direction":"positive","formula":"weighted_avg * 20","weight_sum":2.7}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA2', '依恋焦虑', 'SELF_ATTACHMENT', '自我关系模式', 2, '{"label":"依恋焦虑","direction":"reverse","formula":"weighted_avg * 20","weight_sum":5.6}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA3', '依恋回避', 'SELF_ATTACHMENT', '自我关系模式', 3, '{"label":"依恋回避","direction":"reverse","formula":"weighted_avg * 20","weight_sum":5.6}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA4', '自我边界', 'SELF_ATTACHMENT', '自我关系模式', 4, '{"label":"自我边界","direction":"positive","formula":"weighted_avg * 20","weight_sum":4.1}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA5', '情绪调节', 'SELF_ATTACHMENT', '自我关系模式', 5, '{"label":"情绪调节","direction":"positive","formula":"weighted_avg * 20","weight_sum":4.1}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA6', '关系投入模式', 'SELF_ATTACHMENT', '自我关系模式', 6, '{"label":"关系投入模式","direction":"positive","formula":"weighted_avg * 20","weight_sum":4.3}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.test_suites (slug, name, version, gender, total_questions, estimated_minutes, is_free, is_active, source_suite_config)
VALUES ('s01_self_male_lite', '自我关系模式测试 · 快速版', '1.0-lite', 'male'::public.test_gender, 20, 4, true, true, '{"id":"S01_SELF_MALE_LITE","name":"自我关系模式测试 · 快速版","gender":"male","version":"1.0-lite","total_questions":20,"estimated_minutes":4,"is_free":true,"dimensions":["SA1","SA2","SA3","SA4","SA5","SA6"],"result_types":["贾探春","贾宝玉","柳湘莲","贾雨村","北静王","蒋玉菡"],"question_types_used":["slider","scenario","binary","choice"],"tier":"lite","full_suite_id":"S01_SELF_MALE"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  version = EXCLUDED.version,
  gender = EXCLUDED.gender,
  total_questions = EXCLUDED.total_questions,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_free = EXCLUDED.is_free,
  is_active = EXCLUDED.is_active,
  source_suite_config = EXCLUDED.source_suite_config,
  updated_at = now();

INSERT INTO public.scoring_models (suite_id, model_key, model_version, scoring_formula, type_rules, ros_config, is_active)
SELECT id, 'ROS_V3', '1.0-lite', '{"SA1":{"label":"自我吸引感知","direction":"positive","formula":"weighted_avg * 20","weights":{"SA1-M-01":1.5,"SA1-M-02":1.2},"weight_sum":2.7},"SA2":{"label":"依恋焦虑","direction":"reverse","formula":"weighted_avg * 20","weights":{"SA2-M-03":1.5,"SA2-M-04":1.5,"SA2-M-05":1.3,"SA2-M-06":1.3},"weight_sum":5.6},"SA3":{"label":"依恋回避","direction":"reverse","formula":"weighted_avg * 20","weights":{"SA3-M-07":1.5,"SA3-M-08":1.5,"SA3-M-09":1.3,"SA3-M-10":1.3},"weight_sum":5.6},"SA4":{"label":"自我边界","direction":"positive","formula":"weighted_avg * 20","weights":{"SA4-M-11":1.5,"SA4-M-12":1.3,"SA4-M-13":1.3},"weight_sum":4.1},"SA5":{"label":"情绪调节","direction":"positive","formula":"weighted_avg * 20","weights":{"SA5-M-14":1.5,"SA5-M-15":1.3,"SA5-M-16":1.3},"weight_sum":4.1},"SA6":{"label":"关系投入模式","direction":"positive","formula":"weighted_avg * 20","weights":{"SA6-M-17":1.3,"SA6-M-18":1.5,"SA6-M-19":1.5},"weight_sum":4.3}}'::jsonb, '{"primary":[{"condition":"SA2 < 45 && SA3 < 45","type":"贾雨村","attachment":"混合型"},{"condition":"SA2 < 45 && SA3 >= 60","type":"贾宝玉","attachment":"焦虑型"},{"condition":"SA2 >= 60 && SA3 < 45","type":"柳湘莲","attachment":"回避型"},{"condition":"SA2 >= 60 && SA3 >= 60","type":"贾探春","attachment":"安全型"}],"override":[{"condition":"SA1 < 40","type":"蒋玉菡","note":"低自我高投入修正，优先级高于primary"},{"condition":"SA4 >= 80 && primary_type == ''贾探春''","type":"北静王","note":"高边界安全修正"}],"grey_zone":{"note":"SA2或SA3在45-60之间为灰色地带，保留primary类型但在报告中注明临界状态"}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"SELF"}'::jsonb, true
FROM public.test_suites WHERE slug = 's01_self_male_lite'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '贾探春', '贾探春', 'male'::public.test_gender, '{"attachment_type":"安全型","tagline":"你在感情里有一种天然的清醒","description":"你在感情里有一种天然的清醒。不将就、不消耗自己、懂得进退。你给的爱是有质量的——因为你从不从匮乏里给出去。","matching_logic":"清醒独立、有原则、不轻易依赖但真心投入、感情里的清醒者","radar_baseline":{"SA1":72,"SA2":75,"SA3":70,"SA4":78,"SA5":74,"SA6":68}}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's01_self_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '贾宝玉', '贾宝玉', 'male'::public.test_gender, '{"attachment_type":"焦虑型","tagline":"你是感情里最用心的那种人","description":"你是感情里最用心的那种人。在意每一个细节，记得每一句话。你的情感浓度是别人给不了的——只是你值得一个同样认真的人。","matching_logic":"情感浓烈、在意细节、害怕失去、记得每一句话的人","radar_baseline":{"SA1":58,"SA2":35,"SA3":65,"SA4":52,"SA5":48,"SA6":62}}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's01_self_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '柳湘莲', '柳湘莲', 'male'::public.test_gender, '{"attachment_type":"回避型","tagline":"你的独立是一种骨气，不是冷漠","description":"你的独立是一种骨气，不是冷漠。你不轻易动心，是因为你对感情有真正的标准。一旦你认定，就是全力以赴——只是这个人要配得上你的认定。","matching_logic":"独来独往、不轻易动情、骨子里重情义、一旦受伤彻底消失","radar_baseline":{"SA1":68,"SA2":72,"SA3":28,"SA4":74,"SA5":60,"SA6":55}}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's01_self_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '贾雨村', '贾雨村', 'male'::public.test_gender, '{"attachment_type":"混合型","tagline":"你的复杂是深度，不是问题","description":"你的复杂是深度，不是问题。你在感情里有很多面，时而投入时而抽离——那是因为你在真实地和自己相处。懂你的人，会爱上你的所有层次。","matching_logic":"入世又抽离、多面复杂、感情里有很多层、懂他的人才能爱上他的全部","radar_baseline":{"SA1":60,"SA2":42,"SA3":42,"SA4":55,"SA5":52,"SA6":58}}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's01_self_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '北静王', '北静王', 'male'::public.test_gender, '{"attachment_type":"高边界安全型","tagline":"你有一种天然的分寸感","description":"你有一种天然的分寸感。亲密而不失自我，投入但保持清醒。你不是不能爱，你只是不会为了爱而降低标准。这是成熟，不是距离。","matching_logic":"有分寸感、亲密而不失自我、投入但保持清醒、成熟不是距离","radar_baseline":{"SA1":75,"SA2":78,"SA3":72,"SA4":88,"SA5":76,"SA6":65}}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's01_self_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '蒋玉菡', '蒋玉菡', 'male'::public.test_gender, '{"attachment_type":"低自我高投入型","tagline":"你的深情是你最大的财富","description":"你的深情是你最大的财富。你爱起来是全心全意的，没有保留。你给的温柔是真实的重量，不是表演——只是别忘了，你自己也值得被这样对待。","matching_logic":"深情无保留、全心全意、温柔有重量、只是别忘了自己也值得被这样对待","radar_baseline":{"SA1":32,"SA2":38,"SA3":60,"SA4":35,"SA5":55,"SA6":45}}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's01_self_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA1-M-01', 1, 'SA1', 'slider', 1.5, 'positive', '你觉得自己值得被一个很好的人认真对待吗？', '{"slider":{"min":0,"max":100,"min_label":"不太确定","max_label":"完全值得"},"source_question":{"id":"SA1-M-01","order":1,"dimension":"SA1","type":"slider","weight":1.5,"direction":"positive","text":"你觉得自己值得被一个很好的人认真对待吗？","slider":{"min":0,"max":100,"min_label":"不太确定","max_label":"完全值得"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA1-M-02', 2, 'SA1', 'choice', 1.2, 'positive', '有人对你感兴趣，你的第一反应通常是？', '{"options":[{"key":"A","text":"有点怀疑，觉得对方可能只是一时的","score":1.0},{"key":"B","text":"开心，但很快想「她了解真实的我吗」","score":2.5},{"key":"C","text":"正常接受，觉得自然","score":4.0},{"key":"D","text":"理所当然，我值得被喜欢","score":4.5}],"source_question":{"id":"SA1-M-02","order":2,"dimension":"SA1","type":"choice","weight":1.2,"direction":"positive","text":"有人对你感兴趣，你的第一反应通常是？","options":[{"key":"A","text":"有点怀疑，觉得对方可能只是一时的","score":1.0},{"key":"B","text":"开心，但很快想「她了解真实的我吗」","score":2.5},{"key":"C","text":"正常接受，觉得自然","score":4.0},{"key":"D","text":"理所当然，我值得被喜欢","score":4.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA2-M-03', 3, 'SA2', 'scenario', 1.5, 'positive', '你发消息给她，两小时没回。你最可能做什么？', '{"options":[{"key":"A","text":"没什么，她可能在忙","score":4.5},{"key":"B","text":"有点在意，但继续做自己的事","score":3.5},{"key":"C","text":"忍不住再发一条确认","score":1.25},{"key":"D","text":"开始觉得是不是哪里出问题了","score":0.5}],"source_question":{"id":"SA2-M-03","order":3,"dimension":"SA2","type":"scenario","weight":1.5,"direction":"positive","text":"你发消息给她，两小时没回。你最可能做什么？","options":[{"key":"A","text":"没什么，她可能在忙","score":4.5},{"key":"B","text":"有点在意，但继续做自己的事","score":3.5},{"key":"C","text":"忍不住再发一条确认","score":1.25},{"key":"D","text":"开始觉得是不是哪里出问题了","score":0.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA2-M-04', 4, 'SA2', 'binary', 1.5, 'positive', '她今天状态冷淡一些。你通常的反应是？', '{"options":[{"key":"left","text":"观察一下，可能只是她今天累了","score":4.25},{"key":"right","text":"情绪受影响，开始担心是不是自己的问题","score":0.75}],"source_question":{"id":"SA2-M-04","order":4,"dimension":"SA2","type":"binary","weight":1.5,"direction":"positive","text":"她今天状态冷淡一些。你通常的反应是？","options":[{"key":"left","text":"观察一下，可能只是她今天累了","score":4.25},{"key":"right","text":"情绪受影响，开始担心是不是自己的问题","score":0.75}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA2-M-05', 5, 'SA2', 'choice', 1.3, 'positive', '你在关系里的安全感主要来自？', '{"options":[{"key":"A","text":"自己内心，外部怎么变化影响不了我","score":4.5},{"key":"B","text":"对方稳定的行动，时间长了会安心","score":3.5},{"key":"C","text":"需要她频繁表达，少说一句我就会多想","score":1.0},{"key":"D","text":"说不清，状态好就有，状态差就没有","score":2.5}],"source_question":{"id":"SA2-M-05","order":5,"dimension":"SA2","type":"choice","weight":1.3,"direction":"positive","text":"你在关系里的安全感主要来自？","options":[{"key":"A","text":"自己内心，外部怎么变化影响不了我","score":4.5},{"key":"B","text":"对方稳定的行动，时间长了会安心","score":3.5},{"key":"C","text":"需要她频繁表达，少说一句我就会多想","score":1.0},{"key":"D","text":"说不清，状态好就有，状态差就没有","score":2.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA2-M-06', 6, 'SA2', 'scenario', 1.3, 'positive', '你们吵架，她说今晚不想说话。你会？', '{"options":[{"key":"A","text":"好，给她时间，我也去做自己的事","score":4.25},{"key":"B","text":"表面同意，但一直刷手机等她消息","score":2.0},{"key":"C","text":"过一会儿忍不住发消息确认她还好","score":1.5},{"key":"D","text":"继续找她说，不能接受就这样冷着","score":0.75}],"source_question":{"id":"SA2-M-06","order":6,"dimension":"SA2","type":"scenario","weight":1.3,"direction":"positive","text":"你们吵架，她说今晚不想说话。你会？","options":[{"key":"A","text":"好，给她时间，我也去做自己的事","score":4.25},{"key":"B","text":"表面同意，但一直刷手机等她消息","score":2.0},{"key":"C","text":"过一会儿忍不住发消息确认她还好","score":1.5},{"key":"D","text":"继续找她说，不能接受就这样冷着","score":0.75}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA3-M-07', 7, 'SA3', 'binary', 1.5, 'positive', '当关系变得非常亲密，对方开始高度依赖你，你通常感觉？', '{"options":[{"key":"left","text":"被珍视，这正是我想要的","score":4.0},{"key":"right","text":"有点压迫感，需要一些个人空间","score":1.0}],"source_question":{"id":"SA3-M-07","order":7,"dimension":"SA3","type":"binary","weight":1.5,"direction":"positive","text":"当关系变得非常亲密，对方开始高度依赖你，你通常感觉？","options":[{"key":"left","text":"被珍视，这正是我想要的","score":4.0},{"key":"right","text":"有点压迫感，需要一些个人空间","score":1.0}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA3-M-08', 8, 'SA3', 'scenario', 1.5, 'positive', '她想每天睡前通话。你的真实感受是？', '{"options":[{"key":"A","text":"挺好的，喜欢这种感觉","score":4.0},{"key":"B","text":"可以接受，但希望不是每天必须","score":2.75},{"key":"C","text":"有点喘不过气，这对我来说太多了","score":1.0},{"key":"D","text":"直接说不太适合我，我需要自己的时间","score":3.25}],"source_question":{"id":"SA3-M-08","order":8,"dimension":"SA3","type":"scenario","weight":1.5,"direction":"positive","text":"她想每天睡前通话。你的真实感受是？","options":[{"key":"A","text":"挺好的，喜欢这种感觉","score":4.0},{"key":"B","text":"可以接受，但希望不是每天必须","score":2.75},{"key":"C","text":"有点喘不过气，这对我来说太多了","score":1.0},{"key":"D","text":"直接说不太适合我，我需要自己的时间","score":3.25}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA3-M-09', 9, 'SA3', 'choice', 1.3, 'positive', '你愿意让她真正了解你吗？', '{"options":[{"key":"A","text":"愿意，我喜欢被真正看见","score":4.25},{"key":"B","text":"愿意，但要慢慢来","score":3.25},{"key":"C","text":"有一些部分不想让人看见","score":1.75},{"key":"D","text":"展示真实的自己让我不太自在","score":0.75}],"source_question":{"id":"SA3-M-09","order":9,"dimension":"SA3","type":"choice","weight":1.3,"direction":"positive","text":"你愿意让她真正了解你吗？","options":[{"key":"A","text":"愿意，我喜欢被真正看见","score":4.25},{"key":"B","text":"愿意，但要慢慢来","score":3.25},{"key":"C","text":"有一些部分不想让人看见","score":1.75},{"key":"D","text":"展示真实的自己让我不太自在","score":0.75}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA3-M-10', 10, 'SA3', 'scenario', 1.3, 'positive', '她第一次对你说「我爱你」。你的本能反应是？', '{"options":[{"key":"A","text":"回应她，我也有同感","score":4.25},{"key":"B","text":"感动，但说不出口，用行动表示","score":3.25},{"key":"C","text":"有点愣，需要一点时间消化","score":2.25},{"key":"D","text":"感到压力，本能地想后退","score":0.75}],"source_question":{"id":"SA3-M-10","order":10,"dimension":"SA3","type":"scenario","weight":1.3,"direction":"positive","text":"她第一次对你说「我爱你」。你的本能反应是？","options":[{"key":"A","text":"回应她，我也有同感","score":4.25},{"key":"B","text":"感动，但说不出口，用行动表示","score":3.25},{"key":"C","text":"有点愣，需要一点时间消化","score":2.25},{"key":"D","text":"感到压力，本能地想后退","score":0.75}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA4-M-11', 11, 'SA4', 'binary', 1.5, 'positive', '她对你的某个习惯或朋友有意见，但你觉得没问题。你会？', '{"options":[{"key":"left","text":"跟她说清楚，这件事我不打算改变","score":4.25},{"key":"right","text":"为了不让她不高兴，将就一下","score":1.0}],"source_question":{"id":"SA4-M-11","order":11,"dimension":"SA4","type":"binary","weight":1.5,"direction":"positive","text":"她对你的某个习惯或朋友有意见，但你觉得没问题。你会？","options":[{"key":"left","text":"跟她说清楚，这件事我不打算改变","score":4.25},{"key":"right","text":"为了不让她不高兴，将就一下","score":1.0}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA4-M-12', 12, 'SA4', 'scenario', 1.3, 'positive', '她做了一件让你不舒服的事，但她没意识到。你通常会？', '{"options":[{"key":"A","text":"直接告诉她","score":4.5},{"key":"B","text":"暗示一下，等她自己发现","score":2.75},{"key":"C","text":"忍着，不想因为这个起摩擦","score":1.0},{"key":"D","text":"冷处理，看她什么时候注意到","score":1.5}],"source_question":{"id":"SA4-M-12","order":12,"dimension":"SA4","type":"scenario","weight":1.3,"direction":"positive","text":"她做了一件让你不舒服的事，但她没意识到。你通常会？","options":[{"key":"A","text":"直接告诉她","score":4.5},{"key":"B","text":"暗示一下，等她自己发现","score":2.75},{"key":"C","text":"忍着，不想因为这个起摩擦","score":1.0},{"key":"D","text":"冷处理，看她什么时候注意到","score":1.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA4-M-13', 13, 'SA4', 'choice', 1.3, 'positive', '你在关系里说「没事」的时候，通常真的没事吗？', '{"options":[{"key":"A","text":"是的，我不说了就是真的没事","score":4.5},{"key":"B","text":"大多数时候是，偶尔有事懒得说","score":3.25},{"key":"C","text":"大多数时候是有事但不想说","score":1.25},{"key":"D","text":"说没事但其实心里记着","score":0.75}],"source_question":{"id":"SA4-M-13","order":13,"dimension":"SA4","type":"choice","weight":1.3,"direction":"positive","text":"你在关系里说「没事」的时候，通常真的没事吗？","options":[{"key":"A","text":"是的，我不说了就是真的没事","score":4.5},{"key":"B","text":"大多数时候是，偶尔有事懒得说","score":3.25},{"key":"C","text":"大多数时候是有事但不想说","score":1.25},{"key":"D","text":"说没事但其实心里记着","score":0.75}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA5-M-14', 14, 'SA5', 'binary', 1.5, 'positive', '当你情绪很差时，你对她的态度会受影响吗？', '{"options":[{"key":"left","text":"基本不会，我能把情绪管好","score":4.25},{"key":"right","text":"会有影响，状态差时她能感觉到","score":1.5}],"source_question":{"id":"SA5-M-14","order":14,"dimension":"SA5","type":"binary","weight":1.5,"direction":"positive","text":"当你情绪很差时，你对她的态度会受影响吗？","options":[{"key":"left","text":"基本不会，我能把情绪管好","score":4.25},{"key":"right","text":"会有影响，状态差时她能感觉到","score":1.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA5-M-15', 15, 'SA5', 'scenario', 1.3, 'positive', '工作压力很大，状态很差。回家后她随口说了一句让你不舒服的话。你会？', '{"options":[{"key":"A","text":"告诉她我今天状态不好，那句话让我有点难受","score":4.25},{"key":"B","text":"语气有点差，但不是故意针对她","score":2.0},{"key":"C","text":"直接发了一顿，事后知道不对","score":1.0},{"key":"D","text":"憋着什么都不说，开始冷战","score":1.25}],"source_question":{"id":"SA5-M-15","order":15,"dimension":"SA5","type":"scenario","weight":1.3,"direction":"positive","text":"工作压力很大，状态很差。回家后她随口说了一句让你不舒服的话。你会？","options":[{"key":"A","text":"告诉她我今天状态不好，那句话让我有点难受","score":4.25},{"key":"B","text":"语气有点差，但不是故意针对她","score":2.0},{"key":"C","text":"直接发了一顿，事后知道不对","score":1.0},{"key":"D","text":"憋着什么都不说，开始冷战","score":1.25}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA5-M-16', 16, 'SA5', 'slider', 1.3, 'positive', '在关系里发生冲突时，你保持情绪稳定、不失控的能力有多强？', '{"slider":{"min":0,"max":100,"min_label":"很难，容易情绪化","max_label":"通常能保持相对冷静"},"source_question":{"id":"SA5-M-16","order":16,"dimension":"SA5","type":"slider","weight":1.3,"direction":"positive","text":"在关系里发生冲突时，你保持情绪稳定、不失控的能力有多强？","slider":{"min":0,"max":100,"min_label":"很难，容易情绪化","max_label":"通常能保持相对冷静"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA6-M-17', 17, 'SA6', 'scenario', 1.3, 'positive', '你喜欢一个人时，你通常是怎么表达的？', '{"options":[{"key":"A","text":"直接说出来","score":3.75},{"key":"B","text":"用行动，记住她说过的事，在合适的时机出现","score":4.25},{"key":"C","text":"等她先表达，再回应","score":2.5},{"key":"D","text":"喜欢但藏着，不太会说","score":2.0}],"source_question":{"id":"SA6-M-17","order":17,"dimension":"SA6","type":"scenario","weight":1.3,"direction":"positive","text":"你喜欢一个人时，你通常是怎么表达的？","options":[{"key":"A","text":"直接说出来","score":3.75},{"key":"B","text":"用行动，记住她说过的事，在合适的时机出现","score":4.25},{"key":"C","text":"等她先表达，再回应","score":2.5},{"key":"D","text":"喜欢但藏着，不太会说","score":2.0}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA6-M-18', 18, 'SA6', 'choice', 1.5, 'positive', '你在关系里付出的动力，更多来自？', '{"options":[{"key":"A","text":"真心喜欢她，主动想让她好","score":4.25},{"key":"B","text":"喜欢她，但也有一部分是怕失去","score":2.75},{"key":"C","text":"觉得这是关系里应该做的","score":2.25},{"key":"D","text":"需要有人在，不想一个人","score":1.0}],"source_question":{"id":"SA6-M-18","order":18,"dimension":"SA6","type":"choice","weight":1.5,"direction":"positive","text":"你在关系里付出的动力，更多来自？","options":[{"key":"A","text":"真心喜欢她，主动想让她好","score":4.25},{"key":"B","text":"喜欢她，但也有一部分是怕失去","score":2.75},{"key":"C","text":"觉得这是关系里应该做的","score":2.25},{"key":"D","text":"需要有人在，不想一个人","score":1.0}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA6-M-19', 19, 'SA6', 'binary', 1.5, 'positive', '如果你全力付出但对方没有同等回应，你会？', '{"options":[{"key":"left","text":"说出来，或者调整自己的投入","score":4.25},{"key":"right","text":"继续付出，觉得多做一点对方会感受到","score":1.5}],"source_question":{"id":"SA6-M-19","order":19,"dimension":"SA6","type":"binary","weight":1.5,"direction":"positive","text":"如果你全力付出但对方没有同等回应，你会？","options":[{"key":"left","text":"说出来，或者调整自己的投入","score":4.25},{"key":"right","text":"继续付出，觉得多做一点对方会感受到","score":1.5}],"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA6-M-20', 20, 'SA6', 'choice', 1.2, 'auxiliary', '你在一段关系里最在意的是？', '{"options":[{"key":"A","text":"她真的懂我，我们有真实的联结","score":4.0},{"key":"B","text":"她让我感到轻松，跟她在一起不累","score":3.75},{"key":"C","text":"她很爱我，我能感受到被珍视","score":3.0},{"key":"D","text":"有人陪着，不孤单","score":1.75}],"note":"辅助类型判断","source_question":{"id":"SA6-M-20","order":20,"dimension":"SA6","type":"choice","weight":1.2,"direction":"auxiliary","text":"你在一段关系里最在意的是？","options":[{"key":"A","text":"她真的懂我，我们有真实的联结","score":4.0},{"key":"B","text":"她让我感到轻松，跟她在一起不累","score":3.75},{"key":"C","text":"她很爱我，我能感受到被珍视","score":3.0},{"key":"D","text":"有人陪着，不孤单","score":1.75}],"scoring":{"method":"direct"},"note":"辅助类型判断"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();


-- Source: suite2_ros_female_lite.json

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('AT', '吸引基础', 'ROS_RELATIONSHIP', '关系画像', 1, '{"label":"吸引基础","direction":"positive","weight":0.2,"description":"你们当初为什么在一起，那个吸引力现在还在不在"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('IN', '互动质量', 'ROS_RELATIONSHIP', '关系画像', 2, '{"label":"互动质量","direction":"positive","weight":0.3,"description":"日常相处的体验——沟通、陪伴、冲突处理的质量"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('CO', '兼容程度', 'ROS_RELATIONSHIP', '关系画像', 3, '{"label":"兼容程度","direction":"positive","weight":0.25,"description":"价值观、生活节奏和未来方向的契合度"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('EV', '关系走向', 'ROS_RELATIONSHIP', '关系画像', 4, '{"label":"关系走向","direction":"positive","weight":0.15,"description":"这段关系在往哪里走，你在其中有没有在成长"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('RK', '风险信号', 'ROS_RELATIONSHIP', '关系画像', 5, '{"label":"风险信号","direction":"reverse","weight":0.1,"description":"有没有需要正视的问题，分数越低风险越高"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('PRE', '前置校准题', 'ROS_RELATIONSHIP', '关系画像', 0, '{"direction":"neutral","scored":false}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.test_suites (slug, name, version, gender, total_questions, estimated_minutes, is_free, is_active, source_suite_config)
VALUES ('s02_ros_female_lite', '关系画像测试 · 快速版', '1.0-lite', 'female'::public.test_gender, 20, 5, false, true, '{"gender":"female","version":"1.0-lite","estimated_minutes":5,"is_free":false,"layers":["AT","IN","CO","EV","RK"],"relationship_types":["彼此生长","难舍难分","温水同行","心甘情愿地累","烈火烹油","此刻刚好"],"relationship_stages":["怦然相遇","渐入佳境","暗流初现","磨合阵痛","倦怠低谷","十字路口","重建信任","深度联结","并肩同行"],"question_types_used":["slider","scenario","binary","choice"],"id":"S02_ROS_FEMALE_LITE","name":"关系画像测试 · 快速版","total_questions":20,"pre_questions":1,"tier":"lite","full_suite_id":"S02_ROS_FEMALE"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  version = EXCLUDED.version,
  gender = EXCLUDED.gender,
  total_questions = EXCLUDED.total_questions,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_free = EXCLUDED.is_free,
  is_active = EXCLUDED.is_active,
  source_suite_config = EXCLUDED.source_suite_config,
  updated_at = now();

INSERT INTO public.scoring_models (suite_id, model_key, model_version, scoring_formula, type_rules, ros_config, is_active)
SELECT id, 'ROS_V3', '1.0-lite', '{"layers":{"AT":{"label":"吸引基础","direction":"positive","weight":0.2,"description":"你们当初为什么在一起，那个吸引力现在还在不在"},"IN":{"label":"互动质量","direction":"positive","weight":0.3,"description":"日常相处的体验——沟通、陪伴、冲突处理的质量"},"CO":{"label":"兼容程度","direction":"positive","weight":0.25,"description":"价值观、生活节奏和未来方向的契合度"},"EV":{"label":"关系走向","direction":"positive","weight":0.15,"description":"这段关系在往哪里走，你在其中有没有在成长"},"RK":{"label":"风险信号","direction":"reverse","weight":0.1,"description":"有没有需要正视的问题，分数越低风险越高"}},"overall":{"formula":"AT*0.20 + IN*0.30 + CO*0.25 + EV*0.15 + (100-RK)*0.10","display_adjustment":{"note":"所有分数向上平移，底部有托底，最低显示55","mapping":[{"raw_min":0,"raw_max":40,"display_min":55,"display_max":65},{"raw_min":41,"raw_max":60,"display_min":65,"display_max":75},{"raw_min":61,"raw_max":80,"display_min":75,"display_max":88},{"raw_min":81,"raw_max":100,"display_min":88,"display_max":96}]}},"resonance_levels":[{"min":88,"max":96,"name":"心有灵犀","desc":"你们之间有一种很难被替代的默契"},{"min":75,"max":87,"name":"深度共鸣","desc":"真实的联结，值得好好珍惜"},{"min":65,"max":74,"name":"温柔磨合","desc":"你们在彼此靠近的路上，慢慢来"},{"min":55,"max":64,"name":"初见雏形","desc":"关系还在成形，有空间，也有可能"}]}'::jsonb, '{"pre_questions":[{"id":"PRE-F-00A","type":"choice","text":"在开始之前，先告诉我你们现在处于什么阶段？","note":"此答案影响题目措辞与阶段判断，不计分。","options":[{"key":"A","text":"暗恋/还没在一起","tag":"secret_crush"},{"key":"B","text":"暧昧中","tag":"ambiguous"},{"key":"C","text":"在一起不到一年","tag":"early"},{"key":"D","text":"在一起一到三年","tag":"mid"},{"key":"E","text":"在一起三年以上","tag":"long"},{"key":"F","text":"已婚/长期伴侣","tag":"married"}]}],"stage_rules":{"note":"结合时间输入和各层得分综合判断","time_constraints":{"secret_crush":{"locked_stages":["重建信任","深度联结","并肩同行"]},"ambiguous":{"locked_stages":["重建信任","深度联结","并肩同行"]},"married":{"low_resonance_language":"long_term_version"}},"score_mapping":{"①怦然相遇":{"EV_range":[75,100],"AT_range":[80,100],"IN_range":[0,100]},"②渐入佳境":{"EV_range":[70,100],"AT_range":[65,100],"IN_range":[60,100]},"③暗流初现":{"EV_range":[50,75],"AT_range":[50,80],"RK_range":[30,60]},"④磨合阵痛":{"EV_range":[40,65],"IN_range":[30,60],"RK_range":[40,70]},"⑤倦怠低谷":{"EV_range":[20,45],"RK_range":[60,100],"IN_range":[20,50]},"⑥十字路口":{"EV_range":[25,50],"RK_range":[55,85]},"⑦重建信任":{"EV_range":[55,75],"IN_range":[60,85],"RK_range":[20,50]},"⑧深度联结":{"EV_range":[70,90],"IN_range":[75,100],"AT_range":[60,100]},"⑨并肩同行":{"EV_range":[80,100],"CO_range":[75,100],"IN_range":[75,100]}}},"relationship_type_rules":{"彼此生长":{"condition":"EV >= 75 && IN >= 70 && RK <= 35","tagline":"在一起让你成为更好的自己","desc":"被看见、被支持、有成长"},"难舍难分":{"condition":"AT >= 75 && IN >= 65 && EV < 65","tagline":"深度融合，分不清是爱还是需要","desc":"离不开，但不确定是爱还是习惯"},"温水同行":{"condition":"RK <= 40 && IN < 65 && EV < 60","tagline":"不冷不热，舒适但缺少真正的联结","desc":"不吵架，也没有真正在一起"},"心甘情愿地累":{"condition":"RK >= 55 && EV < 55 && AT >= 60","tagline":"付出多于回报，但还在坚持","desc":"累，但走不掉"},"烈火烹油":{"condition":"AT >= 75 && RK >= 50 && IN < 70","tagline":"极好极坏，情绪过山车","desc":"高强度的吸引和冲突并存"},"此刻刚好":{"condition":"CO < 65 && EV < 60 && RK <= 45","tagline":"双方都知道这不是终点","desc":"舒适但没有未来感"}},"prescription_rules":{"stage_7_8_9":"你们走过了不容易的部分，能走到这里很不简单。下面这张处方，是给经历过风浪的你们用来继续走好的——","stage_1_2_3":"你们还在彼此发现的阶段，这是关系里最有生命力的时候。下面这张处方帮你们把这段时间过得更扎实一些——","stage_4_5_6":"能在这个阶段认真做这道题，说明你们都在认真对待这段关系。这张处方不是说你们有问题，是帮你们把问题说清楚——","low_resonance_long_term":"在一起久了，有些东西会钝化——这很正常，不是感情出了问题。这张处方是帮你们重新找到彼此的频道——"},"attachment_collision_map":{"安全型×安全型":{"name":"天作之合","desc":"两个内心稳定的人在一起，是最少内耗的组合。不是没有问题，是有能力一起解决。"},"安全型×焦虑型":{"name":"避风港与浪","desc":"稳定的人能给焦虑的人真实的安全感，但时间久了容易出现不平衡——一个一直在给，一个一直在要。"},"安全型×回避型":{"name":"开门与关门","desc":"安全型足够稳定，不会因为回避型的后退而崩溃——这是这个组合能走下去的原因。"},"安全型×混合型":{"name":"稳中有变","desc":"安全型是这段关系的锚，混合型的情绪起伏会被安全型的稳定慢慢平衡。"},"焦虑型×焦虑型":{"name":"双向拉扯","desc":"两个都需要确认的人在一起，前期浓烈，后期容易把彼此都耗尽。"},"焦虑型×回避型":{"name":"欢喜冤家","desc":"最常见也最戏剧性的组合。一个追，一个退，形成经典的追逃模式。吸引力是真实的，但如果不打破这个模式，最终会耗尽双方。"},"焦虑型×混合型":{"name":"迷雾中的彼此","desc":"两个人都不够稳定，但方式不同。对方的忽冷忽热会持续触发焦虑型的不安全感。"},"回避型×回避型":{"name":"平行宇宙","desc":"两个人都不主动靠近，关系很平静，但也很难真正深入。"},"回避型×混合型":{"name":"捉摸不定","desc":"混合型的忽冷忽热反而能让回避型感到相对舒适。但这个组合很难建立真正的深度。"},"混合型×混合型":{"name":"一团烟火","desc":"两个情绪都不稳定的人在一起，会非常热烈，也会非常混乱。"},"高边界安全型×焦虑型":{"name":"冰与火","desc":"高边界的安全感让焦虑型感到有依靠，但边界的硬度也会让焦虑型觉得进不去。"},"高边界安全型×回避型":{"name":"两座山","desc":"两个都有很强边界感的人在一起，相互尊重，但也可能相互疏远。"},"低自我高投入型×任意":{"name":"全心付出","desc":"无论对方是什么类型，这个组合的核心风险不在对方，在自己——需要先学会照顾自己。"},"高边界安全型×混合型":{"name":"规则与例外","desc":"高边界的清晰给混合型一种难得的稳定感，只要双方愿意沟通，互补性很强。"},"低自我高投入型×回避型":{"name":"给不到的距离","desc":"付出最多的人遇到了最难靠近的人。这个组合需要付出型学会有边界地爱。"}}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"ROS"}'::jsonb, true
FROM public.test_suites WHERE slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '彼此生长', '彼此生长', 'female'::public.test_gender, '{"condition":"EV >= 75 && IN >= 70 && RK <= 35","tagline":"在一起让你成为更好的自己","desc":"被看见、被支持、有成长"}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '难舍难分', '难舍难分', 'female'::public.test_gender, '{"condition":"AT >= 75 && IN >= 65 && EV < 65","tagline":"深度融合，分不清是爱还是需要","desc":"离不开，但不确定是爱还是习惯"}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '温水同行', '温水同行', 'female'::public.test_gender, '{"condition":"RK <= 40 && IN < 65 && EV < 60","tagline":"不冷不热，舒适但缺少真正的联结","desc":"不吵架，也没有真正在一起"}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '心甘情愿地累', '心甘情愿地累', 'female'::public.test_gender, '{"condition":"RK >= 55 && EV < 55 && AT >= 60","tagline":"付出多于回报，但还在坚持","desc":"累，但走不掉"}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '烈火烹油', '烈火烹油', 'female'::public.test_gender, '{"condition":"AT >= 75 && RK >= 50 && IN < 70","tagline":"极好极坏，情绪过山车","desc":"高强度的吸引和冲突并存"}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '此刻刚好', '此刻刚好', 'female'::public.test_gender, '{"condition":"CO < 65 && EV < 60 && RK <= 45","tagline":"双方都知道这不是终点","desc":"舒适但没有未来感"}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'PRE-F-00A', 1, 'PRE', 'choice', 0, 'neutral', '在开始之前，先告诉我你们现在处于什么阶段？', '{"note":"此答案影响题目措辞与阶段判断，不计分。","options":[{"key":"A","text":"暗恋/还没在一起","tag":"secret_crush"},{"key":"B","text":"暧昧中","tag":"ambiguous"},{"key":"C","text":"在一起不到一年","tag":"early"},{"key":"D","text":"在一起一到三年","tag":"mid"},{"key":"E","text":"在一起三年以上","tag":"long"},{"key":"F","text":"已婚/长期伴侣","tag":"married"}],"source_question":{"id":"PRE-F-00A","type":"choice","text":"在开始之前，先告诉我你们现在处于什么阶段？","note":"此答案影响题目措辞与阶段判断，不计分。","options":[{"key":"A","text":"暗恋/还没在一起","tag":"secret_crush"},{"key":"B","text":"暧昧中","tag":"ambiguous"},{"key":"C","text":"在一起不到一年","tag":"early"},{"key":"D","text":"在一起一到三年","tag":"mid"},{"key":"E","text":"在一起三年以上","tag":"long"},{"key":"F","text":"已婚/长期伴侣","tag":"married"}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-01', 2, 'AT', 'slider', 1.5, 'positive', '你现在对他的吸引感，跟最开始相比是什么状态？', '{"slider":{"min":0,"max":100,"min_label":"比最开始淡了很多","max_label":"还是一样强烈，甚至更深了"},"source_question":{"id":"AT-F-01","order":1,"type":"slider","weight":1.5,"direction":"positive","text":"你现在对他的吸引感，跟最开始相比是什么状态？","slider":{"min":0,"max":100,"min_label":"比最开始淡了很多","max_label":"还是一样强烈，甚至更深了"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"AT"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-02', 3, 'AT', 'binary', 1.5, 'positive', '当初让你喜欢上他的那些东西，现在还在吗？', '{"options":[{"key":"left","text":"在，而且了解越深越喜欢","score":85},{"key":"right","text":"有些还在，但有些随着了解淡了","score":50}],"source_question":{"id":"AT-F-02","order":2,"type":"binary","weight":1.5,"direction":"positive","text":"当初让你喜欢上他的那些东西，现在还在吗？","options":[{"key":"left","text":"在，而且了解越深越喜欢","score":85},{"key":"right","text":"有些还在，但有些随着了解淡了","score":50}],"scoring":{"method":"direct"},"layer":"AT"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-03', 4, 'AT', 'scenario', 1.3, 'positive', '如果他现在从你的生活里消失，你的第一反应会是？', '{"options":[{"key":"A","text":"很难受，他在我生命里有真实的重量","score":85},{"key":"B","text":"会有影响，但我能想象没有他的生活","score":55},{"key":"C","text":"说不清楚，复杂","score":45},{"key":"D","text":"可能会如释重负","score":20}],"source_question":{"id":"AT-F-03","order":3,"type":"scenario","weight":1.3,"direction":"positive","text":"如果他现在从你的生活里消失，你的第一反应会是？","options":[{"key":"A","text":"很难受，他在我生命里有真实的重量","score":85},{"key":"B","text":"会有影响，但我能想象没有他的生活","score":55},{"key":"C","text":"说不清楚，复杂","score":45},{"key":"D","text":"可能会如释重负","score":20}],"scoring":{"method":"direct"},"layer":"AT"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-04', 5, 'AT', 'choice', 1.0, 'auxiliary', '你喜欢他，最核心的原因是？', '{"options":[{"key":"A","text":"跟他在一起有真实的安全感","score":75},{"key":"B","text":"他让我觉得自己值得被认真对待","score":80},{"key":"C","text":"就是被他吸引，说不清楚","score":70},{"key":"D","text":"他是我真正欣赏的人","score":80}],"note":"辅助关系类型判断","source_question":{"id":"AT-F-04","order":4,"type":"choice","weight":1.0,"direction":"auxiliary","text":"你喜欢他，最核心的原因是？","options":[{"key":"A","text":"跟他在一起有真实的安全感","score":75},{"key":"B","text":"他让我觉得自己值得被认真对待","score":80},{"key":"C","text":"就是被他吸引，说不清楚","score":70},{"key":"D","text":"他是我真正欣赏的人","score":80}],"scoring":{"method":"direct"},"note":"辅助关系类型判断","layer":"AT"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-05', 6, 'IN', 'slider', 1.5, 'positive', '你觉得他真正在听你说话的频率有多高？', '{"slider":{"min":0,"max":100,"min_label":"他很少真正在听","max_label":"他大多数时候都真的在听"},"source_question":{"id":"IN-F-05","order":5,"type":"slider","weight":1.5,"direction":"positive","text":"你觉得他真正在听你说话的频率有多高？","slider":{"min":0,"max":100,"min_label":"他很少真正在听","max_label":"他大多数时候都真的在听"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"IN"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-06', 7, 'IN', 'binary', 1.5, 'positive', '跟他在一起，你大多数时候是？', '{"options":[{"key":"left","text":"轻松的，很舒服，不需要表演","score":85},{"key":"right","text":"需要注意一些东西，有时候会累","score":35}],"source_question":{"id":"IN-F-06","order":6,"type":"binary","weight":1.5,"direction":"positive","text":"跟他在一起，你大多数时候是？","options":[{"key":"left","text":"轻松的，很舒服，不需要表演","score":85},{"key":"right","text":"需要注意一些东西，有时候会累","score":35}],"scoring":{"method":"direct"},"layer":"IN"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-07', 8, 'IN', 'scenario', 1.5, 'positive', '你们吵架或者有矛盾之后，通常是怎么结束的？', '{"options":[{"key":"A","text":"真正把问题说清楚了，然后和好","score":90},{"key":"B","text":"冷静了就和好，但问题没完全说清楚","score":60},{"key":"C","text":"一个人先妥协，然后过去了","score":40},{"key":"D","text":"冷处理，假装没发生过","score":20}],"source_question":{"id":"IN-F-07","order":7,"type":"scenario","weight":1.5,"direction":"positive","text":"你们吵架或者有矛盾之后，通常是怎么结束的？","options":[{"key":"A","text":"真正把问题说清楚了，然后和好","score":90},{"key":"B","text":"冷静了就和好，但问题没完全说清楚","score":60},{"key":"C","text":"一个人先妥协，然后过去了","score":40},{"key":"D","text":"冷处理，假装没发生过","score":20}],"scoring":{"method":"direct"},"layer":"IN"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-08', 9, 'IN', 'choice', 1.5, 'positive', '你今天心情很差，他看出来了。他通常怎么做？', '{"options":[{"key":"A","text":"主动问我，然后认真听","score":90},{"key":"B","text":"问了一下，然后帮我分析解决","score":65},{"key":"C","text":"看出来了，但没主动问","score":45},{"key":"D","text":"没特别注意到","score":20}],"source_question":{"id":"IN-F-08","order":8,"type":"choice","weight":1.5,"direction":"positive","text":"你今天心情很差，他看出来了。他通常怎么做？","options":[{"key":"A","text":"主动问我，然后认真听","score":90},{"key":"B","text":"问了一下，然后帮我分析解决","score":65},{"key":"C","text":"看出来了，但没主动问","score":45},{"key":"D","text":"没特别注意到","score":20}],"scoring":{"method":"direct"},"layer":"IN"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-09', 10, 'IN', 'slider', 1.5, 'positive', '在你们的关系里，你感觉自己被他真正理解的程度是多少？', '{"slider":{"min":0,"max":100,"min_label":"他不太了解真正的我","max_label":"他是少数真正懂我的人之一"},"source_question":{"id":"IN-F-09","order":9,"type":"slider","weight":1.5,"direction":"positive","text":"在你们的关系里，你感觉自己被他真正理解的程度是多少？","slider":{"min":0,"max":100,"min_label":"他不太了解真正的我","max_label":"他是少数真正懂我的人之一"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"IN"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-10', 11, 'IN', 'binary', 1.3, 'positive', '他说话算数吗？答应你的事，他做到的概率是？', '{"options":[{"key":"left","text":"很高，他说了基本上会做到","score":85},{"key":"right","text":"不一定，经常有变化或者忘了","score":25}],"source_question":{"id":"IN-F-10","order":10,"type":"binary","weight":1.3,"direction":"positive","text":"他说话算数吗？答应你的事，他做到的概率是？","options":[{"key":"left","text":"很高，他说了基本上会做到","score":85},{"key":"right","text":"不一定，经常有变化或者忘了","score":25}],"scoring":{"method":"direct"},"layer":"IN"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-11', 12, 'CO', 'scenario', 1.5, 'positive', '你们谈到了未来——住哪、要不要孩子、怎么分工。你们的方向是？', '{"options":[{"key":"A","text":"基本一致，细节可以商量","score":90},{"key":"B","text":"有些不同，但都愿意妥协","score":65},{"key":"C","text":"有一个核心分歧，暂时搁置","score":35},{"key":"D","text":"没认真谈过，或者谈了发现差很多","score":20}],"alt_text_secret_crush":"从你对他的了解，你们对未来的设想大概一致吗？","source_question":{"id":"CO-F-11","order":11,"type":"scenario","weight":1.5,"direction":"positive","text":"你们谈到了未来——住哪、要不要孩子、怎么分工。你们的方向是？","options":[{"key":"A","text":"基本一致，细节可以商量","score":90},{"key":"B","text":"有些不同，但都愿意妥协","score":65},{"key":"C","text":"有一个核心分歧，暂时搁置","score":35},{"key":"D","text":"没认真谈过，或者谈了发现差很多","score":20}],"scoring":{"method":"direct"},"alt_text_secret_crush":"从你对他的了解，你们对未来的设想大概一致吗？","layer":"CO"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-12', 13, 'CO', 'binary', 1.3, 'positive', '你们对「关系里各自需要多少空间」这件事，理解一致吗？', '{"options":[{"key":"left","text":"一致，我们都知道彼此需要什么","score":85},{"key":"right","text":"有差距，一个需要更多空间，一个需要更多陪伴","score":35}],"source_question":{"id":"CO-F-12","order":12,"type":"binary","weight":1.3,"direction":"positive","text":"你们对「关系里各自需要多少空间」这件事，理解一致吗？","options":[{"key":"left","text":"一致，我们都知道彼此需要什么","score":85},{"key":"right","text":"有差距，一个需要更多空间，一个需要更多陪伴","score":35}],"scoring":{"method":"direct"},"layer":"CO"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-13', 14, 'CO', 'slider', 1.5, 'positive', '你们在核心价值观上——对家庭、工作、生活的看法——有多一致？', '{"slider":{"min":0,"max":100,"min_label":"差异很大，经常感觉不是一路人","max_label":"非常一致，很少在这些事上有分歧"},"source_question":{"id":"CO-F-13","order":13,"type":"slider","weight":1.5,"direction":"positive","text":"你们在核心价值观上——对家庭、工作、生活的看法——有多一致？","slider":{"min":0,"max":100,"min_label":"差异很大，经常感觉不是一路人","max_label":"非常一致，很少在这些事上有分歧"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"CO"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-14', 15, 'CO', 'choice', 1.5, 'positive', '你觉得他是一个跟你能走很远的人吗？', '{"options":[{"key":"A","text":"是，我这样觉得","score":90},{"key":"B","text":"可能是，但还不确定","score":60},{"key":"C","text":"不太确定，有些重要的事还没想清楚","score":40},{"key":"D","text":"不太像，但我现在也还好","score":25}],"source_question":{"id":"CO-F-14","order":14,"type":"choice","weight":1.5,"direction":"positive","text":"你觉得他是一个跟你能走很远的人吗？","options":[{"key":"A","text":"是，我这样觉得","score":90},{"key":"B","text":"可能是，但还不确定","score":60},{"key":"C","text":"不太确定，有些重要的事还没想清楚","score":40},{"key":"D","text":"不太像，但我现在也还好","score":25}],"scoring":{"method":"direct"},"layer":"CO"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-15', 16, 'EV', 'slider', 1.5, 'positive', '跟他在一起这段时间，你觉得自己有没有在成长？', '{"slider":{"min":0,"max":100,"min_label":"这段关系让我反而有点萎缩","max_label":"我在这段关系里明显变好了"},"source_question":{"id":"EV-F-15","order":15,"type":"slider","weight":1.5,"direction":"positive","text":"跟他在一起这段时间，你觉得自己有没有在成长？","slider":{"min":0,"max":100,"min_label":"这段关系让我反而有点萎缩","max_label":"我在这段关系里明显变好了"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"EV"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-16', 17, 'EV', 'binary', 1.5, 'positive', '这段关系最近的趋势，你感觉是？', '{"options":[{"key":"left","text":"在变好，我们越来越懂彼此","score":85},{"key":"right","text":"有些东西在变淡，或者出现了新的问题","score":30}],"source_question":{"id":"EV-F-16","order":16,"type":"binary","weight":1.5,"direction":"positive","text":"这段关系最近的趋势，你感觉是？","options":[{"key":"left","text":"在变好，我们越来越懂彼此","score":85},{"key":"right","text":"有些东西在变淡，或者出现了新的问题","score":30}],"scoring":{"method":"direct"},"layer":"EV"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-17', 18, 'EV', 'choice', 1.5, 'positive', '你想象一年后的你们，第一个浮现的画面是？', '{"options":[{"key":"A","text":"比现在更好，能清楚想象我们在一起","score":90},{"key":"B","text":"差不多，继续现在这样","score":60},{"key":"C","text":"有点模糊，不确定","score":40},{"key":"D","text":"很难想象，或者想到就有点担心","score":20}],"source_question":{"id":"EV-F-17","order":17,"type":"choice","weight":1.5,"direction":"positive","text":"你想象一年后的你们，第一个浮现的画面是？","options":[{"key":"A","text":"比现在更好，能清楚想象我们在一起","score":90},{"key":"B","text":"差不多，继续现在这样","score":60},{"key":"C","text":"有点模糊，不确定","score":40},{"key":"D","text":"很难想象，或者想到就有点担心","score":20}],"scoring":{"method":"direct"},"layer":"EV"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-18', 19, 'EV', 'scenario', 1.5, 'positive', '你回顾你们在一起的这段时间，整体感受是？', '{"options":[{"key":"A","text":"值得，有很多真实的快乐和成长","score":90},{"key":"B","text":"有好有坏，总体还是值得的","score":65},{"key":"C","text":"有些累，但还没想清楚要怎样","score":35},{"key":"D","text":"如果能重来，可能会做不同的选择","score":15}],"source_question":{"id":"EV-F-18","order":18,"type":"scenario","weight":1.5,"direction":"positive","text":"你回顾你们在一起的这段时间，整体感受是？","options":[{"key":"A","text":"值得，有很多真实的快乐和成长","score":90},{"key":"B","text":"有好有坏，总体还是值得的","score":65},{"key":"C","text":"有些累，但还没想清楚要怎样","score":35},{"key":"D","text":"如果能重来，可能会做不同的选择","score":15}],"scoring":{"method":"direct"},"layer":"EV"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-19', 20, 'RK', 'binary', 1.5, 'reverse', '在这段关系里，你有没有感觉过一种「我在压抑自己」的时刻？', '{"options":[{"key":"left","text":"很少，我在他面前大多数时候可以做自己","score":15},{"key":"right","text":"有，有一些东西我不敢说或者不得不压着","score":75}],"source_question":{"id":"RK-F-19","order":19,"type":"binary","weight":1.5,"direction":"reverse","text":"在这段关系里，你有没有感觉过一种「我在压抑自己」的时刻？","options":[{"key":"left","text":"很少，我在他面前大多数时候可以做自己","score":15},{"key":"right","text":"有，有一些东西我不敢说或者不得不压着","score":75}],"scoring":{"method":"direct"},"layer":"RK"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-20', 21, 'RK', 'choice', 1.5, 'reverse', '如果你最好的朋友描述一段跟你们很相似的关系，问你怎么看，你会说？', '{"options":[{"key":"A","text":"这段关系挺好的，值得珍惜","score":10},{"key":"B","text":"有些地方需要注意，但整体健康","score":30},{"key":"C","text":"我会有些担心，提醒她注意某些模式","score":60},{"key":"D","text":"建议她认真想想值不值得继续","score":85}],"source_question":{"id":"RK-F-20","order":20,"type":"choice","weight":1.5,"direction":"reverse","text":"如果你最好的朋友描述一段跟你们很相似的关系，问你怎么看，你会说？","options":[{"key":"A","text":"这段关系挺好的，值得珍惜","score":10},{"key":"B","text":"有些地方需要注意，但整体健康","score":30},{"key":"C","text":"我会有些担心，提醒她注意某些模式","score":60},{"key":"D","text":"建议她认真想想值不值得继续","score":85}],"scoring":{"method":"direct"},"layer":"RK"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();


-- Source: suite2_ros_male_lite.json

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('AT', '吸引基础', 'ROS_RELATIONSHIP', '关系画像', 1, '{"label":"吸引基础","direction":"positive","weight":0.2,"male_focus":"你对她的吸引感是真实的还是习惯了"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('IN', '互动质量', 'ROS_RELATIONSHIP', '关系画像', 2, '{"label":"互动质量","direction":"positive","weight":0.3,"male_focus":"跟她在一起轻不轻松，她的情绪对你影响有多大"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('CO', '兼容程度', 'ROS_RELATIONSHIP', '关系画像', 3, '{"label":"兼容程度","direction":"positive","weight":0.25,"male_focus":"生活方式和节奏合不合，她带来的是助力还是阻力"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('EV', '关系走向', 'ROS_RELATIONSHIP', '关系画像', 4, '{"label":"关系走向","direction":"positive","weight":0.15,"male_focus":"这段关系有没有让你有动力往前走，还是在消耗你"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('RK', '风险信号', 'ROS_RELATIONSHIP', '关系画像', 5, '{"label":"风险信号","direction":"reverse","weight":0.1,"male_focus":"有没有让你感到消耗、压抑或者不对劲的信号"}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('PRE', '前置校准题', 'ROS_RELATIONSHIP', '关系画像', 0, '{"direction":"neutral","scored":false}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.test_suites (slug, name, version, gender, total_questions, estimated_minutes, is_free, is_active, source_suite_config)
VALUES ('s02_ros_male_lite', '关系画像测试 · 快速版', '1.0-lite', 'male'::public.test_gender, 20, 5, false, true, '{"gender":"male","version":"1.0-lite","estimated_minutes":5,"is_free":false,"layers":["AT","IN","CO","EV","RK"],"relationship_types":["彼此生长","难舍难分","温水同行","心甘情愿地累","烈火烹油","此刻刚好"],"relationship_stages":["怦然相遇","渐入佳境","暗流初现","磨合阵痛","倦怠低谷","十字路口","重建信任","深度联结","并肩同行"],"question_types_used":["slider","scenario","binary","choice"],"id":"S02_ROS_MALE_LITE","name":"关系画像测试 · 快速版","total_questions":20,"pre_questions":1,"tier":"lite","full_suite_id":"S02_ROS_MALE"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  version = EXCLUDED.version,
  gender = EXCLUDED.gender,
  total_questions = EXCLUDED.total_questions,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_free = EXCLUDED.is_free,
  is_active = EXCLUDED.is_active,
  source_suite_config = EXCLUDED.source_suite_config,
  updated_at = now();

INSERT INTO public.scoring_models (suite_id, model_key, model_version, scoring_formula, type_rules, ros_config, is_active)
SELECT id, 'ROS_V3', '1.0-lite', '{"layers":{"AT":{"label":"吸引基础","direction":"positive","weight":0.2,"male_focus":"你对她的吸引感是真实的还是习惯了"},"IN":{"label":"互动质量","direction":"positive","weight":0.3,"male_focus":"跟她在一起轻不轻松，她的情绪对你影响有多大"},"CO":{"label":"兼容程度","direction":"positive","weight":0.25,"male_focus":"生活方式和节奏合不合，她带来的是助力还是阻力"},"EV":{"label":"关系走向","direction":"positive","weight":0.15,"male_focus":"这段关系有没有让你有动力往前走，还是在消耗你"},"RK":{"label":"风险信号","direction":"reverse","weight":0.1,"male_focus":"有没有让你感到消耗、压抑或者不对劲的信号"}},"overall":{"formula":"AT*0.20 + IN*0.30 + CO*0.25 + EV*0.15 + (100-RK)*0.10","display_adjustment":{"note":"所有分数向上平移，底部有托底，最低显示55","mapping":[{"raw_min":0,"raw_max":40,"display_min":55,"display_max":65},{"raw_min":41,"raw_max":60,"display_min":65,"display_max":75},{"raw_min":61,"raw_max":80,"display_min":75,"display_max":88},{"raw_min":81,"raw_max":100,"display_min":88,"display_max":96}]}},"resonance_levels":[{"min":88,"max":96,"name":"心有灵犀","desc":"你们之间有一种很难被替代的默契"},{"min":75,"max":87,"name":"深度共鸣","desc":"真实的联结，值得好好珍惜"},{"min":65,"max":74,"name":"温柔磨合","desc":"你们在彼此靠近的路上，慢慢来"},{"min":55,"max":64,"name":"初见雏形","desc":"关系还在成形，有空间，也有可能"}]}'::jsonb, '{"pre_questions":[{"id":"PRE-M-00A","type":"choice","text":"在开始之前，先告诉我你们现在处于什么阶段？","note":"此答案影响题目措辞与阶段判断，不计分。","options":[{"key":"A","text":"暗恋/还没在一起","tag":"secret_crush"},{"key":"B","text":"暧昧中","tag":"ambiguous"},{"key":"C","text":"在一起不到一年","tag":"early"},{"key":"D","text":"在一起一到三年","tag":"mid"},{"key":"E","text":"在一起三年以上","tag":"long"},{"key":"F","text":"已婚/长期伴侣","tag":"married"}]}],"stage_rules":{"note":"结合时间输入和各层得分综合判断，男版更看重EV层和IN层的轻松感","time_constraints":{"secret_crush":{"locked_stages":["重建信任","深度联结","并肩同行"]},"ambiguous":{"locked_stages":["重建信任","深度联结","并肩同行"]},"married":{"low_resonance_language":"long_term_version"}},"score_mapping":{"①怦然相遇":{"EV_range":[75,100],"AT_range":[80,100],"IN_range":[0,100]},"②渐入佳境":{"EV_range":[70,100],"AT_range":[65,100],"IN_range":[60,100]},"③暗流初现":{"EV_range":[50,75],"AT_range":[50,80],"RK_range":[30,60]},"④磨合阵痛":{"EV_range":[40,65],"IN_range":[30,60],"RK_range":[40,70]},"⑤倦怠低谷":{"EV_range":[20,45],"RK_range":[60,100],"IN_range":[20,50]},"⑥十字路口":{"EV_range":[25,50],"RK_range":[55,85]},"⑦重建信任":{"EV_range":[55,75],"IN_range":[60,85],"RK_range":[20,50]},"⑧深度联结":{"EV_range":[70,90],"IN_range":[75,100],"AT_range":[60,100]},"⑨并肩同行":{"EV_range":[80,100],"CO_range":[75,100],"IN_range":[75,100]}}},"relationship_type_rules":{"彼此生长":{"condition":"EV >= 75 && IN >= 70 && RK <= 35","tagline":"在一起让你成为更好的自己","desc":"有助力、有成长、跟她在一起是充电","male_insight":"你在这段关系里不只是在付出，你也在得到——这种双向的滋养是最好的关系底色。"},"难舍难分":{"condition":"AT >= 75 && IN >= 65 && EV < 65","tagline":"深度融合，分不清是爱还是需要","desc":"离不开，但不确定是真正喜欢还是习惯了","male_insight":"你们之间有很深的联结，但值得想一想：是真的喜欢她，还是已经习惯了她在？"},"温水同行":{"condition":"RK <= 40 && IN < 65 && EV < 60","tagline":"不冷不热，舒适但缺少真正的联结","desc":"不吵架，但也没有真正在一起过","male_insight":"这段关系很平稳，但平稳有时候是因为双方都没有真正投入——值得问自己，你想要的是这样吗？"},"心甘情愿地累":{"condition":"RK >= 55 && EV < 55 && AT >= 60","tagline":"付出多于回报，但还在坚持","desc":"有消耗，但舍不得或者走不掉","male_insight":"你在这段关系里付出了很多，这值得被看见。但好的关系不应该让你一直在消耗——这不是你的问题，是关系本身需要调整。"},"烈火烹油":{"condition":"AT >= 75 && RK >= 50 && IN < 70","tagline":"极好极坏，情绪过山车","desc":"高强度的吸引和消耗并存","male_insight":"你们之间的吸引是真实的，但冲突和消耗也是真实的。这种组合很难维持，需要双方都愿意主动降温和建立规则。"},"此刻刚好":{"condition":"CO < 65 && EV < 60 && RK <= 45","tagline":"现在很好，但没有太多未来感","desc":"舒适但没有明确的方向","male_insight":"你们现在相处得还不错，但有些重要的问题还没有被认真面对——比如这段关系要走向哪里。"}},"attachment_collision_map":{"安全型×安全型":{"name":"天作之合","desc":"两个内心稳定的人在一起，是最少内耗的组合。不是没有问题，是有能力一起解决。"},"安全型×焦虑型":{"name":"避风港与浪","desc":"稳定的人能给焦虑的人真实的安全感，但时间久了容易出现不平衡——一个一直在给，一个一直在要。"},"安全型×回避型":{"name":"开门与关门","desc":"安全型足够稳定，不会因为回避型的后退而崩溃——这是这个组合能走下去的原因。"},"安全型×混合型":{"name":"稳中有变","desc":"安全型是这段关系的锚，混合型的情绪起伏会被安全型的稳定慢慢平衡。"},"焦虑型×焦虑型":{"name":"双向拉扯","desc":"两个都需要确认的人在一起，前期浓烈，后期容易把彼此都耗尽。"},"焦虑型×回避型":{"name":"欢喜冤家","desc":"最常见也最戏剧性的组合。一个追，一个退，形成经典的追逃模式。吸引力是真实的，但如果不打破这个模式，最终会耗尽双方。"},"焦虑型×混合型":{"name":"迷雾中的彼此","desc":"两个人都不够稳定，但方式不同。对方的忽冷忽热会持续触发焦虑型的不安全感。"},"回避型×回避型":{"name":"平行宇宙","desc":"两个人都不主动靠近，关系很平静，但也很难真正深入。"},"回避型×混合型":{"name":"捉摸不定","desc":"混合型的忽冷忽热反而能让回避型感到相对舒适。但这个组合很难建立真正的深度。"},"混合型×混合型":{"name":"一团烟火","desc":"两个情绪都不稳定的人在一起，会非常热烈，也会非常混乱。"},"高边界安全型×焦虑型":{"name":"冰与火","desc":"高边界的安全感让焦虑型感到有依靠，但边界的硬度也会让焦虑型觉得进不去。"},"高边界安全型×回避型":{"name":"两座山","desc":"两个都有很强边界感的人在一起，相互尊重，但也可能相互疏远。"},"低自我高投入型×任意":{"name":"全心付出","desc":"无论对方是什么类型，这个组合的核心风险不在对方，在自己——需要先学会照顾自己。"},"高边界安全型×混合型":{"name":"规则与例外","desc":"高边界的清晰给混合型一种难得的稳定感，只要双方愿意沟通，互补性很强。"},"低自我高投入型×回避型":{"name":"给不到的距离","desc":"付出最多的人遇到了最难靠近的人。这个组合需要付出型学会有边界地爱。"}}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"ROS"}'::jsonb, true
FROM public.test_suites WHERE slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '彼此生长', '彼此生长', 'male'::public.test_gender, '{"condition":"EV >= 75 && IN >= 70 && RK <= 35","tagline":"在一起让你成为更好的自己","desc":"有助力、有成长、跟她在一起是充电","male_insight":"你在这段关系里不只是在付出，你也在得到——这种双向的滋养是最好的关系底色。"}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '难舍难分', '难舍难分', 'male'::public.test_gender, '{"condition":"AT >= 75 && IN >= 65 && EV < 65","tagline":"深度融合，分不清是爱还是需要","desc":"离不开，但不确定是真正喜欢还是习惯了","male_insight":"你们之间有很深的联结，但值得想一想：是真的喜欢她，还是已经习惯了她在？"}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '温水同行', '温水同行', 'male'::public.test_gender, '{"condition":"RK <= 40 && IN < 65 && EV < 60","tagline":"不冷不热，舒适但缺少真正的联结","desc":"不吵架，但也没有真正在一起过","male_insight":"这段关系很平稳，但平稳有时候是因为双方都没有真正投入——值得问自己，你想要的是这样吗？"}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '心甘情愿地累', '心甘情愿地累', 'male'::public.test_gender, '{"condition":"RK >= 55 && EV < 55 && AT >= 60","tagline":"付出多于回报，但还在坚持","desc":"有消耗，但舍不得或者走不掉","male_insight":"你在这段关系里付出了很多，这值得被看见。但好的关系不应该让你一直在消耗——这不是你的问题，是关系本身需要调整。"}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '烈火烹油', '烈火烹油', 'male'::public.test_gender, '{"condition":"AT >= 75 && RK >= 50 && IN < 70","tagline":"极好极坏，情绪过山车","desc":"高强度的吸引和消耗并存","male_insight":"你们之间的吸引是真实的，但冲突和消耗也是真实的。这种组合很难维持，需要双方都愿意主动降温和建立规则。"}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '此刻刚好', '此刻刚好', 'male'::public.test_gender, '{"condition":"CO < 65 && EV < 60 && RK <= 45","tagline":"现在很好，但没有太多未来感","desc":"舒适但没有明确的方向","male_insight":"你们现在相处得还不错，但有些重要的问题还没有被认真面对——比如这段关系要走向哪里。"}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'PRE-M-00A', 1, 'PRE', 'choice', 0, 'neutral', '在开始之前，先告诉我你们现在处于什么阶段？', '{"note":"此答案影响题目措辞与阶段判断，不计分。","options":[{"key":"A","text":"暗恋/还没在一起","tag":"secret_crush"},{"key":"B","text":"暧昧中","tag":"ambiguous"},{"key":"C","text":"在一起不到一年","tag":"early"},{"key":"D","text":"在一起一到三年","tag":"mid"},{"key":"E","text":"在一起三年以上","tag":"long"},{"key":"F","text":"已婚/长期伴侣","tag":"married"}],"source_question":{"id":"PRE-M-00A","type":"choice","text":"在开始之前，先告诉我你们现在处于什么阶段？","note":"此答案影响题目措辞与阶段判断，不计分。","options":[{"key":"A","text":"暗恋/还没在一起","tag":"secret_crush"},{"key":"B","text":"暧昧中","tag":"ambiguous"},{"key":"C","text":"在一起不到一年","tag":"early"},{"key":"D","text":"在一起一到三年","tag":"mid"},{"key":"E","text":"在一起三年以上","tag":"long"},{"key":"F","text":"已婚/长期伴侣","tag":"married"}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-01', 2, 'AT', 'slider', 1.5, 'positive', '你现在对她的吸引感，跟最开始相比？', '{"slider":{"min":0,"max":100,"min_label":"淡了很多","max_label":"还是一样强，甚至更深了"},"source_question":{"id":"AT-M-01","order":1,"type":"slider","weight":1.5,"direction":"positive","text":"你现在对她的吸引感，跟最开始相比？","slider":{"min":0,"max":100,"min_label":"淡了很多","max_label":"还是一样强，甚至更深了"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"AT"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-02', 3, 'AT', 'binary', 1.5, 'positive', '当初让你喜欢上她的那些东西，现在还在吗？', '{"options":[{"key":"left","text":"在，了解越深越喜欢","score":85},{"key":"right","text":"有些还在，但有些随着了解消退了","score":50}],"source_question":{"id":"AT-M-02","order":2,"type":"binary","weight":1.5,"direction":"positive","text":"当初让你喜欢上她的那些东西，现在还在吗？","options":[{"key":"left","text":"在，了解越深越喜欢","score":85},{"key":"right","text":"有些还在，但有些随着了解消退了","score":50}],"scoring":{"method":"direct"},"layer":"AT"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-03', 4, 'AT', 'choice', 1.0, 'auxiliary', '你喜欢她，最核心的原因是？', '{"options":[{"key":"A","text":"跟她在一起很放松，不需要表演","score":75},{"key":"B","text":"她让我想成为更好的自己","score":80},{"key":"C","text":"就是被她吸引，说不清楚","score":70},{"key":"D","text":"她是我真正欣赏的人","score":80}],"source_question":{"id":"AT-M-03","order":3,"type":"choice","weight":1.0,"direction":"auxiliary","text":"你喜欢她，最核心的原因是？","options":[{"key":"A","text":"跟她在一起很放松，不需要表演","score":75},{"key":"B","text":"她让我想成为更好的自己","score":80},{"key":"C","text":"就是被她吸引，说不清楚","score":70},{"key":"D","text":"她是我真正欣赏的人","score":80}],"scoring":{"method":"direct"},"layer":"AT"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-04', 5, 'AT', 'scenario', 1.3, 'positive', '如果她现在从你的生活里消失，你的第一反应会是？', '{"options":[{"key":"A","text":"很难受，她在我生活里有真实的重量","score":85},{"key":"B","text":"会有影响，但能想象没有她的生活","score":55},{"key":"C","text":"说不清楚","score":45},{"key":"D","text":"可能有点如释重负","score":20}],"source_question":{"id":"AT-M-04","order":4,"type":"scenario","weight":1.3,"direction":"positive","text":"如果她现在从你的生活里消失，你的第一反应会是？","options":[{"key":"A","text":"很难受，她在我生活里有真实的重量","score":85},{"key":"B","text":"会有影响，但能想象没有她的生活","score":55},{"key":"C","text":"说不清楚","score":45},{"key":"D","text":"可能有点如释重负","score":20}],"scoring":{"method":"direct"},"layer":"AT"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-05', 6, 'IN', 'slider', 1.5, 'positive', '跟她在一起，你整体的感觉是轻松还是有负担？', '{"slider":{"min":0,"max":100,"min_label":"经常感到有压力或消耗","max_label":"跟她在一起非常轻松"},"source_question":{"id":"IN-M-05","order":5,"type":"slider","weight":1.5,"direction":"positive","text":"跟她在一起，你整体的感觉是轻松还是有负担？","slider":{"min":0,"max":100,"min_label":"经常感到有压力或消耗","max_label":"跟她在一起非常轻松"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"IN"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-06', 7, 'IN', 'binary', 1.5, 'positive', '她的情绪状态，对你的情绪影响大吗？', '{"options":[{"key":"left","text":"不太大，我能把自己的状态和她的情绪分开","score":80},{"key":"right","text":"比较大，她不高兴我就很难放松","score":35}],"source_question":{"id":"IN-M-06","order":6,"type":"binary","weight":1.5,"direction":"positive","text":"她的情绪状态，对你的情绪影响大吗？","options":[{"key":"left","text":"不太大，我能把自己的状态和她的情绪分开","score":80},{"key":"right","text":"比较大，她不高兴我就很难放松","score":35}],"scoring":{"method":"direct"},"layer":"IN"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-07', 8, 'IN', 'scenario', 1.5, 'positive', '你今天心情不好，不想说话。她的反应通常是？', '{"options":[{"key":"A","text":"感觉到了，给我空间，但让我知道她在","score":90},{"key":"B","text":"问我怎么了，想帮我解决问题","score":60},{"key":"C","text":"没感觉到，照常说话","score":35},{"key":"D","text":"感觉到了，但开始担心是不是自己的问题","score":25}],"source_question":{"id":"IN-M-07","order":7,"type":"scenario","weight":1.5,"direction":"positive","text":"你今天心情不好，不想说话。她的反应通常是？","options":[{"key":"A","text":"感觉到了，给我空间，但让我知道她在","score":90},{"key":"B","text":"问我怎么了，想帮我解决问题","score":60},{"key":"C","text":"没感觉到，照常说话","score":35},{"key":"D","text":"感觉到了，但开始担心是不是自己的问题","score":25}],"scoring":{"method":"direct"},"layer":"IN"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-08', 9, 'IN', 'choice', 1.5, 'positive', '你们吵架或有矛盾之后，通常怎么结束？', '{"options":[{"key":"A","text":"真正说清楚，和好，感觉更近了","score":90},{"key":"B","text":"冷静了就和好，但没完全说清楚","score":60},{"key":"C","text":"一个人先让步，然后过去了","score":40},{"key":"D","text":"冷处理，假装没发生过","score":20}],"source_question":{"id":"IN-M-08","order":8,"type":"choice","weight":1.5,"direction":"positive","text":"你们吵架或有矛盾之后，通常怎么结束？","options":[{"key":"A","text":"真正说清楚，和好，感觉更近了","score":90},{"key":"B","text":"冷静了就和好，但没完全说清楚","score":60},{"key":"C","text":"一个人先让步，然后过去了","score":40},{"key":"D","text":"冷处理，假装没发生过","score":20}],"scoring":{"method":"direct"},"layer":"IN"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-09', 10, 'IN', 'slider', 1.5, 'positive', '在你们的关系里，你感觉自己被她真正理解的程度是多少？', '{"slider":{"min":0,"max":100,"min_label":"她不太了解真正的我","max_label":"她是少数真正懂我的人之一"},"source_question":{"id":"IN-M-09","order":9,"type":"slider","weight":1.5,"direction":"positive","text":"在你们的关系里，你感觉自己被她真正理解的程度是多少？","slider":{"min":0,"max":100,"min_label":"她不太了解真正的我","max_label":"她是少数真正懂我的人之一"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"IN"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-10', 11, 'IN', 'binary', 1.3, 'positive', '她说话算数吗？答应你的事，她做到的概率是？', '{"options":[{"key":"left","text":"很高，说了基本都会做到","score":85},{"key":"right","text":"不一定，经常有变化或者忘了","score":25}],"source_question":{"id":"IN-M-10","order":10,"type":"binary","weight":1.3,"direction":"positive","text":"她说话算数吗？答应你的事，她做到的概率是？","options":[{"key":"left","text":"很高，说了基本都会做到","score":85},{"key":"right","text":"不一定，经常有变化或者忘了","score":25}],"scoring":{"method":"direct"},"layer":"IN"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-11', 12, 'CO', 'scenario', 1.5, 'positive', '你们谈到未来。你们的方向是？', '{"options":[{"key":"A","text":"基本一致，细节可以商量","score":90},{"key":"B","text":"有些不同，但都愿意妥协","score":65},{"key":"C","text":"有一个核心分歧，暂时搁置","score":35},{"key":"D","text":"没认真谈过，或谈了发现差很多","score":20}],"source_question":{"id":"CO-M-11","order":11,"type":"scenario","weight":1.5,"direction":"positive","text":"你们谈到未来。你们的方向是？","options":[{"key":"A","text":"基本一致，细节可以商量","score":90},{"key":"B","text":"有些不同，但都愿意妥协","score":65},{"key":"C","text":"有一个核心分歧，暂时搁置","score":35},{"key":"D","text":"没认真谈过，或谈了发现差很多","score":20}],"scoring":{"method":"direct"},"layer":"CO"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-12', 13, 'CO', 'binary', 1.5, 'positive', '她对你需要的个人空间，理解吗？', '{"options":[{"key":"left","text":"理解，不会因为我需要独处而有意见","score":85},{"key":"right","text":"有时候不理解，我需要空间时会有摩擦","score":30}],"source_question":{"id":"CO-M-12","order":12,"type":"binary","weight":1.5,"direction":"positive","text":"她对你需要的个人空间，理解吗？","options":[{"key":"left","text":"理解，不会因为我需要独处而有意见","score":85},{"key":"right","text":"有时候不理解，我需要空间时会有摩擦","score":30}],"scoring":{"method":"direct"},"layer":"CO"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-13', 14, 'CO', 'slider', 1.5, 'positive', '你们在核心价值观上有多一致？', '{"slider":{"min":0,"max":100,"min_label":"差异很大","max_label":"非常一致"},"source_question":{"id":"CO-M-13","order":13,"type":"slider","weight":1.5,"direction":"positive","text":"你们在核心价值观上有多一致？","slider":{"min":0,"max":100,"min_label":"差异很大","max_label":"非常一致"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"CO"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-14', 15, 'CO', 'choice', 1.5, 'positive', '你觉得她是一个跟你能走很远的人吗？', '{"options":[{"key":"A","text":"是","score":90},{"key":"B","text":"可能是，但还不确定","score":60},{"key":"C","text":"不太确定","score":40},{"key":"D","text":"不太像，但现在也还好","score":25}],"source_question":{"id":"CO-M-14","order":14,"type":"choice","weight":1.5,"direction":"positive","text":"你觉得她是一个跟你能走很远的人吗？","options":[{"key":"A","text":"是","score":90},{"key":"B","text":"可能是，但还不确定","score":60},{"key":"C","text":"不太确定","score":40},{"key":"D","text":"不太像，但现在也还好","score":25}],"scoring":{"method":"direct"},"layer":"CO"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-15', 16, 'EV', 'slider', 1.5, 'positive', '跟她在一起这段时间，你觉得自己有没有在进步？', '{"slider":{"min":0,"max":100,"min_label":"这段关系让我停滞甚至退步","max_label":"在这段关系里我明显变好了"},"source_question":{"id":"EV-M-15","order":15,"type":"slider","weight":1.5,"direction":"positive","text":"跟她在一起这段时间，你觉得自己有没有在进步？","slider":{"min":0,"max":100,"min_label":"这段关系让我停滞甚至退步","max_label":"在这段关系里我明显变好了"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"layer":"EV"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-16', 17, 'EV', 'binary', 1.5, 'positive', '这段关系有没有让你有动力往前走？', '{"options":[{"key":"left","text":"有，她让我更想努力","score":85},{"key":"right","text":"没有特别，或者反而有点消耗","score":30}],"source_question":{"id":"EV-M-16","order":16,"type":"binary","weight":1.5,"direction":"positive","text":"这段关系有没有让你有动力往前走？","options":[{"key":"left","text":"有，她让我更想努力","score":85},{"key":"right","text":"没有特别，或者反而有点消耗","score":30}],"scoring":{"method":"direct"},"layer":"EV"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-17', 18, 'EV', 'choice', 1.5, 'positive', '你想象一年后的你们，第一个浮现的画面是？', '{"options":[{"key":"A","text":"比现在更好，能清楚想象","score":90},{"key":"B","text":"差不多，继续现在这样","score":60},{"key":"C","text":"有点模糊，不确定","score":40},{"key":"D","text":"很难想象，或者想到就有点担心","score":20}],"source_question":{"id":"EV-M-17","order":17,"type":"choice","weight":1.5,"direction":"positive","text":"你想象一年后的你们，第一个浮现的画面是？","options":[{"key":"A","text":"比现在更好，能清楚想象","score":90},{"key":"B","text":"差不多，继续现在这样","score":60},{"key":"C","text":"有点模糊，不确定","score":40},{"key":"D","text":"很难想象，或者想到就有点担心","score":20}],"scoring":{"method":"direct"},"layer":"EV"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-18', 19, 'EV', 'scenario', 1.5, 'positive', '你回顾你们在一起的这段时间，整体感受是？', '{"options":[{"key":"A","text":"值得，有很多真实的快乐，我不后悔","score":90},{"key":"B","text":"有好有坏，总体还是值得的","score":65},{"key":"C","text":"有些累，但还没想清楚","score":35},{"key":"D","text":"如果能重来可能会做不同选择","score":15}],"source_question":{"id":"EV-M-18","order":18,"type":"scenario","weight":1.5,"direction":"positive","text":"你回顾你们在一起的这段时间，整体感受是？","options":[{"key":"A","text":"值得，有很多真实的快乐，我不后悔","score":90},{"key":"B","text":"有好有坏，总体还是值得的","score":65},{"key":"C","text":"有些累，但还没想清楚","score":35},{"key":"D","text":"如果能重来可能会做不同选择","score":15}],"scoring":{"method":"direct"},"layer":"EV"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-19', 20, 'RK', 'binary', 1.5, 'reverse', '在这段关系里，你有没有感觉过「我在压抑自己」？', '{"options":[{"key":"left","text":"很少，我在她面前大多数时候可以做自己","score":15},{"key":"right","text":"有，有一些东西不敢说或者不得不压着","score":75}],"source_question":{"id":"RK-M-19","order":19,"type":"binary","weight":1.5,"direction":"reverse","text":"在这段关系里，你有没有感觉过「我在压抑自己」？","options":[{"key":"left","text":"很少，我在她面前大多数时候可以做自己","score":15},{"key":"right","text":"有，有一些东西不敢说或者不得不压着","score":75}],"scoring":{"method":"direct"},"layer":"RK"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-20', 21, 'RK', 'choice', 1.5, 'reverse', '如果最好的哥们描述一段跟你们很相似的关系，问你怎么看，你会说？', '{"options":[{"key":"A","text":"挺好的，值得珍惜","score":10},{"key":"B","text":"有些地方需要注意，但整体健康","score":30},{"key":"C","text":"我会有点担心，提醒他注意某些模式","score":60},{"key":"D","text":"建议他认真想想值不值得继续","score":85}],"source_question":{"id":"RK-M-20","order":20,"type":"choice","weight":1.5,"direction":"reverse","text":"如果最好的哥们描述一段跟你们很相似的关系，问你怎么看，你会说？","options":[{"key":"A","text":"挺好的，值得珍惜","score":10},{"key":"B","text":"有些地方需要注意，但整体健康","score":30},{"key":"C","text":"我会有点担心，提醒他注意某些模式","score":60},{"key":"D","text":"建议他认真想想值不值得继续","score":85}],"scoring":{"method":"direct"},"layer":"RK"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();


-- Source: suite3_mate_female_lite.json

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('FS1', '吸引力资产', 'MATE_SELECTION', '择偶坐标', 1, '{"label":"吸引力资产","weight":0.35,"sub":{"FS1_A":{"label":"外形管理水平","weight":0.4},"FS1_B":{"label":"气质与存在感","weight":0.35},"FS1_C":{"label":"新鲜感存续力","weight":0.25}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('FS2', '情感价值输出', 'MATE_SELECTION', '择偶坐标', 2, '{"label":"情感价值输出","weight":0.3,"sub":{"FS2_A":{"label":"情绪滋养能力","weight":0.4},"FS2_B":{"label":"趣味与话题质量","weight":0.3},"FS2_C":{"label":"被需要感制造力","weight":0.3}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('FS3', '现实自主性', 'MATE_SELECTION', '择偶坐标', 3, '{"label":"现实自主性","weight":0.2,"sub":{"FS3_A":{"label":"经济独立程度","weight":0.4},"FS3_B":{"label":"家庭助力情况","weight":0.35},"FS3_C":{"label":"生活自主能力","weight":0.25}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('FS4', '关系成熟度', 'MATE_SELECTION', '择偶坐标', 4, '{"label":"关系成熟度","weight":0.1,"sub":{"FS4_A":{"label":"边界清晰度","weight":0.4},"FS4_B":{"label":"情绪处理方式","weight":0.35},"FS4_C":{"label":"依赖与独立平衡","weight":0.25}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('FS5', '风险净值', 'MATE_SELECTION', '择偶坐标', 5, '{"label":"风险净值","weight":0.05,"direction":"reverse","note":"此模块分数越低越好，反向计入纵轴","sub":{"FS5_A":{"label":"过去关系包袱","weight":0.35},"FS5_B":{"label":"情感依赖风险","weight":0.4},"FS5_C":{"label":"家庭干预风险","weight":0.25}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.test_suites (slug, name, version, gender, total_questions, estimated_minutes, is_free, is_active, source_suite_config)
VALUES ('s03_mate_female_lite', '择偶坐标测试 · 快速版', '1.0-lite', 'female'::public.test_gender, 20, 5, false, true, '{"gender":"female","version":"1.0-lite","estimated_minutes":5,"is_free":false,"modules":["FS1","FS2","FS3","FS4","FS5"],"result_types":["让人想留下来的人","被读懂之前的人","一眼就懂的人","需要被正确打开的人","还没到时候的人","越了解越值钱的人"],"question_types_used":["slider","scenario","binary","choice"],"id":"S03_MATE_FEMALE_LITE","name":"择偶坐标测试 · 快速版","total_questions":20,"tier":"lite","full_suite_id":"S03_MATE_FEMALE"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  version = EXCLUDED.version,
  gender = EXCLUDED.gender,
  total_questions = EXCLUDED.total_questions,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_free = EXCLUDED.is_free,
  is_active = EXCLUDED.is_active,
  source_suite_config = EXCLUDED.source_suite_config,
  updated_at = now();

INSERT INTO public.scoring_models (suite_id, model_key, model_version, scoring_formula, type_rules, ros_config, is_active)
SELECT id, 'ROS_V3', '1.0-lite', '{"axes":{"horizontal":{"name":"市场显示度","formula":"FS1 * 0.55 + FS2 * 0.45","description":"别人第一眼和相处后感受到的吸引力综合"},"vertical":{"name":"现实支撑力","formula":"FS3 * 0.60 + (100 - FS5) * 0.40","description":"你能给关系托底的现实能力和风险净值"}},"modules":{"FS1":{"label":"吸引力资产","weight":0.35,"sub":{"FS1_A":{"label":"外形管理水平","weight":0.4},"FS1_B":{"label":"气质与存在感","weight":0.35},"FS1_C":{"label":"新鲜感存续力","weight":0.25}}},"FS2":{"label":"情感价值输出","weight":0.3,"sub":{"FS2_A":{"label":"情绪滋养能力","weight":0.4},"FS2_B":{"label":"趣味与话题质量","weight":0.3},"FS2_C":{"label":"被需要感制造力","weight":0.3}}},"FS3":{"label":"现实自主性","weight":0.2,"sub":{"FS3_A":{"label":"经济独立程度","weight":0.4},"FS3_B":{"label":"家庭助力情况","weight":0.35},"FS3_C":{"label":"生活自主能力","weight":0.25}}},"FS4":{"label":"关系成熟度","weight":0.1,"sub":{"FS4_A":{"label":"边界清晰度","weight":0.4},"FS4_B":{"label":"情绪处理方式","weight":0.35},"FS4_C":{"label":"依赖与独立平衡","weight":0.25}}},"FS5":{"label":"风险净值","weight":0.05,"direction":"reverse","note":"此模块分数越低越好，反向计入纵轴","sub":{"FS5_A":{"label":"过去关系包袱","weight":0.35},"FS5_B":{"label":"情感依赖风险","weight":0.4},"FS5_C":{"label":"家庭干预风险","weight":0.25}}}}}'::jsonb, '{"quadrant_logic":{"note":"以50分为轴线中点，判断所在象限","Q1":{"condition":"horizontal >= 60 && vertical >= 60","type":"让人想留下来的人"},"Q2":{"condition":"horizontal < 50 && vertical >= 60","type":"被读懂之前的人"},"Q4":{"condition":"horizontal >= 60 && vertical < 50","type":"一眼就懂的人"},"Q3":{"condition":"horizontal < 50 && vertical < 50","type":"还没到时候的人"},"special_1":{"condition":"50 <= horizontal < 60 && 50 <= vertical < 60","type":"需要被正确打开的人"},"special_2":{"condition":"horizontal < 50 && vertical >= 55 && FS2 >= 65","type":"越了解越值钱的人"}},"score_display_rules":{"note":"所有分数转化为描述性语言输出，不直接显示数字","ranges":[{"min":0,"max":30,"label":"这个维度还有很大的成长空间"},{"min":31,"max":50,"label":"这个维度处于发展阶段"},{"min":51,"max":65,"label":"这个维度表现稳定"},{"min":66,"max":80,"label":"这个维度是你的重要资产"},{"min":81,"max":100,"label":"这个维度是你的核心竞争力"}],"sensitive_fields":{"FS1_A_base":"外形基础值不直接显示，转化为：高辨识度/中等辨识度/自然型/待提升","FS3_A_income":"收入档位不直接显示，转化为：经济独立/基本独立/发展阶段","FS3_A_education":"学历作为修正系数，不单独显示"}}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"MATE"}'::jsonb, true
FROM public.test_suites WHERE slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '让人想留下来的人', '让人想留下来的人', 'female'::public.test_gender, '{"tagline":"你不是最耀眼的那个，但待在你身边有一种说不清的舒服。","tags":["情感浓度高","安全感制造者","越处越好"],"market_read":"你的吸引力是慢热型的，第一眼不一定赢，但留存率极高。你在关系里能给对方持续的情绪价值，对方很难找到替代品。","upper_match":"需要稳定情感着陆点、有一定阅历、不追求即时刺激的成熟男性","sweet_spot":"重视稳定感、不喜欢刺激和不确定性、愿意花时间了解你的男性","lower_match":"追求即时吸引力、需要强存在感刺激的男性","radar_baseline":{"FS1":72,"FS2":78,"FS3":70,"FS4":75,"FS5_risk":25}}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '被读懂之前的人', '被读懂之前的人', 'female'::public.test_gender, '{"tagline":"你有很多好，但它们藏得很深——大多数人没有耐心等到那一刻。","tags":["高价值低显示度","需要对的频道","慢慢升值"],"market_read":"你的牌面没有被充分展示出来，第一印象可能低于你的实际价值。你不缺好，缺的是一个愿意停下来读你的人。","upper_match":"有阅历、不被表面吸引、懂得欣赏内在深度的男性","sweet_spot":"务实、重视稳定、不追求即时浪漫刺激的男性","lower_match":"追求第一眼感觉、需要你主动展示自己才能看见你的男性","radar_baseline":{"FS1":48,"FS2":68,"FS3":72,"FS4":70,"FS5_risk":20}}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '一眼就懂的人', '一眼就懂的人', 'female'::public.test_gender, '{"tagline":"你把自己放在那里，清清楚楚，喜欢就来，不喜欢走开。","tags":["高辨识度","低迷失率","所见即所得"],"market_read":"你的吸引力是显性的，门面资产和气质都摆在明面上。筛选效率极高，但也意味着你吸引的范围已经被框定，制造惊喜感的空间需要主动创造。","upper_match":"资源好、审美在线、有一定阅历的成熟男性","sweet_spot":"目标清晰、不喜欢猜谜、追求匹配效率的务实型男性","lower_match":"条件一般、需要靠你的吸引力维持自信的男性","radar_baseline":{"FS1":82,"FS2":65,"FS3":55,"FS4":65,"FS5_risk":35}}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '需要被正确打开的人', '需要被正确打开的人', 'female'::public.test_gender, '{"tagline":"你对了频道就是惊喜，频道不对就是误解——你不难，只是要对的人。","tags":["高个性","强烈的存在感","非标品"],"market_read":"你不走大众审美，也不符合标准模板，但你在特定人群里的吸引力是无可替代的。你的市场窄但深，找到就是真命。","upper_match":"有独立审美、不从众、愿意接受非标准答案的男性","sweet_spot":"同样有鲜明个性、能欣赏你独特之处的男性","lower_match":"追求大众标准、需要你符合某种模板的男性","radar_baseline":{"FS1":62,"FS2":72,"FS3":60,"FS4":68,"FS5_risk":30}}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '还没到时候的人', '还没到时候的人', 'female'::public.test_gender, '{"tagline":"你现在的状态还不是最好版本，但方向是对的——时间站在你这边。","tags":["成长轨道清晰","当下不完整","潜力可见"],"market_read":"你目前的现实底牌或吸引力资产还在建设中，市场给你的即时报价低于你的长期价值。你需要的不是将就，而是等自己准备好。","upper_match":"有耐心、看重潜力而非现状、愿意一起成长的男性","sweet_spot":"同样在成长阶段、不追求即时完美、把关系当长期项目的男性","lower_match":"追求现成条件、不愿意等待的男性","radar_baseline":{"FS1":45,"FS2":50,"FS3":42,"FS4":48,"FS5_risk":55}}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '越了解越值钱的人', '越了解越值钱的人', 'female'::public.test_gender, '{"tagline":"停留的时间越长，你给的东西越多——你不适合被快速评估。","tags":["复利型价值","深度体验者","长期主义"],"market_read":"你的价值不在第一印象，而在第三个月、第一年、第五年。你在短期市场里容易被低估，但一旦进入长期关系，你的优势会持续放大。","upper_match":"不追求即时满足、愿意投入时间、把关系当长期项目经营的男性","sweet_spot":"成熟稳重、有长期规划意识、不急于求成的男性","lower_match":"喜欢快节奏、需要即时回报、耐心不足的男性","radar_baseline":{"FS1":50,"FS2":75,"FS3":70,"FS4":72,"FS5_risk":22}}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-F-01', 1, 'FS1', 'slider', 2.0, 'positive', '先来校准一下你的外形基础。根据下面的参考，你觉得自己大概在哪个区间？', '{"subtitle":"参考的是现实社交中的综合感受，不只是五官","note":"这个观察只帮助系统理解你的起点，不会以数字形式出现在结果里。","slider":{"min":1,"max":10,"step":1,"displayMode":"appearance","tierLabels":[{"range":[1,2],"label":"自然型"},{"range":[3,4],"label":"普通辨识度"},{"range":[5,6],"label":"有记忆点"},{"range":[7,8],"label":"高辨识度"},{"range":[9,10],"label":"极高辨识度"}],"footnote":"注意：不是素颜自拍视角，也不是美颜后的自己。\n参考：现实社交 + 日常状态 + 外形管理后的综合感受","reference":[{"score":1,"perception":"极少因为外形被注意","behavior":"外形基本不构成优势"},{"score":2,"perception":"不太关注外在呈现","behavior":"穿搭、妆容、管理较少"},{"score":3,"perception":"偶尔被夸","behavior":"熟人礼貌性评价更多"},{"score":4,"perception":"普通水平","behavior":"放在人群里不突出"},{"score":5,"perception":"中位值","behavior":"朋友会说「挺顺眼」"},{"score":6,"perception":"有辨识度","behavior":"社交场合容易留下印象"},{"score":7,"perception":"明显好看","behavior":"陌生场景会有人主动注意"},{"score":8,"perception":"同龄前10%左右","behavior":"经常被夸气质/颜值"},{"score":9,"perception":"同龄前3%左右","behavior":"经常有人主动表达好感"},{"score":10,"perception":"极少数","behavior":"外形成为明显优势资产"}]},"source_question":{"id":"FS1-F-01","order":1,"module":"FS1","sub":"FS1_A","type":"slider","weight":2.0,"direction":"positive","text":"先来校准一下你的外形基础。根据下面的参考，你觉得自己大概在哪个区间？","subtitle":"参考的是现实社交中的综合感受，不只是五官","note":"这个观察只帮助系统理解你的起点，不会以数字形式出现在结果里。","slider":{"min":1,"max":10,"step":1,"displayMode":"appearance","tierLabels":[{"range":[1,2],"label":"自然型"},{"range":[3,4],"label":"普通辨识度"},{"range":[5,6],"label":"有记忆点"},{"range":[7,8],"label":"高辨识度"},{"range":[9,10],"label":"极高辨识度"}],"footnote":"注意：不是素颜自拍视角，也不是美颜后的自己。\n参考：现实社交 + 日常状态 + 外形管理后的综合感受","reference":[{"score":1,"perception":"极少因为外形被注意","behavior":"外形基本不构成优势"},{"score":2,"perception":"不太关注外在呈现","behavior":"穿搭、妆容、管理较少"},{"score":3,"perception":"偶尔被夸","behavior":"熟人礼貌性评价更多"},{"score":4,"perception":"普通水平","behavior":"放在人群里不突出"},{"score":5,"perception":"中位值","behavior":"朋友会说「挺顺眼」"},{"score":6,"perception":"有辨识度","behavior":"社交场合容易留下印象"},{"score":7,"perception":"明显好看","behavior":"陌生场景会有人主动注意"},{"score":8,"perception":"同龄前10%左右","behavior":"经常被夸气质/颜值"},{"score":9,"perception":"同龄前3%左右","behavior":"经常有人主动表达好感"},{"score":10,"perception":"极少数","behavior":"外形成为明显优势资产"}]},"scoring":{"method":"direct_times_10","sensitive":"appearance","calibrationSignals":["FS1-F-03","FS1-F-02","FS1-F-04"]}}}'::jsonb, '{"method":"direct_times_10","sensitive":"appearance","calibrationSignals":["FS1-F-03","FS1-F-02","FS1-F-04"]}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-F-02', 2, 'FS1', 'scenario', 1.5, 'positive', '你走进一个聚会，里面大多数是陌生人。通常会发生什么？', '{"options":[{"key":"A","text":"我进去的时候，通常会有人抬头看","score":90},{"key":"B","text":"偶尔会感觉有人看了我一眼，但不确定","score":65},{"key":"C","text":"我找个位置坐下，没什么特别","score":40},{"key":"D","text":"我主动找角落，尽量不引人注意","score":20}],"source_question":{"id":"FS1-F-02","order":2,"type":"scenario","weight":1.5,"direction":"positive","text":"你走进一个聚会，里面大多数是陌生人。通常会发生什么？","options":[{"key":"A","text":"我进去的时候，通常会有人抬头看","score":90},{"key":"B","text":"偶尔会感觉有人看了我一眼，但不确定","score":65},{"key":"C","text":"我找个位置坐下，没什么特别","score":40},{"key":"D","text":"我主动找角落，尽量不引人注意","score":20}],"scoring":{"method":"direct"},"module":"FS1","sub":"FS1_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-F-03', 3, 'FS1', 'binary', 1.3, 'positive', '你的吸引力，更接近哪种？', '{"options":[{"key":"left","text":"第一眼型，初见最惊艳","score":70},{"key":"right","text":"越处越好看型，相处后才出来","score":80}],"source_question":{"id":"FS1-F-03","order":3,"type":"binary","weight":1.3,"direction":"positive","text":"你的吸引力，更接近哪种？","options":[{"key":"left","text":"第一眼型，初见最惊艳","score":70},{"key":"right","text":"越处越好看型，相处后才出来","score":80}],"scoring":{"method":"direct"},"module":"FS1","sub":"FS1_C"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-F-04', 4, 'FS1', 'choice', 1.3, 'positive', '你上一次被陌生人主动要联系方式，是什么时候？', '{"options":[{"key":"A","text":"好几年前，记不太清","score":20},{"key":"B","text":"一两年以内","score":50},{"key":"C","text":"半年以内","score":70},{"key":"D","text":"最近三个月内就有","score":90}],"source_question":{"id":"FS1-F-04","order":4,"type":"choice","weight":1.3,"direction":"positive","text":"你上一次被陌生人主动要联系方式，是什么时候？","options":[{"key":"A","text":"好几年前，记不太清","score":20},{"key":"B","text":"一两年以内","score":50},{"key":"C","text":"半年以内","score":70},{"key":"D","text":"最近三个月内就有","score":90}],"scoring":{"method":"direct"},"module":"FS1","sub":"FS1_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-F-05', 5, 'FS1', 'slider', 1.0, 'positive', '你对自己目前外形状态的满意程度？', '{"slider":{"min":0,"max":100,"min_label":"很不满意","max_label":"非常满意，状态很好"},"source_question":{"id":"FS1-F-05","order":5,"type":"slider","weight":1.0,"direction":"positive","text":"你对自己目前外形状态的满意程度？","slider":{"min":0,"max":100,"min_label":"很不满意","max_label":"非常满意，状态很好"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"module":"FS1","sub":"FS1_A"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-F-06', 6, 'FS2', 'scenario', 1.5, 'positive', '他今天工作上遇到了很糟糕的事，回家后一句话不说。你的第一反应是？', '{"options":[{"key":"A","text":"走过去坐在他旁边，不说话，陪着他","score":90},{"key":"B","text":"问他怎么了","score":70},{"key":"C","text":"给他倒水或者做点吃的，用行动表达","score":80},{"key":"D","text":"等他自己缓过来，不打扰","score":45}],"source_question":{"id":"FS2-F-06","order":6,"type":"scenario","weight":1.5,"direction":"positive","text":"他今天工作上遇到了很糟糕的事，回家后一句话不说。你的第一反应是？","options":[{"key":"A","text":"走过去坐在他旁边，不说话，陪着他","score":90},{"key":"B","text":"问他怎么了","score":70},{"key":"C","text":"给他倒水或者做点吃的，用行动表达","score":80},{"key":"D","text":"等他自己缓过来，不打扰","score":45}],"scoring":{"method":"direct"},"module":"FS2","sub":"FS2_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-F-07', 7, 'FS2', 'binary', 1.5, 'positive', '对方跟你倾诉烦心事，你的本能反应更接近？', '{"options":[{"key":"left","text":"先听完，给他感受被理解的空间","score":85},{"key":"right","text":"边听边想，帮他分析问题在哪里","score":55}],"source_question":{"id":"FS2-F-07","order":7,"type":"binary","weight":1.5,"direction":"positive","text":"对方跟你倾诉烦心事，你的本能反应更接近？","options":[{"key":"left","text":"先听完，给他感受被理解的空间","score":85},{"key":"right","text":"边听边想，帮他分析问题在哪里","score":55}],"scoring":{"method":"direct"},"module":"FS2","sub":"FS2_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-F-08', 8, 'FS2', 'choice', 1.3, 'positive', '你跟喜欢的人聊天，通常是什么状态？', '{"options":[{"key":"A","text":"我话多，话题多，对方说跟我聊天不无聊","score":80},{"key":"B","text":"双方都挺有话说，很自然","score":85},{"key":"C","text":"我不太擅长主动找话题，更多是接话","score":40},{"key":"D","text":"看对方，遇到聊得来的我话很多","score":65}],"source_question":{"id":"FS2-F-08","order":8,"type":"choice","weight":1.3,"direction":"positive","text":"你跟喜欢的人聊天，通常是什么状态？","options":[{"key":"A","text":"我话多，话题多，对方说跟我聊天不无聊","score":80},{"key":"B","text":"双方都挺有话说，很自然","score":85},{"key":"C","text":"我不太擅长主动找话题，更多是接话","score":40},{"key":"D","text":"看对方，遇到聊得来的我话很多","score":65}],"scoring":{"method":"direct"},"module":"FS2","sub":"FS2_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-F-09', 9, 'FS2', 'binary', 1.5, 'positive', '你觉得如果你们分开，他会？', '{"options":[{"key":"left","text":"很难找到像我这样的，会想起我很久","score":85},{"key":"right","text":"慢慢会好，我不确定自己有多难被替代","score":40}],"source_question":{"id":"FS2-F-09","order":9,"type":"binary","weight":1.5,"direction":"positive","text":"你觉得如果你们分开，他会？","options":[{"key":"left","text":"很难找到像我这样的，会想起我很久","score":85},{"key":"right","text":"慢慢会好，我不确定自己有多难被替代","score":40}],"scoring":{"method":"direct"},"module":"FS2","sub":"FS2_C"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-F-10', 10, 'FS2', 'slider', 1.2, 'positive', '你觉得跟你在一起，对方会觉得有意思的程度是多少？', '{"slider":{"min":0,"max":100,"min_label":"我可能比较无聊","max_label":"跟我在一起很有意思"},"source_question":{"id":"FS2-F-10","order":10,"type":"slider","weight":1.2,"direction":"positive","text":"你觉得跟你在一起，对方会觉得有意思的程度是多少？","slider":{"min":0,"max":100,"min_label":"我可能比较无聊","max_label":"跟我在一起很有意思"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"module":"FS2","sub":"FS2_B"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-F-11', 11, 'FS3', 'choice', 1.5, 'positive', '你目前的经济状态，最接近哪种描述？', '{"options":[{"key":"A","text":"有稳定工作，收入能覆盖自己，还有余钱","score":70},{"key":"B","text":"有收入但不多，偶尔需要家里补贴","score":50},{"key":"C","text":"主要靠家里","score":25},{"key":"D","text":"我收入很好，明显高于同龄人平均","score":90}],"source_question":{"id":"FS3-F-11","order":11,"type":"choice","weight":1.5,"direction":"positive","text":"你目前的经济状态，最接近哪种描述？","options":[{"key":"A","text":"有稳定工作，收入能覆盖自己，还有余钱","score":70},{"key":"B","text":"有收入但不多，偶尔需要家里补贴","score":50},{"key":"C","text":"主要靠家里","score":25},{"key":"D","text":"我收入很好，明显高于同龄人平均","score":90}],"scoring":{"method":"direct"},"module":"FS3","sub":"FS3_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-F-12', 12, 'FS3', 'binary', 1.5, 'positive', '如果你们分手，你的生活质量会？', '{"options":[{"key":"left","text":"基本不受影响，我自己过得很好","score":85},{"key":"right","text":"会有一些影响，我有一部分依赖对方","score":35}],"source_question":{"id":"FS3-F-12","order":12,"type":"binary","weight":1.5,"direction":"positive","text":"如果你们分手，你的生活质量会？","options":[{"key":"left","text":"基本不受影响，我自己过得很好","score":85},{"key":"right","text":"会有一些影响，我有一部分依赖对方","score":35}],"scoring":{"method":"direct"},"module":"FS3","sub":"FS3_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-F-13', 13, 'FS3', 'choice', 1.5, 'positive', '你的原生家庭在你的感情里，通常扮演什么角色？', '{"options":[{"key":"A","text":"后盾，需要时支持，不干涉我的选择","score":85},{"key":"B","text":"存在感不强，我自己做决定","score":75},{"key":"C","text":"偶尔干预，但总体还好","score":50},{"key":"D","text":"参与度很高，对我的感情有很多要求","score":20}],"source_question":{"id":"FS3-F-13","order":13,"type":"choice","weight":1.5,"direction":"positive","text":"你的原生家庭在你的感情里，通常扮演什么角色？","options":[{"key":"A","text":"后盾，需要时支持，不干涉我的选择","score":85},{"key":"B","text":"存在感不强，我自己做决定","score":75},{"key":"C","text":"偶尔干预，但总体还好","score":50},{"key":"D","text":"参与度很高，对我的感情有很多要求","score":20}],"scoring":{"method":"direct"},"module":"FS3","sub":"FS3_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-F-14', 14, 'FS3', 'binary', 1.3, 'positive', '你一个人生活的话，能过得很好吗？', '{"options":[{"key":"left","text":"完全没问题，我很能照顾自己","score":85},{"key":"right","text":"还好，但有很多事需要有人帮","score":40}],"source_question":{"id":"FS3-F-14","order":14,"type":"binary","weight":1.3,"direction":"positive","text":"你一个人生活的话，能过得很好吗？","options":[{"key":"left","text":"完全没问题，我很能照顾自己","score":85},{"key":"right","text":"还好，但有很多事需要有人帮","score":40}],"scoring":{"method":"direct"},"module":"FS3","sub":"FS3_C"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-F-15', 15, 'FS4', 'scenario', 1.5, 'positive', '他做了一件让你不舒服的事，但他没意识到。你通常会？', '{"options":[{"key":"A","text":"直接告诉他","score":90},{"key":"B","text":"暗示一下，希望他自己意识到","score":55},{"key":"C","text":"忍着，不想闹矛盾","score":20},{"key":"D","text":"先冷处理，看他有没有反应","score":35}],"source_question":{"id":"FS4-F-15","order":15,"type":"scenario","weight":1.5,"direction":"positive","text":"他做了一件让你不舒服的事，但他没意识到。你通常会？","options":[{"key":"A","text":"直接告诉他","score":90},{"key":"B","text":"暗示一下，希望他自己意识到","score":55},{"key":"C","text":"忍着，不想闹矛盾","score":20},{"key":"D","text":"先冷处理，看他有没有反应","score":35}],"scoring":{"method":"direct"},"module":"FS4","sub":"FS4_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-F-16', 16, 'FS4', 'choice', 1.3, 'positive', '你在关系里最常用的情绪处理方式是？', '{"options":[{"key":"A","text":"直接说，当下处理，不拖","score":85},{"key":"B","text":"先给自己时间冷静，然后再说","score":90},{"key":"C","text":"靠时间消化，不一定会说出来","score":45},{"key":"D","text":"用行动表示，比如冷战，让他感觉到","score":20}],"source_question":{"id":"FS4-F-16","order":16,"type":"choice","weight":1.3,"direction":"positive","text":"你在关系里最常用的情绪处理方式是？","options":[{"key":"A","text":"直接说，当下处理，不拖","score":85},{"key":"B","text":"先给自己时间冷静，然后再说","score":90},{"key":"C","text":"靠时间消化，不一定会说出来","score":45},{"key":"D","text":"用行动表示，比如冷战，让他感觉到","score":20}],"scoring":{"method":"direct"},"module":"FS4","sub":"FS4_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-F-17', 17, 'FS4', 'binary', 1.3, 'positive', '自从谈恋爱之后，你的个人生活？', '{"options":[{"key":"left","text":"基本没变，我还是我，关系是额外的部分","score":85},{"key":"right","text":"变了很多，他成了我生活的中心","score":25}],"source_question":{"id":"FS4-F-17","order":17,"type":"binary","weight":1.3,"direction":"positive","text":"自从谈恋爱之后，你的个人生活？","options":[{"key":"left","text":"基本没变，我还是我，关系是额外的部分","score":85},{"key":"right","text":"变了很多，他成了我生活的中心","score":25}],"scoring":{"method":"direct"},"module":"FS4","sub":"FS4_C"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-F-18', 18, 'FS5', 'scenario', 1.5, 'reverse', '新认识一个男生，他问你上一段感情是怎么结束的。你最真实的回答是？', '{"options":[{"key":"A","text":"简单说了，双方都有问题，已经过去了","score":10},{"key":"B","text":"说了一些，但有些部分还没消化","score":35},{"key":"C","text":"说了很多，那段感情对我影响还挺大","score":65},{"key":"D","text":"不太想提，提了情绪会有波动","score":80}],"source_question":{"id":"FS5-F-18","order":18,"type":"scenario","weight":1.5,"direction":"reverse","text":"新认识一个男生，他问你上一段感情是怎么结束的。你最真实的回答是？","options":[{"key":"A","text":"简单说了，双方都有问题，已经过去了","score":10},{"key":"B","text":"说了一些，但有些部分还没消化","score":35},{"key":"C","text":"说了很多，那段感情对我影响还挺大","score":65},{"key":"D","text":"不太想提，提了情绪会有波动","score":80}],"scoring":{"method":"direct"},"module":"FS5","sub":"FS5_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-F-19', 19, 'FS5', 'binary', 1.5, 'reverse', '你在关系里，安全感主要来自？', '{"options":[{"key":"left","text":"我自己内心比较稳，不太需要对方时刻确认","score":10},{"key":"right","text":"对方的回应和行动，他不稳定我就不稳定","score":80}],"source_question":{"id":"FS5-F-19","order":19,"type":"binary","weight":1.5,"direction":"reverse","text":"你在关系里，安全感主要来自？","options":[{"key":"left","text":"我自己内心比较稳，不太需要对方时刻确认","score":10},{"key":"right","text":"对方的回应和行动，他不稳定我就不稳定","score":80}],"scoring":{"method":"direct"},"module":"FS5","sub":"FS5_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-F-20', 20, 'FS5', 'choice', 1.3, 'reverse', '你父母对你的感情生活，态度是？', '{"options":[{"key":"A","text":"你自己决定，他们信任你","score":10},{"key":"B","text":"会问问，有意见，但最终尊重你","score":35},{"key":"C","text":"有具体要求，不太容易商量","score":60},{"key":"D","text":"参与度很高，我的感情他们必须满意","score":85}],"source_question":{"id":"FS5-F-20","order":20,"type":"choice","weight":1.3,"direction":"reverse","text":"你父母对你的感情生活，态度是？","options":[{"key":"A","text":"你自己决定，他们信任你","score":10},{"key":"B","text":"会问问，有意见，但最终尊重你","score":35},{"key":"C","text":"有具体要求，不太容易商量","score":60},{"key":"D","text":"参与度很高，我的感情他们必须满意","score":85}],"scoring":{"method":"direct"},"module":"FS5","sub":"FS5_C"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();


-- Source: suite3_mate_male_lite.json

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('MS1', '资源与事业轨道', 'MATE_SELECTION', '择偶坐标', 1, '{"label":"资源与事业轨道","weight":0.3,"sub":{"MS1_A":{"label":"当下经济基础","weight":0.45},"MS1_B":{"label":"事业轨道可见度","weight":0.35},"MS1_C":{"label":"家庭助力情况","weight":0.2}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('MS2', '稳定性与可靠度', 'MATE_SELECTION', '择偶坐标', 2, '{"label":"稳定性与可靠度","weight":0.25,"sub":{"MS2_A":{"label":"承诺履约度","weight":0.4},"MS2_B":{"label":"情绪稳定性","weight":0.35},"MS2_C":{"label":"关系信息透明度","weight":0.25}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('MS3', '情感供给能力', 'MATE_SELECTION', '择偶坐标', 3, '{"label":"情感供给能力","weight":0.2,"sub":{"MS3_A":{"label":"趣味与话题密度","weight":0.35},"MS3_B":{"label":"情绪支持能力","weight":0.4},"MS3_C":{"label":"被需要感制造力","weight":0.25}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('MS4', '门面与社交资本', 'MATE_SELECTION', '择偶坐标', 4, '{"label":"门面与社交资本","weight":0.15,"sub":{"MS4_A":{"label":"外形管理水平","weight":0.35},"MS4_B":{"label":"社交场合表现","weight":0.4},"MS4_C":{"label":"带出去的体面感","weight":0.25}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('MS5', '风险净值', 'MATE_SELECTION', '择偶坐标', 5, '{"label":"风险净值","weight":0.1,"direction":"reverse","note":"此模块分数越低越好，反向计入纵轴","sub":{"MS5_A":{"label":"过去关系质量","weight":0.3},"MS5_B":{"label":"控制与边界风险","weight":0.45},"MS5_C":{"label":"成长停滞风险","weight":0.25}}}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.test_suites (slug, name, version, gender, total_questions, estimated_minutes, is_free, is_active, source_suite_config)
VALUES ('s03_mate_male_lite', '择偶坐标测试 · 快速版', '1.0-lite', 'male'::public.test_gender, 20, 5, false, true, '{"gender":"male","version":"1.0-lite","estimated_minutes":5,"is_free":false,"modules":["MS1","MS2","MS3","MS4","MS5"],"result_types":["让人想留下来的人","被读懂之前的人","一眼就懂的人","需要被正确打开的人","还没到时候的人","越了解越值钱的人"],"question_types_used":["slider","scenario","binary","choice"],"id":"S03_MATE_MALE_LITE","name":"择偶坐标测试 · 快速版","total_questions":20,"tier":"lite","full_suite_id":"S03_MATE_MALE"}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  version = EXCLUDED.version,
  gender = EXCLUDED.gender,
  total_questions = EXCLUDED.total_questions,
  estimated_minutes = EXCLUDED.estimated_minutes,
  is_free = EXCLUDED.is_free,
  is_active = EXCLUDED.is_active,
  source_suite_config = EXCLUDED.source_suite_config,
  updated_at = now();

INSERT INTO public.scoring_models (suite_id, model_key, model_version, scoring_formula, type_rules, ros_config, is_active)
SELECT id, 'ROS_V3', '1.0-lite', '{"axes":{"horizontal":{"name":"市场显示度","formula":"MS3 * 0.50 + MS4 * 0.50","description":"情感供给能力和门面社交资本的综合，决定别人第一眼和相处后的感受"},"vertical":{"name":"现实支撑力","formula":"MS1 * 0.55 + MS2 * 0.30 + (100 - MS5) * 0.15","description":"资源轨道、稳定可靠度和风险净值共同决定的现实托底能力"}},"modules":{"MS1":{"label":"资源与事业轨道","weight":0.3,"sub":{"MS1_A":{"label":"当下经济基础","weight":0.45},"MS1_B":{"label":"事业轨道可见度","weight":0.35},"MS1_C":{"label":"家庭助力情况","weight":0.2}}},"MS2":{"label":"稳定性与可靠度","weight":0.25,"sub":{"MS2_A":{"label":"承诺履约度","weight":0.4},"MS2_B":{"label":"情绪稳定性","weight":0.35},"MS2_C":{"label":"关系信息透明度","weight":0.25}}},"MS3":{"label":"情感供给能力","weight":0.2,"sub":{"MS3_A":{"label":"趣味与话题密度","weight":0.35},"MS3_B":{"label":"情绪支持能力","weight":0.4},"MS3_C":{"label":"被需要感制造力","weight":0.25}}},"MS4":{"label":"门面与社交资本","weight":0.15,"sub":{"MS4_A":{"label":"外形管理水平","weight":0.35},"MS4_B":{"label":"社交场合表现","weight":0.4},"MS4_C":{"label":"带出去的体面感","weight":0.25}}},"MS5":{"label":"风险净值","weight":0.1,"direction":"reverse","note":"此模块分数越低越好，反向计入纵轴","sub":{"MS5_A":{"label":"过去关系质量","weight":0.3},"MS5_B":{"label":"控制与边界风险","weight":0.45},"MS5_C":{"label":"成长停滞风险","weight":0.25}}}}}'::jsonb, '{"quadrant_logic":{"note":"以50分为轴线中点，判断所在象限","Q1":{"condition":"horizontal >= 60 && vertical >= 60","type":"让人想留下来的人"},"Q2":{"condition":"horizontal < 50 && vertical >= 60","type":"被读懂之前的人"},"Q4":{"condition":"horizontal >= 60 && vertical < 50","type":"一眼就懂的人"},"Q3":{"condition":"horizontal < 50 && vertical < 50","type":"还没到时候的人"},"special_1":{"condition":"50 <= horizontal < 60 && 50 <= vertical < 60","type":"需要被正确打开的人"},"special_2":{"condition":"horizontal < 50 && vertical >= 55 && MS3 >= 65","type":"越了解越值钱的人"}},"score_display_rules":{"note":"所有分数转化为描述性语言，不直接显示数字","ranges":[{"min":0,"max":30,"label":"这个维度还有很大的成长空间"},{"min":31,"max":50,"label":"这个维度处于发展阶段"},{"min":51,"max":65,"label":"这个维度表现稳定"},{"min":66,"max":80,"label":"这个维度是你的重要资产"},{"min":81,"max":100,"label":"这个维度是你的核心竞争力"}],"sensitive_fields":{"MS1_A_income":"收入档位不直接显示，转化为：经济主导型/经济稳健型/经济发展型","MS1_A_education":"学历作为修正系数，不单独显示，结合职业和收入综合判断"}}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"MATE"}'::jsonb, true
FROM public.test_suites WHERE slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '让人想留下来的人', '让人想留下来的人', 'male'::public.test_gender, '{"tagline":"你不是最耀眼的那个，但跟你在一起有一种说不清楚的踏实。","tags":["稳","有趣","靠得住"],"market_read":"你在资源、稳定性和情感供给上都有不错的表现，不是最闪的那个，但留存率极高。她很难在别人身上找到这种综合感觉。","upper_match":"条件好、有主见、需要一个情感着陆点的成熟女性","sweet_spot":"重视稳定感、不喜欢不确定性、把长期放在第一位的女性","lower_match":"需要强刺激和即时吸引力的女性","radar_baseline":{"MS1":72,"MS2":75,"MS3":68,"MS4":65,"MS5_risk":20}}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '被读懂之前的人', '被读懂之前的人', 'male'::public.test_gender, '{"tagline":"你有很多好，但藏得比较深——大多数人没有耐心等到那一刻。","tags":["低调","实力在里面","需要时间"],"market_read":"你的现实底牌扎实，但门面显示度偏低，第一印象可能低于你的实际价值。你需要的不是更好的条件，是更好的出场方式。","upper_match":"有阅历、不被表面吸引、看重内在稳定性的女性","sweet_spot":"务实、重视可靠感、不追求即时浪漫的女性","lower_match":"追求第一眼吸引力、需要你主动展示自己才看得见你的女性","radar_baseline":{"MS1":75,"MS2":70,"MS3":48,"MS4":45,"MS5_risk":18}}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '一眼就懂的人', '一眼就懂的人', 'male'::public.test_gender, '{"tagline":"你把自己放在那里，清清楚楚，喜欢就来，不喜欢走开。","tags":["高辨识度","清晰","所见即所得"],"market_read":"你的门面资产和情感输出都比较显性，筛选效率高。但这也意味着你吸引的范围已经被框定，需要主动在深度上下功夫。","upper_match":"追求确定感、目标清晰、审美在线的成熟女性","sweet_spot":"不喜欢猜谜、追求效率、直接知道自己要什么的女性","lower_match":"追求神秘感、需要被持续惊喜的女性","radar_baseline":{"MS1":60,"MS2":65,"MS3":75,"MS4":80,"MS5_risk":30}}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '需要被正确打开的人', '需要被正确打开的人', 'male'::public.test_gender, '{"tagline":"你对了频道就是惊喜，频道不对就是误解——你不难，只是要对的人。","tags":["个性","非标","对的人才懂"],"market_read":"你不走大众路线，也不符合标准模板，但你在特定人群里的吸引力是无可替代的。你的市场窄但深。","upper_match":"有独立判断力、不从众、能欣赏非标准男性的女性","sweet_spot":"同样有鲜明个性、不需要你符合某种固定模板的女性","lower_match":"追求标准答案、需要你符合大众期待的女性","radar_baseline":{"MS1":60,"MS2":62,"MS3":68,"MS4":58,"MS5_risk":28}}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '还没到时候的人', '还没到时候的人', 'male'::public.test_gender, '{"tagline":"你现在的状态还不是最好版本，但方向是对的——时间站在你这边。","tags":["在建","方向对","等自己好"],"market_read":"你目前的资源底牌或情感供给能力还在建设中，市场给你的即时报价低于你的长期价值。先把自己做好，再谈择偶。","upper_match":"有耐心、看重潜力而非现状、愿意一起成长的女性","sweet_spot":"同样在成长阶段、把关系当长期项目经营的女性","lower_match":"追求现成条件、不愿意等待的女性","radar_baseline":{"MS1":42,"MS2":50,"MS3":45,"MS4":48,"MS5_risk":55}}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '越了解越值钱的人', '越了解越值钱的人', 'male'::public.test_gender, '{"tagline":"停留的时间越长，你给的东西越多——你不适合被快速评估。","tags":["复利型","长期","慢慢升值"],"market_read":"你的情感价值远超第一印象，但现实底牌的显示度偏低。进入长期关系后，你的优势会持续放大，短期市场里容易被低估。","upper_match":"不追求即时满足、愿意投入时间、把关系当长期项目的女性","sweet_spot":"成熟稳重、有长期规划意识、不急于求成的女性","lower_match":"喜欢快节奏、需要即时回报的女性","radar_baseline":{"MS1":68,"MS2":72,"MS3":70,"MS4":48,"MS5_risk":22}}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS1-M-01', 1, 'MS1', 'slider', 2.0, 'positive', '你目前的经济状况，在你所在城市大概处于什么水平？', '{"note":"这里不需要填具体数字，系统只需要了解你的相对位置。","slider":{"min":1,"max":6,"step":1,"reference":[{"level":"A","score":1,"desc":"入门层：收入勉强覆盖基本开销"},{"level":"B","score":2,"desc":"基础层：收入稳定，有一定储蓄"},{"level":"C","score":3,"desc":"中等层：高于本城市平均水平"},{"level":"D","score":4,"desc":"中上层：有资产积累（房/车）"},{"level":"E","score":5,"desc":"优质层：本城市前20%"},{"level":"F","score":6,"desc":"顶端层：本城市前5%"}]},"source_question":{"id":"MS1-M-01","order":1,"module":"MS1","sub":"MS1_A","type":"slider","weight":2.0,"direction":"positive","text":"你目前的经济状况，在你所在城市大概处于什么水平？","note":"这里不需要填具体数字，系统只需要了解你的相对位置。","slider":{"min":1,"max":6,"step":1,"reference":[{"level":"A","score":1,"desc":"入门层：收入勉强覆盖基本开销"},{"level":"B","score":2,"desc":"基础层：收入稳定，有一定储蓄"},{"level":"C","score":3,"desc":"中等层：高于本城市平均水平"},{"level":"D","score":4,"desc":"中上层：有资产积累（房/车）"},{"level":"E","score":5,"desc":"优质层：本城市前20%"},{"level":"F","score":6,"desc":"顶端层：本城市前5%"}]},"scoring":{"method":"direct_times_10"}}}'::jsonb, '{"method":"direct_times_10"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS1-M-02', 2, 'MS1', 'choice', 1.5, 'positive', '你现在的住房情况是？', '{"options":[{"key":"A","text":"自己有房（已付清或按揭中）","score":90},{"key":"B","text":"家里有房，住家里或用家里的","score":65},{"key":"C","text":"租房，条件不错","score":55},{"key":"D","text":"租房，还在积累阶段","score":35}],"source_question":{"id":"MS1-M-02","order":2,"type":"choice","weight":1.5,"direction":"positive","text":"你现在的住房情况是？","options":[{"key":"A","text":"自己有房（已付清或按揭中）","score":90},{"key":"B","text":"家里有房，住家里或用家里的","score":65},{"key":"C","text":"租房，条件不错","score":55},{"key":"D","text":"租房，还在积累阶段","score":35}],"scoring":{"method":"direct"},"module":"MS1","sub":"MS1_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS1-M-03', 3, 'MS1', 'scenario', 1.5, 'positive', '她问你「你觉得自己五年后会是什么状态」。你的回答最接近？', '{"options":[{"key":"A","text":"能说出具体的职位、收入目标或方向","score":90},{"key":"B","text":"大概知道方向，但具体说不清楚","score":65},{"key":"C","text":"比现在好很多，但怎么好说不上来","score":40},{"key":"D","text":"没想太多，先过好当下","score":20}],"source_question":{"id":"MS1-M-03","order":3,"type":"scenario","weight":1.5,"direction":"positive","text":"她问你「你觉得自己五年后会是什么状态」。你的回答最接近？","options":[{"key":"A","text":"能说出具体的职位、收入目标或方向","score":90},{"key":"B","text":"大概知道方向，但具体说不清楚","score":65},{"key":"C","text":"比现在好很多，但怎么好说不上来","score":40},{"key":"D","text":"没想太多，先过好当下","score":20}],"scoring":{"method":"direct"},"module":"MS1","sub":"MS1_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS1-M-04', 4, 'MS1', 'binary', 1.3, 'positive', '你现在的工作，在你看来是？', '{"options":[{"key":"left","text":"在上升通道里，还有很大空间","score":80},{"key":"right","text":"比较稳定，但天花板也差不多看到了","score":50}],"source_question":{"id":"MS1-M-04","order":4,"type":"binary","weight":1.3,"direction":"positive","text":"你现在的工作，在你看来是？","options":[{"key":"left","text":"在上升通道里，还有很大空间","score":80},{"key":"right","text":"比较稳定，但天花板也差不多看到了","score":50}],"scoring":{"method":"direct"},"module":"MS1","sub":"MS1_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS1-M-05', 5, 'MS1', 'choice', 1.3, 'positive', '你的原生家庭在你的感情里，通常扮演什么角色？', '{"options":[{"key":"A","text":"后盾，需要时支持，不干涉","score":85},{"key":"B","text":"存在感不强，我自己扛","score":70},{"key":"C","text":"偶尔干预，但总体还好","score":50},{"key":"D","text":"参与度很高，有很多想法和要求","score":20}],"source_question":{"id":"MS1-M-05","order":5,"type":"choice","weight":1.3,"direction":"positive","text":"你的原生家庭在你的感情里，通常扮演什么角色？","options":[{"key":"A","text":"后盾，需要时支持，不干涉","score":85},{"key":"B","text":"存在感不强，我自己扛","score":70},{"key":"C","text":"偶尔干预，但总体还好","score":50},{"key":"D","text":"参与度很高，有很多想法和要求","score":20}],"scoring":{"method":"direct"},"module":"MS1","sub":"MS1_C"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS2-M-06', 6, 'MS2', 'scenario', 1.5, 'positive', '你答应她周末陪她，但临时朋友约你打球。你通常会？', '{"options":[{"key":"A","text":"跟朋友说改天，先把跟她的约定兑现","score":90},{"key":"B","text":"跟她商量能不能改时间","score":60},{"key":"C","text":"去打球，心想下次再补","score":20},{"key":"D","text":"两边都不想放弃，最后都不满意","score":30}],"source_question":{"id":"MS2-M-06","order":6,"type":"scenario","weight":1.5,"direction":"positive","text":"你答应她周末陪她，但临时朋友约你打球。你通常会？","options":[{"key":"A","text":"跟朋友说改天，先把跟她的约定兑现","score":90},{"key":"B","text":"跟她商量能不能改时间","score":60},{"key":"C","text":"去打球，心想下次再补","score":20},{"key":"D","text":"两边都不想放弃，最后都不满意","score":30}],"scoring":{"method":"direct"},"module":"MS2","sub":"MS2_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS2-M-07', 7, 'MS2', 'binary', 1.5, 'positive', '当你情绪很差时，你对她的态度会受影响吗？', '{"options":[{"key":"left","text":"基本不会，我能把情绪管好","score":85},{"key":"right","text":"会有影响，状态差时她能感觉到","score":30}],"source_question":{"id":"MS2-M-07","order":7,"type":"binary","weight":1.5,"direction":"positive","text":"当你情绪很差时，你对她的态度会受影响吗？","options":[{"key":"left","text":"基本不会，我能把情绪管好","score":85},{"key":"right","text":"会有影响，状态差时她能感觉到","score":30}],"scoring":{"method":"direct"},"module":"MS2","sub":"MS2_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS2-M-08', 8, 'MS2', 'choice', 1.5, 'positive', '你跟异性朋友的关系，她清楚吗？', '{"options":[{"key":"A","text":"清楚，我会主动告诉她谁是谁","score":90},{"key":"B","text":"大概清楚，没刻意说但也没隐瞒","score":65},{"key":"C","text":"她不太清楚，我不太提","score":35},{"key":"D","text":"我觉得没必要每个都说清楚","score":20}],"source_question":{"id":"MS2-M-08","order":8,"type":"choice","weight":1.5,"direction":"positive","text":"你跟异性朋友的关系，她清楚吗？","options":[{"key":"A","text":"清楚，我会主动告诉她谁是谁","score":90},{"key":"B","text":"大概清楚，没刻意说但也没隐瞒","score":65},{"key":"C","text":"她不太清楚，我不太提","score":35},{"key":"D","text":"我觉得没必要每个都说清楚","score":20}],"scoring":{"method":"direct"},"module":"MS2","sub":"MS2_C"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS2-M-09', 9, 'MS2', 'scenario', 1.3, 'positive', '你答应她某件事，但后来因为自己的原因没做到。你通常怎么处理？', '{"options":[{"key":"A","text":"主动道歉，解释原因，想办法补救","score":90},{"key":"B","text":"道歉，但没特别去补救","score":65},{"key":"C","text":"等她提起来再说，不主动","score":35},{"key":"D","text":"觉得没什么大不了，过了就过了","score":15}],"source_question":{"id":"MS2-M-09","order":9,"type":"scenario","weight":1.3,"direction":"positive","text":"你答应她某件事，但后来因为自己的原因没做到。你通常怎么处理？","options":[{"key":"A","text":"主动道歉，解释原因，想办法补救","score":90},{"key":"B","text":"道歉，但没特别去补救","score":65},{"key":"C","text":"等她提起来再说，不主动","score":35},{"key":"D","text":"觉得没什么大不了，过了就过了","score":15}],"scoring":{"method":"direct"},"module":"MS2","sub":"MS2_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS2-M-10', 10, 'MS2', 'binary', 1.3, 'positive', '你在生活里，算不算一个说到做到的人？', '{"options":[{"key":"left","text":"算，答应的事基本都会做到","score":85},{"key":"right","text":"不一定，有时候会忘或者变了计划","score":30}],"source_question":{"id":"MS2-M-10","order":10,"type":"binary","weight":1.3,"direction":"positive","text":"你在生活里，算不算一个说到做到的人？","options":[{"key":"left","text":"算，答应的事基本都会做到","score":85},{"key":"right","text":"不一定，有时候会忘或者变了计划","score":30}],"scoring":{"method":"direct"},"module":"MS2","sub":"MS2_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS3-M-11', 11, 'MS3', 'scenario', 1.5, 'positive', '她跟你说今天工作上被骂了，很委屈，边说边快哭了。你的第一反应是？', '{"options":[{"key":"A","text":"先抱她，让她先哭出来，什么都不说","score":90},{"key":"B","text":"说「那个领导有问题」，帮她站队","score":65},{"key":"C","text":"问她具体怎么回事，帮她分析","score":50},{"key":"D","text":"有点不知道怎么办，说「会好的」","score":25}],"source_question":{"id":"MS3-M-11","order":11,"type":"scenario","weight":1.5,"direction":"positive","text":"她跟你说今天工作上被骂了，很委屈，边说边快哭了。你的第一反应是？","options":[{"key":"A","text":"先抱她，让她先哭出来，什么都不说","score":90},{"key":"B","text":"说「那个领导有问题」，帮她站队","score":65},{"key":"C","text":"问她具体怎么回事，帮她分析","score":50},{"key":"D","text":"有点不知道怎么办，说「会好的」","score":25}],"scoring":{"method":"direct"},"module":"MS3","sub":"MS3_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS3-M-12', 12, 'MS3', 'binary', 1.5, 'positive', '她倾诉烦心事，你的本能反应是？', '{"options":[{"key":"left","text":"先听完，让她感觉被理解","score":85},{"key":"right","text":"边听边帮她想解决方案","score":50}],"source_question":{"id":"MS3-M-12","order":12,"type":"binary","weight":1.5,"direction":"positive","text":"她倾诉烦心事，你的本能反应是？","options":[{"key":"left","text":"先听完，让她感觉被理解","score":85},{"key":"right","text":"边听边帮她想解决方案","score":50}],"scoring":{"method":"direct"},"module":"MS3","sub":"MS3_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS3-M-13', 13, 'MS3', 'choice', 1.3, 'positive', '跟她聊天，通常是什么状态？', '{"options":[{"key":"A","text":"我话多，话题多，她说跟我聊天不无聊","score":80},{"key":"B","text":"双方都挺有话说，很自然","score":85},{"key":"C","text":"我不太擅长主动找话题","score":35},{"key":"D","text":"看她，她起话题我跟着聊","score":55}],"source_question":{"id":"MS3-M-13","order":13,"type":"choice","weight":1.3,"direction":"positive","text":"跟她聊天，通常是什么状态？","options":[{"key":"A","text":"我话多，话题多，她说跟我聊天不无聊","score":80},{"key":"B","text":"双方都挺有话说，很自然","score":85},{"key":"C","text":"我不太擅长主动找话题","score":35},{"key":"D","text":"看她，她起话题我跟着聊","score":55}],"scoring":{"method":"direct"},"module":"MS3","sub":"MS3_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS3-M-14', 14, 'MS3', 'slider', 1.2, 'positive', '你觉得跟你在一起，她会不会觉得有意思？', '{"slider":{"min":0,"max":100,"min_label":"我可能比较无聊","max_label":"跟我在一起不无聊"},"source_question":{"id":"MS3-M-14","order":14,"type":"slider","weight":1.2,"direction":"positive","text":"你觉得跟你在一起，她会不会觉得有意思？","slider":{"min":0,"max":100,"min_label":"我可能比较无聊","max_label":"跟我在一起不无聊"},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"},"module":"MS3","sub":"MS3_A"}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS4-M-15', 15, 'MS4', 'slider', 1.5, 'positive', '你觉得自己的外形资产大概在哪个位置？', '{"subtitle":"包含长相、身材、穿搭、整体气质","note":"这个观察只帮助系统理解你的起点，不会以数字形式出现在结果里。","slider":{"min":1,"max":10,"step":1,"displayMode":"appearance","tierLabels":[{"range":[1,2],"label":"自然型"},{"range":[3,4],"label":"普通辨识度"},{"range":[5,6],"label":"有记忆点"},{"range":[7,8],"label":"高辨识度"},{"range":[9,10],"label":"极高辨识度"}],"footnote":"注意：不是素颜自拍视角，也不是美颜后的自己。\n参考：现实社交 + 日常状态 + 外形管理后的综合感受","reference":[{"score":1,"perception":"外形存在明显短板","behavior":"整体形象管理较少"},{"score":2,"perception":"很少因为外形被关注","behavior":"基本不构成优势"},{"score":3,"perception":"偶尔被夸精神","behavior":"熟人评价更多"},{"score":4,"perception":"普通水平","behavior":"放在人群里不突出"},{"score":5,"perception":"中位值","behavior":"干净舒服，不减分"},{"score":6,"perception":"有记忆点","behavior":"身材/气质/穿搭有亮点"},{"score":7,"perception":"明显加分","behavior":"异性会主动注意"},{"score":8,"perception":"同龄前10%左右","behavior":"常被夸有魅力"},{"score":9,"perception":"同龄前3%左右","behavior":"外形会带来社交优势"},{"score":10,"perception":"极少数","behavior":"长相或整体气质非常突出"}]},"source_question":{"id":"MS4-M-15","order":15,"module":"MS4","sub":"MS4_A","type":"slider","weight":1.5,"direction":"positive","text":"你觉得自己的外形资产大概在哪个位置？","subtitle":"包含长相、身材、穿搭、整体气质","note":"这个观察只帮助系统理解你的起点，不会以数字形式出现在结果里。","slider":{"min":1,"max":10,"step":1,"displayMode":"appearance","tierLabels":[{"range":[1,2],"label":"自然型"},{"range":[3,4],"label":"普通辨识度"},{"range":[5,6],"label":"有记忆点"},{"range":[7,8],"label":"高辨识度"},{"range":[9,10],"label":"极高辨识度"}],"footnote":"注意：不是素颜自拍视角，也不是美颜后的自己。\n参考：现实社交 + 日常状态 + 外形管理后的综合感受","reference":[{"score":1,"perception":"外形存在明显短板","behavior":"整体形象管理较少"},{"score":2,"perception":"很少因为外形被关注","behavior":"基本不构成优势"},{"score":3,"perception":"偶尔被夸精神","behavior":"熟人评价更多"},{"score":4,"perception":"普通水平","behavior":"放在人群里不突出"},{"score":5,"perception":"中位值","behavior":"干净舒服，不减分"},{"score":6,"perception":"有记忆点","behavior":"身材/气质/穿搭有亮点"},{"score":7,"perception":"明显加分","behavior":"异性会主动注意"},{"score":8,"perception":"同龄前10%左右","behavior":"常被夸有魅力"},{"score":9,"perception":"同龄前3%左右","behavior":"外形会带来社交优势"},{"score":10,"perception":"极少数","behavior":"长相或整体气质非常突出"}]},"scoring":{"method":"direct_times_10","sensitive":"appearance","calibrationSignals":["MS4-M-16","MS4-M-17","MS4-M-14"]}}}'::jsonb, '{"method":"direct_times_10","sensitive":"appearance","calibrationSignals":["MS4-M-16","MS4-M-17","MS4-M-14"]}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS4-M-16', 16, 'MS4', 'binary', 1.3, 'positive', '你对自己的外形，有没有主动维护的习惯？', '{"options":[{"key":"left","text":"有，我会注意穿搭、健身或者护肤","score":80},{"key":"right","text":"没有特别，保持基本整洁就行","score":40}],"source_question":{"id":"MS4-M-16","order":16,"type":"binary","weight":1.3,"direction":"positive","text":"你对自己的外形，有没有主动维护的习惯？","options":[{"key":"left","text":"有，我会注意穿搭、健身或者护肤","score":80},{"key":"right","text":"没有特别，保持基本整洁就行","score":40}],"scoring":{"method":"direct"},"module":"MS4","sub":"MS4_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS4-M-17', 17, 'MS4', 'scenario', 1.3, 'positive', '你和她一起参加她朋友的聚会，你不认识里面大多数人。你通常是什么状态？', '{"options":[{"key":"A","text":"很快融入，开始跟大家聊，场子热了","score":85},{"key":"B","text":"找几个聊得来的，不冷场但不特别活跃","score":75},{"key":"C","text":"基本跟在她旁边，等她来介绍","score":40},{"key":"D","text":"有点不自在，需要一段时间放开","score":45}],"source_question":{"id":"MS4-M-17","order":17,"type":"scenario","weight":1.3,"direction":"positive","text":"你和她一起参加她朋友的聚会，你不认识里面大多数人。你通常是什么状态？","options":[{"key":"A","text":"很快融入，开始跟大家聊，场子热了","score":85},{"key":"B","text":"找几个聊得来的，不冷场但不特别活跃","score":75},{"key":"C","text":"基本跟在她旁边，等她来介绍","score":40},{"key":"D","text":"有点不自在，需要一段时间放开","score":45}],"scoring":{"method":"direct"},"module":"MS4","sub":"MS4_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS5-M-18', 18, 'MS5', 'scenario', 1.5, 'reverse', '她今晚跟闺蜜出去，说可能很晚，叫你不用等。你的真实反应是？', '{"options":[{"key":"A","text":"好，我也去做自己的事","score":10},{"key":"B","text":"嘴上说好，但心里在想她在哪跟谁","score":40},{"key":"C","text":"问了一下她去哪几点回","score":60},{"key":"D","text":"觉得有点不放心，找理由让她早点回","score":85}],"source_question":{"id":"MS5-M-18","order":18,"type":"scenario","weight":1.5,"direction":"reverse","text":"她今晚跟闺蜜出去，说可能很晚，叫你不用等。你的真实反应是？","options":[{"key":"A","text":"好，我也去做自己的事","score":10},{"key":"B","text":"嘴上说好，但心里在想她在哪跟谁","score":40},{"key":"C","text":"问了一下她去哪几点回","score":60},{"key":"D","text":"觉得有点不放心，找理由让她早点回","score":85}],"scoring":{"method":"direct"},"module":"MS5","sub":"MS5_B"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS5-M-19', 19, 'MS5', 'binary', 1.5, 'reverse', '你现在跟前任还有联系吗？', '{"options":[{"key":"left","text":"没有，已经完全断开","score":10},{"key":"right","text":"偶尔有，关系说复杂也不复杂","score":60}],"source_question":{"id":"MS5-M-19","order":19,"type":"binary","weight":1.5,"direction":"reverse","text":"你现在跟前任还有联系吗？","options":[{"key":"left","text":"没有，已经完全断开","score":10},{"key":"right","text":"偶尔有，关系说复杂也不复杂","score":60}],"scoring":{"method":"direct"},"module":"MS5","sub":"MS5_A"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS5-M-20', 20, 'MS5', 'choice', 1.2, 'reverse', '她说她希望未来的另一半是一个不断进步的人。你的内心感受是？', '{"options":[{"key":"A","text":"有点压力，但这正是我想做的，接受","score":20},{"key":"B","text":"挺好的，我本来就有这样的计划","score":10},{"key":"C","text":"有点担心，不确定能达到她的期待","score":50},{"key":"D","text":"感觉有点被要求，不太喜欢这种压力","score":75}],"source_question":{"id":"MS5-M-20","order":20,"type":"choice","weight":1.2,"direction":"reverse","text":"她说她希望未来的另一半是一个不断进步的人。你的内心感受是？","options":[{"key":"A","text":"有点压力，但这正是我想做的，接受","score":20},{"key":"B","text":"挺好的，我本来就有这样的计划","score":10},{"key":"C","text":"有点担心，不确定能达到她的期待","score":50},{"key":"D","text":"感觉有点被要求，不太喜欢这种压力","score":75}],"scoring":{"method":"direct"},"module":"MS5","sub":"MS5_C"}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male_lite'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

COMMIT;
