-- LoveCompass generated data import SQL

-- 此文件由 scripts/generate_import_sql.py 根据外部 JSON 数据生成；题目内容没有硬编码在脚本中。

BEGIN;


-- Source: suite1_female.json

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA1', '自我吸引感知', 'SELF_ATTACHMENT', '自我关系模式', 1, '{"label":"自我吸引感知","direction":"positive","formula":"weighted_avg * 20","weight_sum":7.1}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA2', '依恋焦虑', 'SELF_ATTACHMENT', '自我关系模式', 2, '{"label":"依恋焦虑","direction":"reverse","note":"所有题目已在选项层完成反向处理，公式直接加权","formula":"weighted_avg * 20","weight_sum":13.8}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA3', '依恋回避', 'SELF_ATTACHMENT', '自我关系模式', 3, '{"label":"依恋回避","direction":"reverse","formula":"weighted_avg * 20","weight_sum":10.1}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA4', '自我边界', 'SELF_ATTACHMENT', '自我关系模式', 4, '{"label":"自我边界","direction":"positive","formula":"weighted_avg * 20","weight_sum":9.9}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA5', '情绪调节', 'SELF_ATTACHMENT', '自我关系模式', 5, '{"label":"情绪调节","direction":"positive","formula":"weighted_avg * 20","weight_sum":12.3}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA6', '关系投入模式', 'SELF_ATTACHMENT', '自我关系模式', 6, '{"label":"关系投入模式","direction":"positive","formula":"weighted_avg * 20","weight_sum":8.5,"auxiliary_questions":["SA6-F-42","SA6-F-46","SA6-F-50"]}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.test_suites (slug, name, version, gender, total_questions, estimated_minutes, is_free, is_active, source_suite_config)
VALUES ('s01_self_female', '自我关系模式测试', '1.0', 'female'::public.test_gender, 50, 12, true, true, '{"id":"S01_SELF_FEMALE","name":"自我关系模式测试","gender":"female","version":"1.0","total_questions":50,"estimated_minutes":12,"is_free":true,"dimensions":["SA1","SA2","SA3","SA4","SA5","SA6"],"result_types":["薛宝钗","林黛玉","妙玉","史湘云","王熙凤","袭人"]}'::jsonb)
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
SELECT id, 'ROS_V3', '1.0', '{"SA1":{"label":"自我吸引感知","direction":"positive","formula":"weighted_avg * 20","weights":{"SA1-F-01":1.2,"SA1-F-02":1.5,"SA1-F-03":1.0,"SA1-F-04":1.2,"SA1-F-05":1.0,"SA1-F-06":1.2},"weight_sum":7.1},"SA2":{"label":"依恋焦虑","direction":"reverse","note":"所有题目已在选项层完成反向处理，公式直接加权","formula":"weighted_avg * 20","weights":{"SA2-F-07":1.5,"SA2-F-08":1.5,"SA2-F-09":1.2,"SA2-F-10":1.2,"SA2-F-11":1.2,"SA2-F-12":1.0,"SA2-F-13":1.5,"SA2-F-14":1.5,"SA2-F-15":1.5,"SA2-F-16":1.2},"weight_sum":13.8},"SA3":{"label":"依恋回避","direction":"reverse","formula":"weighted_avg * 20","weights":{"SA3-F-17":1.5,"SA3-F-18":1.5,"SA3-F-19":1.5,"SA3-F-20":1.2,"SA3-F-21":1.2,"SA3-F-22":1.2,"SA3-F-23":1.0,"SA3-F-24":1.0},"weight_sum":10.1},"SA4":{"label":"自我边界","direction":"positive","formula":"weighted_avg * 20","weights":{"SA4-F-25":1.5,"SA4-F-26":1.5,"SA4-F-27":1.5,"SA4-F-29":1.5,"SA4-F-30":1.5,"SA4-F-31":1.2,"SA4-F-32":1.2},"weight_sum":9.9},"SA5":{"label":"情绪调节","direction":"positive","formula":"weighted_avg * 20","weights":{"SA5-F-33":1.5,"SA5-F-34":1.5,"SA5-F-35":1.5,"SA5-F-36":1.2,"SA5-F-37":1.2,"SA5-F-38":1.2,"SA5-F-39":1.5,"SA5-F-40":1.2,"SA5-F-41":1.5},"weight_sum":12.3},"SA6":{"label":"关系投入模式","direction":"positive","formula":"weighted_avg * 20","weights":{"SA6-F-43":1.5,"SA6-F-44":1.5,"SA6-F-45":1.5,"SA6-F-47":1.5,"SA6-F-48":1.5,"SA6-F-49":1.0},"weight_sum":8.5,"auxiliary_questions":["SA6-F-42","SA6-F-46","SA6-F-50"]}}'::jsonb, '{"primary":[{"condition":"SA2 < 45 && SA3 < 45","type":"史湘云","attachment":"混合型"},{"condition":"SA2 < 45 && SA3 >= 60","type":"林黛玉","attachment":"焦虑型"},{"condition":"SA2 >= 60 && SA3 < 45","type":"妙玉","attachment":"回避型"},{"condition":"SA2 >= 60 && SA3 >= 60","type":"薛宝钗","attachment":"安全型"}],"override":[{"condition":"SA1 < 40","type":"袭人","note":"低自我高投入修正，优先级高于primary"},{"condition":"SA4 >= 80 && primary_type == ''薛宝钗''","type":"王熙凤","note":"高边界安全修正"}],"grey_zone":{"note":"SA2或SA3在45-60之间为灰色地带，保留primary类型但在报告中注明临界状态"}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB"}'::jsonb, true
FROM public.test_suites WHERE slug = 's01_self_female'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '薛宝钗', '薛宝钗', 'female'::public.test_gender, '{"attachment_type":"安全型","tagline":"你是关系里最稀有的人","description":"你是关系里最稀有的人。清醒但不冷漠，温柔但有边界。不会因为爱一个人而失去自己，也不需要对方时刻确认才能安心。你给的安全感是真实的，不是表演出来的。","matching_logic":"情绪稳定、边界清晰、能给能收、不因爱失去自我","radar_baseline":{"SA1":72,"SA2":75,"SA3":70,"SA4":78,"SA5":74,"SA6":68}}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's01_self_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '林黛玉', '林黛玉', 'female'::public.test_gender, '{"attachment_type":"焦虑型","tagline":"你的敏感是一种天赋，不是缺陷","description":"你的敏感是一种天赋，不是缺陷。你比任何人都更能感受到关系里的细微变化，爱得深、想得多，是因为你把感情当真。这世上最难得的，是你这种真心。","matching_logic":"高敏感、需要被确认、爱得深但安全感弱、把感情当真的人","radar_baseline":{"SA1":58,"SA2":35,"SA3":65,"SA4":52,"SA5":48,"SA6":62}}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's01_self_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '妙玉', '妙玉', 'female'::public.test_gender, '{"attachment_type":"回避型","tagline":"你不是不懂爱，你只是对平庸的亲密没有兴趣","description":"你不是不懂爱，你只是对平庸的亲密没有兴趣。你有极高的精神标准，不轻易让人靠近，是因为你深知自己值得真正懂你的人。等到了，你会是最深情的那个。","matching_logic":"高冷疏离、精神标准极高、渴望亲密却主动筑墙、等到懂的人才开放","radar_baseline":{"SA1":68,"SA2":72,"SA3":28,"SA4":74,"SA5":60,"SA6":55}}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's01_self_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '史湘云', '史湘云', 'female'::public.test_gender, '{"attachment_type":"混合型","tagline":"你是关系里最有生命力的那种人","description":"你是关系里最有生命力的那种人。时而热烈时而需要空间，不是因为你不稳定，而是因为你足够真实。你从不表演，这反而是最珍贵的事。","matching_logic":"时而热烈时而需要空间、情绪真实不表演、足够复杂才足够有趣","radar_baseline":{"SA1":60,"SA2":42,"SA3":42,"SA4":55,"SA5":52,"SA6":58}}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's01_self_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '王熙凤', '王熙凤', 'female'::public.test_gender, '{"attachment_type":"高边界安全型","tagline":"你是感情里最有掌控力的人","description":"你是感情里最有掌控力的人。清楚自己要什么，不会被情绪带着走，爱得现实但绝对忠诚。你的边界不是冷漠，是尊重——包括对自己的尊重。","matching_logic":"掌控感强、边界极硬、爱得现实但绝对忠诚、尊重自己才能尊重感情","radar_baseline":{"SA1":75,"SA2":78,"SA3":72,"SA4":88,"SA5":76,"SA6":65}}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's01_self_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '袭人', '袭人', 'female'::public.test_gender, '{"attachment_type":"低自我高投入型","tagline":"你是感情里最有温度的人","description":"你是感情里最有温度的人。你的爱是具体的、日常的、落在每一个细节里的。你懂得如何让一个人感到被珍视——这种能力，是很多人一生都学不会的。","matching_logic":"爱得具体日常、落在细节里、温度最高、懂得让人感到被珍视","radar_baseline":{"SA1":32,"SA2":38,"SA3":60,"SA4":35,"SA5":55,"SA6":45}}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's01_self_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA1-F-01', 1, 'SA1', 'slider', 1.2, 'positive', '不需要任何人告诉你，你自己心里清楚——你觉得自己有多值得被认真对待？', '{"slider":{"min":0,"max":100,"min_label":"我经常觉得自己不够好","max_label":"我清楚地知道自己值得","feedback":[{"range":[0,20],"text":"你可能习惯了把自己排在最后"},{"range":[21,40],"text":"你有时候相信自己，但需要外部确认"},{"range":[41,60],"text":"你的自我价值感依情况而定"},{"range":[61,80],"text":"你大多数时候知道自己的重量"},{"range":[81,100],"text":"你有一种安静的自知，不需要别人证明"}]},"source_question":{"id":"SA1-F-01","order":1,"dimension":"SA1","type":"slider","weight":1.2,"direction":"positive","text":"不需要任何人告诉你，你自己心里清楚——你觉得自己有多值得被认真对待？","slider":{"min":0,"max":100,"min_label":"我经常觉得自己不够好","max_label":"我清楚地知道自己值得","feedback":[{"range":[0,20],"text":"你可能习惯了把自己排在最后"},{"range":[21,40],"text":"你有时候相信自己，但需要外部确认"},{"range":[41,60],"text":"你的自我价值感依情况而定"},{"range":[61,80],"text":"你大多数时候知道自己的重量"},{"range":[81,100],"text":"你有一种安静的自知，不需要别人证明"}]},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA1-F-02', 2, 'SA1', 'choice', 1.5, 'positive', '你喜欢的人突然冷淡了，消息回得很慢，状态也不更新。你脑子里第一个冒出来的念头更接近哪个？', '{"scene":null,"options":[{"key":"A","text":"是不是我哪里做错了，让他不舒服了","sub":"第一反应是检讨自己","score":1},{"key":"B","text":"他可能最近有事，但我还是有点不安","sub":"理性但情绪在","score":2},{"key":"C","text":"他的状态和我的价值没有关系，先观察","sub":"能区分事件和自我","score":4},{"key":"D","text":"他要是不珍惜，那是他的损失","sub":"自我价值感稳定","score":5}],"source_question":{"id":"SA1-F-02","order":2,"dimension":"SA1","type":"choice","weight":1.5,"direction":"positive","text":"你喜欢的人突然冷淡了，消息回得很慢，状态也不更新。你脑子里第一个冒出来的念头更接近哪个？","scene":null,"options":[{"key":"A","text":"是不是我哪里做错了，让他不舒服了","sub":"第一反应是检讨自己","score":1},{"key":"B","text":"他可能最近有事，但我还是有点不安","sub":"理性但情绪在","score":2},{"key":"C","text":"他的状态和我的价值没有关系，先观察","sub":"能区分事件和自我","score":4},{"key":"D","text":"他要是不珍惜，那是他的损失","sub":"自我价值感稳定","score":5}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA1-F-03', 3, 'SA1', 'likert', 1.0, 'positive', '我相信自己对别人有真实的吸引力，这种吸引力不只来自外表，也来自我这个人本身。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA1-F-03","order":3,"dimension":"SA1","type":"likert","weight":1.0,"direction":"positive","text":"我相信自己对别人有真实的吸引力，这种吸引力不只来自外表，也来自我这个人本身。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA1-F-04', 4, 'SA1', 'choice', 1.2, 'positive', '闺蜜跟你说，你前任现在过得特别好，新女友又漂亮又优秀。你心里真实的感受更接近？', '{"scene":null,"options":[{"key":"A","text":"有点难受，觉得自己好像输了","sub":"自我价值与对比挂钩","score":1},{"key":"B","text":"有点在意，但很快就过去了","sub":"轻微波动但能恢复","score":3},{"key":"C","text":"替他高兴，跟我没什么关系了","sub":"边界清晰，自我稳定","score":4},{"key":"D","text":"那挺好的，我也在往前走","sub":"自我叙事完整","score":5}],"source_question":{"id":"SA1-F-04","order":4,"dimension":"SA1","type":"choice","weight":1.2,"direction":"positive","text":"闺蜜跟你说，你前任现在过得特别好，新女友又漂亮又优秀。你心里真实的感受更接近？","scene":null,"options":[{"key":"A","text":"有点难受，觉得自己好像输了","sub":"自我价值与对比挂钩","score":1},{"key":"B","text":"有点在意，但很快就过去了","sub":"轻微波动但能恢复","score":3},{"key":"C","text":"替他高兴，跟我没什么关系了","sub":"边界清晰，自我稳定","score":4},{"key":"D","text":"那挺好的，我也在往前走","sub":"自我叙事完整","score":5}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA1-F-05', 5, 'SA1', 'slider', 1.0, 'positive', '当你走进一个全是陌生人的场合，你对自己的感觉是？', '{"slider":{"min":0,"max":100,"min_label":"我很担心别人怎么看我","max_label":"我对自己的状态挺笃定的","feedback":[{"range":[0,20],"text":"陌生场合会让你高度警觉"},{"range":[21,40],"text":"你会有些不安，需要时间找到状态"},{"range":[41,60],"text":"看情况，有时自信有时不确定"},{"range":[61,80],"text":"你通常能稳住自己"},{"range":[81,100],"text":"你不需要别人的眼光来确定自己的位置"}]},"source_question":{"id":"SA1-F-05","order":5,"dimension":"SA1","type":"slider","weight":1.0,"direction":"positive","text":"当你走进一个全是陌生人的场合，你对自己的感觉是？","slider":{"min":0,"max":100,"min_label":"我很担心别人怎么看我","max_label":"我对自己的状态挺笃定的","feedback":[{"range":[0,20],"text":"陌生场合会让你高度警觉"},{"range":[21,40],"text":"你会有些不安，需要时间找到状态"},{"range":[41,60],"text":"看情况，有时自信有时不确定"},{"range":[61,80],"text":"你通常能稳住自己"},{"range":[81,100],"text":"你不需要别人的眼光来确定自己的位置"}]},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA1-F-06', 6, 'SA1', 'likert', 1.2, 'positive', '当我喜欢一个人时，我有信心去表达或行动，而不是因为怕被拒绝就一直等待。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA1-F-06","order":6,"dimension":"SA1","type":"likert","weight":1.2,"direction":"positive","text":"当我喜欢一个人时，我有信心去表达或行动，而不是因为怕被拒绝就一直等待。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-07', 7, 'SA2', 'mood', 1.5, 'reverse', '你发了条消息给他，两个小时了还没回。你现在的状态最接近？', '{"scene":null,"options":[{"key":"A","icon":"ti-mood-smile","text":"没事，他可能在忙","score":5},{"key":"B","icon":"ti-mood-confuzed","text":"有点奇怪，但没想太多","score":4},{"key":"C","icon":"ti-mood-nervous","text":"开始回想最近有没有说错什么","score":2},{"key":"D","icon":"ti-mood-sad","text":"感觉有点被忽视了","score":3},{"key":"E","icon":"ti-mood-angry","text":"有点烦，觉得他不够重视我","score":3},{"key":"F","icon":"ti-mood-suprised","text":"开始刷他朋友圈看有没有更新","score":1},{"key":"G","icon":"ti-mood-empty","text":"已经开始想象最坏的情况了","score":1},{"key":"H","icon":"ti-mood-tongue","text":"随便，我去干别的了","score":5}],"source_question":{"id":"SA2-F-07","order":7,"dimension":"SA2","type":"mood","weight":1.5,"direction":"reverse","text":"你发了条消息给他，两个小时了还没回。你现在的状态最接近？","scene":null,"options":[{"key":"A","icon":"ti-mood-smile","text":"没事，他可能在忙","score":5},{"key":"B","icon":"ti-mood-confuzed","text":"有点奇怪，但没想太多","score":4},{"key":"C","icon":"ti-mood-nervous","text":"开始回想最近有没有说错什么","score":2},{"key":"D","icon":"ti-mood-sad","text":"感觉有点被忽视了","score":3},{"key":"E","icon":"ti-mood-angry","text":"有点烦，觉得他不够重视我","score":3},{"key":"F","icon":"ti-mood-suprised","text":"开始刷他朋友圈看有没有更新","score":1},{"key":"G","icon":"ti-mood-empty","text":"已经开始想象最坏的情况了","score":1},{"key":"H","icon":"ti-mood-tongue","text":"随便，我去干别的了","score":5}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-08', 8, 'SA2', 'choice', 1.5, 'reverse', '你们约好周末见面，他下午突然说有事要取消。你的第一反应是？', '{"scene":null,"options":[{"key":"A","text":"好的，下次再约，没什么大不了","sub":"低焦虑，弹性好","score":5},{"key":"B","text":"有点失望，但理解，问他什么时候有空","sub":"中低焦虑，健康表达","score":4},{"key":"C","text":"嘴上说没事，心里开始想是不是不想见我","sub":"中高焦虑，内外不一","score":2},{"key":"D","text":"很难受，需要他多解释几句才能安心","sub":"高焦虑，需要确认","score":1}],"source_question":{"id":"SA2-F-08","order":8,"dimension":"SA2","type":"choice","weight":1.5,"direction":"reverse","text":"你们约好周末见面，他下午突然说有事要取消。你的第一反应是？","scene":null,"options":[{"key":"A","text":"好的，下次再约，没什么大不了","sub":"低焦虑，弹性好","score":5},{"key":"B","text":"有点失望，但理解，问他什么时候有空","sub":"中低焦虑，健康表达","score":4},{"key":"C","text":"嘴上说没事，心里开始想是不是不想见我","sub":"中高焦虑，内外不一","score":2},{"key":"D","text":"很难受，需要他多解释几句才能安心","sub":"高焦虑，需要确认","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-09', 9, 'SA2', 'likert', 1.2, 'reverse', '当对方一段时间没有主动联系我时，我会开始担心他是否对我失去了兴趣。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"总是"},"source_question":{"id":"SA2-F-09","order":9,"dimension":"SA2","type":"likert","weight":1.2,"direction":"reverse","text":"当对方一段时间没有主动联系我时，我会开始担心他是否对我失去了兴趣。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"总是"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-10', 10, 'SA2', 'choice', 1.2, 'reverse', '你发现他跟一个女生聊得很开心，你不认识她。你心里的感受更接近？', '{"scene":null,"options":[{"key":"A","text":"没什么特别，他有自己的社交很正常","sub":"低焦虑，边界清晰","score":5},{"key":"B","text":"有一点在意，但不会表现出来","sub":"轻微焦虑，能消化","score":4},{"key":"C","text":"想知道她是谁，心里有点不舒服","sub":"中等焦虑","score":3},{"key":"D","text":"开始有点不安全感，想确认我们的关系状态","sub":"高焦虑，需要确认","score":1}],"source_question":{"id":"SA2-F-10","order":10,"dimension":"SA2","type":"choice","weight":1.2,"direction":"reverse","text":"你发现他跟一个女生聊得很开心，你不认识她。你心里的感受更接近？","scene":null,"options":[{"key":"A","text":"没什么特别，他有自己的社交很正常","sub":"低焦虑，边界清晰","score":5},{"key":"B","text":"有一点在意，但不会表现出来","sub":"轻微焦虑，能消化","score":4},{"key":"C","text":"想知道她是谁，心里有点不舒服","sub":"中等焦虑","score":3},{"key":"D","text":"开始有点不安全感，想确认我们的关系状态","sub":"高焦虑，需要确认","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-11', 11, 'SA2', 'slider', 1.2, 'reverse', '在一段关系里，你需要多高频率的主动联系才能感到安心？', '{"slider":{"min":0,"max":100,"min_label":"完全不需要，有他就够了","max_label":"需要非常频繁才能放心","feedback":[{"range":[0,20],"text":"你在亲密关系里很有安全感"},{"range":[21,40],"text":"偶尔需要确认，但不依赖"},{"range":[41,60],"text":"中等需求，看关系质量"},{"range":[61,80],"text":"你需要比较稳定的联系才能安心"},{"range":[81,100],"text":"频繁的联系对你来说是安全感的来源"}]},"source_question":{"id":"SA2-F-11","order":11,"dimension":"SA2","type":"slider","weight":1.2,"direction":"reverse","text":"在一段关系里，你需要多高频率的主动联系才能感到安心？","slider":{"min":0,"max":100,"min_label":"完全不需要，有他就够了","max_label":"需要非常频繁才能放心","feedback":[{"range":[0,20],"text":"你在亲密关系里很有安全感"},{"range":[21,40],"text":"偶尔需要确认，但不依赖"},{"range":[41,60],"text":"中等需求，看关系质量"},{"range":[61,80],"text":"你需要比较稳定的联系才能安心"},{"range":[81,100],"text":"频繁的联系对你来说是安全感的来源"}]},"scoring":{"method":"reverse_slider","formula":"(100 - value) / 100 * 5"}}}'::jsonb, '{"method":"reverse_slider","formula":"(100 - value) / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-12', 12, 'SA2', 'mood', 1.0, 'reverse', '他今天发的朋友圈你点了赞，但他没有回复你。你的感受是？', '{"options":[{"key":"A","icon":"ti-mood-smile","text":"没想那么多，继续刷","score":5},{"key":"B","icon":"ti-mood-confuzed","text":"稍微注意到了，但没放心上","score":4},{"key":"C","icon":"ti-mood-nervous","text":"有点在意，想着要不要说点什么","score":3},{"key":"D","icon":"ti-mood-sad","text":"有点失落，觉得被忽视了","score":2},{"key":"E","icon":"ti-mood-empty","text":"开始想是不是他不想理我","score":1},{"key":"F","icon":"ti-mood-angry","text":"有点不爽，觉得他不够用心","score":2},{"key":"G","icon":"ti-mood-happy","text":"无所谓，我又不是为了他才发的","score":5},{"key":"H","icon":"ti-mood-tongue","text":"我根本没注意","score":5}],"source_question":{"id":"SA2-F-12","order":12,"dimension":"SA2","type":"mood","weight":1.0,"direction":"reverse","text":"他今天发的朋友圈你点了赞，但他没有回复你。你的感受是？","options":[{"key":"A","icon":"ti-mood-smile","text":"没想那么多，继续刷","score":5},{"key":"B","icon":"ti-mood-confuzed","text":"稍微注意到了，但没放心上","score":4},{"key":"C","icon":"ti-mood-nervous","text":"有点在意，想着要不要说点什么","score":3},{"key":"D","icon":"ti-mood-sad","text":"有点失落，觉得被忽视了","score":2},{"key":"E","icon":"ti-mood-empty","text":"开始想是不是他不想理我","score":1},{"key":"F","icon":"ti-mood-angry","text":"有点不爽，觉得他不够用心","score":2},{"key":"G","icon":"ti-mood-happy","text":"无所谓，我又不是为了他才发的","score":5},{"key":"H","icon":"ti-mood-tongue","text":"我根本没注意","score":5}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-13', 13, 'SA2', 'likert', 1.5, 'reverse', '我有时候会压抑自己真实的需求或感受，因为害怕说出来会让他不喜欢我。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"source_question":{"id":"SA2-F-13","order":13,"dimension":"SA2","type":"likert","weight":1.5,"direction":"reverse","text":"我有时候会压抑自己真实的需求或感受，因为害怕说出来会让他不喜欢我。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-14', 14, 'SA2', 'choice', 1.5, 'reverse', '你们吵架了，他说需要冷静一下，暂时不想说话。你会怎么做？', '{"scene":null,"options":[{"key":"A","text":"好，给他时间，我也去做自己的事","sub":"低焦虑，尊重边界","score":5},{"key":"B","text":"忍着，但心里很不安，一直看手机","sub":"中高焦虑，表面克制","score":3},{"key":"C","text":"过一会儿忍不住发消息，想确认他还好","sub":"高焦虑，难以等待","score":2},{"key":"D","text":"开始担心他是不是想分手，越想越怕","sub":"极高焦虑，灾难化","score":1}],"source_question":{"id":"SA2-F-14","order":14,"dimension":"SA2","type":"choice","weight":1.5,"direction":"reverse","text":"你们吵架了，他说需要冷静一下，暂时不想说话。你会怎么做？","scene":null,"options":[{"key":"A","text":"好，给他时间，我也去做自己的事","sub":"低焦虑，尊重边界","score":5},{"key":"B","text":"忍着，但心里很不安，一直看手机","sub":"中高焦虑，表面克制","score":3},{"key":"C","text":"过一会儿忍不住发消息，想确认他还好","sub":"高焦虑，难以等待","score":2},{"key":"D","text":"开始担心他是不是想分手，越想越怕","sub":"极高焦虑，灾难化","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-15', 15, 'SA2', 'likert', 1.5, 'reverse', '在关系里，我需要对方频繁地表达爱意或确认关系，才能真正感到放心。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA2-F-15","order":15,"dimension":"SA2","type":"likert","weight":1.5,"direction":"reverse","text":"在关系里，我需要对方频繁地表达爱意或确认关系，才能真正感到放心。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA2-F-16', 16, 'SA2', 'choice', 1.2, 'reverse', '他说要和朋友出去玩，可能很晚回来，叫你不用等他。你的感受？', '{"scene":null,"options":[{"key":"A","text":"好啊，我也去做自己的事","sub":"低焦虑，独立感强","score":5},{"key":"B","text":"有点想他，但理解，等他回来再聊","sub":"健康依恋，情感真实","score":4},{"key":"C","text":"嘴上说好，但心里有点空，一直刷手机等他","sub":"焦虑在低鸣","score":2},{"key":"D","text":"开始想他在和谁玩，为什么不带我","sub":"焦虑带控制倾向","score":1}],"source_question":{"id":"SA2-F-16","order":16,"dimension":"SA2","type":"choice","weight":1.2,"direction":"reverse","text":"他说要和朋友出去玩，可能很晚回来，叫你不用等他。你的感受？","scene":null,"options":[{"key":"A","text":"好啊，我也去做自己的事","sub":"低焦虑，独立感强","score":5},{"key":"B","text":"有点想他，但理解，等他回来再聊","sub":"健康依恋，情感真实","score":4},{"key":"C","text":"嘴上说好，但心里有点空，一直刷手机等他","sub":"焦虑在低鸣","score":2},{"key":"D","text":"开始想他在和谁玩，为什么不带我","sub":"焦虑带控制倾向","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA3-F-17', 17, 'SA3', 'choice', 1.5, 'reverse', '你们在一起三个月了，他说想每天睡前通话，保持更多联系。你的第一感受是？', '{"scene":null,"options":[{"key":"A","text":"挺好的，我也喜欢这样","sub":"低回避，接受亲密","score":5},{"key":"B","text":"可以试试，看看习不习惯","sub":"中低回避，开放谨慎","score":4},{"key":"C","text":"有点压力，但不好意思说","sub":"中高回避，压抑感受","score":2},{"key":"D","text":"觉得有点窒息，想保留更多自己的空间","sub":"高回避，亲密触发不适","score":1}],"source_question":{"id":"SA3-F-17","order":17,"dimension":"SA3","type":"choice","weight":1.5,"direction":"reverse","text":"你们在一起三个月了，他说想每天睡前通话，保持更多联系。你的第一感受是？","scene":null,"options":[{"key":"A","text":"挺好的，我也喜欢这样","sub":"低回避，接受亲密","score":5},{"key":"B","text":"可以试试，看看习不习惯","sub":"中低回避，开放谨慎","score":4},{"key":"C","text":"有点压力，但不好意思说","sub":"中高回避，压抑感受","score":2},{"key":"D","text":"觉得有点窒息，想保留更多自己的空间","sub":"高回避，亲密触发不适","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA3-F-18', 18, 'SA3', 'mood', 1.5, 'reverse', '他第一次跟你说「我爱你」，你的第一反应是？', '{"options":[{"key":"A","icon":"ti-heart","text":"我也爱你，说得很自然","score":5},{"key":"B","icon":"ti-mood-happy","text":"心里很暖，回了他","score":5},{"key":"C","icon":"ti-mood-smile","text":"有点开心，但说不出口，笑了笑","score":4},{"key":"D","icon":"ti-mood-confuzed","text":"有点懵，不确定该怎么回应","score":3},{"key":"E","icon":"ti-mood-nervous","text":"心跳加速，但感觉有点慌","score":3},{"key":"F","icon":"ti-mood-empty","text":"突然想保持一点距离","score":1},{"key":"G","icon":"ti-mood-suprised","text":"觉得太快了，有点不舒服","score":1},{"key":"H","icon":"ti-mood-tongue","text":"开了个玩笑转移话题","score":2}],"source_question":{"id":"SA3-F-18","order":18,"dimension":"SA3","type":"mood","weight":1.5,"direction":"reverse","text":"他第一次跟你说「我爱你」，你的第一反应是？","options":[{"key":"A","icon":"ti-heart","text":"我也爱你，说得很自然","score":5},{"key":"B","icon":"ti-mood-happy","text":"心里很暖，回了他","score":5},{"key":"C","icon":"ti-mood-smile","text":"有点开心，但说不出口，笑了笑","score":4},{"key":"D","icon":"ti-mood-confuzed","text":"有点懵，不确定该怎么回应","score":3},{"key":"E","icon":"ti-mood-nervous","text":"心跳加速，但感觉有点慌","score":3},{"key":"F","icon":"ti-mood-empty","text":"突然想保持一点距离","score":1},{"key":"G","icon":"ti-mood-suprised","text":"觉得太快了，有点不舒服","score":1},{"key":"H","icon":"ti-mood-tongue","text":"开了个玩笑转移话题","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA3-F-19', 19, 'SA3', 'likert', 1.5, 'reverse', '当关系变得越来越亲密，对方对我有强烈的情感需求时，我会感到一种想要后退的冲动。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"source_question":{"id":"SA3-F-19","order":19,"dimension":"SA3","type":"likert","weight":1.5,"direction":"reverse","text":"当关系变得越来越亲密，对方对我有强烈的情感需求时，我会感到一种想要后退的冲动。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA3-F-20', 20, 'SA3', 'choice', 1.2, 'reverse', '他情绪很低落，发消息跟你说他很难受，需要你陪他说说话。你的内心感受？', '{"scene":null,"options":[{"key":"A","text":"当然，我很想陪他，马上回复","sub":"低回避，情感可及","score":5},{"key":"B","text":"愿意陪，但不太知道说什么好","sub":"低回避，能力待提升","score":4},{"key":"C","text":"有点不知所措，感觉有压力","sub":"中等回避，情感负担","score":3},{"key":"D","text":"有点烦，觉得他太依赖我了","sub":"高回避，排斥需求","score":1}],"source_question":{"id":"SA3-F-20","order":20,"dimension":"SA3","type":"choice","weight":1.2,"direction":"reverse","text":"他情绪很低落，发消息跟你说他很难受，需要你陪他说说话。你的内心感受？","scene":null,"options":[{"key":"A","text":"当然，我很想陪他，马上回复","sub":"低回避，情感可及","score":5},{"key":"B","text":"愿意陪，但不太知道说什么好","sub":"低回避，能力待提升","score":4},{"key":"C","text":"有点不知所措，感觉有压力","sub":"中等回避，情感负担","score":3},{"key":"D","text":"有点烦，觉得他太依赖我了","sub":"高回避，排斥需求","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA3-F-21', 21, 'SA3', 'slider', 1.2, 'reverse', '在一段关系里，你愿意让对方了解你多少？', '{"slider":{"min":0,"max":100,"min_label":"我更愿意保留自己的私人世界","max_label":"我愿意完全敞开自己","feedback":[{"range":[0,20],"text":"你需要很强的安全感才会打开"},{"range":[21,40],"text":"你会有选择地分享，但有保留"},{"range":[41,60],"text":"你愿意分享，但有些部分是禁区"},{"range":[61,80],"text":"你比较愿意敞开，但需要时间"},{"range":[81,100],"text":"你在关系里能够真正放下防备"}]},"source_question":{"id":"SA3-F-21","order":21,"dimension":"SA3","type":"slider","weight":1.2,"direction":"reverse","text":"在一段关系里，你愿意让对方了解你多少？","slider":{"min":0,"max":100,"min_label":"我更愿意保留自己的私人世界","max_label":"我愿意完全敞开自己","feedback":[{"range":[0,20],"text":"你需要很强的安全感才会打开"},{"range":[21,40],"text":"你会有选择地分享，但有保留"},{"range":[41,60],"text":"你愿意分享，但有些部分是禁区"},{"range":[61,80],"text":"你比较愿意敞开，但需要时间"},{"range":[81,100],"text":"你在关系里能够真正放下防备"}]},"scoring":{"method":"reverse_slider","formula":"(100 - value) / 100 * 5"}}}'::jsonb, '{"method":"reverse_slider","formula":"(100 - value) / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA3-F-22', 22, 'SA3', 'likert', 1.2, 'reverse', '我不太习惯向对方表达我的脆弱或真实需求，觉得这样会让我显得不够独立。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA3-F-22","order":22,"dimension":"SA3","type":"likert","weight":1.2,"direction":"reverse","text":"我不太习惯向对方表达我的脆弱或真实需求，觉得这样会让我显得不够独立。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA3-F-23', 23, 'SA3', 'choice', 1.0, 'reverse', '你们关系很好，但他突然说想更深入了解你，包括你的过去、你的恐惧、你的软肋。你的感受？', '{"scene":null,"options":[{"key":"A","text":"愿意，我也想让他真正了解我","sub":"低回避，渴望被看见","score":5},{"key":"B","text":"愿意，但可能需要慢慢来","sub":"中低回避，有节奏感","score":4},{"key":"C","text":"有点不自在，但不知道怎么拒绝","sub":"中高回避，边界模糊","score":2},{"key":"D","text":"感觉太暴露了，想转移话题","sub":"高回避，保护壳厚","score":1}],"source_question":{"id":"SA3-F-23","order":23,"dimension":"SA3","type":"choice","weight":1.0,"direction":"reverse","text":"你们关系很好，但他突然说想更深入了解你，包括你的过去、你的恐惧、你的软肋。你的感受？","scene":null,"options":[{"key":"A","text":"愿意，我也想让他真正了解我","sub":"低回避，渴望被看见","score":5},{"key":"B","text":"愿意，但可能需要慢慢来","sub":"中低回避，有节奏感","score":4},{"key":"C","text":"有点不自在，但不知道怎么拒绝","sub":"中高回避，边界模糊","score":2},{"key":"D","text":"感觉太暴露了，想转移话题","sub":"高回避，保护壳厚","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA3-F-24', 24, 'SA3', 'mood', 1.0, 'reverse', '他说想见你的家人朋友，融入你的生活圈。你的感受？', '{"options":[{"key":"A","icon":"ti-heart","text":"很开心，正合我意","score":5},{"key":"B","icon":"ti-mood-happy","text":"挺好的，有点期待","score":5},{"key":"C","icon":"ti-mood-smile","text":"可以，但想先想想怎么安排","score":4},{"key":"D","icon":"ti-mood-confuzed","text":"有点没准备好","score":3},{"key":"E","icon":"ti-mood-nervous","text":"感觉太正式了，有点紧张","score":3},{"key":"F","icon":"ti-mood-empty","text":"有点不舒服，觉得进展太快","score":2},{"key":"G","icon":"ti-mood-sad","text":"感觉自己的空间被侵入了","score":1},{"key":"H","icon":"ti-mood-tongue","text":"还没到那一步吧","score":3}],"source_question":{"id":"SA3-F-24","order":24,"dimension":"SA3","type":"mood","weight":1.0,"direction":"reverse","text":"他说想见你的家人朋友，融入你的生活圈。你的感受？","options":[{"key":"A","icon":"ti-heart","text":"很开心，正合我意","score":5},{"key":"B","icon":"ti-mood-happy","text":"挺好的，有点期待","score":5},{"key":"C","icon":"ti-mood-smile","text":"可以，但想先想想怎么安排","score":4},{"key":"D","icon":"ti-mood-confuzed","text":"有点没准备好","score":3},{"key":"E","icon":"ti-mood-nervous","text":"感觉太正式了，有点紧张","score":3},{"key":"F","icon":"ti-mood-empty","text":"有点不舒服，觉得进展太快","score":2},{"key":"G","icon":"ti-mood-sad","text":"感觉自己的空间被侵入了","score":1},{"key":"H","icon":"ti-mood-tongue","text":"还没到那一步吧","score":3}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA4-F-25', 25, 'SA4', 'choice', 1.5, 'positive', '他说你最近对他不够好，态度有点冷淡，让你反省一下。但你觉得自己没有问题。你会怎么做？', '{"scene":null,"options":[{"key":"A","text":"认真反省，可能真的是我的问题","sub":"边界弱，容易被定义","score":1},{"key":"B","text":"听他说完，再表达自己的感受","sub":"边界健康，能倾听也能反驳","score":4},{"key":"C","text":"告诉他我不觉得自己有问题，说明我的立场","sub":"边界清晰，不轻易认错","score":5},{"key":"D","text":"不想争，但心里很不舒服，憋着","sub":"边界弱，压抑真实感受","score":2}],"source_question":{"id":"SA4-F-25","order":25,"dimension":"SA4","type":"choice","weight":1.5,"direction":"positive","text":"他说你最近对他不够好，态度有点冷淡，让你反省一下。但你觉得自己没有问题。你会怎么做？","scene":null,"options":[{"key":"A","text":"认真反省，可能真的是我的问题","sub":"边界弱，容易被定义","score":1},{"key":"B","text":"听他说完，再表达自己的感受","sub":"边界健康，能倾听也能反驳","score":4},{"key":"C","text":"告诉他我不觉得自己有问题，说明我的立场","sub":"边界清晰，不轻易认错","score":5},{"key":"D","text":"不想争，但心里很不舒服，憋着","sub":"边界弱，压抑真实感受","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA4-F-26', 26, 'SA4', 'likert', 1.5, 'positive', '我清楚地知道自己在关系里有哪些事是不可以接受的，而且我能直接说出来。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA4-F-26","order":26,"dimension":"SA4","type":"likert","weight":1.5,"direction":"positive","text":"我清楚地知道自己在关系里有哪些事是不可以接受的，而且我能直接说出来。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA4-F-27', 27, 'SA4', 'choice', 1.5, 'positive', '你们吵架，他说了一句很伤你的话，但很快道歉了说是气话。你会怎么处理？', '{"scene":null,"options":[{"key":"A","text":"接受道歉，过去就算了","sub":"边界弱，伤害被最小化","score":2},{"key":"B","text":"接受道歉，但告诉他这句话真的伤到我了","sub":"边界健康，有修复有表达","score":4},{"key":"C","text":"说清楚这句话我不能接受，下次不可以这样","sub":"边界清晰，有规则意识","score":5},{"key":"D","text":"嘴上说没事，但心里记住了","sub":"边界模糊，内外不一致","score":1}],"source_question":{"id":"SA4-F-27","order":27,"dimension":"SA4","type":"choice","weight":1.5,"direction":"positive","text":"你们吵架，他说了一句很伤你的话，但很快道歉了说是气话。你会怎么处理？","scene":null,"options":[{"key":"A","text":"接受道歉，过去就算了","sub":"边界弱，伤害被最小化","score":2},{"key":"B","text":"接受道歉，但告诉他这句话真的伤到我了","sub":"边界健康，有修复有表达","score":4},{"key":"C","text":"说清楚这句话我不能接受，下次不可以这样","sub":"边界清晰，有规则意识","score":5},{"key":"D","text":"嘴上说没事，但心里记住了","sub":"边界模糊，内外不一致","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA4-F-28', 28, 'SA4', 'rank', 1.2, 'positive', '在一段关系里，下面这些事你会优先守住哪个？从最重要到最不愿意妥协排序。', '{"items":[{"id":"a","text":"我的个人时间和空间"},{"id":"b","text":"我的朋友和社交圈"},{"id":"c","text":"我的工作和个人目标"},{"id":"d","text":"我对自己底线行为的标准"}],"source_question":{"id":"SA4-F-28","order":28,"dimension":"SA4","type":"rank","weight":1.2,"direction":"positive","text":"在一段关系里，下面这些事你会优先守住哪个？从最重要到最不愿意妥协排序。","items":[{"id":"a","text":"我的个人时间和空间"},{"id":"b","text":"我的朋友和社交圈"},{"id":"c","text":"我的工作和个人目标"},{"id":"d","text":"我对自己底线行为的标准"}],"scoring":{"method":"rank_position","key_item":"d","score_map":{"1st":5,"2nd":4,"3rd":3,"4th":2},"note":"底线排第一=5分，考察边界优先级"}}}'::jsonb, '{"method":"rank_position","key_item":"d","score_map":{"1st":5,"2nd":4,"3rd":3,"4th":2},"note":"底线排第一=5分，考察边界优先级"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA4-F-29', 29, 'SA4', 'choice', 1.5, 'positive', '他不喜欢你跟某个男性朋友来往，觉得不合适，希望你减少联系。那个朋友确实只是朋友。你会？', '{"scene":null,"options":[{"key":"A","text":"减少联系，不想因为这个让他不舒服","sub":"边界弱，社交被管控","score":1},{"key":"B","text":"跟他解释清楚，但不保证减少联系","sub":"边界中等，有沟通","score":3},{"key":"C","text":"告诉他这是我的朋友，我不会因为他的不安全感改变我的社交","sub":"边界清晰，自主性强","score":5},{"key":"D","text":"表面答应，实际上没有改变","sub":"边界弱，回避冲突","score":2}],"source_question":{"id":"SA4-F-29","order":29,"dimension":"SA4","type":"choice","weight":1.5,"direction":"positive","text":"他不喜欢你跟某个男性朋友来往，觉得不合适，希望你减少联系。那个朋友确实只是朋友。你会？","scene":null,"options":[{"key":"A","text":"减少联系，不想因为这个让他不舒服","sub":"边界弱，社交被管控","score":1},{"key":"B","text":"跟他解释清楚，但不保证减少联系","sub":"边界中等，有沟通","score":3},{"key":"C","text":"告诉他这是我的朋友，我不会因为他的不安全感改变我的社交","sub":"边界清晰，自主性强","score":5},{"key":"D","text":"表面答应，实际上没有改变","sub":"边界弱，回避冲突","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA4-F-30', 30, 'SA4', 'likert', 1.5, 'positive', '当对方越过我的边界时，我能够直接说出来，而不是忍着、绕弯子或事后抱怨。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA4-F-30","order":30,"dimension":"SA4","type":"likert","weight":1.5,"direction":"positive","text":"当对方越过我的边界时，我能够直接说出来，而不是忍着、绕弯子或事后抱怨。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA4-F-31', 31, 'SA4', 'choice', 1.2, 'positive', '他希望你改变某个你一直以来的生活习惯，说这样对你们关系更好。但你很喜欢这个习惯。你会？', '{"scene":null,"options":[{"key":"A","text":"认真考虑改变，关系比习惯重要","sub":"边界弱，自我让步大","score":2},{"key":"B","text":"听他的理由，但最终自己决定要不要改","sub":"边界健康，保留自主权","score":4},{"key":"C","text":"告诉他这是我的习惯，他需要接受这部分的我","sub":"边界清晰，自我定义稳定","score":5},{"key":"D","text":"暂时答应，但内心很不情愿","sub":"边界弱，压抑真实意愿","score":1}],"source_question":{"id":"SA4-F-31","order":31,"dimension":"SA4","type":"choice","weight":1.2,"direction":"positive","text":"他希望你改变某个你一直以来的生活习惯，说这样对你们关系更好。但你很喜欢这个习惯。你会？","scene":null,"options":[{"key":"A","text":"认真考虑改变，关系比习惯重要","sub":"边界弱，自我让步大","score":2},{"key":"B","text":"听他的理由，但最终自己决定要不要改","sub":"边界健康，保留自主权","score":4},{"key":"C","text":"告诉他这是我的习惯，他需要接受这部分的我","sub":"边界清晰，自我定义稳定","score":5},{"key":"D","text":"暂时答应，但内心很不情愿","sub":"边界弱，压抑真实意愿","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA4-F-32', 32, 'SA4', 'likert', 1.2, 'positive', '我不会为了维持一段关系，而一再妥协掉自己的核心需求或底线。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA4-F-32","order":32,"dimension":"SA4","type":"likert","weight":1.2,"direction":"positive","text":"我不会为了维持一段关系，而一再妥协掉自己的核心需求或底线。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA5-F-33', 33, 'SA5', 'choice', 1.5, 'positive', '你们因为一件小事起了争执，你很生气。你通常怎么处理？', '{"scene":null,"options":[{"key":"A","text":"直接说出我的感受，但尽量控制语气","sub":"情绪健康表达","score":5},{"key":"B","text":"先冷静一下，等情绪平了再说","sub":"有调节能力，节奏好","score":4},{"key":"C","text":"当下直接爆发，说完了又后悔","sub":"调节能力弱，冲动型","score":2},{"key":"D","text":"什么都不说，冷处理，等他来哄","sub":"回避型情绪处理","score":1}],"source_question":{"id":"SA5-F-33","order":33,"dimension":"SA5","type":"choice","weight":1.5,"direction":"positive","text":"你们因为一件小事起了争执，你很生气。你通常怎么处理？","scene":null,"options":[{"key":"A","text":"直接说出我的感受，但尽量控制语气","sub":"情绪健康表达","score":5},{"key":"B","text":"先冷静一下，等情绪平了再说","sub":"有调节能力，节奏好","score":4},{"key":"C","text":"当下直接爆发，说完了又后悔","sub":"调节能力弱，冲动型","score":2},{"key":"D","text":"什么都不说，冷处理，等他来哄","sub":"回避型情绪处理","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA5-F-34', 34, 'SA5', 'slider', 1.5, 'positive', '当你在关系里感到受伤或委屈，你有多大能力用语言表达出来，而不是靠冷战或消失来传递信号？', '{"slider":{"min":0,"max":100,"min_label":"我很难开口，通常靠行动传递","max_label":"我能清楚地说出我的感受","feedback":[{"range":[0,20],"text":"你的情绪更多通过行为表达"},{"range":[21,40],"text":"你能说一些，但说不完整"},{"range":[41,60],"text":"看情况，有时能说有时说不出"},{"range":[61,80],"text":"你通常能表达，但有时还是会憋"},{"range":[81,100],"text":"你有能力把情绪转化成语言"}]},"source_question":{"id":"SA5-F-34","order":34,"dimension":"SA5","type":"slider","weight":1.5,"direction":"positive","text":"当你在关系里感到受伤或委屈，你有多大能力用语言表达出来，而不是靠冷战或消失来传递信号？","slider":{"min":0,"max":100,"min_label":"我很难开口，通常靠行动传递","max_label":"我能清楚地说出我的感受","feedback":[{"range":[0,20],"text":"你的情绪更多通过行为表达"},{"range":[21,40],"text":"你能说一些，但说不完整"},{"range":[41,60],"text":"看情况，有时能说有时说不出"},{"range":[61,80],"text":"你通常能表达，但有时还是会憋"},{"range":[81,100],"text":"你有能力把情绪转化成语言"}]},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA5-F-35', 35, 'SA5', 'likert', 1.5, 'positive', '我不会把工作、家庭或其他压力带来的情绪，发泄到伴侣身上。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA5-F-35","order":35,"dimension":"SA5","type":"likert","weight":1.5,"direction":"positive","text":"我不会把工作、家庭或其他压力带来的情绪，发泄到伴侣身上。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA5-F-36', 36, 'SA5', 'choice', 1.2, 'positive', '你工作上遇到了很糟糕的事，心情很差。当天晚上他说了一句无心的话，你的反应是？', '{"scene":null,"options":[{"key":"A","text":"告诉他我今天状态不好，这句话让我不舒服","sub":"情绪清晰，能区分来源","score":5},{"key":"B","text":"比平时更敏感，有点过度反应，事后意识到了","sub":"有觉察，控制力有限","score":3},{"key":"C","text":"直接爆发，事后才知道是因为工作的事","sub":"情绪迁移，觉察晚","score":2},{"key":"D","text":"没说什么，但心里记了很久","sub":"积压型，不表达","score":2}],"source_question":{"id":"SA5-F-36","order":36,"dimension":"SA5","type":"choice","weight":1.2,"direction":"positive","text":"你工作上遇到了很糟糕的事，心情很差。当天晚上他说了一句无心的话，你的反应是？","scene":null,"options":[{"key":"A","text":"告诉他我今天状态不好，这句话让我不舒服","sub":"情绪清晰，能区分来源","score":5},{"key":"B","text":"比平时更敏感，有点过度反应，事后意识到了","sub":"有觉察，控制力有限","score":3},{"key":"C","text":"直接爆发，事后才知道是因为工作的事","sub":"情绪迁移，觉察晚","score":2},{"key":"D","text":"没说什么，但心里记了很久","sub":"积压型，不表达","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA5-F-37', 37, 'SA5', 'mood', 1.2, 'positive', '他做了一件让你很失望的事，但你知道他不是故意的。你现在的状态？', '{"options":[{"key":"A","icon":"ti-mood-smile","text":"理解他，失望但没放心上","score":4},{"key":"B","icon":"ti-mood-confuzed","text":"有点难受，不确定要不要说","score":2},{"key":"C","icon":"ti-mood-sad","text":"很失望，跟他说了我的感受","score":5},{"key":"D","icon":"ti-mood-nervous","text":"很在意，但怕说了他不高兴","score":2},{"key":"E","icon":"ti-mood-angry","text":"很生气，忍不住表现出来了","score":2},{"key":"F","icon":"ti-mood-empty","text":"心里有个结，说不出来","score":1},{"key":"G","icon":"ti-mood-suprised","text":"直接说了，然后就放下了","score":5},{"key":"H","icon":"ti-mood-tongue","text":"没事，过了就过了","score":3}],"source_question":{"id":"SA5-F-37","order":37,"dimension":"SA5","type":"mood","weight":1.2,"direction":"positive","text":"他做了一件让你很失望的事，但你知道他不是故意的。你现在的状态？","options":[{"key":"A","icon":"ti-mood-smile","text":"理解他，失望但没放心上","score":4},{"key":"B","icon":"ti-mood-confuzed","text":"有点难受，不确定要不要说","score":2},{"key":"C","icon":"ti-mood-sad","text":"很失望，跟他说了我的感受","score":5},{"key":"D","icon":"ti-mood-nervous","text":"很在意，但怕说了他不高兴","score":2},{"key":"E","icon":"ti-mood-angry","text":"很生气，忍不住表现出来了","score":2},{"key":"F","icon":"ti-mood-empty","text":"心里有个结，说不出来","score":1},{"key":"G","icon":"ti-mood-suprised","text":"直接说了，然后就放下了","score":5},{"key":"H","icon":"ti-mood-tongue","text":"没事，过了就过了","score":3}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA5-F-38', 38, 'SA5', 'slider', 1.2, 'positive', '在关系里发生冲突时，你保持情绪稳定、不失控的能力有多强？', '{"slider":{"min":0,"max":100,"min_label":"我很难控制，容易崩","max_label":"我通常能保持相对冷静","feedback":[{"range":[0,20],"text":"冲突是你最难处理的时刻"},{"range":[21,40],"text":"你会有情绪，但不总是能控制"},{"range":[41,60],"text":"你能撑一会儿，但时间长了会崩"},{"range":[61,80],"text":"你通常能保持，偶尔失控"},{"range":[81,100],"text":"你有较强的情绪容纳能力"}]},"source_question":{"id":"SA5-F-38","order":38,"dimension":"SA5","type":"slider","weight":1.2,"direction":"positive","text":"在关系里发生冲突时，你保持情绪稳定、不失控的能力有多强？","slider":{"min":0,"max":100,"min_label":"我很难控制，容易崩","max_label":"我通常能保持相对冷静","feedback":[{"range":[0,20],"text":"冲突是你最难处理的时刻"},{"range":[21,40],"text":"你会有情绪，但不总是能控制"},{"range":[41,60],"text":"你能撑一会儿，但时间长了会崩"},{"range":[61,80],"text":"你通常能保持，偶尔失控"},{"range":[81,100],"text":"你有较强的情绪容纳能力"}]},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA5-F-39', 39, 'SA5', 'likert', 1.5, 'positive', '当关系中出现矛盾时，我能够在情绪相对平稳的状态下表达我的感受，而不是爆发或完全沉默。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA5-F-39","order":39,"dimension":"SA5","type":"likert","weight":1.5,"direction":"positive","text":"当关系中出现矛盾时，我能够在情绪相对平稳的状态下表达我的感受，而不是爆发或完全沉默。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA5-F-40', 40, 'SA5', 'choice', 1.2, 'positive', '你们冷战了一天，他一直没有主动。你的处理方式通常是？', '{"scene":null,"options":[{"key":"A","text":"如果我也有问题，我会先开口，不管谁先动","sub":"情绪成熟，能放下自尊","score":5},{"key":"B","text":"等他先开口，但我愿意认真沟通","sub":"有些执着，但能修复","score":3},{"key":"C","text":"一直等，就看谁先撑不住","sub":"冷战作为工具","score":2},{"key":"D","text":"假装和好，但真正的问题没有解决","sub":"回避型修复，表面化","score":1}],"source_question":{"id":"SA5-F-40","order":40,"dimension":"SA5","type":"choice","weight":1.2,"direction":"positive","text":"你们冷战了一天，他一直没有主动。你的处理方式通常是？","scene":null,"options":[{"key":"A","text":"如果我也有问题，我会先开口，不管谁先动","sub":"情绪成熟，能放下自尊","score":5},{"key":"B","text":"等他先开口，但我愿意认真沟通","sub":"有些执着，但能修复","score":3},{"key":"C","text":"一直等，就看谁先撑不住","sub":"冷战作为工具","score":2},{"key":"D","text":"假装和好，但真正的问题没有解决","sub":"回避型修复，表面化","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA5-F-41', 41, 'SA5', 'likert', 1.5, 'positive', '当我感到受伤或委屈时，我能够用语言表达，而不是用冷战、消失或其他间接方式来回应。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA5-F-41","order":41,"dimension":"SA5","type":"likert","weight":1.5,"direction":"positive","text":"当我感到受伤或委屈时，我能够用语言表达，而不是用冷战、消失或其他间接方式来回应。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA6-F-42', 42, 'SA6', 'rank', 1, 'auxiliary', '当你喜欢一个人，你最先在意的是什么？从最重要到最不重要排序。', '{"items":[{"id":"a","text":"他对我有没有真实的吸引力"},{"id":"b","text":"他在我生命里能不能给我安全感"},{"id":"c","text":"我们之间有没有共同的未来"},{"id":"d","text":"在一起的感觉好不好，舒不舒服"}],"source_question":{"id":"SA6-F-42","order":42,"dimension":"SA6","type":"rank","weight":null,"direction":"auxiliary","text":"当你喜欢一个人，你最先在意的是什么？从最重要到最不重要排序。","items":[{"id":"a","text":"他对我有没有真实的吸引力"},{"id":"b","text":"他在我生命里能不能给我安全感"},{"id":"c","text":"我们之间有没有共同的未来"},{"id":"d","text":"在一起的感觉好不好，舒不舒服"}],"scoring":{"method":"auxiliary_type","note":"用于判断投入驱动类型，辅助结果解读，不计入SA6分数"}}}'::jsonb, '{"method":"auxiliary_type","note":"用于判断投入驱动类型，辅助结果解读，不计入SA6分数"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA6-F-43', 43, 'SA6', 'choice', 1.5, 'positive', '一段关系里，你发现自己付出比对方多很多。你通常怎么面对这件事？', '{"scene":null,"options":[{"key":"A","text":"告诉他我的感受，希望他有所改变","sub":"边界健康，能表达需求","score":5},{"key":"B","text":"继续付出，觉得只要他好就够了","sub":"低自我投入模式","score":1},{"key":"C","text":"开始质疑这段关系，考虑是否值得","sub":"有自我保护意识","score":4},{"key":"D","text":"减少自己的付出，看他的反应","sub":"测试型策略，有防御","score":3}],"source_question":{"id":"SA6-F-43","order":43,"dimension":"SA6","type":"choice","weight":1.5,"direction":"positive","text":"一段关系里，你发现自己付出比对方多很多。你通常怎么面对这件事？","scene":null,"options":[{"key":"A","text":"告诉他我的感受，希望他有所改变","sub":"边界健康，能表达需求","score":5},{"key":"B","text":"继续付出，觉得只要他好就够了","sub":"低自我投入模式","score":1},{"key":"C","text":"开始质疑这段关系，考虑是否值得","sub":"有自我保护意识","score":4},{"key":"D","text":"减少自己的付出，看他的反应","sub":"测试型策略，有防御","score":3}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA6-F-44', 44, 'SA6', 'likert', 1.5, 'positive', '我在关系中的投入是有意识的，而不是因为害怕孤独、外部压力或惯性。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA6-F-44","order":44,"dimension":"SA6","type":"likert","weight":1.5,"direction":"positive","text":"我在关系中的投入是有意识的，而不是因为害怕孤独、外部压力或惯性。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA6-F-45', 45, 'SA6', 'choice', 1.5, 'positive', '自从在一起，你发现自己越来越少做之前喜欢的事，朋友也见得少了。你怎么看这件事？', '{"scene":null,"options":[{"key":"A","text":"这是自然的，重心转移到关系上很正常","sub":"自我消融倾向","score":2},{"key":"B","text":"有点意识到，但不确定要不要改变","sub":"觉察但行动力弱","score":3},{"key":"C","text":"意识到了，主动在找回自己的生活节奏","sub":"自我意识强，有行动","score":5},{"key":"D","text":"不觉得有问题，喜欢全心投入的感觉","sub":"关系中心化，边界弱","score":1}],"source_question":{"id":"SA6-F-45","order":45,"dimension":"SA6","type":"choice","weight":1.5,"direction":"positive","text":"自从在一起，你发现自己越来越少做之前喜欢的事，朋友也见得少了。你怎么看这件事？","scene":null,"options":[{"key":"A","text":"这是自然的，重心转移到关系上很正常","sub":"自我消融倾向","score":2},{"key":"B","text":"有点意识到，但不确定要不要改变","sub":"觉察但行动力弱","score":3},{"key":"C","text":"意识到了，主动在找回自己的生活节奏","sub":"自我意识强，有行动","score":5},{"key":"D","text":"不觉得有问题，喜欢全心投入的感觉","sub":"关系中心化，边界弱","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA6-F-46', 46, 'SA6', 'rank', 1, 'auxiliary', '你理想中的一段关系，是什么样的？从最接近你的理想到最不重要排序。', '{"items":[{"id":"a","text":"我们是彼此最重要的人，紧密相连"},{"id":"b","text":"我们各有各的生活，但感情很深"},{"id":"c","text":"我们一起成长，互相推动变得更好"},{"id":"d","text":"我们在一起很舒服，没有太多要求"}],"source_question":{"id":"SA6-F-46","order":46,"dimension":"SA6","type":"rank","weight":null,"direction":"auxiliary","text":"你理想中的一段关系，是什么样的？从最接近你的理想到最不重要排序。","items":[{"id":"a","text":"我们是彼此最重要的人，紧密相连"},{"id":"b","text":"我们各有各的生活，但感情很深"},{"id":"c","text":"我们一起成长，互相推动变得更好"},{"id":"d","text":"我们在一起很舒服，没有太多要求"}],"scoring":{"method":"auxiliary_type","note":"b排第一=高自主性，辅助SA6类型判断"}}}'::jsonb, '{"method":"auxiliary_type","note":"b排第一=高自主性，辅助SA6类型判断"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA6-F-47', 47, 'SA6', 'slider', 1.5, 'positive', '在一段关系里，你有多能保持自己原本的生活重心——朋友、目标、兴趣？', '{"slider":{"min":0,"max":100,"min_label":"我容易把全部重心放在关系上","max_label":"我能很好地保持自己的生活","feedback":[{"range":[0,20],"text":"你倾向于把关系放在一切之上"},{"range":[21,40],"text":"你有时候会迷失在关系里"},{"range":[41,60],"text":"你能保持一部分，但关系会影响你"},{"range":[61,80],"text":"你大多数时候能守住自己的生活"},{"range":[81,100],"text":"你在关系里同时也活得很完整"}]},"source_question":{"id":"SA6-F-47","order":47,"dimension":"SA6","type":"slider","weight":1.5,"direction":"positive","text":"在一段关系里，你有多能保持自己原本的生活重心——朋友、目标、兴趣？","slider":{"min":0,"max":100,"min_label":"我容易把全部重心放在关系上","max_label":"我能很好地保持自己的生活","feedback":[{"range":[0,20],"text":"你倾向于把关系放在一切之上"},{"range":[21,40],"text":"你有时候会迷失在关系里"},{"range":[41,60],"text":"你能保持一部分，但关系会影响你"},{"range":[61,80],"text":"你大多数时候能守住自己的生活"},{"range":[81,100],"text":"你在关系里同时也活得很完整"}]},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA6-F-48', 48, 'SA6', 'likert', 1.5, 'positive', '我能够在关系中保持自我，不会因为喜欢一个人就失去自己的生活重心、朋友圈或个人目标。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA6-F-48","order":48,"dimension":"SA6","type":"likert","weight":1.5,"direction":"positive","text":"我能够在关系中保持自我，不会因为喜欢一个人就失去自己的生活重心、朋友圈或个人目标。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA6-F-49', 49, 'SA6', 'choice', 1.0, 'positive', '你对自己在过去关系里出现过的模式，有多少了解？', '{"scene":null,"options":[{"key":"A","text":"我很清楚自己的问题，也在有意识地改变","sub":"高自我觉察，成长型","score":5},{"key":"B","text":"我大概知道，但不确定怎么改","sub":"有觉察，执行力待提升","score":3},{"key":"C","text":"我觉得问题都在对方，跟我关系不大","sub":"低自我觉察，归因外部","score":1},{"key":"D","text":"我不太回顾过去的关系，想往前看","sub":"回避型自我认知","score":2}],"source_question":{"id":"SA6-F-49","order":49,"dimension":"SA6","type":"choice","weight":1.0,"direction":"positive","text":"你对自己在过去关系里出现过的模式，有多少了解？","scene":null,"options":[{"key":"A","text":"我很清楚自己的问题，也在有意识地改变","sub":"高自我觉察，成长型","score":5},{"key":"B","text":"我大概知道，但不确定怎么改","sub":"有觉察，执行力待提升","score":3},{"key":"C","text":"我觉得问题都在对方，跟我关系不大","sub":"低自我觉察，归因外部","score":1},{"key":"D","text":"我不太回顾过去的关系，想往前看","sub":"回避型自我认知","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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
SELECT s.id, 'SA6-F-50', 50, 'SA6', 'rank', 1, 'auxiliary', '如果用四个词描述你在关系里的状态，你会怎么排？从最像你到最不像你。', '{"items":[{"id":"a","text":"我是付出更多的那个"},{"id":"b","text":"我是需要更多确认的那个"},{"id":"c","text":"我是更独立、更难靠近的那个"},{"id":"d","text":"我是比较能掌控自己情绪的那个"}],"source_question":{"id":"SA6-F-50","order":50,"dimension":"SA6","type":"rank","weight":null,"direction":"auxiliary","text":"如果用四个词描述你在关系里的状态，你会怎么排？从最像你到最不像你。","items":[{"id":"a","text":"我是付出更多的那个"},{"id":"b","text":"我是需要更多确认的那个"},{"id":"c","text":"我是更独立、更难靠近的那个"},{"id":"d","text":"我是比较能掌控自己情绪的那个"}],"scoring":{"method":"auxiliary_type","mapping":{"a_first":"SA6低自我倾向 → 袭人方向","b_first":"SA2高焦虑倾向 → 林黛玉方向","c_first":"SA3高回避倾向 → 妙玉方向","d_first":"SA5高调节能力 → 薛宝钗/王熙凤方向"},"note":"辅助类型判断，不计入SA6分数"}}}'::jsonb, '{"method":"auxiliary_type","mapping":{"a_first":"SA6低自我倾向 → 袭人方向","b_first":"SA2高焦虑倾向 → 林黛玉方向","c_first":"SA3高回避倾向 → 妙玉方向","d_first":"SA5高调节能力 → 薛宝钗/王熙凤方向"},"note":"辅助类型判断，不计入SA6分数"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_female'
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


-- Source: suite1_male.json

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA1', '自我吸引感知', 'SELF_ATTACHMENT', '自我关系模式', 1, '{"label":"自我吸引感知","direction":"positive","formula":"weighted_avg * 20","weight_sum":7.1}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA2', '依恋焦虑', 'SELF_ATTACHMENT', '自我关系模式', 2, '{"label":"依恋焦虑","direction":"reverse","formula":"weighted_avg * 20","weight_sum":13.6}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA3', '依恋回避', 'SELF_ATTACHMENT', '自我关系模式', 3, '{"label":"依恋回避","direction":"reverse","formula":"weighted_avg * 20","weight_sum":10.1}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA4', '自我边界', 'SELF_ATTACHMENT', '自我关系模式', 4, '{"label":"自我边界","direction":"positive","formula":"weighted_avg * 20","weight_sum":11.1}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA5', '情绪调节', 'SELF_ATTACHMENT', '自我关系模式', 5, '{"label":"情绪调节","direction":"positive","formula":"weighted_avg * 20","weight_sum":12.3}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)
VALUES ('SA6', '关系投入模式', 'SELF_ATTACHMENT', '自我关系模式', 6, '{"label":"关系投入模式","direction":"positive","formula":"weighted_avg * 20","weight_sum":8.5,"auxiliary_questions":["SA6-M-42","SA6-M-46","SA6-M-50"]}'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  layer_code = EXCLUDED.layer_code,
  layer_name = EXCLUDED.layer_name,
  display_order = EXCLUDED.display_order,
  config = public.metric_dimensions.config || EXCLUDED.config,
  updated_at = now();

INSERT INTO public.test_suites (slug, name, version, gender, total_questions, estimated_minutes, is_free, is_active, source_suite_config)
VALUES ('s01_self_male', '自我关系模式测试', '1.0', 'male'::public.test_gender, 50, 12, true, true, '{"id":"S01_SELF_MALE","name":"自我关系模式测试","gender":"male","version":"1.0","total_questions":50,"estimated_minutes":12,"is_free":true,"dimensions":["SA1","SA2","SA3","SA4","SA5","SA6"],"result_types":["贾探春","贾宝玉","柳湘莲","贾雨村","北静王","蒋玉菡"],"question_types_used":["choice","scale","slider","mood","rank","binary","card","scenario"]}'::jsonb)
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
SELECT id, 'ROS_V3', '1.0', '{"SA1":{"label":"自我吸引感知","direction":"positive","formula":"weighted_avg * 20","weights":{"SA1-M-01":1.2,"SA1-M-02":1.5,"SA1-M-03":1.0,"SA1-M-04":1.2,"SA1-M-05":1.0,"SA1-M-06":1.2},"weight_sum":7.1},"SA2":{"label":"依恋焦虑","direction":"reverse","formula":"weighted_avg * 20","weights":{"SA2-M-07":1.5,"SA2-M-08":1.5,"SA2-M-09":1.2,"SA2-M-10":1.5,"SA2-M-11":1.2,"SA2-M-12":1.0,"SA2-M-13":1.5,"SA2-M-14":1.5,"SA2-M-15":1.5,"SA2-M-16":1.2},"weight_sum":13.6},"SA3":{"label":"依恋回避","direction":"reverse","formula":"weighted_avg * 20","weights":{"SA3-M-17":1.5,"SA3-M-18":1.5,"SA3-M-19":1.5,"SA3-M-20":1.2,"SA3-M-21":1.2,"SA3-M-22":1.2,"SA3-M-23":1.0,"SA3-M-24":1.0},"weight_sum":10.1},"SA4":{"label":"自我边界","direction":"positive","formula":"weighted_avg * 20","weights":{"SA4-M-25":1.5,"SA4-M-26":1.5,"SA4-M-27":1.5,"SA4-M-28":1.2,"SA4-M-29":1.5,"SA4-M-30":1.5,"SA4-M-31":1.2,"SA4-M-32":1.2},"weight_sum":11.1},"SA5":{"label":"情绪调节","direction":"positive","formula":"weighted_avg * 20","weights":{"SA5-M-33":1.5,"SA5-M-34":1.5,"SA5-M-35":1.5,"SA5-M-36":1.2,"SA5-M-37":1.2,"SA5-M-38":1.2,"SA5-M-39":1.5,"SA5-M-40":1.2,"SA5-M-41":1.5},"weight_sum":12.3},"SA6":{"label":"关系投入模式","direction":"positive","formula":"weighted_avg * 20","weights":{"SA6-M-43":1.5,"SA6-M-44":1.5,"SA6-M-45":1.5,"SA6-M-47":1.5,"SA6-M-48":1.5,"SA6-M-49":1.0},"weight_sum":8.5,"auxiliary_questions":["SA6-M-42","SA6-M-46","SA6-M-50"]}}'::jsonb, '{"primary":[{"condition":"SA2 < 45 && SA3 < 45","type":"贾雨村","attachment":"混合型"},{"condition":"SA2 < 45 && SA3 >= 60","type":"贾宝玉","attachment":"焦虑型"},{"condition":"SA2 >= 60 && SA3 < 45","type":"柳湘莲","attachment":"回避型"},{"condition":"SA2 >= 60 && SA3 >= 60","type":"贾探春","attachment":"安全型"}],"override":[{"condition":"SA1 < 40","type":"蒋玉菡","note":"低自我高投入修正，优先级高于primary"},{"condition":"SA4 >= 80 && primary_type == ''贾探春''","type":"北静王","note":"高边界安全修正"}],"grey_zone":{"note":"SA2或SA3在45-60之间为灰色地带，保留primary类型但在报告中注明临界状态"}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB"}'::jsonb, true
FROM public.test_suites WHERE slug = 's01_self_male'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '贾探春', '贾探春', 'male'::public.test_gender, '{"attachment_type":"安全型","tagline":"你在感情里有一种天然的清醒","description":"你在感情里有一种天然的清醒。不将就、不消耗自己、懂得进退。你给的爱是有质量的——因为你从不从匮乏里给出去。","matching_logic":"清醒独立、有原则、不轻易依赖但真心投入、感情里的清醒者","radar_baseline":{"SA1":72,"SA2":75,"SA3":70,"SA4":78,"SA5":74,"SA6":68}}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's01_self_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '贾宝玉', '贾宝玉', 'male'::public.test_gender, '{"attachment_type":"焦虑型","tagline":"你是感情里最用心的那种人","description":"你是感情里最用心的那种人。在意每一个细节，记得每一句话。你的情感浓度是别人给不了的——只是你值得一个同样认真的人。","matching_logic":"情感浓烈、在意细节、害怕失去、记得每一句话的人","radar_baseline":{"SA1":58,"SA2":35,"SA3":65,"SA4":52,"SA5":48,"SA6":62}}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's01_self_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '柳湘莲', '柳湘莲', 'male'::public.test_gender, '{"attachment_type":"回避型","tagline":"你的独立是一种骨气，不是冷漠","description":"你的独立是一种骨气，不是冷漠。你不轻易动心，是因为你对感情有真正的标准。一旦你认定，就是全力以赴——只是这个人要配得上你的认定。","matching_logic":"独来独往、不轻易动情、骨子里重情义、一旦受伤彻底消失","radar_baseline":{"SA1":68,"SA2":72,"SA3":28,"SA4":74,"SA5":60,"SA6":55}}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's01_self_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '贾雨村', '贾雨村', 'male'::public.test_gender, '{"attachment_type":"混合型","tagline":"你的复杂是深度，不是问题","description":"你的复杂是深度，不是问题。你在感情里有很多面，时而投入时而抽离——那是因为你在真实地和自己相处。懂你的人，会爱上你的所有层次。","matching_logic":"入世又抽离、多面复杂、感情里有很多层、懂他的人才能爱上他的全部","radar_baseline":{"SA1":60,"SA2":42,"SA3":42,"SA4":55,"SA5":52,"SA6":58}}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's01_self_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '北静王', '北静王', 'male'::public.test_gender, '{"attachment_type":"高边界安全型","tagline":"你有一种天然的分寸感","description":"你有一种天然的分寸感。亲密而不失自我，投入但保持清醒。你不是不能爱，你只是不会为了爱而降低标准。这是成熟，不是距离。","matching_logic":"有分寸感、亲密而不失自我、投入但保持清醒、成熟不是距离","radar_baseline":{"SA1":75,"SA2":78,"SA3":72,"SA4":88,"SA5":76,"SA6":65}}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's01_self_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '蒋玉菡', '蒋玉菡', 'male'::public.test_gender, '{"attachment_type":"低自我高投入型","tagline":"你的深情是你最大的财富","description":"你的深情是你最大的财富。你爱起来是全心全意的，没有保留。你给的温柔是真实的重量，不是表演——只是别忘了，你自己也值得被这样对待。","matching_logic":"深情无保留、全心全意、温柔有重量、只是别忘了自己也值得被这样对待","radar_baseline":{"SA1":32,"SA2":38,"SA3":60,"SA4":35,"SA5":55,"SA6":45}}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's01_self_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'SA1-M-01', 1, 'SA1', 'binary', 1.2, 'positive', '喜欢一个人，但不确定她对你什么感觉。你更倾向于？', '{"options":[{"key":"left","text":"主动出击，表明态度","sub":"反正输了也知道结果","score":4},{"key":"right","text":"观察等待，找准时机","sub":"冒然行动容易搞砸","score":2}],"source_question":{"id":"SA1-M-01","order":1,"dimension":"SA1","type":"binary","weight":1.2,"direction":"positive","text":"喜欢一个人，但不确定她对你什么感觉。你更倾向于？","options":[{"key":"left","text":"主动出击，表明态度","sub":"反正输了也知道结果","score":4},{"key":"right","text":"观察等待，找准时机","sub":"冒然行动容易搞砸","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA1-M-02', 2, 'SA1', 'choice', 1.5, 'positive', '你喜欢的女生突然冷淡了，消息回得很慢。你脑子里第一个念头是？', '{"options":[{"key":"A","text":"是不是我最近哪里做得不对","sub":"先检讨自己","score":1},{"key":"B","text":"她可能有事，但我有点不安","sub":"理性但有情绪","score":2},{"key":"C","text":"她的状态跟我没直接关系，观察一下","sub":"能区分事件和自我","score":4},{"key":"D","text":"她不珍惜是她的事，我该干嘛干嘛","sub":"自我价值感稳定","score":5}],"source_question":{"id":"SA1-M-02","order":2,"dimension":"SA1","type":"choice","weight":1.5,"direction":"positive","text":"你喜欢的女生突然冷淡了，消息回得很慢。你脑子里第一个念头是？","options":[{"key":"A","text":"是不是我最近哪里做得不对","sub":"先检讨自己","score":1},{"key":"B","text":"她可能有事，但我有点不安","sub":"理性但有情绪","score":2},{"key":"C","text":"她的状态跟我没直接关系，观察一下","sub":"能区分事件和自我","score":4},{"key":"D","text":"她不珍惜是她的事，我该干嘛干嘛","sub":"自我价值感稳定","score":5}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA1-M-03', 3, 'SA1', 'slider', 1.0, 'positive', '走进一个全是陌生人的场合，你的内心状态是？', '{"slider":{"min":0,"max":100,"min_label":"我会很在意别人怎么看我","max_label":"我对自己的状态很笃定","feedback":[{"range":[0,20],"text":"陌生场合让你高度警觉"},{"range":[21,40],"text":"需要一点时间才能找到状态"},{"range":[41,60],"text":"看情况，有时自信有时不确定"},{"range":[61,80],"text":"通常能稳住自己"},{"range":[81,100],"text":"你不需要别人的眼光来定位自己"}]},"source_question":{"id":"SA1-M-03","order":3,"dimension":"SA1","type":"slider","weight":1.0,"direction":"positive","text":"走进一个全是陌生人的场合，你的内心状态是？","slider":{"min":0,"max":100,"min_label":"我会很在意别人怎么看我","max_label":"我对自己的状态很笃定","feedback":[{"range":[0,20],"text":"陌生场合让你高度警觉"},{"range":[21,40],"text":"需要一点时间才能找到状态"},{"range":[41,60],"text":"看情况，有时自信有时不确定"},{"range":[61,80],"text":"通常能稳住自己"},{"range":[81,100],"text":"你不需要别人的眼光来定位自己"}]},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA1-M-04', 4, 'SA1', 'card', 1.2, 'positive', '哥们告诉你，你前女友最近过得很好，新男友比你条件好很多。你的真实反应更接近哪张？', '{"options":[{"key":"A","text":"有点难受，脑子里开始比较","sub":"感觉自己差了一截","score":1},{"key":"B","text":"有点在意，但没影响心情太久","sub":"想了一下，过去了","score":3},{"key":"C","text":"替她高兴，跟我没什么关系了","sub":"各走各的路","score":4},{"key":"D","text":"那有什么，我也在往前走","sub":"自己的事更重要","score":5}],"source_question":{"id":"SA1-M-04","order":4,"dimension":"SA1","type":"card","weight":1.2,"direction":"positive","text":"哥们告诉你，你前女友最近过得很好，新男友比你条件好很多。你的真实反应更接近哪张？","options":[{"key":"A","text":"有点难受，脑子里开始比较","sub":"感觉自己差了一截","score":1},{"key":"B","text":"有点在意，但没影响心情太久","sub":"想了一下，过去了","score":3},{"key":"C","text":"替她高兴，跟我没什么关系了","sub":"各走各的路","score":4},{"key":"D","text":"那有什么，我也在往前走","sub":"自己的事更重要","score":5}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA1-M-05', 5, 'SA1', 'scale', 1.0, 'positive', '你相信自己对女生有真实的吸引力，不只是靠外表，也来自你这个人本身。', '{"scale":{"min":1,"max":5,"min_label":"完全不信","max_label":"非常确信"},"source_question":{"id":"SA1-M-05","order":5,"dimension":"SA1","type":"scale","weight":1.0,"direction":"positive","text":"你相信自己对女生有真实的吸引力，不只是靠外表，也来自你这个人本身。","scale":{"min":1,"max":5,"min_label":"完全不信","max_label":"非常确信"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA1-M-06', 6, 'SA1', 'binary', 1.2, 'positive', '被拒绝过一次之后，你对下一段感情的态度是？', '{"options":[{"key":"left","text":"该上就上，拒绝是正常的","sub":"失败了再试","score":5},{"key":"right","text":"会更谨慎，不想再被动","sub":"先确认信号再行动","score":2}],"source_question":{"id":"SA1-M-06","order":6,"dimension":"SA1","type":"binary","weight":1.2,"direction":"positive","text":"被拒绝过一次之后，你对下一段感情的态度是？","options":[{"key":"left","text":"该上就上，拒绝是正常的","sub":"失败了再试","score":5},{"key":"right","text":"会更谨慎，不想再被动","sub":"先确认信号再行动","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-07', 7, 'SA2', 'mood', 1.5, 'reverse', '发了条消息给她，两个小时没回。你的状态最接近？', '{"options":[{"key":"A","icon":"ti-mood-smile","text":"没事，她可能在忙","score":5},{"key":"B","icon":"ti-mood-confuzed","text":"有点奇怪，但没多想","score":4},{"key":"C","icon":"ti-mood-nervous","text":"开始回想最近有没有得罪她","score":2},{"key":"D","icon":"ti-mood-sad","text":"有点被晾着的感觉","score":3},{"key":"E","icon":"ti-mood-angry","text":"有点烦，觉得她不够重视","score":3},{"key":"F","icon":"ti-mood-suprised","text":"去翻她最近有没有发朋友圈","score":1},{"key":"G","icon":"ti-mood-empty","text":"开始想最坏的情况","score":1},{"key":"H","icon":"ti-mood-tongue","text":"随便，去干别的了","score":5}],"source_question":{"id":"SA2-M-07","order":7,"dimension":"SA2","type":"mood","weight":1.5,"direction":"reverse","text":"发了条消息给她，两个小时没回。你的状态最接近？","options":[{"key":"A","icon":"ti-mood-smile","text":"没事，她可能在忙","score":5},{"key":"B","icon":"ti-mood-confuzed","text":"有点奇怪，但没多想","score":4},{"key":"C","icon":"ti-mood-nervous","text":"开始回想最近有没有得罪她","score":2},{"key":"D","icon":"ti-mood-sad","text":"有点被晾着的感觉","score":3},{"key":"E","icon":"ti-mood-angry","text":"有点烦，觉得她不够重视","score":3},{"key":"F","icon":"ti-mood-suprised","text":"去翻她最近有没有发朋友圈","score":1},{"key":"G","icon":"ti-mood-empty","text":"开始想最坏的情况","score":1},{"key":"H","icon":"ti-mood-tongue","text":"随便，去干别的了","score":5}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-08', 8, 'SA2', 'binary', 1.5, 'reverse', '你们约好见面，她临时说有事取消。你的处理方式？', '{"options":[{"key":"left","text":"好的，改天再约","sub":"没放心上","score":5},{"key":"right","text":"追问一下是什么事","sub":"需要知道原因才安心","score":2}],"source_question":{"id":"SA2-M-08","order":8,"dimension":"SA2","type":"binary","weight":1.5,"direction":"reverse","text":"你们约好见面，她临时说有事取消。你的处理方式？","options":[{"key":"left","text":"好的，改天再约","sub":"没放心上","score":5},{"key":"right","text":"追问一下是什么事","sub":"需要知道原因才安心","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-09', 9, 'SA2', 'scale', 1.2, 'reverse', '当她一段时间没主动联系我，我会开始担心她是不是对我没兴趣了。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"总是"},"source_question":{"id":"SA2-M-09","order":9,"dimension":"SA2","type":"scale","weight":1.2,"direction":"reverse","text":"当她一段时间没主动联系我，我会开始担心她是不是对我没兴趣了。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"总是"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-10', 10, 'SA2', 'scenario', 1.5, 'reverse', '你们在一起两个月，关系不错。有天你刷到她跟一个你不认识的男生合照，底下还有几条互动评论。她没主动提起过这个人。你会怎么做？', '{"scene":"关系稳定期，突然发现未知社交","options":[{"key":"A","text":"没什么大不了，她有自己的社交","sub":"低焦虑，边界清晰","score":5},{"key":"B","text":"心里有点在意，但不会表现出来","sub":"轻微焦虑，能消化","score":4},{"key":"C","text":"找个机会自然地问一下她是谁","sub":"中等焦虑，有行动","score":3},{"key":"D","text":"直接问她这个人是谁，什么关系","sub":"高焦虑，需要确认","score":1}],"source_question":{"id":"SA2-M-10","order":10,"dimension":"SA2","type":"scenario","weight":1.5,"direction":"reverse","text":"你们在一起两个月，关系不错。有天你刷到她跟一个你不认识的男生合照，底下还有几条互动评论。她没主动提起过这个人。你会怎么做？","scene":"关系稳定期，突然发现未知社交","options":[{"key":"A","text":"没什么大不了，她有自己的社交","sub":"低焦虑，边界清晰","score":5},{"key":"B","text":"心里有点在意，但不会表现出来","sub":"轻微焦虑，能消化","score":4},{"key":"C","text":"找个机会自然地问一下她是谁","sub":"中等焦虑，有行动","score":3},{"key":"D","text":"直接问她这个人是谁，什么关系","sub":"高焦虑，需要确认","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-11', 11, 'SA2', 'slider', 1.2, 'reverse', '你需要多高频率的主动联系才能在关系里感到安心？', '{"slider":{"min":0,"max":100,"min_label":"有她就够了，不需要频繁联系","max_label":"需要每天高频互动才放心","feedback":[{"range":[0,20],"text":"你在关系里安全感很强"},{"range":[21,40],"text":"偶尔需要确认，但不依赖"},{"range":[41,60],"text":"中等需求，取决于关系质量"},{"range":[61,80],"text":"比较依赖稳定的联系"},{"range":[81,100],"text":"频繁互动是你的安全感来源"}]},"source_question":{"id":"SA2-M-11","order":11,"dimension":"SA2","type":"slider","weight":1.2,"direction":"reverse","text":"你需要多高频率的主动联系才能在关系里感到安心？","slider":{"min":0,"max":100,"min_label":"有她就够了，不需要频繁联系","max_label":"需要每天高频互动才放心","feedback":[{"range":[0,20],"text":"你在关系里安全感很强"},{"range":[21,40],"text":"偶尔需要确认，但不依赖"},{"range":[41,60],"text":"中等需求，取决于关系质量"},{"range":[61,80],"text":"比较依赖稳定的联系"},{"range":[81,100],"text":"频繁互动是你的安全感来源"}]},"scoring":{"method":"reverse_slider","formula":"(100 - value) / 100 * 5"}}}'::jsonb, '{"method":"reverse_slider","formula":"(100 - value) / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-12', 12, 'SA2', 'choice', 1.0, 'reverse', '她说今晚要和闺蜜出去，可能很晚，叫你不用等她。你的反应？', '{"options":[{"key":"A","text":"好啊，我也去做自己的事","sub":"低焦虑，独立感强","score":5},{"key":"B","text":"有点想她，但理解，等她回来再聊","sub":"健康依恋","score":4},{"key":"C","text":"嘴上说好，但心里有点空","sub":"焦虑在低鸣","score":2},{"key":"D","text":"开始想她跟谁出去，玩什么","sub":"焦虑带控制倾向","score":1}],"source_question":{"id":"SA2-M-12","order":12,"dimension":"SA2","type":"choice","weight":1.0,"direction":"reverse","text":"她说今晚要和闺蜜出去，可能很晚，叫你不用等她。你的反应？","options":[{"key":"A","text":"好啊，我也去做自己的事","sub":"低焦虑，独立感强","score":5},{"key":"B","text":"有点想她，但理解，等她回来再聊","sub":"健康依恋","score":4},{"key":"C","text":"嘴上说好，但心里有点空","sub":"焦虑在低鸣","score":2},{"key":"D","text":"开始想她跟谁出去，玩什么","sub":"焦虑带控制倾向","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-13', 13, 'SA2', 'scale', 1.5, 'reverse', '我有时候为了不让她不高兴，会压着自己真实的想法不说。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"source_question":{"id":"SA2-M-13","order":13,"dimension":"SA2","type":"scale","weight":1.5,"direction":"reverse","text":"我有时候为了不让她不高兴，会压着自己真实的想法不说。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-14', 14, 'SA2', 'scenario', 1.5, 'reverse', '你们吵架了，她说需要冷静，今晚不想说话。消息已读不回，头像也没动静。距离她说这句话已经过了三个小时。你现在怎么做？', '{"scene":"冷战三小时，对方无动静","options":[{"key":"A","text":"给她时间，我去做自己的事","sub":"低焦虑，尊重边界","score":5},{"key":"B","text":"忍着，但一直在看手机","sub":"中高焦虑，表面克制","score":3},{"key":"C","text":"发一条消息确认她还好","sub":"高焦虑，难以等待","score":2},{"key":"D","text":"越想越不对，开始担心是不是要分","sub":"极高焦虑，灾难化","score":1}],"source_question":{"id":"SA2-M-14","order":14,"dimension":"SA2","type":"scenario","weight":1.5,"direction":"reverse","text":"你们吵架了，她说需要冷静，今晚不想说话。消息已读不回，头像也没动静。距离她说这句话已经过了三个小时。你现在怎么做？","scene":"冷战三小时，对方无动静","options":[{"key":"A","text":"给她时间，我去做自己的事","sub":"低焦虑，尊重边界","score":5},{"key":"B","text":"忍着，但一直在看手机","sub":"中高焦虑，表面克制","score":3},{"key":"C","text":"发一条消息确认她还好","sub":"高焦虑，难以等待","score":2},{"key":"D","text":"越想越不对，开始担心是不是要分","sub":"极高焦虑，灾难化","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-15', 15, 'SA2', 'scale', 1.5, 'reverse', '在关系里，我需要她频繁确认感情，才能真正安心。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA2-M-15","order":15,"dimension":"SA2","type":"scale","weight":1.5,"direction":"reverse","text":"在关系里，我需要她频繁确认感情，才能真正安心。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA2-M-16', 16, 'SA2', 'mood', 1.2, 'reverse', '她发了条朋友圈，你点了赞，她没有回应。你的感受？', '{"options":[{"key":"A","icon":"ti-mood-smile","text":"没想那么多","score":5},{"key":"B","icon":"ti-mood-confuzed","text":"稍微注意到了，没放心上","score":4},{"key":"C","icon":"ti-mood-nervous","text":"有点在意，想着要不要说什么","score":3},{"key":"D","icon":"ti-mood-sad","text":"有点失落，感觉被忽视","score":2},{"key":"E","icon":"ti-mood-empty","text":"开始想她是不是不想理我","score":1},{"key":"F","icon":"ti-mood-angry","text":"有点不爽，觉得她不重视我","score":2},{"key":"G","icon":"ti-mood-happy","text":"无所谓，我又不是专门为她点的","score":5},{"key":"H","icon":"ti-mood-tongue","text":"根本没注意","score":5}],"source_question":{"id":"SA2-M-16","order":16,"dimension":"SA2","type":"mood","weight":1.2,"direction":"reverse","text":"她发了条朋友圈，你点了赞，她没有回应。你的感受？","options":[{"key":"A","icon":"ti-mood-smile","text":"没想那么多","score":5},{"key":"B","icon":"ti-mood-confuzed","text":"稍微注意到了，没放心上","score":4},{"key":"C","icon":"ti-mood-nervous","text":"有点在意，想着要不要说什么","score":3},{"key":"D","icon":"ti-mood-sad","text":"有点失落，感觉被忽视","score":2},{"key":"E","icon":"ti-mood-empty","text":"开始想她是不是不想理我","score":1},{"key":"F","icon":"ti-mood-angry","text":"有点不爽，觉得她不重视我","score":2},{"key":"G","icon":"ti-mood-happy","text":"无所谓，我又不是专门为她点的","score":5},{"key":"H","icon":"ti-mood-tongue","text":"根本没注意","score":5}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA3-M-17', 17, 'SA3', 'choice', 1.5, 'reverse', '你们在一起三个月，她说想每天睡前通话。你的第一感受？', '{"options":[{"key":"A","text":"挺好的，我也喜欢这样","sub":"低回避","score":5},{"key":"B","text":"可以试试，看看适不适合","sub":"中低回避","score":4},{"key":"C","text":"有点压力，但不好意思说","sub":"中高回避","score":2},{"key":"D","text":"觉得有点喘不过气，想保留空间","sub":"高回避","score":1}],"source_question":{"id":"SA3-M-17","order":17,"dimension":"SA3","type":"choice","weight":1.5,"direction":"reverse","text":"你们在一起三个月，她说想每天睡前通话。你的第一感受？","options":[{"key":"A","text":"挺好的，我也喜欢这样","sub":"低回避","score":5},{"key":"B","text":"可以试试，看看适不适合","sub":"中低回避","score":4},{"key":"C","text":"有点压力，但不好意思说","sub":"中高回避","score":2},{"key":"D","text":"觉得有点喘不过气，想保留空间","sub":"高回避","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA3-M-18', 18, 'SA3', 'binary', 1.5, 'reverse', '她第一次跟你说「我爱你」，你的本能反应更接近？', '{"options":[{"key":"left","text":"心里暖，自然地回了她","sub":"亲密感舒适","score":5},{"key":"right","text":"有点懵，说不出口，笑了笑","sub":"亲密感触发不适","score":1}],"source_question":{"id":"SA3-M-18","order":18,"dimension":"SA3","type":"binary","weight":1.5,"direction":"reverse","text":"她第一次跟你说「我爱你」，你的本能反应更接近？","options":[{"key":"left","text":"心里暖，自然地回了她","sub":"亲密感舒适","score":5},{"key":"right","text":"有点懵，说不出口，笑了笑","sub":"亲密感触发不适","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA3-M-19', 19, 'SA3', 'scale', 1.5, 'reverse', '当关系越来越亲密，她对我有很强的情感需求时，我会有一种想要后退的冲动。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"source_question":{"id":"SA3-M-19","order":19,"dimension":"SA3","type":"scale","weight":1.5,"direction":"reverse","text":"当关系越来越亲密，她对我有很强的情感需求时，我会有一种想要后退的冲动。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA3-M-20', 20, 'SA3', 'card', 1.2, 'reverse', '她情绪很差，发消息说很难受，需要你陪她聊聊。你的内心感受更接近哪张？', '{"options":[{"key":"A","text":"当然，马上回她","sub":"情感可及","score":5},{"key":"B","text":"愿意陪，但不太知道说什么好","sub":"有心无力","score":4},{"key":"C","text":"有点不知所措，感觉有压力","sub":"情感负担感","score":3},{"key":"D","text":"有点烦，觉得她太依赖我了","sub":"高回避","score":1}],"source_question":{"id":"SA3-M-20","order":20,"dimension":"SA3","type":"card","weight":1.2,"direction":"reverse","text":"她情绪很差，发消息说很难受，需要你陪她聊聊。你的内心感受更接近哪张？","options":[{"key":"A","text":"当然，马上回她","sub":"情感可及","score":5},{"key":"B","text":"愿意陪，但不太知道说什么好","sub":"有心无力","score":4},{"key":"C","text":"有点不知所措，感觉有压力","sub":"情感负担感","score":3},{"key":"D","text":"有点烦，觉得她太依赖我了","sub":"高回避","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA3-M-21', 21, 'SA3', 'slider', 1.2, 'reverse', '在一段关系里，你愿意让她了解你多少？', '{"slider":{"min":0,"max":100,"min_label":"我更愿意保留自己的私人世界","max_label":"我愿意完全敞开自己","feedback":[{"range":[0,20],"text":"需要很强的安全感才会打开"},{"range":[21,40],"text":"会有选择地分享，留有保留"},{"range":[41,60],"text":"愿意分享，但某些部分是禁区"},{"range":[61,80],"text":"比较愿意敞开，但需要时间"},{"range":[81,100],"text":"在关系里能真正放下防备"}]},"source_question":{"id":"SA3-M-21","order":21,"dimension":"SA3","type":"slider","weight":1.2,"direction":"reverse","text":"在一段关系里，你愿意让她了解你多少？","slider":{"min":0,"max":100,"min_label":"我更愿意保留自己的私人世界","max_label":"我愿意完全敞开自己","feedback":[{"range":[0,20],"text":"需要很强的安全感才会打开"},{"range":[21,40],"text":"会有选择地分享，留有保留"},{"range":[41,60],"text":"愿意分享，但某些部分是禁区"},{"range":[61,80],"text":"比较愿意敞开，但需要时间"},{"range":[81,100],"text":"在关系里能真正放下防备"}]},"scoring":{"method":"reverse_slider","formula":"(100 - value) / 100 * 5"}}}'::jsonb, '{"method":"reverse_slider","formula":"(100 - value) / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA3-M-22', 22, 'SA3', 'scale', 1.2, 'reverse', '我不太习惯向她表达我的脆弱或真实需求，觉得这样显得不够稳。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA3-M-22","order":22,"dimension":"SA3","type":"scale","weight":1.2,"direction":"reverse","text":"我不太习惯向她表达我的脆弱或真实需求，觉得这样显得不够稳。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"reverse","formula":"6 - value"}}}'::jsonb, '{"method":"reverse","formula":"6 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA3-M-23', 23, 'SA3', 'choice', 1.0, 'reverse', '她想更深入了解你，包括你的过去、你的软肋、你真正在怕什么。你的感受？', '{"options":[{"key":"A","text":"愿意，我也想让她真正了解我","sub":"低回避","score":5},{"key":"B","text":"愿意，但可能需要慢慢来","sub":"中低回避","score":4},{"key":"C","text":"有点不自在，但不知道怎么拒绝","sub":"中高回避","score":2},{"key":"D","text":"感觉太暴露了，想转移话题","sub":"高回避","score":1}],"source_question":{"id":"SA3-M-23","order":23,"dimension":"SA3","type":"choice","weight":1.0,"direction":"reverse","text":"她想更深入了解你，包括你的过去、你的软肋、你真正在怕什么。你的感受？","options":[{"key":"A","text":"愿意，我也想让她真正了解我","sub":"低回避","score":5},{"key":"B","text":"愿意，但可能需要慢慢来","sub":"中低回避","score":4},{"key":"C","text":"有点不自在，但不知道怎么拒绝","sub":"中高回避","score":2},{"key":"D","text":"感觉太暴露了，想转移话题","sub":"高回避","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA3-M-24', 24, 'SA3', 'mood', 1.0, 'reverse', '她说想见你的朋友，融入你的圈子。你的感受？', '{"options":[{"key":"A","icon":"ti-heart","text":"很好，正合我意","score":5},{"key":"B","icon":"ti-mood-happy","text":"挺好的，有点期待","score":5},{"key":"C","icon":"ti-mood-smile","text":"可以，想想怎么安排","score":4},{"key":"D","icon":"ti-mood-confuzed","text":"有点没准备好","score":3},{"key":"E","icon":"ti-mood-nervous","text":"感觉有点正式，有点紧张","score":3},{"key":"F","icon":"ti-mood-empty","text":"不太舒服，觉得进展太快","score":2},{"key":"G","icon":"ti-mood-sad","text":"感觉我的空间被进入了","score":1},{"key":"H","icon":"ti-mood-tongue","text":"还没到那一步","score":3}],"source_question":{"id":"SA3-M-24","order":24,"dimension":"SA3","type":"mood","weight":1.0,"direction":"reverse","text":"她说想见你的朋友，融入你的圈子。你的感受？","options":[{"key":"A","icon":"ti-heart","text":"很好，正合我意","score":5},{"key":"B","icon":"ti-mood-happy","text":"挺好的，有点期待","score":5},{"key":"C","icon":"ti-mood-smile","text":"可以，想想怎么安排","score":4},{"key":"D","icon":"ti-mood-confuzed","text":"有点没准备好","score":3},{"key":"E","icon":"ti-mood-nervous","text":"感觉有点正式，有点紧张","score":3},{"key":"F","icon":"ti-mood-empty","text":"不太舒服，觉得进展太快","score":2},{"key":"G","icon":"ti-mood-sad","text":"感觉我的空间被进入了","score":1},{"key":"H","icon":"ti-mood-tongue","text":"还没到那一步","score":3}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA4-M-25', 25, 'SA4', 'choice', 1.5, 'positive', '她说你最近对她态度有点冷，让你反省。但你觉得自己没问题。你会怎么做？', '{"options":[{"key":"A","text":"认真想想，可能真的是我的问题","sub":"边界弱，容易被定义","score":1},{"key":"B","text":"听她说完，再表达自己的判断","sub":"边界健康","score":4},{"key":"C","text":"告诉她我不觉得有问题，说明立场","sub":"边界清晰","score":5},{"key":"D","text":"不想争，但心里很不舒服","sub":"边界弱，压抑","score":2}],"source_question":{"id":"SA4-M-25","order":25,"dimension":"SA4","type":"choice","weight":1.5,"direction":"positive","text":"她说你最近对她态度有点冷，让你反省。但你觉得自己没问题。你会怎么做？","options":[{"key":"A","text":"认真想想，可能真的是我的问题","sub":"边界弱，容易被定义","score":1},{"key":"B","text":"听她说完，再表达自己的判断","sub":"边界健康","score":4},{"key":"C","text":"告诉她我不觉得有问题，说明立场","sub":"边界清晰","score":5},{"key":"D","text":"不想争，但心里很不舒服","sub":"边界弱，压抑","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA4-M-26', 26, 'SA4', 'scale', 1.5, 'positive', '我清楚自己在关系里有哪些事不可接受，而且我能直接说出来。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA4-M-26","order":26,"dimension":"SA4","type":"scale","weight":1.5,"direction":"positive","text":"我清楚自己在关系里有哪些事不可接受，而且我能直接说出来。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA4-M-27', 27, 'SA4', 'scenario', 1.5, 'positive', '吵架时她说了一句很过分的话，当场让你很难受。事后她道歉了，说是气话，不是真心的。你怎么处理？', '{"scene":"被伤害后的修复场景","options":[{"key":"A","text":"接受道歉，过去了就算了","sub":"边界弱","score":2},{"key":"B","text":"接受道歉，但告诉她那句话真的伤到我了","sub":"边界健康","score":4},{"key":"C","text":"告诉她这种话我不能接受，下次不行","sub":"边界清晰，有规则","score":5},{"key":"D","text":"嘴上说没事，但心里记住了","sub":"边界模糊，内外不一","score":1}],"source_question":{"id":"SA4-M-27","order":27,"dimension":"SA4","type":"scenario","weight":1.5,"direction":"positive","text":"吵架时她说了一句很过分的话，当场让你很难受。事后她道歉了，说是气话，不是真心的。你怎么处理？","scene":"被伤害后的修复场景","options":[{"key":"A","text":"接受道歉，过去了就算了","sub":"边界弱","score":2},{"key":"B","text":"接受道歉，但告诉她那句话真的伤到我了","sub":"边界健康","score":4},{"key":"C","text":"告诉她这种话我不能接受，下次不行","sub":"边界清晰，有规则","score":5},{"key":"D","text":"嘴上说没事，但心里记住了","sub":"边界模糊，内外不一","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA4-M-28', 28, 'SA4', 'rank', 1.2, 'positive', '在关系里，下面哪些事你最不愿意妥协？从最重要到最不重要排序。', '{"items":[{"id":"a","text":"我的个人时间和空间"},{"id":"b","text":"我的朋友圈和社交自由"},{"id":"c","text":"我的工作和个人目标"},{"id":"d","text":"我对自己行为底线的标准"}],"source_question":{"id":"SA4-M-28","order":28,"dimension":"SA4","type":"rank","weight":1.2,"direction":"positive","text":"在关系里，下面哪些事你最不愿意妥协？从最重要到最不重要排序。","items":[{"id":"a","text":"我的个人时间和空间"},{"id":"b","text":"我的朋友圈和社交自由"},{"id":"c","text":"我的工作和个人目标"},{"id":"d","text":"我对自己行为底线的标准"}],"scoring":{"method":"rank_position","key_item":"d","score_map":{"1st":5,"2nd":4,"3rd":3,"4th":2}}}}'::jsonb, '{"method":"rank_position","key_item":"d","score_map":{"1st":5,"2nd":4,"3rd":3,"4th":2}}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA4-M-29', 29, 'SA4', 'binary', 1.5, 'positive', '她不喜欢你跟某个女性朋友来往，希望你减少联系。那只是普通朋友。你会？', '{"options":[{"key":"left","text":"减少联系，不想因为这个起摩擦","sub":"关系稳定优先","score":1},{"key":"right","text":"告诉她那是我的朋友，不会因此改变","sub":"自主权优先","score":5}],"source_question":{"id":"SA4-M-29","order":29,"dimension":"SA4","type":"binary","weight":1.5,"direction":"positive","text":"她不喜欢你跟某个女性朋友来往，希望你减少联系。那只是普通朋友。你会？","options":[{"key":"left","text":"减少联系，不想因为这个起摩擦","sub":"关系稳定优先","score":1},{"key":"right","text":"告诉她那是我的朋友，不会因此改变","sub":"自主权优先","score":5}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA4-M-30', 30, 'SA4', 'scale', 1.5, 'positive', '当她越过我的边界，我能直接说出来，不会忍着或绕弯子。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA4-M-30","order":30,"dimension":"SA4","type":"scale","weight":1.5,"direction":"positive","text":"当她越过我的边界，我能直接说出来，不会忍着或绕弯子。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA4-M-31', 31, 'SA4', 'choice', 1.2, 'positive', '她希望你改掉一个你一直有的生活习惯，说这样对关系更好。但你很喜欢这个习惯。你会？', '{"options":[{"key":"A","text":"认真考虑改，关系比习惯重要","sub":"边界弱","score":2},{"key":"B","text":"听她的理由，但最终自己决定","sub":"边界健康","score":4},{"key":"C","text":"告诉她这是我的习惯，她需要接受","sub":"边界清晰","score":5},{"key":"D","text":"暂时答应，但内心很不情愿","sub":"边界弱，压抑","score":1}],"source_question":{"id":"SA4-M-31","order":31,"dimension":"SA4","type":"choice","weight":1.2,"direction":"positive","text":"她希望你改掉一个你一直有的生活习惯，说这样对关系更好。但你很喜欢这个习惯。你会？","options":[{"key":"A","text":"认真考虑改，关系比习惯重要","sub":"边界弱","score":2},{"key":"B","text":"听她的理由，但最终自己决定","sub":"边界健康","score":4},{"key":"C","text":"告诉她这是我的习惯，她需要接受","sub":"边界清晰","score":5},{"key":"D","text":"暂时答应，但内心很不情愿","sub":"边界弱，压抑","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA4-M-32', 32, 'SA4', 'scale', 1.2, 'positive', '我不会为了维持一段关系，一再妥协自己的核心需求或底线。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA4-M-32","order":32,"dimension":"SA4","type":"scale","weight":1.2,"direction":"positive","text":"我不会为了维持一段关系，一再妥协自己的核心需求或底线。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA5-M-33', 33, 'SA5', 'choice', 1.5, 'positive', '你们因为一件小事起了争执，你很生气。你通常怎么处理？', '{"options":[{"key":"A","text":"直接说出感受，但控制语气","sub":"健康表达","score":5},{"key":"B","text":"先冷静，等情绪平了再说","sub":"有调节能力","score":4},{"key":"C","text":"当下直接爆，说完又后悔","sub":"冲动型","score":2},{"key":"D","text":"什么都不说，冷处理等她来哄","sub":"回避型","score":1}],"source_question":{"id":"SA5-M-33","order":33,"dimension":"SA5","type":"choice","weight":1.5,"direction":"positive","text":"你们因为一件小事起了争执，你很生气。你通常怎么处理？","options":[{"key":"A","text":"直接说出感受，但控制语气","sub":"健康表达","score":5},{"key":"B","text":"先冷静，等情绪平了再说","sub":"有调节能力","score":4},{"key":"C","text":"当下直接爆，说完又后悔","sub":"冲动型","score":2},{"key":"D","text":"什么都不说，冷处理等她来哄","sub":"回避型","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA5-M-34', 34, 'SA5', 'slider', 1.5, 'positive', '当你在关系里感到受伤或委屈，你能用语言说出来的能力有多强？', '{"slider":{"min":0,"max":100,"min_label":"很难开口，通常用行动或沉默传递","max_label":"能直接说出感受","feedback":[{"range":[0,20],"text":"情绪更多通过行为表达"},{"range":[21,40],"text":"能说一些，但说不完整"},{"range":[41,60],"text":"看情况，有时能说有时不行"},{"range":[61,80],"text":"通常能表达，偶尔会憋"},{"range":[81,100],"text":"能把情绪转化成清晰的语言"}]},"source_question":{"id":"SA5-M-34","order":34,"dimension":"SA5","type":"slider","weight":1.5,"direction":"positive","text":"当你在关系里感到受伤或委屈，你能用语言说出来的能力有多强？","slider":{"min":0,"max":100,"min_label":"很难开口，通常用行动或沉默传递","max_label":"能直接说出感受","feedback":[{"range":[0,20],"text":"情绪更多通过行为表达"},{"range":[21,40],"text":"能说一些，但说不完整"},{"range":[41,60],"text":"看情况，有时能说有时不行"},{"range":[61,80],"text":"通常能表达，偶尔会憋"},{"range":[81,100],"text":"能把情绪转化成清晰的语言"}]},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA5-M-35', 35, 'SA5', 'scale', 1.5, 'positive', '我不会把工作或其他压力的情绪，发泄到她身上。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA5-M-35","order":35,"dimension":"SA5","type":"scale","weight":1.5,"direction":"positive","text":"我不会把工作或其他压力的情绪，发泄到她身上。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA5-M-36', 36, 'SA5', 'card', 1.2, 'positive', '工作上遇到很糟糕的事，心情很差。晚上她说了一句无心的话。你的反应更接近哪张？', '{"options":[{"key":"A","text":"告诉她今天状态不好，那句话让我不舒服","sub":"情绪清晰，能区分来源","score":5},{"key":"B","text":"比平时敏感，反应有点过，事后意识到","sub":"有觉察，控制有限","score":3},{"key":"C","text":"直接爆发，事后才意识到是因为工作","sub":"情绪迁移，觉察晚","score":2},{"key":"D","text":"什么都没说，但心里记住了","sub":"积压型","score":2}],"source_question":{"id":"SA5-M-36","order":36,"dimension":"SA5","type":"card","weight":1.2,"direction":"positive","text":"工作上遇到很糟糕的事，心情很差。晚上她说了一句无心的话。你的反应更接近哪张？","options":[{"key":"A","text":"告诉她今天状态不好，那句话让我不舒服","sub":"情绪清晰，能区分来源","score":5},{"key":"B","text":"比平时敏感，反应有点过，事后意识到","sub":"有觉察，控制有限","score":3},{"key":"C","text":"直接爆发，事后才意识到是因为工作","sub":"情绪迁移，觉察晚","score":2},{"key":"D","text":"什么都没说，但心里记住了","sub":"积压型","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA5-M-37', 37, 'SA5', 'binary', 1.2, 'positive', '她做了一件让你失望的事，但你知道她不是故意的。你会怎么做？', '{"options":[{"key":"left","text":"跟她说，这件事让我有点失望","sub":"直接表达情绪","score":5},{"key":"right","text":"算了，不是故意的就过去了","sub":"压下去不说","score":2}],"source_question":{"id":"SA5-M-37","order":37,"dimension":"SA5","type":"binary","weight":1.2,"direction":"positive","text":"她做了一件让你失望的事，但你知道她不是故意的。你会怎么做？","options":[{"key":"left","text":"跟她说，这件事让我有点失望","sub":"直接表达情绪","score":5},{"key":"right","text":"算了，不是故意的就过去了","sub":"压下去不说","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA5-M-38', 38, 'SA5', 'slider', 1.2, 'positive', '在关系里发生冲突时，你保持情绪稳定、不失控的能力有多强？', '{"slider":{"min":0,"max":100,"min_label":"很难控制，容易崩","max_label":"通常能保持相对冷静","feedback":[{"range":[0,20],"text":"冲突是你最难过的时刻"},{"range":[21,40],"text":"会有情绪，但不总能控制"},{"range":[41,60],"text":"能撑一会儿，时间长了会崩"},{"range":[61,80],"text":"通常能保持，偶尔失控"},{"range":[81,100],"text":"你有较强的情绪容纳能力"}]},"source_question":{"id":"SA5-M-38","order":38,"dimension":"SA5","type":"slider","weight":1.2,"direction":"positive","text":"在关系里发生冲突时，你保持情绪稳定、不失控的能力有多强？","slider":{"min":0,"max":100,"min_label":"很难控制，容易崩","max_label":"通常能保持相对冷静","feedback":[{"range":[0,20],"text":"冲突是你最难过的时刻"},{"range":[21,40],"text":"会有情绪，但不总能控制"},{"range":[41,60],"text":"能撑一会儿，时间长了会崩"},{"range":[61,80],"text":"通常能保持，偶尔失控"},{"range":[81,100],"text":"你有较强的情绪容纳能力"}]},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA5-M-39', 39, 'SA5', 'scale', 1.5, 'positive', '关系中出现矛盾时，我能在情绪相对平稳的状态下表达感受，不会爆发或完全沉默。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA5-M-39","order":39,"dimension":"SA5","type":"scale","weight":1.5,"direction":"positive","text":"关系中出现矛盾时，我能在情绪相对平稳的状态下表达感受，不会爆发或完全沉默。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA5-M-40', 40, 'SA5', 'scenario', 1.2, 'positive', '你们冷战了一天，她没有主动。你知道这件事你也有一半责任，但先开口感觉很难。现在已经晚上十一点了。你会怎么做？', '{"scene":"冷战结束前的最后时刻","options":[{"key":"A","text":"先开口，责任是我的就是我的","sub":"情绪成熟，能放下自尊","score":5},{"key":"B","text":"再等等，看她有没有动静","sub":"有些执着，但能修复","score":3},{"key":"C","text":"一直等，就看谁先撑不住","sub":"冷战作为工具","score":2},{"key":"D","text":"随便发个表情包，假装没事发生","sub":"回避型修复，表面化","score":1}],"source_question":{"id":"SA5-M-40","order":40,"dimension":"SA5","type":"scenario","weight":1.2,"direction":"positive","text":"你们冷战了一天，她没有主动。你知道这件事你也有一半责任，但先开口感觉很难。现在已经晚上十一点了。你会怎么做？","scene":"冷战结束前的最后时刻","options":[{"key":"A","text":"先开口，责任是我的就是我的","sub":"情绪成熟，能放下自尊","score":5},{"key":"B","text":"再等等，看她有没有动静","sub":"有些执着，但能修复","score":3},{"key":"C","text":"一直等，就看谁先撑不住","sub":"冷战作为工具","score":2},{"key":"D","text":"随便发个表情包，假装没事发生","sub":"回避型修复，表面化","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA5-M-41', 41, 'SA5', 'scale', 1.5, 'positive', '当我感到受伤或委屈，我能用语言说出来，不会用冷战或消失来回应。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA5-M-41","order":41,"dimension":"SA5","type":"scale","weight":1.5,"direction":"positive","text":"当我感到受伤或委屈，我能用语言说出来，不会用冷战或消失来回应。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA6-M-42', 42, 'SA6', 'rank', 1, 'auxiliary', '喜欢一个人，你最先在意的是什么？从最重要到最不重要排序。', '{"items":[{"id":"a","text":"她对我有没有真实的吸引力"},{"id":"b","text":"她能不能给我安全感和稳定"},{"id":"c","text":"我们有没有共同的未来方向"},{"id":"d","text":"在一起的感觉轻松不轻松"}],"source_question":{"id":"SA6-M-42","order":42,"dimension":"SA6","type":"rank","weight":null,"direction":"auxiliary","text":"喜欢一个人，你最先在意的是什么？从最重要到最不重要排序。","items":[{"id":"a","text":"她对我有没有真实的吸引力"},{"id":"b","text":"她能不能给我安全感和稳定"},{"id":"c","text":"我们有没有共同的未来方向"},{"id":"d","text":"在一起的感觉轻松不轻松"}],"scoring":{"method":"auxiliary_type","note":"辅助类型判断，不计入SA6分数"}}}'::jsonb, '{"method":"auxiliary_type","note":"辅助类型判断，不计入SA6分数"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA6-M-43', 43, 'SA6', 'choice', 1.5, 'positive', '你发现在这段关系里，你付出明显比她多。你怎么面对？', '{"options":[{"key":"A","text":"告诉她我的感受，希望她有所改变","sub":"边界健康","score":5},{"key":"B","text":"继续付出，只要她好就行","sub":"低自我投入模式","score":1},{"key":"C","text":"开始质疑这段关系值不值得","sub":"有自我保护意识","score":4},{"key":"D","text":"减少付出，看看她的反应","sub":"测试型策略","score":3}],"source_question":{"id":"SA6-M-43","order":43,"dimension":"SA6","type":"choice","weight":1.5,"direction":"positive","text":"你发现在这段关系里，你付出明显比她多。你怎么面对？","options":[{"key":"A","text":"告诉她我的感受，希望她有所改变","sub":"边界健康","score":5},{"key":"B","text":"继续付出，只要她好就行","sub":"低自我投入模式","score":1},{"key":"C","text":"开始质疑这段关系值不值得","sub":"有自我保护意识","score":4},{"key":"D","text":"减少付出，看看她的反应","sub":"测试型策略","score":3}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA6-M-44', 44, 'SA6', 'scale', 1.5, 'positive', '我在关系里的投入是主动选择的，不是因为怕孤独或外部压力。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA6-M-44","order":44,"dimension":"SA6","type":"scale","weight":1.5,"direction":"positive","text":"我在关系里的投入是主动选择的，不是因为怕孤独或外部压力。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA6-M-45', 45, 'SA6', 'binary', 1.5, 'positive', '自从在一起，你发现自己越来越少做之前喜欢的事。你的态度是？', '{"options":[{"key":"left","text":"主动找回自己的节奏，两件事都要","sub":"自我意识强","score":5},{"key":"right","text":"感情是重心，这是自然的","sub":"关系中心化","score":1}],"source_question":{"id":"SA6-M-45","order":45,"dimension":"SA6","type":"binary","weight":1.5,"direction":"positive","text":"自从在一起，你发现自己越来越少做之前喜欢的事。你的态度是？","options":[{"key":"left","text":"主动找回自己的节奏，两件事都要","sub":"自我意识强","score":5},{"key":"right","text":"感情是重心，这是自然的","sub":"关系中心化","score":1}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA6-M-46', 46, 'SA6', 'rank', 1, 'auxiliary', '你理想中的关系状态是什么样的？从最接近你到最不重要排序。', '{"items":[{"id":"a","text":"我们是彼此最重要的人，紧密相连"},{"id":"b","text":"我们各有各的生活，感情很深"},{"id":"c","text":"我们一起成长，互相推动"},{"id":"d","text":"在一起很舒服，没有太多要求"}],"source_question":{"id":"SA6-M-46","order":46,"dimension":"SA6","type":"rank","weight":null,"direction":"auxiliary","text":"你理想中的关系状态是什么样的？从最接近你到最不重要排序。","items":[{"id":"a","text":"我们是彼此最重要的人，紧密相连"},{"id":"b","text":"我们各有各的生活，感情很深"},{"id":"c","text":"我们一起成长，互相推动"},{"id":"d","text":"在一起很舒服，没有太多要求"}],"scoring":{"method":"auxiliary_type","note":"b排第一=高自主性，辅助SA6类型判断"}}}'::jsonb, '{"method":"auxiliary_type","note":"b排第一=高自主性，辅助SA6类型判断"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA6-M-47', 47, 'SA6', 'slider', 1.5, 'positive', '在一段关系里，你有多能保持自己原本的生活重心——朋友、目标、爱好？', '{"slider":{"min":0,"max":100,"min_label":"我容易把全部重心放在关系上","max_label":"我能很好地保持自己的生活","feedback":[{"range":[0,20],"text":"你倾向于把关系放在一切之上"},{"range":[21,40],"text":"有时会迷失在关系里"},{"range":[41,60],"text":"能保持一部分，但关系影响你"},{"range":[61,80],"text":"大多数时候能守住自己的生活"},{"range":[81,100],"text":"你在关系里同时活得很完整"}]},"source_question":{"id":"SA6-M-47","order":47,"dimension":"SA6","type":"slider","weight":1.5,"direction":"positive","text":"在一段关系里，你有多能保持自己原本的生活重心——朋友、目标、爱好？","slider":{"min":0,"max":100,"min_label":"我容易把全部重心放在关系上","max_label":"我能很好地保持自己的生活","feedback":[{"range":[0,20],"text":"你倾向于把关系放在一切之上"},{"range":[21,40],"text":"有时会迷失在关系里"},{"range":[41,60],"text":"能保持一部分，但关系影响你"},{"range":[61,80],"text":"大多数时候能守住自己的生活"},{"range":[81,100],"text":"你在关系里同时活得很完整"}]},"scoring":{"method":"slider_to_5","formula":"value / 100 * 5"}}}'::jsonb, '{"method":"slider_to_5","formula":"value / 100 * 5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA6-M-48', 48, 'SA6', 'scale', 1.5, 'positive', '我能在关系里保持自我，不会因为喜欢一个人失去自己的目标、朋友圈或生活重心。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"SA6-M-48","order":48,"dimension":"SA6","type":"scale","weight":1.5,"direction":"positive","text":"我能在关系里保持自我，不会因为喜欢一个人失去自己的目标、朋友圈或生活重心。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA6-M-49', 49, 'SA6', 'card', 1.0, 'positive', '你对自己在过去关系里出现过的模式，了解多少？', '{"options":[{"key":"A","text":"我很清楚自己的问题，也在改","sub":"高觉察，成长型","score":5},{"key":"B","text":"大概知道，但不确定怎么改","sub":"有觉察，执行待提升","score":3},{"key":"C","text":"问题都在对方，跟我关系不大","sub":"低觉察，归因外部","score":1},{"key":"D","text":"不太回顾过去，往前看就好","sub":"回避型自我认知","score":2}],"source_question":{"id":"SA6-M-49","order":49,"dimension":"SA6","type":"card","weight":1.0,"direction":"positive","text":"你对自己在过去关系里出现过的模式，了解多少？","options":[{"key":"A","text":"我很清楚自己的问题，也在改","sub":"高觉察，成长型","score":5},{"key":"B","text":"大概知道，但不确定怎么改","sub":"有觉察，执行待提升","score":3},{"key":"C","text":"问题都在对方，跟我关系不大","sub":"低觉察，归因外部","score":1},{"key":"D","text":"不太回顾过去，往前看就好","sub":"回避型自我认知","score":2}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
SELECT s.id, 'SA6-M-50', 50, 'SA6', 'rank', 1, 'auxiliary', '用四个词描述你在关系里的状态，从最像你到最不像你排序。', '{"items":[{"id":"a","text":"我是付出更多的那个"},{"id":"b","text":"我是需要更多确认的那个"},{"id":"c","text":"我是更独立、更难靠近的那个"},{"id":"d","text":"我是比较能控制情绪的那个"}],"source_question":{"id":"SA6-M-50","order":50,"dimension":"SA6","type":"rank","weight":null,"direction":"auxiliary","text":"用四个词描述你在关系里的状态，从最像你到最不像你排序。","items":[{"id":"a","text":"我是付出更多的那个"},{"id":"b","text":"我是需要更多确认的那个"},{"id":"c","text":"我是更独立、更难靠近的那个"},{"id":"d","text":"我是比较能控制情绪的那个"}],"scoring":{"method":"auxiliary_type","mapping":{"a_first":"SA6低自我倾向 → 蒋玉菡方向","b_first":"SA2高焦虑倾向 → 贾宝玉方向","c_first":"SA3高回避倾向 → 柳湘莲方向","d_first":"SA5高调节能力 → 贾探春/北静王方向"},"note":"辅助类型判断，不计入SA6分数"}}}'::jsonb, '{"method":"auxiliary_type","mapping":{"a_first":"SA6低自我倾向 → 蒋玉菡方向","b_first":"SA2高焦虑倾向 → 贾宝玉方向","c_first":"SA3高回避倾向 → 柳湘莲方向","d_first":"SA5高调节能力 → 贾探春/北静王方向"},"note":"辅助类型判断，不计入SA6分数"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's01_self_male'
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
