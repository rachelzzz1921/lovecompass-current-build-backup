BEGIN;

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
