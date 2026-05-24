-- LoveCompass generated data import SQL

-- 此文件由 scripts/generate_import_sql.py 根据外部 JSON 数据生成；题目内容没有硬编码在脚本中。

BEGIN;


-- Source: suite3_mate_male.json

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
VALUES ('s03_mate_male', '择偶坐标测试', '1.0', 'male'::public.test_gender, 80, 18, false, true, '{"id":"S03_MATE_MALE","name":"择偶坐标测试","gender":"male","version":"1.0","total_questions":80,"estimated_minutes":18,"is_free":false,"modules":["MS1","MS2","MS3","MS4","MS5"],"result_types":["让人想留下来的人","被读懂之前的人","一眼就懂的人","需要被正确打开的人","还没到时候的人","越了解越值钱的人"],"question_types_used":["slider","scenario","binary","choice","scale","card","mood","rank"]}'::jsonb)
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
SELECT id, 'ROS_V3', '1.0', '{"axes":{"horizontal":{"name":"市场显示度","formula":"MS3 * 0.50 + MS4 * 0.50","description":"情感供给能力和门面社交资本的综合，决定别人第一眼和相处后的感受"},"vertical":{"name":"现实支撑力","formula":"MS1 * 0.55 + MS2 * 0.30 + (100 - MS5) * 0.15","description":"资源轨道、稳定可靠度和风险净值共同决定的现实托底能力"}},"modules":{"MS1":{"label":"资源与事业轨道","weight":0.3,"sub":{"MS1_A":{"label":"当下经济基础","weight":0.45},"MS1_B":{"label":"事业轨道可见度","weight":0.35},"MS1_C":{"label":"家庭助力情况","weight":0.2}}},"MS2":{"label":"稳定性与可靠度","weight":0.25,"sub":{"MS2_A":{"label":"承诺履约度","weight":0.4},"MS2_B":{"label":"情绪稳定性","weight":0.35},"MS2_C":{"label":"关系信息透明度","weight":0.25}}},"MS3":{"label":"情感供给能力","weight":0.2,"sub":{"MS3_A":{"label":"趣味与话题密度","weight":0.35},"MS3_B":{"label":"情绪支持能力","weight":0.4},"MS3_C":{"label":"被需要感制造力","weight":0.25}}},"MS4":{"label":"门面与社交资本","weight":0.15,"sub":{"MS4_A":{"label":"外形管理水平","weight":0.35},"MS4_B":{"label":"社交场合表现","weight":0.4},"MS4_C":{"label":"带出去的体面感","weight":0.25}}},"MS5":{"label":"风险净值","weight":0.1,"direction":"reverse","note":"此模块分数越低越好，反向计入纵轴","sub":{"MS5_A":{"label":"过去关系质量","weight":0.3},"MS5_B":{"label":"控制与边界风险","weight":0.45},"MS5_C":{"label":"成长停滞风险","weight":0.25}}}}}'::jsonb, '{"quadrant_logic":{"note":"以50分为轴线中点，判断所在象限","Q1":{"condition":"horizontal >= 60 && vertical >= 60","type":"让人想留下来的人"},"Q2":{"condition":"horizontal < 50 && vertical >= 60","type":"被读懂之前的人"},"Q4":{"condition":"horizontal >= 60 && vertical < 50","type":"一眼就懂的人"},"Q3":{"condition":"horizontal < 50 && vertical < 50","type":"还没到时候的人"},"special_1":{"condition":"50 <= horizontal < 60 && 50 <= vertical < 60","type":"需要被正确打开的人"},"special_2":{"condition":"horizontal < 50 && vertical >= 55 && MS3 >= 65","type":"越了解越值钱的人"}},"score_display_rules":{"note":"所有分数转化为描述性语言，不直接显示数字","ranges":[{"min":0,"max":30,"label":"这个维度还有很大的成长空间"},{"min":31,"max":50,"label":"这个维度处于发展阶段"},{"min":51,"max":65,"label":"这个维度表现稳定"},{"min":66,"max":80,"label":"这个维度是你的重要资产"},{"min":81,"max":100,"label":"这个维度是你的核心竞争力"}],"sensitive_fields":{"MS1_A_income":"收入档位不直接显示，转化为：经济主导型/经济稳健型/经济发展型","MS1_A_education":"学历作为修正系数，不单独显示，结合职业和收入综合判断"}}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"MATE"}'::jsonb, true
FROM public.test_suites WHERE slug = 's03_mate_male'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '让人想留下来的人', '让人想留下来的人', 'male'::public.test_gender, '{"tagline":"你不是最耀眼的那个，但跟你在一起有一种说不清楚的踏实。","tags":["稳","有趣","靠得住"],"market_read":"你在资源、稳定性和情感供给上都有不错的表现，不是最闪的那个，但留存率极高。她很难在别人身上找到这种综合感觉。","upper_match":"条件好、有主见、需要一个情感着陆点的成熟女性","sweet_spot":"重视稳定感、不喜欢不确定性、把长期放在第一位的女性","lower_match":"需要强刺激和即时吸引力的女性","radar_baseline":{"MS1":72,"MS2":75,"MS3":68,"MS4":65,"MS5_risk":20}}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's03_mate_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '被读懂之前的人', '被读懂之前的人', 'male'::public.test_gender, '{"tagline":"你有很多好，但藏得比较深——大多数人没有耐心等到那一刻。","tags":["低调","实力在里面","需要时间"],"market_read":"你的现实底牌扎实，但门面显示度偏低，第一印象可能低于你的实际价值。你需要的不是更好的条件，是更好的出场方式。","upper_match":"有阅历、不被表面吸引、看重内在稳定性的女性","sweet_spot":"务实、重视可靠感、不追求即时浪漫的女性","lower_match":"追求第一眼吸引力、需要你主动展示自己才看得见你的女性","radar_baseline":{"MS1":75,"MS2":70,"MS3":48,"MS4":45,"MS5_risk":18}}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's03_mate_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '一眼就懂的人', '一眼就懂的人', 'male'::public.test_gender, '{"tagline":"你把自己放在那里，清清楚楚，喜欢就来，不喜欢走开。","tags":["高辨识度","清晰","所见即所得"],"market_read":"你的门面资产和情感输出都比较显性，筛选效率高。但这也意味着你吸引的范围已经被框定，需要主动在深度上下功夫。","upper_match":"追求确定感、目标清晰、审美在线的成熟女性","sweet_spot":"不喜欢猜谜、追求效率、直接知道自己要什么的女性","lower_match":"追求神秘感、需要被持续惊喜的女性","radar_baseline":{"MS1":60,"MS2":65,"MS3":75,"MS4":80,"MS5_risk":30}}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's03_mate_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '需要被正确打开的人', '需要被正确打开的人', 'male'::public.test_gender, '{"tagline":"你对了频道就是惊喜，频道不对就是误解——你不难，只是要对的人。","tags":["个性","非标","对的人才懂"],"market_read":"你不走大众路线，也不符合标准模板，但你在特定人群里的吸引力是无可替代的。你的市场窄但深。","upper_match":"有独立判断力、不从众、能欣赏非标准男性的女性","sweet_spot":"同样有鲜明个性、不需要你符合某种固定模板的女性","lower_match":"追求标准答案、需要你符合大众期待的女性","radar_baseline":{"MS1":60,"MS2":62,"MS3":68,"MS4":58,"MS5_risk":28}}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's03_mate_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '还没到时候的人', '还没到时候的人', 'male'::public.test_gender, '{"tagline":"你现在的状态还不是最好版本，但方向是对的——时间站在你这边。","tags":["在建","方向对","等自己好"],"market_read":"你目前的资源底牌或情感供给能力还在建设中，市场给你的即时报价低于你的长期价值。先把自己做好，再谈择偶。","upper_match":"有耐心、看重潜力而非现状、愿意一起成长的女性","sweet_spot":"同样在成长阶段、把关系当长期项目经营的女性","lower_match":"追求现成条件、不愿意等待的女性","radar_baseline":{"MS1":42,"MS2":50,"MS3":45,"MS4":48,"MS5_risk":55}}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's03_mate_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '越了解越值钱的人', '越了解越值钱的人', 'male'::public.test_gender, '{"tagline":"停留的时间越长，你给的东西越多——你不适合被快速评估。","tags":["复利型","长期","慢慢升值"],"market_read":"你的情感价值远超第一印象，但现实底牌的显示度偏低。进入长期关系后，你的优势会持续放大，短期市场里容易被低估。","upper_match":"不追求即时满足、愿意投入时间、把关系当长期项目的女性","sweet_spot":"成熟稳重、有长期规划意识、不急于求成的女性","lower_match":"喜欢快节奏、需要即时回报的女性","radar_baseline":{"MS1":68,"MS2":72,"MS3":70,"MS4":48,"MS5_risk":22}}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's03_mate_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'MS1-A-M-01', 1, 'MS1', 'slider', 2.0, 'positive', '你目前的经济状况，在你所在城市大概处于什么水平？', '{"note":"这里不需要填具体数字，系统只需要了解你的相对位置。","slider":{"min":1,"max":6,"reference":[{"level":"A","score":1,"desc":"入门层：收入勉强覆盖个人基本开销，无存款或少量存款"},{"level":"B","score":2,"desc":"基础层：收入稳定，能覆盖生活，有一定储蓄能力"},{"level":"C","score":3,"desc":"中等层：收入高于本城市平均水平，生活质量不错"},{"level":"D","score":4,"desc":"中上层：收入明显高于平均，有资产积累（房/车/投资）"},{"level":"E","score":5,"desc":"优质层：属于本城市收入前20%，资产可见且可验证"},{"level":"F","score":6,"desc":"顶端层：属于本城市收入前5%，资产规模较大"}]},"source_question":{"id":"MS1-A-M-01","order":1,"module":"MS1","sub":"MS1_A","type":"slider","weight":2.0,"direction":"positive","text":"你目前的经济状况，在你所在城市大概处于什么水平？","note":"这里不需要填具体数字，系统只需要了解你的相对位置。","slider":{"min":1,"max":6,"reference":[{"level":"A","score":1,"desc":"入门层：收入勉强覆盖个人基本开销，无存款或少量存款"},{"level":"B","score":2,"desc":"基础层：收入稳定，能覆盖生活，有一定储蓄能力"},{"level":"C","score":3,"desc":"中等层：收入高于本城市平均水平，生活质量不错"},{"level":"D","score":4,"desc":"中上层：收入明显高于平均，有资产积累（房/车/投资）"},{"level":"E","score":5,"desc":"优质层：属于本城市收入前20%，资产可见且可验证"},{"level":"F","score":6,"desc":"顶端层：属于本城市收入前5%，资产规模较大"}]},"scoring":{"method":"level_to_score","score_map":{"1":20,"2":40,"3":55,"4":70,"5":85,"6":100}}}}'::jsonb, '{"method":"level_to_score","score_map":{"1":20,"2":40,"3":55,"4":70,"5":85,"6":100}}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-A-M-02', 2, 'MS1', 'choice', 1.5, 'positive', '你现在的住房情况是？', '{"options":[{"key":"A","text":"自己有房（已付清或按揭中）","sub":"高现实底牌","score":90},{"key":"B","text":"家里有房，我住家里或者用家里的房","sub":"有底牌，但非个人资产","score":65},{"key":"C","text":"租房，但租的条件不错，生活质量有保障","sub":"中等，过渡状态","score":55},{"key":"D","text":"租房，条件一般，还在积累阶段","sub":"底牌偏低，发展中","score":35}],"source_question":{"id":"MS1-A-M-02","order":2,"module":"MS1","sub":"MS1_A","type":"choice","weight":1.5,"direction":"positive","text":"你现在的住房情况是？","options":[{"key":"A","text":"自己有房（已付清或按揭中）","sub":"高现实底牌","score":90},{"key":"B","text":"家里有房，我住家里或者用家里的房","sub":"有底牌，但非个人资产","score":65},{"key":"C","text":"租房，但租的条件不错，生活质量有保障","sub":"中等，过渡状态","score":55},{"key":"D","text":"租房，条件一般，还在积累阶段","sub":"底牌偏低，发展中","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-A-M-03', 3, 'MS1', 'binary', 1.3, 'positive', '如果你们明天开始一起生活，你能独立负担两个人的基本生活开销吗？', '{"options":[{"key":"left","text":"能，不需要她承担什么","sub":"经济主导能力强","score":85},{"key":"right","text":"需要两个人一起分担才行","sub":"共担型，经济主导力有限","score":50}],"source_question":{"id":"MS1-A-M-03","order":3,"module":"MS1","sub":"MS1_A","type":"binary","weight":1.3,"direction":"positive","text":"如果你们明天开始一起生活，你能独立负担两个人的基本生活开销吗？","options":[{"key":"left","text":"能，不需要她承担什么","sub":"经济主导能力强","score":85},{"key":"right","text":"需要两个人一起分担才行","sub":"共担型，经济主导力有限","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-A-M-04', 4, 'MS1', 'scenario', 1.3, 'positive', '你们在一起半年，她想去一趟日本旅行，大概需要一万五左右。对你来说，这件事是？', '{"scene":"旅行消费能力测试","options":[{"key":"A","text":"没压力，我来安排，说走就走","sub":"高经济自由度","score":90},{"key":"B","text":"可以的，需要提前规划一下，不是问题","sub":"中高，有计划性","score":72},{"key":"C","text":"有点压力，需要攒一攒，但愿意为她做","sub":"中等，经济有限制","score":50},{"key":"D","text":"说实话有点难，目前的状态不太支持","sub":"经济底牌偏低","score":28}],"source_question":{"id":"MS1-A-M-04","order":4,"module":"MS1","sub":"MS1_A","type":"scenario","weight":1.3,"direction":"positive","text":"你们在一起半年，她想去一趟日本旅行，大概需要一万五左右。对你来说，这件事是？","scene":"旅行消费能力测试","options":[{"key":"A","text":"没压力，我来安排，说走就走","sub":"高经济自由度","score":90},{"key":"B","text":"可以的，需要提前规划一下，不是问题","sub":"中高，有计划性","score":72},{"key":"C","text":"有点压力，需要攒一攒，但愿意为她做","sub":"中等，经济有限制","score":50},{"key":"D","text":"说实话有点难，目前的状态不太支持","sub":"经济底牌偏低","score":28}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-A-M-05', 5, 'MS1', 'scale', 1.2, 'positive', '我目前的经济状态，让我在感情里有足够的底气，不会因为钱的问题感到被动。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS1-A-M-05","order":5,"module":"MS1","sub":"MS1_A","type":"scale","weight":1.2,"direction":"positive","text":"我目前的经济状态，让我在感情里有足够的底气，不会因为钱的问题感到被动。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-A-M-06', 6, 'MS1', 'choice', 1.0, 'positive', '你的最高学历是？', '{"note":"学历作为修正系数，结合职业和收入综合判断，不单独显示在结果里。","options":[{"key":"A","text":"高中/中专及以下","score":30},{"key":"B","text":"大专","score":45},{"key":"C","text":"本科","score":65},{"key":"D","text":"硕士研究生","score":80},{"key":"E","text":"博士及以上","score":90}],"source_question":{"id":"MS1-A-M-06","order":6,"module":"MS1","sub":"MS1_A","type":"choice","weight":1.0,"direction":"positive","text":"你的最高学历是？","note":"学历作为修正系数，结合职业和收入综合判断，不单独显示在结果里。","options":[{"key":"A","text":"高中/中专及以下","score":30},{"key":"B","text":"大专","score":45},{"key":"C","text":"本科","score":65},{"key":"D","text":"硕士研究生","score":80},{"key":"E","text":"博士及以上","score":90}],"scoring":{"method":"modifier","note":"作为MS1_A的修正系数，不直接计分"}}}'::jsonb, '{"method":"modifier","note":"作为MS1_A的修正系数，不直接计分"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-B-M-07', 7, 'MS1', 'slider', 1.5, 'positive', '你对自己未来五年的职业发展，有多清晰的规划？', '{"slider":{"min":0,"max":100,"min_label":"完全没有，走一步看一步","max_label":"非常清晰，每个阶段都有目标","feedback":[{"range":[0,25],"text":"你目前还在摸索阶段，方向不太确定"},{"range":[26,45],"text":"有一些想法，但还不够具体"},{"range":[46,65],"text":"有大方向，但执行路径还不明确"},{"range":[66,85],"text":"规划比较清晰，在按计划推进"},{"range":[86,100],"text":"你对自己的职业路径非常清楚，目标明确"}]},"source_question":{"id":"MS1-B-M-07","order":7,"module":"MS1","sub":"MS1_B","type":"slider","weight":1.5,"direction":"positive","text":"你对自己未来五年的职业发展，有多清晰的规划？","slider":{"min":0,"max":100,"min_label":"完全没有，走一步看一步","max_label":"非常清晰，每个阶段都有目标","feedback":[{"range":[0,25],"text":"你目前还在摸索阶段，方向不太确定"},{"range":[26,45],"text":"有一些想法，但还不够具体"},{"range":[46,65],"text":"有大方向，但执行路径还不明确"},{"range":[66,85],"text":"规划比较清晰，在按计划推进"},{"range":[86,100],"text":"你对自己的职业路径非常清楚，目标明确"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-B-M-08', 8, 'MS1', 'scenario', 1.5, 'positive', '她问你「你觉得自己五年后会是什么状态」。你的回答最接近哪种？', '{"scene":"未来规划的清晰度","options":[{"key":"A","text":"能说出具体的职位、收入目标或者事业方向","sub":"规划清晰，轨道可见","score":90},{"key":"B","text":"大概知道方向，但具体说不太清楚","sub":"中等，有方向无细节","score":65},{"key":"C","text":"比现在好很多，但怎么好说不上来","sub":"轨道模糊，期待型","score":45},{"key":"D","text":"说实话没想太多，先过好当下","sub":"缺乏规划，短视型","score":25}],"source_question":{"id":"MS1-B-M-08","order":8,"module":"MS1","sub":"MS1_B","type":"scenario","weight":1.5,"direction":"positive","text":"她问你「你觉得自己五年后会是什么状态」。你的回答最接近哪种？","scene":"未来规划的清晰度","options":[{"key":"A","text":"能说出具体的职位、收入目标或者事业方向","sub":"规划清晰，轨道可见","score":90},{"key":"B","text":"大概知道方向，但具体说不太清楚","sub":"中等，有方向无细节","score":65},{"key":"C","text":"比现在好很多，但怎么好说不上来","sub":"轨道模糊，期待型","score":45},{"key":"D","text":"说实话没想太多，先过好当下","sub":"缺乏规划，短视型","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-B-M-09', 9, 'MS1', 'binary', 1.3, 'positive', '你现在的工作，在你看来是？', '{"options":[{"key":"left","text":"在上升通道里，还有很大空间","sub":"成长轨道清晰","score":80},{"key":"right","text":"比较稳定，但天花板也差不多看到了","sub":"稳定但上限有限","score":55}],"source_question":{"id":"MS1-B-M-09","order":9,"module":"MS1","sub":"MS1_B","type":"binary","weight":1.3,"direction":"positive","text":"你现在的工作，在你看来是？","options":[{"key":"left","text":"在上升通道里，还有很大空间","sub":"成长轨道清晰","score":80},{"key":"right","text":"比较稳定，但天花板也差不多看到了","sub":"稳定但上限有限","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-B-M-10', 10, 'MS1', 'choice', 1.3, 'positive', '你目前的职业状态，最接近哪种描述？', '{"options":[{"key":"A","text":"在快速上升期，收入和职位都在增长","sub":"高速轨道","score":90},{"key":"B","text":"稳定发展，不急但方向对","sub":"稳健轨道","score":70},{"key":"C","text":"遇到了一些瓶颈，在想办法突破","sub":"轨道有阻力，待观察","score":50},{"key":"D","text":"还在找方向，不太确定适合什么","sub":"轨道不明确","score":30}],"source_question":{"id":"MS1-B-M-10","order":10,"module":"MS1","sub":"MS1_B","type":"choice","weight":1.3,"direction":"positive","text":"你目前的职业状态，最接近哪种描述？","options":[{"key":"A","text":"在快速上升期，收入和职位都在增长","sub":"高速轨道","score":90},{"key":"B","text":"稳定发展，不急但方向对","sub":"稳健轨道","score":70},{"key":"C","text":"遇到了一些瓶颈，在想办法突破","sub":"轨道有阻力，待观察","score":50},{"key":"D","text":"还在找方向，不太确定适合什么","sub":"轨道不明确","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-B-M-11', 11, 'MS1', 'scale', 1.2, 'positive', '我有明确的职业目标，并且正在为此采取具体行动。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS1-B-M-11","order":11,"module":"MS1","sub":"MS1_B","type":"scale","weight":1.2,"direction":"positive","text":"我有明确的职业目标，并且正在为此采取具体行动。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-B-M-12', 12, 'MS1', 'scenario', 1.3, 'positive', '你朋友问你，你现在的工作跟你三年前比怎么样。你最诚实的回答是？', '{"scene":"三年成长轨迹自评","options":[{"key":"A","text":"好太多了，无论是收入还是职位都提升了","sub":"上升轨道清晰","score":90},{"key":"B","text":"稳定了，收入差不多，但工作本身更顺手了","sub":"横向发展，稳定","score":65},{"key":"C","text":"换了几次，还没找到特别合适的","sub":"轨道波动，摸索中","score":45},{"key":"D","text":"差不多，没什么大变化","sub":"停滞风险","score":30}],"source_question":{"id":"MS1-B-M-12","order":12,"module":"MS1","sub":"MS1_B","type":"scenario","weight":1.3,"direction":"positive","text":"你朋友问你，你现在的工作跟你三年前比怎么样。你最诚实的回答是？","scene":"三年成长轨迹自评","options":[{"key":"A","text":"好太多了，无论是收入还是职位都提升了","sub":"上升轨道清晰","score":90},{"key":"B","text":"稳定了，收入差不多，但工作本身更顺手了","sub":"横向发展，稳定","score":65},{"key":"C","text":"换了几次，还没找到特别合适的","sub":"轨道波动，摸索中","score":45},{"key":"D","text":"差不多，没什么大变化","sub":"停滞风险","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-C-M-13', 13, 'MS1', 'card', 1.5, 'positive', '你的原生家庭，在你的感情和未来生活里，通常扮演什么角色？', '{"options":[{"key":"A","text":"后盾——需要的时候支持，不干涉我的选择","sub":"家庭是净资产","score":85},{"key":"B","text":"存在感不强——基本不管我，我自己扛","sub":"中性，独立型","score":70},{"key":"C","text":"会有意见——偶尔干预，但总体还好","sub":"轻度干预","score":55},{"key":"D","text":"参与度很高——我的感情和生活他们有很多想法","sub":"高干预，潜在风险","score":30}],"source_question":{"id":"MS1-C-M-13","order":13,"module":"MS1","sub":"MS1_C","type":"card","weight":1.5,"direction":"positive","text":"你的原生家庭，在你的感情和未来生活里，通常扮演什么角色？","options":[{"key":"A","text":"后盾——需要的时候支持，不干涉我的选择","sub":"家庭是净资产","score":85},{"key":"B","text":"存在感不强——基本不管我，我自己扛","sub":"中性，独立型","score":70},{"key":"C","text":"会有意见——偶尔干预，但总体还好","sub":"轻度干预","score":55},{"key":"D","text":"参与度很高——我的感情和生活他们有很多想法","sub":"高干预，潜在风险","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-C-M-14', 14, 'MS1', 'binary', 1.5, 'positive', '在你未来的感情或婚姻里，你家里会是？', '{"options":[{"key":"left","text":"助力，他们会支持我们，让对方感觉到欢迎","sub":"家庭加分","score":85},{"key":"right","text":"压力，他们有一些要求或者习惯，对方需要适应","sub":"家庭有挑战","score":40}],"source_question":{"id":"MS1-C-M-14","order":14,"module":"MS1","sub":"MS1_C","type":"binary","weight":1.5,"direction":"positive","text":"在你未来的感情或婚姻里，你家里会是？","options":[{"key":"left","text":"助力，他们会支持我们，让对方感觉到欢迎","sub":"家庭加分","score":85},{"key":"right","text":"压力，他们有一些要求或者习惯，对方需要适应","sub":"家庭有挑战","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-C-M-15', 15, 'MS1', 'choice', 1.3, 'positive', '你父母对你择偶的态度，大概是？', '{"options":[{"key":"A","text":"尊重我的选择，没有硬性条件","sub":"低干预，低风险","score":85},{"key":"B","text":"有一些期待，比如希望对方工作好，但不强求","sub":"轻度期待，可沟通","score":70},{"key":"C","text":"有比较明确的条件，比如户籍/家境/学历","sub":"中度干预，需协调","score":50},{"key":"D","text":"要求多且坚持，这是我谈恋爱的压力来源","sub":"高干预，风险明显","score":25}],"source_question":{"id":"MS1-C-M-15","order":15,"module":"MS1","sub":"MS1_C","type":"choice","weight":1.3,"direction":"positive","text":"你父母对你择偶的态度，大概是？","options":[{"key":"A","text":"尊重我的选择，没有硬性条件","sub":"低干预，低风险","score":85},{"key":"B","text":"有一些期待，比如希望对方工作好，但不强求","sub":"轻度期待，可沟通","score":70},{"key":"C","text":"有比较明确的条件，比如户籍/家境/学历","sub":"中度干预，需协调","score":50},{"key":"D","text":"要求多且坚持，这是我谈恋爱的压力来源","sub":"高干预，风险明显","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-C-M-16', 16, 'MS1', 'scale', 1.2, 'positive', '我的家庭背景对我的感情是一个加分项，而不是需要对方额外接受的负担。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS1-C-M-16","order":16,"module":"MS1","sub":"MS1_C","type":"scale","weight":1.2,"direction":"positive","text":"我的家庭背景对我的感情是一个加分项，而不是需要对方额外接受的负担。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-C-M-17', 17, 'MS1', 'scenario', 1.3, 'positive', '你女朋友第一次见你父母，吃完饭回来她问你感觉怎么样。你最真实的预期是？', '{"scene":"女友见家长的预判","options":[{"key":"A","text":"应该挺顺的，我爸妈好相处，不为难人","sub":"家庭助力，低风险","score":85},{"key":"B","text":"会有点考察，但讲道理，能过","sub":"中等，可控","score":65},{"key":"C","text":"我其实有点担心，我父母比较挑剔","sub":"家庭是挑战，中高风险","score":40},{"key":"D","text":"我一般不急着让她见我父母，时机不对容易出问题","sub":"高风险，有意回避","score":25}],"source_question":{"id":"MS1-C-M-17","order":17,"module":"MS1","sub":"MS1_C","type":"scenario","weight":1.3,"direction":"positive","text":"你女朋友第一次见你父母，吃完饭回来她问你感觉怎么样。你最真实的预期是？","scene":"女友见家长的预判","options":[{"key":"A","text":"应该挺顺的，我爸妈好相处，不为难人","sub":"家庭助力，低风险","score":85},{"key":"B","text":"会有点考察，但讲道理，能过","sub":"中等，可控","score":65},{"key":"C","text":"我其实有点担心，我父母比较挑剔","sub":"家庭是挑战，中高风险","score":40},{"key":"D","text":"我一般不急着让她见我父母，时机不对容易出问题","sub":"高风险，有意回避","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS1-C-M-18', 18, 'MS1', 'slider', 1.0, 'positive', '你觉得你的家庭背景，在择偶市场上是加分项还是需要对方接受的部分？', '{"slider":{"min":0,"max":100,"min_label":"坦白说是对方需要接受的部分","max_label":"是我明显的加分项","feedback":[{"range":[0,25],"text":"你的家庭背景在择偶中可能需要额外解释"},{"range":[26,50],"text":"中性，不加分也不明显扣分"},{"range":[51,75],"text":"算是加分项，家庭情况不差"},{"range":[76,100],"text":"你的家庭背景是明显的竞争优势"}]},"source_question":{"id":"MS1-C-M-18","order":18,"module":"MS1","sub":"MS1_C","type":"slider","weight":1.0,"direction":"positive","text":"你觉得你的家庭背景，在择偶市场上是加分项还是需要对方接受的部分？","slider":{"min":0,"max":100,"min_label":"坦白说是对方需要接受的部分","max_label":"是我明显的加分项","feedback":[{"range":[0,25],"text":"你的家庭背景在择偶中可能需要额外解释"},{"range":[26,50],"text":"中性，不加分也不明显扣分"},{"range":[51,75],"text":"算是加分项，家庭情况不差"},{"range":[76,100],"text":"你的家庭背景是明显的竞争优势"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-A-M-19', 19, 'MS2', 'scenario', 1.5, 'positive', '你答应她周六陪她去看展，但临时朋友约你打球，他们很久没聚了。你通常会怎么做？', '{"scene":"承诺vs临时诱惑的选择","options":[{"key":"A","text":"跟朋友说改天，先把跟她的约定兑现","sub":"高履约度，承诺优先","score":90},{"key":"B","text":"跟她商量能不能改个时间，解释原因","sub":"中等，有沟通但动摇了承诺","score":60},{"key":"C","text":"去打球，心想展随时都可以去","sub":"低履约度，承诺可被挤占","score":25},{"key":"D","text":"两边都不想放弃，最后搞得两边都不满意","sub":"决断力弱，执行混乱","score":35}],"source_question":{"id":"MS2-A-M-19","order":19,"module":"MS2","sub":"MS2_A","type":"scenario","weight":1.5,"direction":"positive","text":"你答应她周六陪她去看展，但临时朋友约你打球，他们很久没聚了。你通常会怎么做？","scene":"承诺vs临时诱惑的选择","options":[{"key":"A","text":"跟朋友说改天，先把跟她的约定兑现","sub":"高履约度，承诺优先","score":90},{"key":"B","text":"跟她商量能不能改个时间，解释原因","sub":"中等，有沟通但动摇了承诺","score":60},{"key":"C","text":"去打球，心想展随时都可以去","sub":"低履约度，承诺可被挤占","score":25},{"key":"D","text":"两边都不想放弃，最后搞得两边都不满意","sub":"决断力弱，执行混乱","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-A-M-20', 20, 'MS2', 'binary', 1.5, 'positive', '你在生活里，算不算一个说到做到的人？', '{"options":[{"key":"left","text":"算，答应的事我基本都会做到","sub":"高履约","score":85},{"key":"right","text":"不一定，有时候会忘或者变了计划","sub":"低履约","score":40}],"source_question":{"id":"MS2-A-M-20","order":20,"module":"MS2","sub":"MS2_A","type":"binary","weight":1.5,"direction":"positive","text":"你在生活里，算不算一个说到做到的人？","options":[{"key":"left","text":"算，答应的事我基本都会做到","sub":"高履约","score":85},{"key":"right","text":"不一定，有时候会忘或者变了计划","sub":"低履约","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-A-M-21', 21, 'MS2', 'choice', 1.3, 'positive', '你在感情里守时吗？', '{"options":[{"key":"A","text":"很守时，迟到对我来说是例外","sub":"高可靠度","score":90},{"key":"B","text":"一般，偶尔会晚几分钟，但不严重","sub":"中等","score":65},{"key":"C","text":"不太准时，但我会提前说","sub":"低守时但有沟通","score":50},{"key":"D","text":"经常迟到，这个我承认是个问题","sub":"低可靠度","score":20}],"source_question":{"id":"MS2-A-M-21","order":21,"module":"MS2","sub":"MS2_A","type":"choice","weight":1.3,"direction":"positive","text":"你在感情里守时吗？","options":[{"key":"A","text":"很守时，迟到对我来说是例外","sub":"高可靠度","score":90},{"key":"B","text":"一般，偶尔会晚几分钟，但不严重","sub":"中等","score":65},{"key":"C","text":"不太准时，但我会提前说","sub":"低守时但有沟通","score":50},{"key":"D","text":"经常迟到，这个我承认是个问题","sub":"低可靠度","score":20}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-A-M-22', 22, 'MS2', 'scenario', 1.5, 'positive', '你答应她某件事，但后来因为自己的原因没做到。你通常怎么处理？', '{"scene":"失信后的补救行为","options":[{"key":"A","text":"主动道歉，解释原因，想办法补救","sub":"高责任感","score":90},{"key":"B","text":"道歉，但没有特别去补救","sub":"中等，有认错但执行不足","score":65},{"key":"C","text":"等她提起来再说，不主动","sub":"被动型，责任感偏弱","score":40},{"key":"D","text":"觉得没什么大不了，事情过了就过了","sub":"低责任感","score":20}],"source_question":{"id":"MS2-A-M-22","order":22,"module":"MS2","sub":"MS2_A","type":"scenario","weight":1.5,"direction":"positive","text":"你答应她某件事，但后来因为自己的原因没做到。你通常怎么处理？","scene":"失信后的补救行为","options":[{"key":"A","text":"主动道歉，解释原因，想办法补救","sub":"高责任感","score":90},{"key":"B","text":"道歉，但没有特别去补救","sub":"中等，有认错但执行不足","score":65},{"key":"C","text":"等她提起来再说，不主动","sub":"被动型，责任感偏弱","score":40},{"key":"D","text":"觉得没什么大不了，事情过了就过了","sub":"低责任感","score":20}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-A-M-23', 23, 'MS2', 'scale', 1.2, 'positive', '我在感情里答应的事，基本上都会做到，不会让她因为我的失信感到失望。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS2-A-M-23","order":23,"module":"MS2","sub":"MS2_A","type":"scale","weight":1.2,"direction":"positive","text":"我在感情里答应的事，基本上都会做到，不会让她因为我的失信感到失望。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-A-M-24', 24, 'MS2', 'rank', 1.2, 'positive', '在感情里，下面哪些事你最难做到？从最难到最容易排序。', '{"items":[{"id":"a","text":"每次约定都准时到"},{"id":"b","text":"答应的事情不打折扣地完成"},{"id":"c","text":"在她需要时第一时间出现"},{"id":"d","text":"情绪不好时也保持对她的承诺"}],"source_question":{"id":"MS2-A-M-24","order":24,"module":"MS2","sub":"MS2_A","type":"rank","weight":1.2,"direction":"positive","text":"在感情里，下面哪些事你最难做到？从最难到最容易排序。","items":[{"id":"a","text":"每次约定都准时到"},{"id":"b","text":"答应的事情不打折扣地完成"},{"id":"c","text":"在她需要时第一时间出现"},{"id":"d","text":"情绪不好时也保持对她的承诺"}],"scoring":{"method":"rank_difficulty_analysis","note":"d排最难=有自我觉察=正向信号；a排最难=守时问题=扣分项；b排最难=低履约=高风险"}}}'::jsonb, '{"method":"rank_difficulty_analysis","note":"d排最难=有自我觉察=正向信号；a排最难=守时问题=扣分项；b排最难=低履约=高风险"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-B-M-25', 25, 'MS2', 'scenario', 1.5, 'positive', '工作上遇到了很烂的事，心情很差。回家之后她随口问了一句「今天怎么了」。你通常的反应是？', '{"scene":"负面情绪的处理方式","options":[{"key":"A","text":"跟她说今天发生了什么，让她了解我的状态","sub":"情绪开放，能沟通","score":85},{"key":"B","text":"说「没事，有点累」，自己消化","sub":"封闭型，不迁怒但也不沟通","score":65},{"key":"C","text":"语气有点差，但不是故意针对她","sub":"情绪迁移，觉察弱","score":40},{"key":"D","text":"发了一顿，事后知道不对","sub":"低情绪控制，迁怒倾向","score":20}],"source_question":{"id":"MS2-B-M-25","order":25,"module":"MS2","sub":"MS2_B","type":"scenario","weight":1.5,"direction":"positive","text":"工作上遇到了很烂的事，心情很差。回家之后她随口问了一句「今天怎么了」。你通常的反应是？","scene":"负面情绪的处理方式","options":[{"key":"A","text":"跟她说今天发生了什么，让她了解我的状态","sub":"情绪开放，能沟通","score":85},{"key":"B","text":"说「没事，有点累」，自己消化","sub":"封闭型，不迁怒但也不沟通","score":65},{"key":"C","text":"语气有点差，但不是故意针对她","sub":"情绪迁移，觉察弱","score":40},{"key":"D","text":"发了一顿，事后知道不对","sub":"低情绪控制，迁怒倾向","score":20}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-B-M-26', 26, 'MS2', 'mood', 1.5, 'positive', '你们发生争执，她说了一句很让你生气的话。你现在的状态是？', '{"options":[{"key":"A","icon":"ti-mood-angry","text":"很生气，可能会说出激烈的话","score":20},{"key":"B","icon":"ti-mood-empty","text":"沉默，什么都不想说","score":40},{"key":"C","icon":"ti-mood-confuzed","text":"懵，不知道怎么反应","score":45},{"key":"D","icon":"ti-mood-nervous","text":"担心关系会因此受损","score":50},{"key":"E","icon":"ti-mood-sad","text":"有点受伤，但会克制","score":65},{"key":"F","icon":"ti-mood-smile","text":"冷静了，想怎么解决","score":80},{"key":"G","icon":"ti-mood-tongue","text":"给自己一点时间，然后去谈","score":85},{"key":"H","icon":"ti-mood-happy","text":"已经在想怎么沟通了","score":90}],"source_question":{"id":"MS2-B-M-26","order":26,"module":"MS2","sub":"MS2_B","type":"mood","weight":1.5,"direction":"positive","text":"你们发生争执，她说了一句很让你生气的话。你现在的状态是？","options":[{"key":"A","icon":"ti-mood-angry","text":"很生气，可能会说出激烈的话","score":20},{"key":"B","icon":"ti-mood-empty","text":"沉默，什么都不想说","score":40},{"key":"C","icon":"ti-mood-confuzed","text":"懵，不知道怎么反应","score":45},{"key":"D","icon":"ti-mood-nervous","text":"担心关系会因此受损","score":50},{"key":"E","icon":"ti-mood-sad","text":"有点受伤，但会克制","score":65},{"key":"F","icon":"ti-mood-smile","text":"冷静了，想怎么解决","score":80},{"key":"G","icon":"ti-mood-tongue","text":"给自己一点时间，然后去谈","score":85},{"key":"H","icon":"ti-mood-happy","text":"已经在想怎么沟通了","score":90}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-B-M-27', 27, 'MS2', 'binary', 1.5, 'positive', '当你情绪很差的时候，你对她的态度会？', '{"options":[{"key":"left","text":"基本不受影响，我能把情绪管好","sub":"高情绪隔离能力","score":85},{"key":"right","text":"会有影响，状态差的时候她能感觉到","sub":"情绪外溢，低稳定性","score":40}],"source_question":{"id":"MS2-B-M-27","order":27,"module":"MS2","sub":"MS2_B","type":"binary","weight":1.5,"direction":"positive","text":"当你情绪很差的时候，你对她的态度会？","options":[{"key":"left","text":"基本不受影响，我能把情绪管好","sub":"高情绪隔离能力","score":85},{"key":"right","text":"会有影响，状态差的时候她能感觉到","sub":"情绪外溢，低稳定性","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-B-M-28', 28, 'MS2', 'scale', 1.5, 'positive', '我不会把工作、家庭或其他地方的坏情绪带回来发泄在她身上。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS2-B-M-28","order":28,"module":"MS2","sub":"MS2_B","type":"scale","weight":1.5,"direction":"positive","text":"我不会把工作、家庭或其他地方的坏情绪带回来发泄在她身上。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-B-M-29', 29, 'MS2', 'slider', 1.3, 'positive', '在关系里发生冲突时，你保持情绪稳定、不失控的能力有多强？', '{"slider":{"min":0,"max":100,"min_label":"很难控制，容易情绪化","max_label":"通常能保持相对冷静","feedback":[{"range":[0,25],"text":"冲突是你情绪最难控制的时刻"},{"range":[26,45],"text":"会有情绪波动，不总能控制"},{"range":[46,65],"text":"能撑一段时间，但持续压力下会有问题"},{"range":[66,85],"text":"通常能保持，偶尔失控"},{"range":[86,100],"text":"你有较强的情绪容纳能力"}]},"source_question":{"id":"MS2-B-M-29","order":29,"module":"MS2","sub":"MS2_B","type":"slider","weight":1.3,"direction":"positive","text":"在关系里发生冲突时，你保持情绪稳定、不失控的能力有多强？","slider":{"min":0,"max":100,"min_label":"很难控制，容易情绪化","max_label":"通常能保持相对冷静","feedback":[{"range":[0,25],"text":"冲突是你情绪最难控制的时刻"},{"range":[26,45],"text":"会有情绪波动，不总能控制"},{"range":[46,65],"text":"能撑一段时间，但持续压力下会有问题"},{"range":[66,85],"text":"通常能保持，偶尔失控"},{"range":[86,100],"text":"你有较强的情绪容纳能力"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-C-M-30', 30, 'MS2', 'binary', 1.3, 'positive', '你跟她在一起，她对你的日常生活和社交是否清楚？', '{"options":[{"key":"left","text":"清楚，我不会刻意隐瞒什么","sub":"高透明度","score":85},{"key":"right","text":"有一些部分我没有主动说，不是秘密但也没提","sub":"中等透明度","score":55}],"source_question":{"id":"MS2-C-M-30","order":30,"module":"MS2","sub":"MS2_C","type":"binary","weight":1.3,"direction":"positive","text":"你跟她在一起，她对你的日常生活和社交是否清楚？","options":[{"key":"left","text":"清楚，我不会刻意隐瞒什么","sub":"高透明度","score":85},{"key":"right","text":"有一些部分我没有主动说，不是秘密但也没提","sub":"中等透明度","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-C-M-31', 31, 'MS2', 'choice', 1.5, 'positive', '你跟异性朋友的关系，她清楚吗？', '{"options":[{"key":"A","text":"清楚，我会主动告诉她谁是谁，什么关系","sub":"高透明，主动告知","score":90},{"key":"B","text":"大概清楚，没有刻意说但也没隐瞒","sub":"中等，被动透明","score":65},{"key":"C","text":"她不太清楚，我不太提这些","sub":"低透明度，有模糊空间","score":40},{"key":"D","text":"我觉得没必要每个都说清楚","sub":"信息不对称，风险信号","score":25}],"source_question":{"id":"MS2-C-M-31","order":31,"module":"MS2","sub":"MS2_C","type":"choice","weight":1.5,"direction":"positive","text":"你跟异性朋友的关系，她清楚吗？","options":[{"key":"A","text":"清楚，我会主动告诉她谁是谁，什么关系","sub":"高透明，主动告知","score":90},{"key":"B","text":"大概清楚，没有刻意说但也没隐瞒","sub":"中等，被动透明","score":65},{"key":"C","text":"她不太清楚，我不太提这些","sub":"低透明度，有模糊空间","score":40},{"key":"D","text":"我觉得没必要每个都说清楚","sub":"信息不对称，风险信号","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-C-M-32', 32, 'MS2', 'scenario', 1.5, 'positive', '她发现你跟一个女性聊了很久，但你没有主动提起过这个人。你的解释最接近？', '{"scene":"被发现未主动提及的异性往来","options":[{"key":"A","text":"我直接告诉她是谁，有什么背景，没什么好隐瞒的","sub":"高透明，主动澄清","score":90},{"key":"B","text":"我解释了，但心里有点烦为什么要解释","sub":"中等，解释但有情绪","score":60},{"key":"C","text":"我觉得没什么必要解释，普通朋友而已","sub":"透明度低，认为无需说明","score":35},{"key":"D","text":"有点心虚，但还是解释了","sub":"有隐瞒迹象","score":20}],"source_question":{"id":"MS2-C-M-32","order":32,"module":"MS2","sub":"MS2_C","type":"scenario","weight":1.5,"direction":"positive","text":"她发现你跟一个女性聊了很久，但你没有主动提起过这个人。你的解释最接近？","scene":"被发现未主动提及的异性往来","options":[{"key":"A","text":"我直接告诉她是谁，有什么背景，没什么好隐瞒的","sub":"高透明，主动澄清","score":90},{"key":"B","text":"我解释了，但心里有点烦为什么要解释","sub":"中等，解释但有情绪","score":60},{"key":"C","text":"我觉得没什么必要解释，普通朋友而已","sub":"透明度低，认为无需说明","score":35},{"key":"D","text":"有点心虚，但还是解释了","sub":"有隐瞒迹象","score":20}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-C-M-33', 33, 'MS2', 'scale', 1.3, 'positive', '我会主动告诉她我生活里重要的事情，不需要她来问才说。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS2-C-M-33","order":33,"module":"MS2","sub":"MS2_C","type":"scale","weight":1.3,"direction":"positive","text":"我会主动告诉她我生活里重要的事情，不需要她来问才说。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS2-C-M-34', 34, 'MS2', 'choice', 1.2, 'positive', '你过去的感情历史，她清楚吗？', '{"options":[{"key":"A","text":"清楚，我主动告诉她了","sub":"高透明","score":85},{"key":"B","text":"大概清楚，她问了我答了","sub":"被动透明","score":65},{"key":"C","text":"不太清楚，我没有主动说，她也没问","sub":"低透明度","score":45},{"key":"D","text":"我不太想说这些，过去的事没必要翻","sub":"隐瞒倾向，潜在风险","score":25}],"source_question":{"id":"MS2-C-M-34","order":34,"module":"MS2","sub":"MS2_C","type":"choice","weight":1.2,"direction":"positive","text":"你过去的感情历史，她清楚吗？","options":[{"key":"A","text":"清楚，我主动告诉她了","sub":"高透明","score":85},{"key":"B","text":"大概清楚，她问了我答了","sub":"被动透明","score":65},{"key":"C","text":"不太清楚，我没有主动说，她也没问","sub":"低透明度","score":45},{"key":"D","text":"我不太想说这些，过去的事没必要翻","sub":"隐瞒倾向，潜在风险","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-A-M-35', 35, 'MS3', 'scenario', 1.3, 'positive', '你们约会，饭吃完了还不想回去。通常是谁在提议接下来去哪？', '{"scene":"约会续集的主导方","options":[{"key":"A","text":"我来提，我一般有想法","sub":"主导型，趣味输出强","score":80},{"key":"B","text":"我们聊着聊着自然想到了","sub":"双向互动，自然流","score":85},{"key":"C","text":"她来决定，我跟着走","sub":"被动型，趣味输出弱","score":50},{"key":"D","text":"通常各自回家了，没什么特别安排","sub":"话题密度和互动意愿偏低","score":30}],"source_question":{"id":"MS3-A-M-35","order":35,"module":"MS3","sub":"MS3_A","type":"scenario","weight":1.3,"direction":"positive","text":"你们约会，饭吃完了还不想回去。通常是谁在提议接下来去哪？","scene":"约会续集的主导方","options":[{"key":"A","text":"我来提，我一般有想法","sub":"主导型，趣味输出强","score":80},{"key":"B","text":"我们聊着聊着自然想到了","sub":"双向互动，自然流","score":85},{"key":"C","text":"她来决定，我跟着走","sub":"被动型，趣味输出弱","score":50},{"key":"D","text":"通常各自回家了，没什么特别安排","sub":"话题密度和互动意愿偏低","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-A-M-36', 36, 'MS3', 'choice', 1.3, 'positive', '跟她聊天，通常是什么状态？', '{"options":[{"key":"A","text":"我话比较多，话题也多，她说跟我聊天不无聊","sub":"高话题输出","score":80},{"key":"B","text":"双方都挺有话说，很自然","sub":"均衡互动","score":85},{"key":"C","text":"我不太擅长主动找话题，更多是接话","sub":"被动型","score":40},{"key":"D","text":"看她，她起话题我跟着聊，我不太会主动","sub":"选择性输出","score":55}],"source_question":{"id":"MS3-A-M-36","order":36,"module":"MS3","sub":"MS3_A","type":"choice","weight":1.3,"direction":"positive","text":"跟她聊天，通常是什么状态？","options":[{"key":"A","text":"我话比较多，话题也多，她说跟我聊天不无聊","sub":"高话题输出","score":80},{"key":"B","text":"双方都挺有话说，很自然","sub":"均衡互动","score":85},{"key":"C","text":"我不太擅长主动找话题，更多是接话","sub":"被动型","score":40},{"key":"D","text":"看她，她起话题我跟着聊，我不太会主动","sub":"选择性输出","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-A-M-37', 37, 'MS3', 'slider', 1.2, 'positive', '你觉得跟你在一起，她会不会觉得有意思？', '{"slider":{"min":0,"max":100,"min_label":"我可能比较无聊，没什么特别","max_label":"跟我在一起很有意思，不无聊","feedback":[{"range":[0,30],"text":"你可能需要发展一些制造趣味的能力"},{"range":[31,55],"text":"有时有趣，有时比较平"},{"range":[56,75],"text":"整体有趣，相处体验不错"},{"range":[76,100],"text":"你是那种让人觉得跟你在一起不无聊的人"}]},"source_question":{"id":"MS3-A-M-37","order":37,"module":"MS3","sub":"MS3_A","type":"slider","weight":1.2,"direction":"positive","text":"你觉得跟你在一起，她会不会觉得有意思？","slider":{"min":0,"max":100,"min_label":"我可能比较无聊，没什么特别","max_label":"跟我在一起很有意思，不无聊","feedback":[{"range":[0,30],"text":"你可能需要发展一些制造趣味的能力"},{"range":[31,55],"text":"有时有趣，有时比较平"},{"range":[56,75],"text":"整体有趣，相处体验不错"},{"range":[76,100],"text":"你是那种让人觉得跟你在一起不无聊的人"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-A-M-38', 38, 'MS3', 'binary', 1.0, 'positive', '你在关系里，更多是？', '{"options":[{"key":"left","text":"制造新鲜感和惊喜的那个","sub":"主动趣味输出","score":75},{"key":"right","text":"稳定可靠、让她放心的那个","sub":"安全感供给型","score":80}],"source_question":{"id":"MS3-A-M-38","order":38,"module":"MS3","sub":"MS3_A","type":"binary","weight":1.0,"direction":"positive","text":"你在关系里，更多是？","options":[{"key":"left","text":"制造新鲜感和惊喜的那个","sub":"主动趣味输出","score":75},{"key":"right","text":"稳定可靠、让她放心的那个","sub":"安全感供给型","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-A-M-39', 39, 'MS3', 'scale', 1.2, 'positive', '我有自己的生活和想法，跟她在一起的时候有东西可以分享，不会找不到话说。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS3-A-M-39","order":39,"module":"MS3","sub":"MS3_A","type":"scale","weight":1.2,"direction":"positive","text":"我有自己的生活和想法，跟她在一起的时候有东西可以分享，不会找不到话说。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-B-M-40', 40, 'MS3', 'scenario', 1.5, 'positive', '她跟你说今天工作上被领导骂了，很委屈，边说边快哭了。你的第一反应是？', '{"scene":"伴侣情绪崩溃时的回应","options":[{"key":"A","text":"先抱她，让她先哭出来，什么都不说","sub":"高情感接收能力","score":90},{"key":"B","text":"说「没事，那个领导有问题」，帮她站队","sub":"情感支持型，但偏向评判","score":70},{"key":"C","text":"问她具体怎么回事，帮她分析原因","sub":"解决导向，情绪接收不足","score":55},{"key":"D","text":"有点不知道怎么办，说「会好的」","sub":"情感支持能力弱","score":30}],"source_question":{"id":"MS3-B-M-40","order":40,"module":"MS3","sub":"MS3_B","type":"scenario","weight":1.5,"direction":"positive","text":"她跟你说今天工作上被领导骂了，很委屈，边说边快哭了。你的第一反应是？","scene":"伴侣情绪崩溃时的回应","options":[{"key":"A","text":"先抱她，让她先哭出来，什么都不说","sub":"高情感接收能力","score":90},{"key":"B","text":"说「没事，那个领导有问题」，帮她站队","sub":"情感支持型，但偏向评判","score":70},{"key":"C","text":"问她具体怎么回事，帮她分析原因","sub":"解决导向，情绪接收不足","score":55},{"key":"D","text":"有点不知道怎么办，说「会好的」","sub":"情感支持能力弱","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-B-M-41', 41, 'MS3', 'binary', 1.5, 'positive', '她跟你倾诉一件烦心事，你的本能反应是？', '{"options":[{"key":"left","text":"先听完，让她感觉到被理解","sub":"情感接收型","score":85},{"key":"right","text":"边听边帮她想解决方案","sub":"解决导向型","score":55}],"source_question":{"id":"MS3-B-M-41","order":41,"module":"MS3","sub":"MS3_B","type":"binary","weight":1.5,"direction":"positive","text":"她跟你倾诉一件烦心事，你的本能反应是？","options":[{"key":"left","text":"先听完，让她感觉到被理解","sub":"情感接收型","score":85},{"key":"right","text":"边听边帮她想解决方案","sub":"解决导向型","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-B-M-42', 42, 'MS3', 'mood', 1.3, 'positive', '她情绪很差，发消息给你说「我今天好难过」。你的第一反应是？', '{"options":[{"key":"A","icon":"ti-heart","text":"马上问她怎么了，要不要过来陪她","score":90},{"key":"B","icon":"ti-mood-happy","text":"发了个拥抱表情，问她发生什么了","score":85},{"key":"C","icon":"ti-mood-smile","text":"说「说来听听」","score":75},{"key":"D","icon":"ti-mood-confuzed","text":"有点不知道怎么回，想了一下才回","score":60},{"key":"E","icon":"ti-mood-nervous","text":"担心是不是自己做了什么","score":50},{"key":"F","icon":"ti-mood-empty","text":"回了个「怎么了」，等她说","score":55},{"key":"G","icon":"ti-mood-sad","text":"感觉有点烦，不知道该怎么回应","score":20},{"key":"H","icon":"ti-mood-tongue","text":"打了个电话过去","score":90}],"source_question":{"id":"MS3-B-M-42","order":42,"module":"MS3","sub":"MS3_B","type":"mood","weight":1.3,"direction":"positive","text":"她情绪很差，发消息给你说「我今天好难过」。你的第一反应是？","options":[{"key":"A","icon":"ti-heart","text":"马上问她怎么了，要不要过来陪她","score":90},{"key":"B","icon":"ti-mood-happy","text":"发了个拥抱表情，问她发生什么了","score":85},{"key":"C","icon":"ti-mood-smile","text":"说「说来听听」","score":75},{"key":"D","icon":"ti-mood-confuzed","text":"有点不知道怎么回，想了一下才回","score":60},{"key":"E","icon":"ti-mood-nervous","text":"担心是不是自己做了什么","score":50},{"key":"F","icon":"ti-mood-empty","text":"回了个「怎么了」，等她说","score":55},{"key":"G","icon":"ti-mood-sad","text":"感觉有点烦，不知道该怎么回应","score":20},{"key":"H","icon":"ti-mood-tongue","text":"打了个电话过去","score":90}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-B-M-43', 43, 'MS3', 'scale', 1.3, 'positive', '当她情绪低落时，我通常能感知到，并且知道用什么方式让她感觉好一点。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS3-B-M-43","order":43,"module":"MS3","sub":"MS3_B","type":"scale","weight":1.3,"direction":"positive","text":"当她情绪低落时，我通常能感知到，并且知道用什么方式让她感觉好一点。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-B-M-44', 44, 'MS3', 'scenario', 1.2, 'positive', '你们异地，她说最近很累，很想你。但你今天真的很忙，根本没时间。你通常会怎么做？', '{"scene":"忙碌时的情感响应优先级","options":[{"key":"A","text":"挤出十分钟打个电话，哪怕很短","sub":"高情感响应","score":90},{"key":"B","text":"发语音说自己在忙，但晚点一定联系她","sub":"中等，有温度有边界","score":75},{"key":"C","text":"回个消息说「我在忙，等我」，然后忙完了再说","sub":"低情感响应","score":50},{"key":"D","text":"看到了但没立刻回，等忙完了再统一处理","sub":"情感响应延迟，低优先级","score":30}],"source_question":{"id":"MS3-B-M-44","order":44,"module":"MS3","sub":"MS3_B","type":"scenario","weight":1.2,"direction":"positive","text":"你们异地，她说最近很累，很想你。但你今天真的很忙，根本没时间。你通常会怎么做？","scene":"忙碌时的情感响应优先级","options":[{"key":"A","text":"挤出十分钟打个电话，哪怕很短","sub":"高情感响应","score":90},{"key":"B","text":"发语音说自己在忙，但晚点一定联系她","sub":"中等，有温度有边界","score":75},{"key":"C","text":"回个消息说「我在忙，等我」，然后忙完了再说","sub":"低情感响应","score":50},{"key":"D","text":"看到了但没立刻回，等忙完了再统一处理","sub":"情感响应延迟，低优先级","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-C-M-45', 45, 'MS3', 'binary', 1.5, 'positive', '你觉得如果你们分开，她会？', '{"options":[{"key":"left","text":"很难找到像我这样的，我在她生活里很难替代","sub":"高不可替代感","score":85},{"key":"right","text":"她会慢慢好，我不确定自己有多难被替代","sub":"中等替代性","score":50}],"source_question":{"id":"MS3-C-M-45","order":45,"module":"MS3","sub":"MS3_C","type":"binary","weight":1.5,"direction":"positive","text":"你觉得如果你们分开，她会？","options":[{"key":"left","text":"很难找到像我这样的，我在她生活里很难替代","sub":"高不可替代感","score":85},{"key":"right","text":"她会慢慢好，我不确定自己有多难被替代","sub":"中等替代性","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-C-M-46', 46, 'MS3', 'choice', 1.3, 'positive', '在一段关系里，通常是她更需要你，还是你更需要她？', '{"options":[{"key":"A","text":"她更需要我，她依赖我多一些","sub":"被需要感强","score":85},{"key":"B","text":"差不多，互相需要","sub":"均衡型","score":75},{"key":"C","text":"我需要她多一些","sub":"被需要感弱，依赖倾向","score":40},{"key":"D","text":"看阶段，不同时期不一样","sub":"动态型","score":65}],"source_question":{"id":"MS3-C-M-46","order":46,"module":"MS3","sub":"MS3_C","type":"choice","weight":1.3,"direction":"positive","text":"在一段关系里，通常是她更需要你，还是你更需要她？","options":[{"key":"A","text":"她更需要我，她依赖我多一些","sub":"被需要感强","score":85},{"key":"B","text":"差不多，互相需要","sub":"均衡型","score":75},{"key":"C","text":"我需要她多一些","sub":"被需要感弱，依赖倾向","score":40},{"key":"D","text":"看阶段，不同时期不一样","sub":"动态型","score":65}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-C-M-47', 47, 'MS3', 'scenario', 1.5, 'positive', '你们在一起八个月，她朋友问她「你男朋友有什么特别的地方」。你觉得她最可能说的是？', '{"scene":"在伴侣眼中的差异化价值","options":[{"key":"A","text":"「跟他在一起很安心，说不清楚，就是不想离开」","sub":"高情感粘性","score":90},{"key":"B","text":"「他很上进/很靠谱/很有趣」——具体某个特质","sub":"有明确辨识点","score":75},{"key":"C","text":"「他挺好的」——然后说不下去了","sub":"存在感不足","score":40},{"key":"D","text":"「他对我很好，我们相处不错」","sub":"关系质量好但独特性待提升","score":60}],"source_question":{"id":"MS3-C-M-47","order":47,"module":"MS3","sub":"MS3_C","type":"scenario","weight":1.5,"direction":"positive","text":"你们在一起八个月，她朋友问她「你男朋友有什么特别的地方」。你觉得她最可能说的是？","scene":"在伴侣眼中的差异化价值","options":[{"key":"A","text":"「跟他在一起很安心，说不清楚，就是不想离开」","sub":"高情感粘性","score":90},{"key":"B","text":"「他很上进/很靠谱/很有趣」——具体某个特质","sub":"有明确辨识点","score":75},{"key":"C","text":"「他挺好的」——然后说不下去了","sub":"存在感不足","score":40},{"key":"D","text":"「他对我很好，我们相处不错」","sub":"关系质量好但独特性待提升","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS3-C-M-48', 48, 'MS3', 'scale', 1.2, 'positive', '在关系里，我有自己的位置和价值，她很难在别的人身上得到同样的感觉。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS3-C-M-48","order":48,"module":"MS3","sub":"MS3_C","type":"scale","weight":1.2,"direction":"positive","text":"在关系里，我有自己的位置和价值，她很难在别的人身上得到同样的感觉。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-A-M-49', 49, 'MS4', 'slider', 1.5, 'positive', '你觉得自己的整体外形，在同龄男性里处于什么水平？', '{"slider":{"min":0,"max":100,"min_label":"比较普通，外形不是我的优势","max_label":"外形明显好于同龄人","feedback":[{"range":[0,25],"text":"外形不是你的核心竞争力，其他维度更重要"},{"range":[26,45],"text":"中等偏下，有提升空间"},{"range":[46,65],"text":"中等，外形不拉分也不加分"},{"range":[66,80],"text":"中等偏上，外形是你的加分项"},{"range":[81,100],"text":"外形是你明显的竞争优势"}]},"source_question":{"id":"MS4-A-M-49","order":49,"module":"MS4","sub":"MS4_A","type":"slider","weight":1.5,"direction":"positive","text":"你觉得自己的整体外形，在同龄男性里处于什么水平？","slider":{"min":0,"max":100,"min_label":"比较普通，外形不是我的优势","max_label":"外形明显好于同龄人","feedback":[{"range":[0,25],"text":"外形不是你的核心竞争力，其他维度更重要"},{"range":[26,45],"text":"中等偏下，有提升空间"},{"range":[46,65],"text":"中等，外形不拉分也不加分"},{"range":[66,80],"text":"中等偏上，外形是你的加分项"},{"range":[81,100],"text":"外形是你明显的竞争优势"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-A-M-50', 50, 'MS4', 'binary', 1.3, 'positive', '你对自己的外形，有没有主动维护的习惯？', '{"options":[{"key":"left","text":"有，我会注意穿搭、健身或者护肤","sub":"主动管理型","score":80},{"key":"right","text":"没有特别，保持基本整洁就行了","sub":"被动型","score":45}],"source_question":{"id":"MS4-A-M-50","order":50,"module":"MS4","sub":"MS4_A","type":"binary","weight":1.3,"direction":"positive","text":"你对自己的外形，有没有主动维护的习惯？","options":[{"key":"left","text":"有，我会注意穿搭、健身或者护肤","sub":"主动管理型","score":80},{"key":"right","text":"没有特别，保持基本整洁就行了","sub":"被动型","score":45}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-A-M-51', 51, 'MS4', 'choice', 1.2, 'positive', '她带你去见她的朋友，你通常的状态是？', '{"options":[{"key":"A","text":"准备一下，给她长脸是应该的","sub":"高形象意识","score":85},{"key":"B","text":"正常去，不会特别准备但也不会邋遢","sub":"中等，自然状态","score":65},{"key":"C","text":"没怎么在意，穿什么都差不多","sub":"低形象意识","score":35},{"key":"D","text":"有点紧张，但会努力表现好","sub":"有意识但不自信","score":60}],"source_question":{"id":"MS4-A-M-51","order":51,"module":"MS4","sub":"MS4_A","type":"choice","weight":1.2,"direction":"positive","text":"她带你去见她的朋友，你通常的状态是？","options":[{"key":"A","text":"准备一下，给她长脸是应该的","sub":"高形象意识","score":85},{"key":"B","text":"正常去，不会特别准备但也不会邋遢","sub":"中等，自然状态","score":65},{"key":"C","text":"没怎么在意，穿什么都差不多","sub":"低形象意识","score":35},{"key":"D","text":"有点紧张，但会努力表现好","sub":"有意识但不自信","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-A-M-52', 52, 'MS4', 'scale', 1.3, 'positive', '我会主动维护自己的外形状态，不会让她觉得带出去没面子。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS4-A-M-52","order":52,"module":"MS4","sub":"MS4_A","type":"scale","weight":1.3,"direction":"positive","text":"我会主动维护自己的外形状态，不会让她觉得带出去没面子。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-A-M-53', 53, 'MS4', 'scenario', 1.0, 'positive', '她发了张你们的合照到朋友圈，朋友们的评论是什么？你觉得最可能的是？', '{"scene":"合照在社交圈的反馈","options":[{"key":"A","text":"「你男朋友好帅/好有型」之类的夸你的","sub":"高外形认可度","score":85},{"key":"B","text":"「你们好甜」——夸关系不特别评价外形","sub":"中等，外形不是焦点","score":65},{"key":"C","text":"没什么特别评论，正常点赞","sub":"外形存在感低","score":45},{"key":"D","text":"我不确定，我们很少发合照","sub":"样本不足，中性处理","score":60}],"source_question":{"id":"MS4-A-M-53","order":53,"module":"MS4","sub":"MS4_A","type":"scenario","weight":1.0,"direction":"positive","text":"她发了张你们的合照到朋友圈，朋友们的评论是什么？你觉得最可能的是？","scene":"合照在社交圈的反馈","options":[{"key":"A","text":"「你男朋友好帅/好有型」之类的夸你的","sub":"高外形认可度","score":85},{"key":"B","text":"「你们好甜」——夸关系不特别评价外形","sub":"中等，外形不是焦点","score":65},{"key":"C","text":"没什么特别评论，正常点赞","sub":"外形存在感低","score":45},{"key":"D","text":"我不确定，我们很少发合照","sub":"样本不足，中性处理","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-B-M-54', 54, 'MS4', 'scenario', 1.5, 'positive', '你和她一起参加一个她朋友的聚会，你不认识里面大多数人。你通常是什么状态？', '{"scene":"陌生社交场合的融入能力","options":[{"key":"A","text":"很快融入，开始跟大家聊，场子热了","sub":"强社交主导力","score":85},{"key":"B","text":"找几个聊得来的，不冷场，但不特别活跃","sub":"中等，选择性社交","score":75},{"key":"C","text":"基本跟在她旁边，等她来介绍","sub":"低社交主动性","score":45},{"key":"D","text":"有点不自在，需要一段时间才能放开","sub":"社交适应慢","score":50}],"source_question":{"id":"MS4-B-M-54","order":54,"module":"MS4","sub":"MS4_B","type":"scenario","weight":1.5,"direction":"positive","text":"你和她一起参加一个她朋友的聚会，你不认识里面大多数人。你通常是什么状态？","scene":"陌生社交场合的融入能力","options":[{"key":"A","text":"很快融入，开始跟大家聊，场子热了","sub":"强社交主导力","score":85},{"key":"B","text":"找几个聊得来的，不冷场，但不特别活跃","sub":"中等，选择性社交","score":75},{"key":"C","text":"基本跟在她旁边，等她来介绍","sub":"低社交主动性","score":45},{"key":"D","text":"有点不自在，需要一段时间才能放开","sub":"社交适应慢","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-B-M-55', 55, 'MS4', 'binary', 1.3, 'positive', '在社交场合，你是那种容易被注意到的人吗？', '{"options":[{"key":"left","text":"是，进了一个场合不需要很长时间就有存在感","sub":"高社交存在感","score":80},{"key":"right","text":"不太是，我比较低调，不主动不太会被注意","sub":"低社交存在感","score":45}],"source_question":{"id":"MS4-B-M-55","order":55,"module":"MS4","sub":"MS4_B","type":"binary","weight":1.3,"direction":"positive","text":"在社交场合，你是那种容易被注意到的人吗？","options":[{"key":"left","text":"是，进了一个场合不需要很长时间就有存在感","sub":"高社交存在感","score":80},{"key":"right","text":"不太是，我比较低调，不主动不太会被注意","sub":"低社交存在感","score":45}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-B-M-56', 56, 'MS4', 'choice', 1.3, 'positive', '她的闺蜜们对你的第一印象，通常是？', '{"options":[{"key":"A","text":"很快就喜欢你，觉得你好相处/有趣","sub":"高社交好感度","score":85},{"key":"B","text":"觉得你挺好的，说不出特别突出的点","sub":"中等，印象平稳","score":65},{"key":"C","text":"感觉你有点冷/不好接近，但熟了会好","sub":"初始印象偏低，慢热","score":50},{"key":"D","text":"我还没见过她大多数的朋友","sub":"样本不足","score":60}],"source_question":{"id":"MS4-B-M-56","order":56,"module":"MS4","sub":"MS4_B","type":"choice","weight":1.3,"direction":"positive","text":"她的闺蜜们对你的第一印象，通常是？","options":[{"key":"A","text":"很快就喜欢你，觉得你好相处/有趣","sub":"高社交好感度","score":85},{"key":"B","text":"觉得你挺好的，说不出特别突出的点","sub":"中等，印象平稳","score":65},{"key":"C","text":"感觉你有点冷/不好接近，但熟了会好","sub":"初始印象偏低，慢热","score":50},{"key":"D","text":"我还没见过她大多数的朋友","sub":"样本不足","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-B-M-57', 57, 'MS4', 'scale', 1.2, 'positive', '在社交场合，我能让周围的人感到舒服，不会制造尴尬或者冷场。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS4-B-M-57","order":57,"module":"MS4","sub":"MS4_B","type":"scale","weight":1.2,"direction":"positive","text":"在社交场合，我能让周围的人感到舒服，不会制造尴尬或者冷场。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-B-M-58', 58, 'MS4', 'scenario', 1.5, 'positive', '她父母第一次见你，吃了一顿饭。你觉得他们对你的印象最可能是？', '{"scene":"见家长的好感输出","options":[{"key":"A","text":"挺满意的，我擅长跟长辈打交道","sub":"高好感输出，社交能力强","score":85},{"key":"B","text":"觉得还行，说不上特别好但没反感","sub":"中等，安全","score":65},{"key":"C","text":"有点拘谨，我跟长辈相处不太自然","sub":"社交适应弱","score":40},{"key":"D","text":"很难说，我每次见家长都很紧张","sub":"低稳定性","score":45}],"source_question":{"id":"MS4-B-M-58","order":58,"module":"MS4","sub":"MS4_B","type":"scenario","weight":1.5,"direction":"positive","text":"她父母第一次见你，吃了一顿饭。你觉得他们对你的印象最可能是？","scene":"见家长的好感输出","options":[{"key":"A","text":"挺满意的，我擅长跟长辈打交道","sub":"高好感输出，社交能力强","score":85},{"key":"B","text":"觉得还行，说不上特别好但没反感","sub":"中等，安全","score":65},{"key":"C","text":"有点拘谨，我跟长辈相处不太自然","sub":"社交适应弱","score":40},{"key":"D","text":"很难说，我每次见家长都很紧张","sub":"低稳定性","score":45}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-C-M-59', 59, 'MS4', 'binary', 1.3, 'positive', '你觉得带她出去，你给她长脸还是她给你长脸？', '{"options":[{"key":"left","text":"我给她长脸，带出去我有底气","sub":"体面感强","score":85},{"key":"right","text":"差不多，或者她在这方面更有优势","sub":"体面感中等","score":55}],"source_question":{"id":"MS4-C-M-59","order":59,"module":"MS4","sub":"MS4_C","type":"binary","weight":1.3,"direction":"positive","text":"你觉得带她出去，你给她长脸还是她给你长脸？","options":[{"key":"left","text":"我给她长脸，带出去我有底气","sub":"体面感强","score":85},{"key":"right","text":"差不多，或者她在这方面更有优势","sub":"体面感中等","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-C-M-60', 60, 'MS4', 'choice', 1.2, 'positive', '你在她家人朋友眼里，大概是什么形象？', '{"options":[{"key":"A","text":"让人放心的那种，稳、靠谱、有前途","sub":"高社会认可度","score":85},{"key":"B","text":"还不错，说不出特别突出的点","sub":"中等","score":65},{"key":"C","text":"有点难评价，可能还需要时间了解","sub":"辨识度低","score":45},{"key":"D","text":"我还没见过她大多数的家人朋友","sub":"样本不足","score":55}],"source_question":{"id":"MS4-C-M-60","order":60,"module":"MS4","sub":"MS4_C","type":"choice","weight":1.2,"direction":"positive","text":"你在她家人朋友眼里，大概是什么形象？","options":[{"key":"A","text":"让人放心的那种，稳、靠谱、有前途","sub":"高社会认可度","score":85},{"key":"B","text":"还不错，说不出特别突出的点","sub":"中等","score":65},{"key":"C","text":"有点难评价，可能还需要时间了解","sub":"辨识度低","score":45},{"key":"D","text":"我还没见过她大多数的家人朋友","sub":"样本不足","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-C-M-61', 61, 'MS4', 'scale', 1.2, 'positive', '我出现在她生活里，能给她加分，让她觉得有我在很有面子。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS4-C-M-61","order":61,"module":"MS4","sub":"MS4_C","type":"scale","weight":1.2,"direction":"positive","text":"我出现在她生活里，能给她加分，让她觉得有我在很有面子。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS4-C-M-62', 62, 'MS4', 'rank', 1.0, 'positive', '在择偶市场上，你觉得自己哪方面对她最有吸引力？从最强到最弱排序。', '{"items":[{"id":"a","text":"外形和整体气质"},{"id":"b","text":"经济条件和事业轨道"},{"id":"c","text":"相处起来的感觉和趣味"},{"id":"d","text":"稳定可靠、让她放心"}],"source_question":{"id":"MS4-C-M-62","order":62,"module":"MS4","sub":"MS4_C","type":"rank","weight":1.0,"direction":"positive","text":"在择偶市场上，你觉得自己哪方面对她最有吸引力？从最强到最弱排序。","items":[{"id":"a","text":"外形和整体气质"},{"id":"b","text":"经济条件和事业轨道"},{"id":"c","text":"相处起来的感觉和趣味"},{"id":"d","text":"稳定可靠、让她放心"}],"scoring":{"method":"self_awareness_check","note":"排第一的维度与该维度实际得分对比，差距大=自我认知偏差，在结果里指出"}}}'::jsonb, '{"method":"self_awareness_check","note":"排第一的维度与该维度实际得分对比，差距大=自我认知偏差，在结果里指出"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-A-M-63', 63, 'MS5', 'scenario', 1.5, 'reverse', '她问你「你上一段感情是怎么结束的」。你最真实的回答接近哪种？', '{"scene":"被问及过去感情的回应","options":[{"key":"A","text":"简单说了，双方都有问题，已经过去了","sub":"处理成熟，包袱轻","score":10},{"key":"B","text":"说了一些，但有些部分说不太清楚","sub":"中等，尚未完全消化","score":35},{"key":"C","text":"说了很多，那段感情对我影响还挺大的","sub":"包袱重，未愈合","score":65},{"key":"D","text":"不太想提，提了情绪会有一些波动","sub":"高包袱，前任阴影","score":80}],"source_question":{"id":"MS5-A-M-63","order":63,"module":"MS5","sub":"MS5_A","type":"scenario","weight":1.5,"direction":"reverse","text":"她问你「你上一段感情是怎么结束的」。你最真实的回答接近哪种？","scene":"被问及过去感情的回应","options":[{"key":"A","text":"简单说了，双方都有问题，已经过去了","sub":"处理成熟，包袱轻","score":10},{"key":"B","text":"说了一些，但有些部分说不太清楚","sub":"中等，尚未完全消化","score":35},{"key":"C","text":"说了很多，那段感情对我影响还挺大的","sub":"包袱重，未愈合","score":65},{"key":"D","text":"不太想提，提了情绪会有一些波动","sub":"高包袱，前任阴影","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-A-M-64', 64, 'MS5', 'binary', 1.5, 'reverse', '你现在跟前任还有联系吗？', '{"options":[{"key":"left","text":"没有，已经完全断开","sub":"低风险","score":10},{"key":"right","text":"偶尔有，关系说复杂也不复杂","sub":"中高风险","score":60}],"source_question":{"id":"MS5-A-M-64","order":64,"module":"MS5","sub":"MS5_A","type":"binary","weight":1.5,"direction":"reverse","text":"你现在跟前任还有联系吗？","options":[{"key":"left","text":"没有，已经完全断开","sub":"低风险","score":10},{"key":"right","text":"偶尔有，关系说复杂也不复杂","sub":"中高风险","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-A-M-65', 65, 'MS5', 'choice', 1.3, 'reverse', '你的分手记录大概是？', '{"options":[{"key":"A","text":"认真谈过的不多，但每段都比较认真","sub":"低风险，质量优先","score":15},{"key":"B","text":"谈过几段，长短不一，基本正常结束","sub":"中等，正常范围","score":30},{"key":"C","text":"短暂的关系多一些，长期的少","sub":"承诺能力待验证","score":55},{"key":"D","text":"有过一些比较复杂的经历，说来话长","sub":"中高风险，历史复杂","score":75}],"source_question":{"id":"MS5-A-M-65","order":65,"module":"MS5","sub":"MS5_A","type":"choice","weight":1.3,"direction":"reverse","text":"你的分手记录大概是？","options":[{"key":"A","text":"认真谈过的不多，但每段都比较认真","sub":"低风险，质量优先","score":15},{"key":"B","text":"谈过几段，长短不一，基本正常结束","sub":"中等，正常范围","score":30},{"key":"C","text":"短暂的关系多一些，长期的少","sub":"承诺能力待验证","score":55},{"key":"D","text":"有过一些比较复杂的经历，说来话长","sub":"中高风险，历史复杂","score":75}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-A-M-66', 66, 'MS5', 'scale', 1.3, 'reverse', '过去的感情经历，有时候会让我在新的关系里变得不信任或者有防御。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"source_question":{"id":"MS5-A-M-66","order":66,"module":"MS5","sub":"MS5_A","type":"scale","weight":1.3,"direction":"reverse","text":"过去的感情经历，有时候会让我在新的关系里变得不信任或者有防御。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"scoring":{"method":"reverse_times_25","formula":"(value - 1) * 25"}}}'::jsonb, '{"method":"reverse_times_25","formula":"(value - 1) * 25"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-A-M-67', 67, 'MS5', 'slider', 1.2, 'reverse', '你觉得自己目前从过去感情里走出来的程度是多少？', '{"slider":{"min":0,"max":100,"min_label":"完全没走出来","max_label":"完全走出来了","feedback":[{"range":[0,30],"text":"你还在消化过去，这个阶段开始新关系需要谨慎"},{"range":[31,55],"text":"还有一些残留，但在慢慢好转"},{"range":[56,75],"text":"基本走出来了，偶尔会想起"},{"range":[76,100],"text":"完全走出来，是新的开始"}]},"source_question":{"id":"MS5-A-M-67","order":67,"module":"MS5","sub":"MS5_A","type":"slider","weight":1.2,"direction":"reverse","text":"你觉得自己目前从过去感情里走出来的程度是多少？","slider":{"min":0,"max":100,"min_label":"完全没走出来","max_label":"完全走出来了","feedback":[{"range":[0,30],"text":"你还在消化过去，这个阶段开始新关系需要谨慎"},{"range":[31,55],"text":"还有一些残留，但在慢慢好转"},{"range":[56,75],"text":"基本走出来了，偶尔会想起"},{"range":[76,100],"text":"完全走出来，是新的开始"}]},"scoring":{"method":"reverse","formula":"100 - value"}}}'::jsonb, '{"method":"reverse","formula":"100 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-A-M-68', 68, 'MS5', 'scenario', 1.2, 'reverse', '她发现你手机里有前任的照片，问你为什么留着。你最真实的答案是？', '{"scene":"前任照片的留存原因","options":[{"key":"A","text":"我删了，定期清理","sub":"低风险","score":5},{"key":"B","text":"忘记删了，没什么特别意思","sub":"低风险","score":15},{"key":"C","text":"留着是因为那段时间有意义，不是因为人","sub":"中等，可解释","score":45},{"key":"D","text":"说实话有点舍不得删，说不清楚为什么","sub":"高风险，情感未割断","score":75}],"source_question":{"id":"MS5-A-M-68","order":68,"module":"MS5","sub":"MS5_A","type":"scenario","weight":1.2,"direction":"reverse","text":"她发现你手机里有前任的照片，问你为什么留着。你最真实的答案是？","scene":"前任照片的留存原因","options":[{"key":"A","text":"我删了，定期清理","sub":"低风险","score":5},{"key":"B","text":"忘记删了，没什么特别意思","sub":"低风险","score":15},{"key":"C","text":"留着是因为那段时间有意义，不是因为人","sub":"中等，可解释","score":45},{"key":"D","text":"说实话有点舍不得删，说不清楚为什么","sub":"高风险，情感未割断","score":75}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-B-M-69', 69, 'MS5', 'scenario', 1.5, 'reverse', '她今晚跟闺蜜出去，说可能很晚，叫你不用等。你的真实反应是？', '{"scene":"伴侣独立社交时的反应","options":[{"key":"A","text":"好，我也去做自己的事，晚点等她平安回家消息","sub":"低控制欲，尊重边界","score":10},{"key":"B","text":"嘴上说好，但心里在想她在哪、跟谁","sub":"中等焦虑，轻微控制倾向","score":40},{"key":"C","text":"问了一下她去哪、几点回","sub":"中高控制倾向","score":60},{"key":"D","text":"觉得有点不放心，找理由想跟去或者让她早点回","sub":"高控制欲","score":85}],"source_question":{"id":"MS5-B-M-69","order":69,"module":"MS5","sub":"MS5_B","type":"scenario","weight":1.5,"direction":"reverse","text":"她今晚跟闺蜜出去，说可能很晚，叫你不用等。你的真实反应是？","scene":"伴侣独立社交时的反应","options":[{"key":"A","text":"好，我也去做自己的事，晚点等她平安回家消息","sub":"低控制欲，尊重边界","score":10},{"key":"B","text":"嘴上说好，但心里在想她在哪、跟谁","sub":"中等焦虑，轻微控制倾向","score":40},{"key":"C","text":"问了一下她去哪、几点回","sub":"中高控制倾向","score":60},{"key":"D","text":"觉得有点不放心，找理由想跟去或者让她早点回","sub":"高控制欲","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-B-M-70', 70, 'MS5', 'binary', 1.5, 'reverse', '你对她跟异性朋友的来往，态度是？', '{"options":[{"key":"left","text":"正常，她有自己的社交我不干涉","sub":"低控制，高信任","score":10},{"key":"right","text":"会在意，有时候会想知道具体是什么情况","sub":"中高控制倾向","score":65}],"source_question":{"id":"MS5-B-M-70","order":70,"module":"MS5","sub":"MS5_B","type":"binary","weight":1.5,"direction":"reverse","text":"你对她跟异性朋友的来往，态度是？","options":[{"key":"left","text":"正常，她有自己的社交我不干涉","sub":"低控制，高信任","score":10},{"key":"right","text":"会在意，有时候会想知道具体是什么情况","sub":"中高控制倾向","score":65}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-B-M-71', 71, 'MS5', 'choice', 1.5, 'reverse', '你会不会翻她的手机或者查看她的聊天记录？', '{"options":[{"key":"A","text":"从来不会，这是边界问题","sub":"低风险，尊重隐私","score":5},{"key":"B","text":"不会主动翻，但如果她主动给我看我会看","sub":"中低风险","score":20},{"key":"C","text":"有时候会有这个冲动，但能克制","sub":"中等风险，有控制倾向","score":55},{"key":"D","text":"偶尔会，如果心里有疑虑的话","sub":"高风险，控制行为","score":80}],"source_question":{"id":"MS5-B-M-71","order":71,"module":"MS5","sub":"MS5_B","type":"choice","weight":1.5,"direction":"reverse","text":"你会不会翻她的手机或者查看她的聊天记录？","options":[{"key":"A","text":"从来不会，这是边界问题","sub":"低风险，尊重隐私","score":5},{"key":"B","text":"不会主动翻，但如果她主动给我看我会看","sub":"中低风险","score":20},{"key":"C","text":"有时候会有这个冲动，但能克制","sub":"中等风险，有控制倾向","score":55},{"key":"D","text":"偶尔会，如果心里有疑虑的话","sub":"高风险，控制行为","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-B-M-72', 72, 'MS5', 'scale', 1.3, 'reverse', '当她没有及时回消息时，我会感到不安或者开始怀疑她在做什么。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"source_question":{"id":"MS5-B-M-72","order":72,"module":"MS5","sub":"MS5_B","type":"scale","weight":1.3,"direction":"reverse","text":"当她没有及时回消息时，我会感到不安或者开始怀疑她在做什么。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"scoring":{"method":"reverse_times_25","formula":"(value - 1) * 25"}}}'::jsonb, '{"method":"reverse_times_25","formula":"(value - 1) * 25"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-B-M-73', 73, 'MS5', 'scenario', 1.5, 'reverse', '她说想要一些自己的时间，这个周末想一个人待着。你的反应是？', '{"scene":"伴侣要求独处空间时的反应","options":[{"key":"A","text":"好，你有自己的时间很正常，我去做我的事","sub":"低控制，尊重独立","score":10},{"key":"B","text":"有点不理解，但忍着没说什么","sub":"中等，有情绪但克制","score":40},{"key":"C","text":"问她是不是出了什么问题，是不是跟我有关","sub":"中高控制倾向，不安全感外化","score":65},{"key":"D","text":"觉得有点受伤，说了一些让她内疚的话","sub":"高风险，情感操控倾向","score":85}],"source_question":{"id":"MS5-B-M-73","order":73,"module":"MS5","sub":"MS5_B","type":"scenario","weight":1.5,"direction":"reverse","text":"她说想要一些自己的时间，这个周末想一个人待着。你的反应是？","scene":"伴侣要求独处空间时的反应","options":[{"key":"A","text":"好，你有自己的时间很正常，我去做我的事","sub":"低控制，尊重独立","score":10},{"key":"B","text":"有点不理解，但忍着没说什么","sub":"中等，有情绪但克制","score":40},{"key":"C","text":"问她是不是出了什么问题，是不是跟我有关","sub":"中高控制倾向，不安全感外化","score":65},{"key":"D","text":"觉得有点受伤，说了一些让她内疚的话","sub":"高风险，情感操控倾向","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-B-M-74', 74, 'MS5', 'binary', 1.3, 'reverse', '你在关系里，算不算一个比较有控制欲的人？', '{"options":[{"key":"left","text":"不算，我尊重她的自主性和空间","sub":"低风险","score":10},{"key":"right","text":"有一点，我对某些事情比较在意","sub":"中高风险","score":65}],"source_question":{"id":"MS5-B-M-74","order":74,"module":"MS5","sub":"MS5_B","type":"binary","weight":1.3,"direction":"reverse","text":"你在关系里，算不算一个比较有控制欲的人？","options":[{"key":"left","text":"不算，我尊重她的自主性和空间","sub":"低风险","score":10},{"key":"right","text":"有一点，我对某些事情比较在意","sub":"中高风险","score":65}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-C-M-75', 75, 'MS5', 'scenario', 1.5, 'reverse', '她说她最近在学一门新技能，问你最近有没有在学什么新东西。你的真实回答最接近？', '{"scene":"持续学习与成长的自我评估","options":[{"key":"A","text":"有，说出来具体在做什么","sub":"持续成长型","score":10},{"key":"B","text":"最近没有，但我在想要做什么","sub":"停滞但有意识","score":40},{"key":"C","text":"没有，工作已经够忙了","sub":"以忙为由，成长停滞","score":65},{"key":"D","text":"感觉自己现在这样挺好的，不需要特别学什么","sub":"成长动力弱","score":80}],"source_question":{"id":"MS5-C-M-75","order":75,"module":"MS5","sub":"MS5_C","type":"scenario","weight":1.5,"direction":"reverse","text":"她说她最近在学一门新技能，问你最近有没有在学什么新东西。你的真实回答最接近？","scene":"持续学习与成长的自我评估","options":[{"key":"A","text":"有，说出来具体在做什么","sub":"持续成长型","score":10},{"key":"B","text":"最近没有，但我在想要做什么","sub":"停滞但有意识","score":40},{"key":"C","text":"没有，工作已经够忙了","sub":"以忙为由，成长停滞","score":65},{"key":"D","text":"感觉自己现在这样挺好的，不需要特别学什么","sub":"成长动力弱","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-C-M-76', 76, 'MS5', 'slider', 1.5, 'reverse', '跟一年前相比，你觉得自己在哪些方面变得更好了？', '{"slider":{"min":0,"max":100,"min_label":"说实话没什么变化","max_label":"明显变好了，能说出具体的地方","feedback":[{"range":[0,25],"text":"你过去一年的成长感比较弱"},{"range":[26,45],"text":"有一些小进步，但不明显"},{"range":[46,65],"text":"有成长，但不够系统"},{"range":[66,85],"text":"明显进步，方向对"},{"range":[86,100],"text":"你在快速成长，能清楚说出变化"}]},"source_question":{"id":"MS5-C-M-76","order":76,"module":"MS5","sub":"MS5_C","type":"slider","weight":1.5,"direction":"reverse","text":"跟一年前相比，你觉得自己在哪些方面变得更好了？","slider":{"min":0,"max":100,"min_label":"说实话没什么变化","max_label":"明显变好了，能说出具体的地方","feedback":[{"range":[0,25],"text":"你过去一年的成长感比较弱"},{"range":[26,45],"text":"有一些小进步，但不明显"},{"range":[46,65],"text":"有成长，但不够系统"},{"range":[66,85],"text":"明显进步，方向对"},{"range":[86,100],"text":"你在快速成长，能清楚说出变化"}]},"scoring":{"method":"reverse","formula":"100 - value"}}}'::jsonb, '{"method":"reverse","formula":"100 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-C-M-77', 77, 'MS5', 'binary', 1.3, 'reverse', '你现在的生活状态，有没有让你感到满足但同时也有点舒适区的感觉？', '{"options":[{"key":"left","text":"有，我知道自己需要往前走，但现在很舒服","sub":"舒适区风险信号","score":65},{"key":"right","text":"没有，我还在积极往前，不觉得现在的状态够了","sub":"成长驱动型","score":15}],"source_question":{"id":"MS5-C-M-77","order":77,"module":"MS5","sub":"MS5_C","type":"binary","weight":1.3,"direction":"reverse","text":"你现在的生活状态，有没有让你感到满足但同时也有点舒适区的感觉？","options":[{"key":"left","text":"有，我知道自己需要往前走，但现在很舒服","sub":"舒适区风险信号","score":65},{"key":"right","text":"没有，我还在积极往前，不觉得现在的状态够了","sub":"成长驱动型","score":15}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-C-M-78', 78, 'MS5', 'choice', 1.3, 'reverse', '你身边的朋友，对你目前的状态是什么评价？', '{"options":[{"key":"A","text":"觉得我在稳步上升，对我的发展比较认可","sub":"外部认可，成长可见","score":15},{"key":"B","text":"觉得我挺好的，但也没什么特别的评价","sub":"中等，不突出","score":40},{"key":"C","text":"有时候会说我应该更上进一点","sub":"成长停滞信号","score":70},{"key":"D","text":"大家都差不多，没人特别说这个","sub":"参照系模糊，中性","score":50}],"source_question":{"id":"MS5-C-M-78","order":78,"module":"MS5","sub":"MS5_C","type":"choice","weight":1.3,"direction":"reverse","text":"你身边的朋友，对你目前的状态是什么评价？","options":[{"key":"A","text":"觉得我在稳步上升，对我的发展比较认可","sub":"外部认可，成长可见","score":15},{"key":"B","text":"觉得我挺好的，但也没什么特别的评价","sub":"中等，不突出","score":40},{"key":"C","text":"有时候会说我应该更上进一点","sub":"成长停滞信号","score":70},{"key":"D","text":"大家都差不多，没人特别说这个","sub":"参照系模糊，中性","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-C-M-79', 79, 'MS5', 'scale', 1.5, 'reverse', '我觉得自己现在的状态已经够好了，不太有动力去做更多改变。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"MS5-C-M-79","order":79,"module":"MS5","sub":"MS5_C","type":"scale","weight":1.5,"direction":"reverse","text":"我觉得自己现在的状态已经够好了，不太有动力去做更多改变。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"reverse_times_25","formula":"(value - 1) * 25"}}}'::jsonb, '{"method":"reverse_times_25","formula":"(value - 1) * 25"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
SELECT s.id, 'MS5-C-M-80', 80, 'MS5', 'scenario', 1.2, 'reverse', '她跟你说，她希望未来的另一半是一个不断进步的人，对你有一定的期待。你的内心感受是？', '{"scene":"被寄予成长期待时的内心反应","options":[{"key":"A","text":"有点压力，但这正好是我想做的，接受这种期待","sub":"成长导向，接受挑战","score":20},{"key":"B","text":"挺好的，我本来就有这样的计划","sub":"成长内驱力强","score":10},{"key":"C","text":"有点担心，我不确定自己能达到她的期待","sub":"成长信心不足","score":50},{"key":"D","text":"感觉有点被要求，不太喜欢这种压力","sub":"成长阻力，排斥型","score":75}],"source_question":{"id":"MS5-C-M-80","order":80,"module":"MS5","sub":"MS5_C","type":"scenario","weight":1.2,"direction":"reverse","text":"她跟你说，她希望未来的另一半是一个不断进步的人，对你有一定的期待。你的内心感受是？","scene":"被寄予成长期待时的内心反应","options":[{"key":"A","text":"有点压力，但这正好是我想做的，接受这种期待","sub":"成长导向，接受挑战","score":20},{"key":"B","text":"挺好的，我本来就有这样的计划","sub":"成长内驱力强","score":10},{"key":"C","text":"有点担心，我不确定自己能达到她的期待","sub":"成长信心不足","score":50},{"key":"D","text":"感觉有点被要求，不太喜欢这种压力","sub":"成长阻力，排斥型","score":75}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_male'
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
