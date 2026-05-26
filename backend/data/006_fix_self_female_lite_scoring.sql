-- Repair missing scoring model + archetypes for s01_self_female_lite (questions were imported separately).

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
SELECT id, v.archetype_code, v.archetype_name, 'female'::public.test_gender, v.profile_payload::jsonb, v.display_order, true
FROM public.test_suites
CROSS JOIN (VALUES
  ('薛宝钗', '薛宝钗', '{"attachment_type":"安全型","tagline":"你是关系里最稀有的人","description":"你是关系里最稀有的人。清醒但不冷漠，温柔但有边界。不会因为爱一个人而失去自己，也不需要对方时刻确认才能安心。你给的安全感是真实的，不是表演出来的。","matching_logic":"情绪稳定、边界清晰、能给能收、不因爱失去自我","radar_baseline":{"SA1":72,"SA2":75,"SA3":70,"SA4":78,"SA5":74,"SA6":68}}', 1),
  ('林黛玉', '林黛玉', '{"attachment_type":"焦虑型","tagline":"你的敏感是一种天赋，不是缺陷","description":"你的敏感是一种天赋，不是缺陷。你比任何人都更能感受到关系里的细微变化，爱得深、想得多，是因为你把感情当真。这世上最难得的，是你这种真心。","matching_logic":"高敏感、需要被确认、爱得深但安全感弱、把感情当真的人","radar_baseline":{"SA1":58,"SA2":35,"SA3":65,"SA4":52,"SA5":48,"SA6":62}}', 2),
  ('妙玉', '妙玉', '{"attachment_type":"回避型","tagline":"你不是不懂爱，你只是对平庸的亲密没有兴趣","description":"你不是不懂爱，你只是对平庸的亲密没有兴趣。你有极高的精神标准，不轻易让人靠近，是因为你深知自己值得真正懂你的人。等到了，你会是最深情的那个。","matching_logic":"高冷疏离、精神标准极高、渴望亲密却主动筑墙、等到懂的人才开放","radar_baseline":{"SA1":68,"SA2":72,"SA3":28,"SA4":74,"SA5":60,"SA6":55}}', 3),
  ('史湘云', '史湘云', '{"attachment_type":"混合型","tagline":"你是关系里最有生命力的那种人","description":"你是关系里最有生命力的那种人。时而热烈时而需要空间，不是因为你不稳定，而是因为你足够真实。你从不表演，这反而是最珍贵的事。","matching_logic":"时而热烈时而需要空间、情绪真实不表演、足够复杂才足够有趣","radar_baseline":{"SA1":60,"SA2":42,"SA3":42,"SA4":55,"SA5":52,"SA6":58}}', 4),
  ('王熙凤', '王熙凤', '{"attachment_type":"高边界安全型","tagline":"你是感情里最有掌控力的人","description":"你是感情里最有掌控力的人。清楚自己要什么，不会被情绪带着走，爱得现实但绝对忠诚。你的边界不是冷漠，是尊重——包括对自己的尊重。","matching_logic":"掌控感强、边界极硬、爱得现实但绝对忠诚、尊重自己才能尊重感情","radar_baseline":{"SA1":75,"SA2":78,"SA3":72,"SA4":88,"SA5":76,"SA6":65}}', 5),
  ('袭人', '袭人', '{"attachment_type":"低自我高投入型","tagline":"你是感情里最有温度的人","description":"你是感情里最有温度的人。你的爱是具体的、日常的、落在每一个细节里的。你懂得如何让一个人感到被珍视——这种能力，是很多人一生都学不会的。","matching_logic":"爱得具体日常、落在细节里、温度最高、懂得让人感到被珍视","radar_baseline":{"SA1":32,"SA2":38,"SA3":60,"SA4":35,"SA5":55,"SA6":45}}', 6)
) AS v(archetype_code, archetype_name, profile_payload, display_order)
WHERE slug = 's01_self_female_lite'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();
