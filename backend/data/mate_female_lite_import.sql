-- LoveCompass generated data import SQL

-- 此文件由 scripts/generate_import_sql.py 根据外部 JSON 数据生成；题目内容没有硬编码在脚本中。

BEGIN;


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
COMMIT;
