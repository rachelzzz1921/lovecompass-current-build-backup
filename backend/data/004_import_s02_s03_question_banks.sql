-- LoveCompass generated data import SQL

-- 此文件由 scripts/generate_import_sql.py 根据外部 JSON 数据生成；题目内容没有硬编码在脚本中。

BEGIN;


-- Source: suite2_ros_female.json

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
VALUES ('s02_ros_female', '关系画像测试', '1.0', 'female'::public.test_gender, 60, 15, false, true, '{"id":"S02_ROS_FEMALE","name":"关系画像测试","gender":"female","version":"1.0","total_questions":60,"pre_questions":2,"estimated_minutes":15,"is_free":false,"layers":["AT","IN","CO","EV","RK"],"relationship_types":["彼此生长","难舍难分","温水同行","心甘情愿地累","烈火烹油","此刻刚好"],"relationship_stages":["怦然相遇","渐入佳境","暗流初现","磨合阵痛","倦怠低谷","十字路口","重建信任","深度联结","并肩同行"],"question_types_used":["slider","scenario","binary","choice","scale","mood","card","rank"]}'::jsonb)
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
SELECT id, 'ROS_V3', '1.0', '{"layers":{"AT":{"label":"吸引基础","direction":"positive","weight":0.2,"description":"你们当初为什么在一起，那个吸引力现在还在不在"},"IN":{"label":"互动质量","direction":"positive","weight":0.3,"description":"日常相处的体验——沟通、陪伴、冲突处理的质量"},"CO":{"label":"兼容程度","direction":"positive","weight":0.25,"description":"价值观、生活节奏和未来方向的契合度"},"EV":{"label":"关系走向","direction":"positive","weight":0.15,"description":"这段关系在往哪里走，你在其中有没有在成长"},"RK":{"label":"风险信号","direction":"reverse","weight":0.1,"description":"有没有需要正视的问题，分数越低风险越高"}},"overall":{"formula":"AT*0.20 + IN*0.30 + CO*0.25 + EV*0.15 + (100-RK)*0.10","display_adjustment":{"note":"所有分数向上平移，底部有托底，最低显示55","mapping":[{"raw_min":0,"raw_max":40,"display_min":55,"display_max":65},{"raw_min":41,"raw_max":60,"display_min":65,"display_max":75},{"raw_min":61,"raw_max":80,"display_min":75,"display_max":88},{"raw_min":81,"raw_max":100,"display_min":88,"display_max":96}]}},"resonance_levels":[{"min":88,"max":96,"name":"心有灵犀","desc":"你们之间有一种很难被替代的默契"},{"min":75,"max":87,"name":"深度共鸣","desc":"真实的联结，值得好好珍惜"},{"min":65,"max":74,"name":"温柔磨合","desc":"你们在彼此靠近的路上，慢慢来"},{"min":55,"max":64,"name":"初见雏形","desc":"关系还在成形，有空间，也有可能"}]}'::jsonb, '{"pre_questions":[{"id":"PRE-F-00A","type":"choice","text":"在开始之前，先告诉我你们的关系状态。","note":"此答案影响题目措辞、阶段判断和结果语言，不计分。","options":[{"key":"A","text":"我在暗恋他，还没有任何进展","tag":"secret_crush"},{"key":"B","text":"我们在暧昧中，还没正式在一起","tag":"ambiguous"},{"key":"C","text":"我们在一起不到一年","tag":"early"},{"key":"D","text":"我们在一起一到三年","tag":"mid"},{"key":"E","text":"我们在一起三年以上","tag":"long"},{"key":"F","text":"我们已婚或是长期伴侣","tag":"married"}]},{"id":"PRE-F-00B","type":"choice","text":"如果用一个词描述你们现在的关系，你会选哪个？","note":"辅助校准关系类型判断，不计分。","options":[{"key":"A","text":"心动但还没说出口"},{"key":"B","text":"说不清楚，但很在意"},{"key":"C","text":"在谈恋爱"},{"key":"D","text":"很稳定的伴侣"},{"key":"E","text":"复杂，一时说不清"}]}],"stage_rules":{"note":"结合时间输入和各层得分综合判断","time_constraints":{"secret_crush":{"locked_stages":["重建信任","深度联结","并肩同行"]},"ambiguous":{"locked_stages":["重建信任","深度联结","并肩同行"]},"married":{"low_resonance_language":"long_term_version"}},"score_mapping":{"①怦然相遇":{"EV_range":[75,100],"AT_range":[80,100],"IN_range":[0,100]},"②渐入佳境":{"EV_range":[70,100],"AT_range":[65,100],"IN_range":[60,100]},"③暗流初现":{"EV_range":[50,75],"AT_range":[50,80],"RK_range":[30,60]},"④磨合阵痛":{"EV_range":[40,65],"IN_range":[30,60],"RK_range":[40,70]},"⑤倦怠低谷":{"EV_range":[20,45],"RK_range":[60,100],"IN_range":[20,50]},"⑥十字路口":{"EV_range":[25,50],"RK_range":[55,85]},"⑦重建信任":{"EV_range":[55,75],"IN_range":[60,85],"RK_range":[20,50]},"⑧深度联结":{"EV_range":[70,90],"IN_range":[75,100],"AT_range":[60,100]},"⑨并肩同行":{"EV_range":[80,100],"CO_range":[75,100],"IN_range":[75,100]}}},"relationship_type_rules":{"彼此生长":{"condition":"EV >= 75 && IN >= 70 && RK <= 35","tagline":"在一起让你成为更好的自己","desc":"被看见、被支持、有成长"},"难舍难分":{"condition":"AT >= 75 && IN >= 65 && EV < 65","tagline":"深度融合，分不清是爱还是需要","desc":"离不开，但不确定是爱还是习惯"},"温水同行":{"condition":"RK <= 40 && IN < 65 && EV < 60","tagline":"不冷不热，舒适但缺少真正的联结","desc":"不吵架，也没有真正在一起"},"心甘情愿地累":{"condition":"RK >= 55 && EV < 55 && AT >= 60","tagline":"付出多于回报，但还在坚持","desc":"累，但走不掉"},"烈火烹油":{"condition":"AT >= 75 && RK >= 50 && IN < 70","tagline":"极好极坏，情绪过山车","desc":"高强度的吸引和冲突并存"},"此刻刚好":{"condition":"CO < 65 && EV < 60 && RK <= 45","tagline":"双方都知道这不是终点","desc":"舒适但没有未来感"}},"prescription_rules":{"stage_7_8_9":"你们走过了不容易的部分，能走到这里很不简单。下面这张处方，是给经历过风浪的你们用来继续走好的——","stage_1_2_3":"你们还在彼此发现的阶段，这是关系里最有生命力的时候。下面这张处方帮你们把这段时间过得更扎实一些——","stage_4_5_6":"能在这个阶段认真做这道题，说明你们都在认真对待这段关系。这张处方不是说你们有问题，是帮你们把问题说清楚——","low_resonance_long_term":"在一起久了，有些东西会钝化——这很正常，不是感情出了问题。这张处方是帮你们重新找到彼此的频道——"},"attachment_collision_map":{"安全型×安全型":{"name":"天作之合","desc":"两个内心稳定的人在一起，是最少内耗的组合。不是没有问题，是有能力一起解决。"},"安全型×焦虑型":{"name":"避风港与浪","desc":"稳定的人能给焦虑的人真实的安全感，但时间久了容易出现不平衡——一个一直在给，一个一直在要。"},"安全型×回避型":{"name":"开门与关门","desc":"安全型足够稳定，不会因为回避型的后退而崩溃——这是这个组合能走下去的原因。"},"安全型×混合型":{"name":"稳中有变","desc":"安全型是这段关系的锚，混合型的情绪起伏会被安全型的稳定慢慢平衡。"},"焦虑型×焦虑型":{"name":"双向拉扯","desc":"两个都需要确认的人在一起，前期浓烈，后期容易把彼此都耗尽。"},"焦虑型×回避型":{"name":"欢喜冤家","desc":"最常见也最戏剧性的组合。一个追，一个退，形成经典的追逃模式。吸引力是真实的，但如果不打破这个模式，最终会耗尽双方。"},"焦虑型×混合型":{"name":"迷雾中的彼此","desc":"两个人都不够稳定，但方式不同。对方的忽冷忽热会持续触发焦虑型的不安全感。"},"回避型×回避型":{"name":"平行宇宙","desc":"两个人都不主动靠近，关系很平静，但也很难真正深入。"},"回避型×混合型":{"name":"捉摸不定","desc":"混合型的忽冷忽热反而能让回避型感到相对舒适。但这个组合很难建立真正的深度。"},"混合型×混合型":{"name":"一团烟火","desc":"两个情绪都不稳定的人在一起，会非常热烈，也会非常混乱。"},"高边界安全型×焦虑型":{"name":"冰与火","desc":"高边界的安全感让焦虑型感到有依靠，但边界的硬度也会让焦虑型觉得进不去。"},"高边界安全型×回避型":{"name":"两座山","desc":"两个都有很强边界感的人在一起，相互尊重，但也可能相互疏远。"},"低自我高投入型×任意":{"name":"全心付出","desc":"无论对方是什么类型，这个组合的核心风险不在对方，在自己——需要先学会照顾自己。"},"高边界安全型×混合型":{"name":"规则与例外","desc":"高边界的清晰给混合型一种难得的稳定感，只要双方愿意沟通，互补性很强。"},"低自我高投入型×回避型":{"name":"给不到的距离","desc":"付出最多的人遇到了最难靠近的人。这个组合需要付出型学会有边界地爱。"}}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"ROS"}'::jsonb, true
FROM public.test_suites WHERE slug = 's02_ros_female'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '彼此生长', '彼此生长', 'female'::public.test_gender, '{"condition":"EV >= 75 && IN >= 70 && RK <= 35","tagline":"在一起让你成为更好的自己","desc":"被看见、被支持、有成长"}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's02_ros_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '难舍难分', '难舍难分', 'female'::public.test_gender, '{"condition":"AT >= 75 && IN >= 65 && EV < 65","tagline":"深度融合，分不清是爱还是需要","desc":"离不开，但不确定是爱还是习惯"}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's02_ros_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '温水同行', '温水同行', 'female'::public.test_gender, '{"condition":"RK <= 40 && IN < 65 && EV < 60","tagline":"不冷不热，舒适但缺少真正的联结","desc":"不吵架，也没有真正在一起"}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's02_ros_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '心甘情愿地累', '心甘情愿地累', 'female'::public.test_gender, '{"condition":"RK >= 55 && EV < 55 && AT >= 60","tagline":"付出多于回报，但还在坚持","desc":"累，但走不掉"}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's02_ros_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '烈火烹油', '烈火烹油', 'female'::public.test_gender, '{"condition":"AT >= 75 && RK >= 50 && IN < 70","tagline":"极好极坏，情绪过山车","desc":"高强度的吸引和冲突并存"}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's02_ros_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '此刻刚好', '此刻刚好', 'female'::public.test_gender, '{"condition":"CO < 65 && EV < 60 && RK <= 45","tagline":"双方都知道这不是终点","desc":"舒适但没有未来感"}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's02_ros_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'PRE-F-00A', 1, 'PRE', 'choice', 0, 'neutral', '在开始之前，先告诉我你们的关系状态。', '{"note":"此答案影响题目措辞、阶段判断和结果语言，不计分。","options":[{"key":"A","text":"我在暗恋他，还没有任何进展","tag":"secret_crush"},{"key":"B","text":"我们在暧昧中，还没正式在一起","tag":"ambiguous"},{"key":"C","text":"我们在一起不到一年","tag":"early"},{"key":"D","text":"我们在一起一到三年","tag":"mid"},{"key":"E","text":"我们在一起三年以上","tag":"long"},{"key":"F","text":"我们已婚或是长期伴侣","tag":"married"}],"source_question":{"id":"PRE-F-00A","type":"choice","text":"在开始之前，先告诉我你们的关系状态。","note":"此答案影响题目措辞、阶段判断和结果语言，不计分。","options":[{"key":"A","text":"我在暗恋他，还没有任何进展","tag":"secret_crush"},{"key":"B","text":"我们在暧昧中，还没正式在一起","tag":"ambiguous"},{"key":"C","text":"我们在一起不到一年","tag":"early"},{"key":"D","text":"我们在一起一到三年","tag":"mid"},{"key":"E","text":"我们在一起三年以上","tag":"long"},{"key":"F","text":"我们已婚或是长期伴侣","tag":"married"}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'PRE-F-00B', 2, 'PRE', 'choice', 0, 'neutral', '如果用一个词描述你们现在的关系，你会选哪个？', '{"note":"辅助校准关系类型判断，不计分。","options":[{"key":"A","text":"心动但还没说出口"},{"key":"B","text":"说不清楚，但很在意"},{"key":"C","text":"在谈恋爱"},{"key":"D","text":"很稳定的伴侣"},{"key":"E","text":"复杂，一时说不清"}],"source_question":{"id":"PRE-F-00B","type":"choice","text":"如果用一个词描述你们现在的关系，你会选哪个？","note":"辅助校准关系类型判断，不计分。","options":[{"key":"A","text":"心动但还没说出口"},{"key":"B","text":"说不清楚，但很在意"},{"key":"C","text":"在谈恋爱"},{"key":"D","text":"很稳定的伴侣"},{"key":"E","text":"复杂，一时说不清"}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-01', 3, 'AT', 'slider', 1.5, 'positive', '你现在对他的吸引感，跟最开始相比是什么状态？', '{"alt_text_secret_crush":"你对他的吸引感，随着时间是在加深还是在消退？","slider":{"min":0,"max":100,"min_label":"比最开始淡了很多","max_label":"还是一样强烈，甚至更深了","feedback":[{"range":[0,20],"text":"吸引感明显减弱，这值得认真想一想"},{"range":[21,40],"text":"有些东西在消退，但还有留下来的理由"},{"range":[41,60],"text":"趋于平稳，是正常的关系演化"},{"range":[61,80],"text":"吸引感很稳定，有些地方甚至更深了"},{"range":[81,100],"text":"你对他的感觉一直都在，甚至在加深"}]},"source_question":{"id":"AT-F-01","order":1,"layer":"AT","weight":1.5,"type":"slider","direction":"positive","text":"你现在对他的吸引感，跟最开始相比是什么状态？","alt_text_secret_crush":"你对他的吸引感，随着时间是在加深还是在消退？","slider":{"min":0,"max":100,"min_label":"比最开始淡了很多","max_label":"还是一样强烈，甚至更深了","feedback":[{"range":[0,20],"text":"吸引感明显减弱，这值得认真想一想"},{"range":[21,40],"text":"有些东西在消退，但还有留下来的理由"},{"range":[41,60],"text":"趋于平稳，是正常的关系演化"},{"range":[61,80],"text":"吸引感很稳定，有些地方甚至更深了"},{"range":[81,100],"text":"你对他的感觉一直都在，甚至在加深"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-02', 4, 'AT', 'scenario', 1.3, 'positive', '你们分开一段时间后再见面。你见到他的第一眼，脑子里闪过的是？', '{"scene":"重逢的第一眼感受","options":[{"key":"A","text":"还是会心跳快一下，这个感觉还在","sub":"吸引感持续","score":85},{"key":"B","text":"有些熟悉的温暖，不是心跳，是放松","sub":"从吸引转向依恋，正常演化","score":75},{"key":"C","text":"没什么特别的感觉，就是见到了","sub":"吸引感明显减弱","score":40},{"key":"D","text":"有点复杂，说不清楚是什么感觉","sub":"关系进入模糊期","score":55}],"source_question":{"id":"AT-F-02","order":2,"layer":"AT","weight":1.3,"type":"scenario","direction":"positive","text":"你们分开一段时间后再见面。你见到他的第一眼，脑子里闪过的是？","scene":"重逢的第一眼感受","options":[{"key":"A","text":"还是会心跳快一下，这个感觉还在","sub":"吸引感持续","score":85},{"key":"B","text":"有些熟悉的温暖，不是心跳，是放松","sub":"从吸引转向依恋，正常演化","score":75},{"key":"C","text":"没什么特别的感觉，就是见到了","sub":"吸引感明显减弱","score":40},{"key":"D","text":"有点复杂，说不清楚是什么感觉","sub":"关系进入模糊期","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-03', 5, 'AT', 'binary', 1.5, 'positive', '当初让你喜欢上他的那些东西，现在还在吗？', '{"options":[{"key":"left","text":"在，而且我觉得了解越深越喜欢","sub":"吸引力深化型","score":85},{"key":"right","text":"有些还在，但有些随着了解反而淡了","sub":"吸引力分化型","score":55}],"source_question":{"id":"AT-F-03","order":3,"layer":"AT","weight":1.5,"type":"binary","direction":"positive","text":"当初让你喜欢上他的那些东西，现在还在吗？","options":[{"key":"left","text":"在，而且我觉得了解越深越喜欢","sub":"吸引力深化型","score":85},{"key":"right","text":"有些还在，但有些随着了解反而淡了","sub":"吸引力分化型","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-04', 6, 'AT', 'choice', 1.0, 'auxiliary', '你喜欢他，最核心的原因是？', '{"note":"辅助关系类型判断，分数相近","options":[{"key":"A","text":"跟他在一起我感觉到真实的安全感","sub":"依恋驱动","score":75},{"key":"B","text":"他让我觉得自己是值得被认真对待的","sub":"自我价值感驱动","score":75},{"key":"C","text":"我们之间有一种说不清的吸引，就是想靠近","sub":"本能吸引","score":70},{"key":"D","text":"他是一个我真正欣赏的人","sub":"尊重驱动","score":80}],"source_question":{"id":"AT-F-04","order":4,"layer":"AT","weight":1.0,"type":"choice","direction":"auxiliary","text":"你喜欢他，最核心的原因是？","note":"辅助关系类型判断，分数相近","options":[{"key":"A","text":"跟他在一起我感觉到真实的安全感","sub":"依恋驱动","score":75},{"key":"B","text":"他让我觉得自己是值得被认真对待的","sub":"自我价值感驱动","score":75},{"key":"C","text":"我们之间有一种说不清的吸引，就是想靠近","sub":"本能吸引","score":70},{"key":"D","text":"他是一个我真正欣赏的人","sub":"尊重驱动","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-05', 7, 'AT', 'scale', 1.5, 'positive', '在这段关系里，我觉得自己是真心喜欢他这个人，不只是需要一段关系或者害怕孤独。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"AT-F-05","order":5,"layer":"AT","weight":1.5,"type":"scale","direction":"positive","text":"在这段关系里，我觉得自己是真心喜欢他这个人，不只是需要一段关系或者害怕孤独。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-06', 8, 'AT', 'mood', 1.2, 'positive', '你想到他的时候，出现频率最高的感觉是？', '{"options":[{"key":"A","icon":"ti-heart","text":"暖，会不自觉地想笑","score":85},{"key":"B","icon":"ti-mood-happy","text":"期待，想见他","score":80},{"key":"C","icon":"ti-mood-nervous","text":"有点不安，不确定他怎么想","score":55},{"key":"D","icon":"ti-mood-confuzed","text":"复杂，说不清楚","score":50},{"key":"E","icon":"ti-mood-sad","text":"有时候会觉得累","score":40},{"key":"F","icon":"ti-mood-empty","text":"没什么特别的感觉了","score":25},{"key":"G","icon":"ti-mood-smile","text":"习惯了，就是他在那里","score":65},{"key":"H","icon":"ti-mood-suprised","text":"还是会因为他做的事情感动","score":85}],"source_question":{"id":"AT-F-06","order":6,"layer":"AT","weight":1.2,"type":"mood","direction":"positive","text":"你想到他的时候，出现频率最高的感觉是？","options":[{"key":"A","icon":"ti-heart","text":"暖，会不自觉地想笑","score":85},{"key":"B","icon":"ti-mood-happy","text":"期待，想见他","score":80},{"key":"C","icon":"ti-mood-nervous","text":"有点不安，不确定他怎么想","score":55},{"key":"D","icon":"ti-mood-confuzed","text":"复杂，说不清楚","score":50},{"key":"E","icon":"ti-mood-sad","text":"有时候会觉得累","score":40},{"key":"F","icon":"ti-mood-empty","text":"没什么特别的感觉了","score":25},{"key":"G","icon":"ti-mood-smile","text":"习惯了，就是他在那里","score":65},{"key":"H","icon":"ti-mood-suprised","text":"还是会因为他做的事情感动","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-07', 9, 'AT', 'scenario', 1.2, 'positive', '他今天做了一件很普通的小事——帮你记住了你说过的某个细节。你的感受是？', '{"scene":"被细节记住的感受","options":[{"key":"A","text":"心里会暖一下，这种小事让我觉得他在认真对待我","sub":"吸引感在细节里加深","score":85},{"key":"B","text":"觉得还好，这是正常的事","sub":"吸引感趋于平稳","score":65},{"key":"C","text":"没什么特别的感觉，已经习惯了","sub":"吸引感钝化","score":45},{"key":"D","text":"反而有点意外，他不常这样","sub":"基线不高，偶发惊喜","score":60}],"source_question":{"id":"AT-F-07","order":7,"layer":"AT","weight":1.2,"type":"scenario","direction":"positive","text":"他今天做了一件很普通的小事——帮你记住了你说过的某个细节。你的感受是？","scene":"被细节记住的感受","options":[{"key":"A","text":"心里会暖一下，这种小事让我觉得他在认真对待我","sub":"吸引感在细节里加深","score":85},{"key":"B","text":"觉得还好，这是正常的事","sub":"吸引感趋于平稳","score":65},{"key":"C","text":"没什么特别的感觉，已经习惯了","sub":"吸引感钝化","score":45},{"key":"D","text":"反而有点意外，他不常这样","sub":"基线不高，偶发惊喜","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-08', 10, 'AT', 'binary', 1.3, 'positive', '如果他现在从你的生活里消失，你的第一反应会是？', '{"options":[{"key":"left","text":"很难受，他在我生命里有真实的重量","sub":"深度依恋","score":80},{"key":"right","text":"会有影响，但我能想象没有他的生活","sub":"吸引感有限，联结不够深","score":50}],"source_question":{"id":"AT-F-08","order":8,"layer":"AT","weight":1.3,"type":"binary","direction":"positive","text":"如果他现在从你的生活里消失，你的第一反应会是？","options":[{"key":"left","text":"很难受，他在我生命里有真实的重量","sub":"深度依恋","score":80},{"key":"right","text":"会有影响，但我能想象没有他的生活","sub":"吸引感有限，联结不够深","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-09', 11, 'AT', 'slider', 1.5, 'positive', '你觉得你们之间的吸引是对等的吗？他对你的吸引感，跟你对他的吸引感，大概是几比几？', '{"slider":{"min":0,"max":100,"min_label":"我明显更喜欢他","max_label":"他明显更喜欢我","midpoint_label":"50 = 大致对等","feedback":[{"range":[0,30],"text":"你在这段关系里投入更多，这值得留意"},{"range":[31,45],"text":"稍微不平衡，但在正常范围内"},{"range":[46,55],"text":"大致对等，关系基础比较稳"},{"range":[56,70],"text":"他对你的喜欢多一些，你是被珍视的那个"},{"range":[71,100],"text":"你感觉他喜欢你很多，但要确认这不只是你的感觉"}]},"source_question":{"id":"AT-F-09","order":9,"layer":"AT","weight":1.5,"type":"slider","direction":"positive","text":"你觉得你们之间的吸引是对等的吗？他对你的吸引感，跟你对他的吸引感，大概是几比几？","slider":{"min":0,"max":100,"min_label":"我明显更喜欢他","max_label":"他明显更喜欢我","midpoint_label":"50 = 大致对等","feedback":[{"range":[0,30],"text":"你在这段关系里投入更多，这值得留意"},{"range":[31,45],"text":"稍微不平衡，但在正常范围内"},{"range":[46,55],"text":"大致对等，关系基础比较稳"},{"range":[56,70],"text":"他对你的喜欢多一些，你是被珍视的那个"},{"range":[71,100],"text":"你感觉他喜欢你很多，但要确认这不只是你的感觉"}]},"scoring":{"method":"distance_from_midpoint","formula":"100 - abs(value - 50) * 1.5","note":"越接近50分越高，两端递减"}}}'::jsonb, '{"method":"distance_from_midpoint","formula":"100 - abs(value - 50) * 1.5","note":"越接近50分越高，两端递减"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-F-10', 12, 'AT', 'scale', 1.3, 'positive', '我觉得他喜欢我这件事，是真实可感的，不需要靠猜测来确认。', '{"alt_text_secret_crush":"我觉得他对我有一些不一样的感觉，哪怕还没说出来。","scale":{"min":1,"max":5,"min_label":"完全不符合，我经常不确定","max_label":"完全符合，我感受得到"},"source_question":{"id":"AT-F-10","order":10,"layer":"AT","weight":1.3,"type":"scale","direction":"positive","text":"我觉得他喜欢我这件事，是真实可感的，不需要靠猜测来确认。","alt_text_secret_crush":"我觉得他对我有一些不一样的感觉，哪怕还没说出来。","scale":{"min":1,"max":5,"min_label":"完全不符合，我经常不确定","max_label":"完全符合，我感受得到"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-11', 13, 'IN', 'scenario', 1.5, 'positive', '你跟他说了一件让你很难受的事，说完之后他的回应是「会好的，别想太多」。你的感受是？', '{"scene":"情感回应质量测试","options":[{"key":"A","text":"有点失落，我需要的不是这个","sub":"沟通需求未被满足，有自我觉察","score":65},{"key":"B","text":"还好，他不擅长这个，我理解","sub":"接受度高，但需求可能被压抑","score":70},{"key":"C","text":"很受伤，感觉他根本没在听","sub":"沟通感严重缺失","score":45},{"key":"D","text":"没什么，我也没指望他能说什么","sub":"期待值已经很低","score":30}],"source_question":{"id":"IN-F-11","order":11,"layer":"IN","weight":1.5,"type":"scenario","direction":"positive","text":"你跟他说了一件让你很难受的事，说完之后他的回应是「会好的，别想太多」。你的感受是？","scene":"情感回应质量测试","options":[{"key":"A","text":"有点失落，我需要的不是这个","sub":"沟通需求未被满足，有自我觉察","score":65},{"key":"B","text":"还好，他不擅长这个，我理解","sub":"接受度高，但需求可能被压抑","score":70},{"key":"C","text":"很受伤，感觉他根本没在听","sub":"沟通感严重缺失","score":45},{"key":"D","text":"没什么，我也没指望他能说什么","sub":"期待值已经很低","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-12', 14, 'IN', 'slider', 1.5, 'positive', '你觉得他真的在听你说话的频率有多高？', '{"slider":{"min":0,"max":100,"min_label":"他很少真正在听，更多是在等我说完","max_label":"他大多数时候都真的在听，我感觉得到","feedback":[{"range":[0,25],"text":"你经常有一种「说了也没用」的感觉"},{"range":[26,45],"text":"偶尔被听见，但不稳定"},{"range":[46,65],"text":"他会听，但深度不够"},{"range":[66,85],"text":"他大多数时候是真的在听"},{"range":[86,100],"text":"他让你感觉说什么都会被认真对待"}]},"source_question":{"id":"IN-F-12","order":12,"layer":"IN","weight":1.5,"type":"slider","direction":"positive","text":"你觉得他真的在听你说话的频率有多高？","slider":{"min":0,"max":100,"min_label":"他很少真正在听，更多是在等我说完","max_label":"他大多数时候都真的在听，我感觉得到","feedback":[{"range":[0,25],"text":"你经常有一种「说了也没用」的感觉"},{"range":[26,45],"text":"偶尔被听见，但不稳定"},{"range":[46,65],"text":"他会听，但深度不够"},{"range":[66,85],"text":"他大多数时候是真的在听"},{"range":[86,100],"text":"他让你感觉说什么都会被认真对待"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-13', 15, 'IN', 'choice', 1.5, 'positive', '你们吵架或者发生矛盾之后，通常是怎么结束的？', '{"alt_text_secret_crush":"当你们有过误会或者不愉快，通常怎么化解？","options":[{"key":"A","text":"真正把问题说清楚了，然后和好","sub":"高质量修复","score":90},{"key":"B","text":"冷静了就和好了，但问题没有完全说清楚","sub":"表面修复，问题积累","score":65},{"key":"C","text":"其中一个人先妥协了，然后就过去了","sub":"不均衡修复，有委屈在","score":50},{"key":"D","text":"慢慢冷处理，然后假装没发生过","sub":"低质量修复，风险积累","score":30}],"source_question":{"id":"IN-F-13","order":13,"layer":"IN","weight":1.5,"type":"choice","direction":"positive","text":"你们吵架或者发生矛盾之后，通常是怎么结束的？","alt_text_secret_crush":"当你们有过误会或者不愉快，通常怎么化解？","options":[{"key":"A","text":"真正把问题说清楚了，然后和好","sub":"高质量修复","score":90},{"key":"B","text":"冷静了就和好了，但问题没有完全说清楚","sub":"表面修复，问题积累","score":65},{"key":"C","text":"其中一个人先妥协了，然后就过去了","sub":"不均衡修复，有委屈在","score":50},{"key":"D","text":"慢慢冷处理，然后假装没发生过","sub":"低质量修复，风险积累","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-14', 16, 'IN', 'binary', 1.5, 'positive', '跟他在一起，你大多数时候是？', '{"options":[{"key":"left","text":"轻松的，就是很舒服，不需要表演","sub":"高相处质量","score":85},{"key":"right","text":"需要注意一些东西，有时候会累","sub":"相处有消耗","score":45}],"source_question":{"id":"IN-F-14","order":14,"layer":"IN","weight":1.5,"type":"binary","direction":"positive","text":"跟他在一起，你大多数时候是？","options":[{"key":"left","text":"轻松的，就是很舒服，不需要表演","sub":"高相处质量","score":85},{"key":"right","text":"需要注意一些东西，有时候会累","sub":"相处有消耗","score":45}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-15', 17, 'IN', 'scenario', 1.5, 'positive', '你今天心情很差，他看出来了。他的反应最可能是？', '{"scene":"对方的情感感知能力","options":[{"key":"A","text":"主动问我怎么了，然后认真听","sub":"高情感响应","score":90},{"key":"B","text":"问了一下，然后尝试帮我解决问题","sub":"中等，解决导向","score":70},{"key":"C","text":"看出来了，但没有主动问，等我说","sub":"低主动性","score":50},{"key":"D","text":"没有特别注意到，或者注意到了也没什么反应","sub":"情感感知弱","score":25}],"source_question":{"id":"IN-F-15","order":15,"layer":"IN","weight":1.5,"type":"scenario","direction":"positive","text":"你今天心情很差，他看出来了。他的反应最可能是？","scene":"对方的情感感知能力","options":[{"key":"A","text":"主动问我怎么了，然后认真听","sub":"高情感响应","score":90},{"key":"B","text":"问了一下，然后尝试帮我解决问题","sub":"中等，解决导向","score":70},{"key":"C","text":"看出来了，但没有主动问，等我说","sub":"低主动性","score":50},{"key":"D","text":"没有特别注意到，或者注意到了也没什么反应","sub":"情感感知弱","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-16', 18, 'IN', 'scale', 1.5, 'positive', '当我跟他说一些对我很重要的事情，我感觉他是真的在乎，而不只是在配合我说话。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"IN-F-16","order":16,"layer":"IN","weight":1.5,"type":"scale","direction":"positive","text":"当我跟他说一些对我很重要的事情，我感觉他是真的在乎，而不只是在配合我说话。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-17', 19, 'IN', 'mood', 1.3, 'positive', '你们最近一次发生矛盾，事后你的感受是？', '{"options":[{"key":"A","icon":"ti-mood-happy","text":"说清楚了，反而感觉更近了","score":90},{"key":"B","icon":"ti-mood-smile","text":"和好了，虽然没说太清楚","score":65},{"key":"C","icon":"ti-mood-confuzed","text":"和好了，但我不确定他理解了我","score":55},{"key":"D","icon":"ti-mood-sad","text":"委屈还在，只是不说了","score":35},{"key":"E","icon":"ti-mood-empty","text":"已经习惯了这种收场方式","score":30},{"key":"F","icon":"ti-mood-angry","text":"还有情绪，没有真正解决","score":35},{"key":"G","icon":"ti-mood-nervous","text":"担心下次还会这样","score":45},{"key":"H","icon":"ti-mood-tongue","text":"我们很少有真正的矛盾","score":75}],"source_question":{"id":"IN-F-17","order":17,"layer":"IN","weight":1.3,"type":"mood","direction":"positive","text":"你们最近一次发生矛盾，事后你的感受是？","options":[{"key":"A","icon":"ti-mood-happy","text":"说清楚了，反而感觉更近了","score":90},{"key":"B","icon":"ti-mood-smile","text":"和好了，虽然没说太清楚","score":65},{"key":"C","icon":"ti-mood-confuzed","text":"和好了，但我不确定他理解了我","score":55},{"key":"D","icon":"ti-mood-sad","text":"委屈还在，只是不说了","score":35},{"key":"E","icon":"ti-mood-empty","text":"已经习惯了这种收场方式","score":30},{"key":"F","icon":"ti-mood-angry","text":"还有情绪，没有真正解决","score":35},{"key":"G","icon":"ti-mood-nervous","text":"担心下次还会这样","score":45},{"key":"H","icon":"ti-mood-tongue","text":"我们很少有真正的矛盾","score":75}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-18', 20, 'IN', 'scenario', 1.5, 'positive', '你需要他，但他刚好很忙。他通常怎么做？', '{"scene":"被需要时的响应优先级","options":[{"key":"A","text":"再忙也会挤出时间回应我，哪怕只是一条消息","sub":"高优先级响应","score":90},{"key":"B","text":"说等他忙完，然后真的会来找我","sub":"延迟但可靠","score":75},{"key":"C","text":"说等他忙完，但经常忘了或者没来","sub":"意愿有但执行不足","score":45},{"key":"D","text":"基本上顾不上，要等他自己空了","sub":"低响应优先级","score":25}],"source_question":{"id":"IN-F-18","order":18,"layer":"IN","weight":1.5,"type":"scenario","direction":"positive","text":"你需要他，但他刚好很忙。他通常怎么做？","scene":"被需要时的响应优先级","options":[{"key":"A","text":"再忙也会挤出时间回应我，哪怕只是一条消息","sub":"高优先级响应","score":90},{"key":"B","text":"说等他忙完，然后真的会来找我","sub":"延迟但可靠","score":75},{"key":"C","text":"说等他忙完，但经常忘了或者没来","sub":"意愿有但执行不足","score":45},{"key":"D","text":"基本上顾不上，要等他自己空了","sub":"低响应优先级","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-19', 21, 'IN', 'binary', 1.5, 'positive', '你们之间的沟通，你满意吗？', '{"options":[{"key":"left","text":"满意，我觉得我们能真正说到对方心里去","sub":"高沟通质量","score":85},{"key":"right","text":"有时候觉得隔着什么，说了但没有被接住","sub":"沟通有障碍","score":40}],"source_question":{"id":"IN-F-19","order":19,"layer":"IN","weight":1.5,"type":"binary","direction":"positive","text":"你们之间的沟通，你满意吗？","options":[{"key":"left","text":"满意，我觉得我们能真正说到对方心里去","sub":"高沟通质量","score":85},{"key":"right","text":"有时候觉得隔着什么，说了但没有被接住","sub":"沟通有障碍","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-20', 22, 'IN', 'choice', 1.3, 'positive', '跟他在一起，你会主动分享你生活里的事情吗？', '{"options":[{"key":"A","text":"很愿意，什么都想跟他说","sub":"高开放度，联结感强","score":85},{"key":"B","text":"重要的会说，日常小事不一定","sub":"中等，选择性分享","score":70},{"key":"C","text":"说了他也不一定感兴趣，慢慢就少说了","sub":"分享欲被打压","score":40},{"key":"D","text":"不太习惯跟他分享，更多是各自的生活","sub":"低联结感","score":45}],"source_question":{"id":"IN-F-20","order":20,"layer":"IN","weight":1.3,"type":"choice","direction":"positive","text":"跟他在一起，你会主动分享你生活里的事情吗？","options":[{"key":"A","text":"很愿意，什么都想跟他说","sub":"高开放度，联结感强","score":85},{"key":"B","text":"重要的会说，日常小事不一定","sub":"中等，选择性分享","score":70},{"key":"C","text":"说了他也不一定感兴趣，慢慢就少说了","sub":"分享欲被打压","score":40},{"key":"D","text":"不太习惯跟他分享，更多是各自的生活","sub":"低联结感","score":45}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-21', 23, 'IN', 'slider', 1.5, 'positive', '在你们的关系里，你感觉自己被他真正理解的程度是多少？', '{"slider":{"min":0,"max":100,"min_label":"他不太了解真正的我","max_label":"他是少数真正懂我的人之一","feedback":[{"range":[0,25],"text":"你在这段关系里有一种孤独感"},{"range":[26,45],"text":"被了解的部分有限，还有很多他不知道"},{"range":[46,65],"text":"他了解你的一部分，还有一部分还没打开"},{"range":[66,85],"text":"他真的懂你的很多，这很珍贵"},{"range":[86,100],"text":"你在他这里有一种被完整看见的感觉"}]},"source_question":{"id":"IN-F-21","order":21,"layer":"IN","weight":1.5,"type":"slider","direction":"positive","text":"在你们的关系里，你感觉自己被他真正理解的程度是多少？","slider":{"min":0,"max":100,"min_label":"他不太了解真正的我","max_label":"他是少数真正懂我的人之一","feedback":[{"range":[0,25],"text":"你在这段关系里有一种孤独感"},{"range":[26,45],"text":"被了解的部分有限，还有很多他不知道"},{"range":[46,65],"text":"他了解你的一部分，还有一部分还没打开"},{"range":[66,85],"text":"他真的懂你的很多，这很珍贵"},{"range":[86,100],"text":"你在他这里有一种被完整看见的感觉"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-22', 24, 'IN', 'scenario', 1.5, 'positive', '你们有一件事意见不一样，都觉得自己是对的。通常最后是怎么解决的？', '{"scene":"分歧解决方式","options":[{"key":"A","text":"真的把各自的想法说清楚，找到双方都接受的方式","sub":"高质量冲突解决","score":90},{"key":"B","text":"其中一个人让步了，虽然不完全认同","sub":"让步式解决，有压抑","score":60},{"key":"C","text":"搁置了，不了了之","sub":"回避型解决","score":45},{"key":"D","text":"争到最后变成情绪问题，忘了最初在讨论什么","sub":"冲突升级，解决质量低","score":25}],"source_question":{"id":"IN-F-22","order":22,"layer":"IN","weight":1.5,"type":"scenario","direction":"positive","text":"你们有一件事意见不一样，都觉得自己是对的。通常最后是怎么解决的？","scene":"分歧解决方式","options":[{"key":"A","text":"真的把各自的想法说清楚，找到双方都接受的方式","sub":"高质量冲突解决","score":90},{"key":"B","text":"其中一个人让步了，虽然不完全认同","sub":"让步式解决，有压抑","score":60},{"key":"C","text":"搁置了，不了了之","sub":"回避型解决","score":45},{"key":"D","text":"争到最后变成情绪问题，忘了最初在讨论什么","sub":"冲突升级，解决质量低","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-23', 25, 'IN', 'scale', 1.3, 'positive', '我们吵架之后，他会主动修复，不会让矛盾一直悬着。', '{"alt_text_secret_crush":"当我们有误会，他会主动来沟通解释。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"IN-F-23","order":23,"layer":"IN","weight":1.3,"type":"scale","direction":"positive","text":"我们吵架之后，他会主动修复，不会让矛盾一直悬着。","alt_text_secret_crush":"当我们有误会，他会主动来沟通解释。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-24', 26, 'IN', 'card', 1.2, 'positive', '你们相处的日常，最接近哪张？', '{"options":[{"key":"A","text":"有很多话说，聊什么都能聊很久","sub":"高话题密度，联结感强","score":80},{"key":"B","text":"不需要一直说话，沉默也很舒服","sub":"高舒适度，联结感深","score":85},{"key":"C","text":"有时候会不知道聊什么，有点冷场","sub":"联结感有待加深","score":50},{"key":"D","text":"各做各的，交集不是很多","sub":"平行状态，联结感弱","score":35}],"source_question":{"id":"IN-F-24","order":24,"layer":"IN","weight":1.2,"type":"card","direction":"positive","text":"你们相处的日常，最接近哪张？","options":[{"key":"A","text":"有很多话说，聊什么都能聊很久","sub":"高话题密度，联结感强","score":80},{"key":"B","text":"不需要一直说话，沉默也很舒服","sub":"高舒适度，联结感深","score":85},{"key":"C","text":"有时候会不知道聊什么，有点冷场","sub":"联结感有待加深","score":50},{"key":"D","text":"各做各的，交集不是很多","sub":"平行状态，联结感弱","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-25', 27, 'IN', 'binary', 1.5, 'positive', '他说话算数吗？答应你的事，他做到的概率是？', '{"options":[{"key":"left","text":"很高，他说了基本上会做到","sub":"高可靠度","score":85},{"key":"right","text":"不一定，经常有变化或者忘了","sub":"低可靠度","score":35}],"source_question":{"id":"IN-F-25","order":25,"layer":"IN","weight":1.5,"type":"binary","direction":"positive","text":"他说话算数吗？答应你的事，他做到的概率是？","options":[{"key":"left","text":"很高，他说了基本上会做到","sub":"高可靠度","score":85},{"key":"right","text":"不一定，经常有变化或者忘了","sub":"低可靠度","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-F-26', 28, 'IN', 'scenario', 1.5, 'positive', '你有一件重要的事，很需要他的支持和陪伴。他出现了吗？', '{"scene":"关键时刻的情感在场","options":[{"key":"A","text":"出现了，而且做到了我需要的","sub":"高情感在场","score":90},{"key":"B","text":"出现了，但不太知道怎么支持我","sub":"意愿有，能力待提升","score":65},{"key":"C","text":"说会来，但最后没有","sub":"低可靠度","score":30},{"key":"D","text":"我没有开口，因为我不确定他会来","sub":"信任度不足，已经开始自我保护","score":40}],"source_question":{"id":"IN-F-26","order":26,"layer":"IN","weight":1.5,"type":"scenario","direction":"positive","text":"你有一件重要的事，很需要他的支持和陪伴。他出现了吗？","scene":"关键时刻的情感在场","options":[{"key":"A","text":"出现了，而且做到了我需要的","sub":"高情感在场","score":90},{"key":"B","text":"出现了，但不太知道怎么支持我","sub":"意愿有，能力待提升","score":65},{"key":"C","text":"说会来，但最后没有","sub":"低可靠度","score":30},{"key":"D","text":"我没有开口，因为我不确定他会来","sub":"信任度不足，已经开始自我保护","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-27', 29, 'CO', 'scenario', 1.5, 'positive', '你们谈到了未来——住在哪里、要不要孩子、怎么分配家庭和工作。你们的方向是？', '{"alt_text_secret_crush":"从你对他的了解来看，你们对未来生活的设想大概一致吗？","scene":"未来规划的一致性","options":[{"key":"A","text":"基本一致，细节可以商量","sub":"高兼容性","score":90},{"key":"B","text":"有一些不同，但都愿意妥协","sub":"中等，有弹性","score":70},{"key":"C","text":"有一个比较核心的分歧，暂时搁置着","sub":"潜在风险，未解决","score":45},{"key":"D","text":"没有认真谈过，或者谈了发现差很多","sub":"低兼容性或未探索","score":30}],"source_question":{"id":"CO-F-27","order":27,"layer":"CO","weight":1.5,"type":"scenario","direction":"positive","text":"你们谈到了未来——住在哪里、要不要孩子、怎么分配家庭和工作。你们的方向是？","alt_text_secret_crush":"从你对他的了解来看，你们对未来生活的设想大概一致吗？","scene":"未来规划的一致性","options":[{"key":"A","text":"基本一致，细节可以商量","sub":"高兼容性","score":90},{"key":"B","text":"有一些不同，但都愿意妥协","sub":"中等，有弹性","score":70},{"key":"C","text":"有一个比较核心的分歧，暂时搁置着","sub":"潜在风险，未解决","score":45},{"key":"D","text":"没有认真谈过，或者谈了发现差很多","sub":"低兼容性或未探索","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-28', 30, 'CO', 'binary', 1.3, 'positive', '你们的生活节奏和日常习惯，合得来吗？', '{"options":[{"key":"left","text":"合得来，不需要特别迁就对方","sub":"高生活兼容性","score":85},{"key":"right","text":"有一些差异，需要双方调整","sub":"中等，需要磨合","score":55}],"source_question":{"id":"CO-F-28","order":28,"layer":"CO","weight":1.3,"type":"binary","direction":"positive","text":"你们的生活节奏和日常习惯，合得来吗？","options":[{"key":"left","text":"合得来，不需要特别迁就对方","sub":"高生活兼容性","score":85},{"key":"right","text":"有一些差异，需要双方调整","sub":"中等，需要磨合","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-29', 31, 'CO', 'choice', 1.3, 'positive', '你们对于钱的态度和消费方式，大概是？', '{"options":[{"key":"A","text":"很接近，不会在这件事上有摩擦","sub":"高兼容","score":85},{"key":"B","text":"有差异，但互相理解，不影响关系","sub":"中等，接受差异","score":70},{"key":"C","text":"有一些摩擦，但还在可以接受的范围","sub":"中低，潜在压力","score":50},{"key":"D","text":"差距比较大，这是我们关系里的一个压力来源","sub":"低兼容，显性风险","score":25}],"source_question":{"id":"CO-F-29","order":29,"layer":"CO","weight":1.3,"type":"choice","direction":"positive","text":"你们对于钱的态度和消费方式，大概是？","options":[{"key":"A","text":"很接近，不会在这件事上有摩擦","sub":"高兼容","score":85},{"key":"B","text":"有差异，但互相理解，不影响关系","sub":"中等，接受差异","score":70},{"key":"C","text":"有一些摩擦，但还在可以接受的范围","sub":"中低，潜在压力","score":50},{"key":"D","text":"差距比较大，这是我们关系里的一个压力来源","sub":"低兼容，显性风险","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-30', 32, 'CO', 'slider', 1.5, 'positive', '你们在核心价值观上——比如对家庭的看法、对工作的态度、对生活的优先级——有多一致？', '{"slider":{"min":0,"max":100,"min_label":"差异很大，经常感觉我们不是一路人","max_label":"非常一致，很少在这些事上有分歧","feedback":[{"range":[0,25],"text":"你们在一些根本性的问题上有差距，这需要认真对待"},{"range":[26,45],"text":"有一些重要的分歧，但还没有到无法共存的程度"},{"range":[46,65],"text":"大方向一致，细节上有差异"},{"range":[66,85],"text":"你们是比较像的两个人，底层逻辑相近"},{"range":[86,100],"text":"你们在很多根本性的问题上都高度一致，这很难得"}]},"source_question":{"id":"CO-F-30","order":30,"layer":"CO","weight":1.5,"type":"slider","direction":"positive","text":"你们在核心价值观上——比如对家庭的看法、对工作的态度、对生活的优先级——有多一致？","slider":{"min":0,"max":100,"min_label":"差异很大，经常感觉我们不是一路人","max_label":"非常一致，很少在这些事上有分歧","feedback":[{"range":[0,25],"text":"你们在一些根本性的问题上有差距，这需要认真对待"},{"range":[26,45],"text":"有一些重要的分歧，但还没有到无法共存的程度"},{"range":[46,65],"text":"大方向一致，细节上有差异"},{"range":[66,85],"text":"你们是比较像的两个人，底层逻辑相近"},{"range":[86,100],"text":"你们在很多根本性的问题上都高度一致，这很难得"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-31', 33, 'CO', 'scale', 1.5, 'positive', '我觉得他是一个跟我能走很远的人，不只是现在合适，是长期来看也合适。', '{"alt_text_secret_crush":"从我对他的了解，我觉得他是一个跟我能走很远的人。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"CO-F-31","order":31,"layer":"CO","weight":1.5,"type":"scale","direction":"positive","text":"我觉得他是一个跟我能走很远的人，不只是现在合适，是长期来看也合适。","alt_text_secret_crush":"从我对他的了解，我觉得他是一个跟我能走很远的人。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-32', 34, 'CO', 'scenario', 1.3, 'positive', '你们各自的家庭对这段关系的态度，大概是什么情况？', '{"skip_for":["secret_crush"],"scene":"家庭外部支持情况","options":[{"key":"A","text":"双方家庭都支持，没有外部压力","sub":"低风险，强支撑","score":90},{"key":"B","text":"一边支持，一边有些保留","sub":"中等，有潜在压力","score":65},{"key":"C","text":"双方家庭都有一些不同意见","sub":"中高风险","score":45},{"key":"D","text":"家庭因素是我们关系里一个比较大的挑战","sub":"高风险，需要认真面对","score":25}],"source_question":{"id":"CO-F-32","order":32,"layer":"CO","weight":1.3,"type":"scenario","direction":"positive","text":"你们各自的家庭对这段关系的态度，大概是什么情况？","skip_for":["secret_crush"],"scene":"家庭外部支持情况","options":[{"key":"A","text":"双方家庭都支持，没有外部压力","sub":"低风险，强支撑","score":90},{"key":"B","text":"一边支持，一边有些保留","sub":"中等，有潜在压力","score":65},{"key":"C","text":"双方家庭都有一些不同意见","sub":"中高风险","score":45},{"key":"D","text":"家庭因素是我们关系里一个比较大的挑战","sub":"高风险，需要认真面对","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-33', 35, 'CO', 'binary', 1.3, 'positive', '你们对于「关系里各自需要多少空间」这件事，理解一致吗？', '{"options":[{"key":"left","text":"一致，我们都知道彼此需要什么","sub":"高空间兼容性","score":85},{"key":"right","text":"有差距，一个需要更多空间，一个需要更多陪伴","sub":"空间需求不对等","score":45}],"source_question":{"id":"CO-F-33","order":33,"layer":"CO","weight":1.3,"type":"binary","direction":"positive","text":"你们对于「关系里各自需要多少空间」这件事，理解一致吗？","options":[{"key":"left","text":"一致，我们都知道彼此需要什么","sub":"高空间兼容性","score":85},{"key":"right","text":"有差距，一个需要更多空间，一个需要更多陪伴","sub":"空间需求不对等","score":45}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-34', 36, 'CO', 'choice', 1.2, 'positive', '你觉得他的朋友圈和社交，跟你的世界有多少交集？', '{"options":[{"key":"A","text":"很多，我们的生活有很深的融合","sub":"高社交兼容","score":75},{"key":"B","text":"有一些交集，但各自也有独立的圈子","sub":"健康平衡","score":85},{"key":"C","text":"很少，我们的生活几乎是平行的","sub":"低融合度","score":45},{"key":"D","text":"我不太了解他的社交，他这部分对我不太透明","sub":"信息不对称，潜在风险","score":35}],"source_question":{"id":"CO-F-34","order":34,"layer":"CO","weight":1.2,"type":"choice","direction":"positive","text":"你觉得他的朋友圈和社交，跟你的世界有多少交集？","options":[{"key":"A","text":"很多，我们的生活有很深的融合","sub":"高社交兼容","score":75},{"key":"B","text":"有一些交集，但各自也有独立的圈子","sub":"健康平衡","score":85},{"key":"C","text":"很少，我们的生活几乎是平行的","sub":"低融合度","score":45},{"key":"D","text":"我不太了解他的社交，他这部分对我不太透明","sub":"信息不对称，潜在风险","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-35', 37, 'CO', 'scale', 1.5, 'positive', '我们对于「这段关系会走向哪里」有相似的期待，不需要靠猜测来确认对方的想法。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"CO-F-35","order":35,"layer":"CO","weight":1.5,"type":"scale","direction":"positive","text":"我们对于「这段关系会走向哪里」有相似的期待，不需要靠猜测来确认对方的想法。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-36', 38, 'CO', 'scenario', 1.2, 'positive', '你们谈到彼此的工作和事业。他对你的工作和发展，是什么态度？', '{"scene":"对彼此事业的支持态度","options":[{"key":"A","text":"真心支持，会为我的成就感到高兴","sub":"高支持度","score":90},{"key":"B","text":"支持，但有时候会有一些不理解","sub":"中等，意愿有，理解有限","score":65},{"key":"C","text":"态度一般，工作对他来说不是优先关注的","sub":"低兴趣，有潜在摩擦","score":45},{"key":"D","text":"有时候会因为工作问题有矛盾","sub":"事业观不兼容","score":30}],"source_question":{"id":"CO-F-36","order":36,"layer":"CO","weight":1.2,"type":"scenario","direction":"positive","text":"你们谈到彼此的工作和事业。他对你的工作和发展，是什么态度？","scene":"对彼此事业的支持态度","options":[{"key":"A","text":"真心支持，会为我的成就感到高兴","sub":"高支持度","score":90},{"key":"B","text":"支持，但有时候会有一些不理解","sub":"中等，意愿有，理解有限","score":65},{"key":"C","text":"态度一般，工作对他来说不是优先关注的","sub":"低兴趣，有潜在摩擦","score":45},{"key":"D","text":"有时候会因为工作问题有矛盾","sub":"事业观不兼容","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-37', 39, 'CO', 'rank', 1.0, 'auxiliary', '在你们的关系里，哪些事情你们最一致？从最一致到最有分歧排序。', '{"items":[{"id":"a","text":"对未来生活方式的设想"},{"id":"b","text":"对家庭和婚育的看法"},{"id":"c","text":"对钱和消费的态度"},{"id":"d","text":"对彼此需要多少空间的理解"}],"source_question":{"id":"CO-F-37","order":37,"layer":"CO","weight":1.0,"type":"rank","direction":"auxiliary","text":"在你们的关系里，哪些事情你们最一致？从最一致到最有分歧排序。","items":[{"id":"a","text":"对未来生活方式的设想"},{"id":"b","text":"对家庭和婚育的看法"},{"id":"c","text":"对钱和消费的态度"},{"id":"d","text":"对彼此需要多少空间的理解"}],"scoring":{"method":"auxiliary","note":"用于辅助AI生成个性化建议，识别具体薄弱点"}}}'::jsonb, '{"method":"auxiliary","note":"用于辅助AI生成个性化建议，识别具体薄弱点"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-F-38', 40, 'CO', 'binary', 1.3, 'positive', '你觉得你们两个人，从根本上是同一类人吗？', '{"options":[{"key":"left","text":"是，我们底层的很多东西是相似的","sub":"高深层兼容","score":80},{"key":"right","text":"不完全是，我们有一些根本性的不同","sub":"差异型组合，需要更多努力","score":55}],"source_question":{"id":"CO-F-38","order":38,"layer":"CO","weight":1.3,"type":"binary","direction":"positive","text":"你觉得你们两个人，从根本上是同一类人吗？","options":[{"key":"left","text":"是，我们底层的很多东西是相似的","sub":"高深层兼容","score":80},{"key":"right","text":"不完全是，我们有一些根本性的不同","sub":"差异型组合，需要更多努力","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-39', 41, 'EV', 'slider', 1.5, 'positive', '跟他在一起这段时间，你觉得自己有没有在成长？', '{"slider":{"min":0,"max":100,"min_label":"我感觉自己在这段关系里反而萎缩了","max_label":"我在这段关系里明显成为了更好的自己","feedback":[{"range":[0,20],"text":"这段关系让你消耗多于滋养，这值得认真看一看"},{"range":[21,40],"text":"有一些被消耗的感觉，但也有好的部分"},{"range":[41,60],"text":"平稳，没有特别的成长也没有特别的消耗"},{"range":[61,80],"text":"你在这段关系里是在成长的"},{"range":[81,100],"text":"这段关系是你生命里真正滋养你的关系之一"}]},"source_question":{"id":"EV-F-39","order":39,"layer":"EV","weight":1.5,"type":"slider","direction":"positive","text":"跟他在一起这段时间，你觉得自己有没有在成长？","slider":{"min":0,"max":100,"min_label":"我感觉自己在这段关系里反而萎缩了","max_label":"我在这段关系里明显成为了更好的自己","feedback":[{"range":[0,20],"text":"这段关系让你消耗多于滋养，这值得认真看一看"},{"range":[21,40],"text":"有一些被消耗的感觉，但也有好的部分"},{"range":[41,60],"text":"平稳，没有特别的成长也没有特别的消耗"},{"range":[61,80],"text":"你在这段关系里是在成长的"},{"range":[81,100],"text":"这段关系是你生命里真正滋养你的关系之一"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-40', 42, 'EV', 'scenario', 1.5, 'positive', '你想象一年后的你们。第一个浮现的画面是？', '{"scene":"对关系未来的直觉预期","options":[{"key":"A","text":"比现在更好，我能想象我们在一起的样子","sub":"正向预期，关系上升期","score":90},{"key":"B","text":"差不多，继续维持现在的状态","sub":"平台期，稳定但缺少动力","score":60},{"key":"C","text":"有点模糊，不确定一年后会怎样","sub":"方向不清，潜在风险","score":45},{"key":"D","text":"我很难想象，或者想到就有点担心","sub":"关系走向不乐观","score":25}],"source_question":{"id":"EV-F-40","order":40,"layer":"EV","weight":1.5,"type":"scenario","direction":"positive","text":"你想象一年后的你们。第一个浮现的画面是？","scene":"对关系未来的直觉预期","options":[{"key":"A","text":"比现在更好，我能想象我们在一起的样子","sub":"正向预期，关系上升期","score":90},{"key":"B","text":"差不多，继续维持现在的状态","sub":"平台期，稳定但缺少动力","score":60},{"key":"C","text":"有点模糊，不确定一年后会怎样","sub":"方向不清，潜在风险","score":45},{"key":"D","text":"我很难想象，或者想到就有点担心","sub":"关系走向不乐观","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-41', 43, 'EV', 'binary', 1.5, 'positive', '这段关系最近的趋势，你感觉是？', '{"options":[{"key":"left","text":"在变好，我们越来越懂彼此","sub":"上升趋势","score":85},{"key":"right","text":"有一些东西在变淡，或者出现了一些以前没有的问题","sub":"下降或平台趋势","score":40}],"source_question":{"id":"EV-F-41","order":41,"layer":"EV","weight":1.5,"type":"binary","direction":"positive","text":"这段关系最近的趋势，你感觉是？","options":[{"key":"left","text":"在变好，我们越来越懂彼此","sub":"上升趋势","score":85},{"key":"right","text":"有一些东西在变淡，或者出现了一些以前没有的问题","sub":"下降或平台趋势","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-42', 44, 'EV', 'choice', 1.3, 'positive', '你在这段关系里，有没有因为他而改变过什么？', '{"options":[{"key":"A","text":"有，而且是往好的方向，我喜欢这些变化","sub":"正向成长","score":90},{"key":"B","text":"有，但不确定这些变化是不是好的","sub":"被动改变，需要审视","score":55},{"key":"C","text":"没有特别的，我还是我自己","sub":"关系影响有限，可正可负","score":65},{"key":"D","text":"有一些，但有时候感觉失去了一些原来的自己","sub":"自我消融风险","score":35}],"source_question":{"id":"EV-F-42","order":42,"layer":"EV","weight":1.3,"type":"choice","direction":"positive","text":"你在这段关系里，有没有因为他而改变过什么？","options":[{"key":"A","text":"有，而且是往好的方向，我喜欢这些变化","sub":"正向成长","score":90},{"key":"B","text":"有，但不确定这些变化是不是好的","sub":"被动改变，需要审视","score":55},{"key":"C","text":"没有特别的，我还是我自己","sub":"关系影响有限，可正可负","score":65},{"key":"D","text":"有一些，但有时候感觉失去了一些原来的自己","sub":"自我消融风险","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-43', 45, 'EV', 'scale', 1.5, 'positive', '我对这段关系的未来是有期待的，不只是走一步看一步。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"EV-F-43","order":43,"layer":"EV","weight":1.5,"type":"scale","direction":"positive","text":"我对这段关系的未来是有期待的，不只是走一步看一步。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-44', 46, 'EV', 'mood', 1.5, 'positive', '你有没有想过结束这段关系？这个念头出现的频率是？', '{"options":[{"key":"A","icon":"ti-mood-smile","text":"几乎没有，我没有想过","score":90},{"key":"B","icon":"ti-mood-happy","text":"偶尔有过一闪而过的念头，但很快就消了","score":75},{"key":"C","icon":"ti-mood-confuzed","text":"有时候会想，但不确定自己真的想","score":55},{"key":"D","icon":"ti-mood-sad","text":"有过认真想过，后来放下了","score":50},{"key":"E","icon":"ti-mood-nervous","text":"最近这个念头出现得比较频繁","score":30},{"key":"F","icon":"ti-mood-empty","text":"想过很多次，但一直没有行动","score":35},{"key":"G","icon":"ti-mood-angry","text":"情绪激动的时候想过，但冷静了就不想了","score":55},{"key":"H","icon":"ti-mood-tongue","text":"这段关系还很新，没有想到这一步","score":80}],"source_question":{"id":"EV-F-44","order":44,"layer":"EV","weight":1.5,"type":"mood","direction":"positive","text":"你有没有想过结束这段关系？这个念头出现的频率是？","options":[{"key":"A","icon":"ti-mood-smile","text":"几乎没有，我没有想过","score":90},{"key":"B","icon":"ti-mood-happy","text":"偶尔有过一闪而过的念头，但很快就消了","score":75},{"key":"C","icon":"ti-mood-confuzed","text":"有时候会想，但不确定自己真的想","score":55},{"key":"D","icon":"ti-mood-sad","text":"有过认真想过，后来放下了","score":50},{"key":"E","icon":"ti-mood-nervous","text":"最近这个念头出现得比较频繁","score":30},{"key":"F","icon":"ti-mood-empty","text":"想过很多次，但一直没有行动","score":35},{"key":"G","icon":"ti-mood-angry","text":"情绪激动的时候想过，但冷静了就不想了","score":55},{"key":"H","icon":"ti-mood-tongue","text":"这段关系还很新，没有想到这一步","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-45', 47, 'EV', 'scenario', 1.5, 'positive', '你回顾你们在一起的这段时间。整体感受是？', '{"scene":"关系整体价值的回顾","options":[{"key":"A","text":"值得，有很多真实的快乐和成长","sub":"高关系价值感","score":90},{"key":"B","text":"有好有坏，总体还是值得的","sub":"中等，接受复杂性","score":70},{"key":"C","text":"有些累，但还没想清楚要怎样","sub":"消耗感明显，方向模糊","score":40},{"key":"D","text":"如果能重来，我可能会做不同的选择","sub":"低关系价值感，风险信号","score":20}],"source_question":{"id":"EV-F-45","order":45,"layer":"EV","weight":1.5,"type":"scenario","direction":"positive","text":"你回顾你们在一起的这段时间。整体感受是？","scene":"关系整体价值的回顾","options":[{"key":"A","text":"值得，有很多真实的快乐和成长","sub":"高关系价值感","score":90},{"key":"B","text":"有好有坏，总体还是值得的","sub":"中等，接受复杂性","score":70},{"key":"C","text":"有些累，但还没想清楚要怎样","sub":"消耗感明显，方向模糊","score":40},{"key":"D","text":"如果能重来，我可能会做不同的选择","sub":"低关系价值感，风险信号","score":20}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-46', 48, 'EV', 'binary', 1.3, 'positive', '你有没有在这段关系里，感觉过一种「这就是了」的确定感？', '{"options":[{"key":"left","text":"有，有时候会感觉他就是那个对的人","sub":"高关系确认感","score":85},{"key":"right","text":"不太确定，这种感觉偶尔有但不稳定","sub":"低确认感，关系方向模糊","score":50}],"source_question":{"id":"EV-F-46","order":46,"layer":"EV","weight":1.3,"type":"binary","direction":"positive","text":"你有没有在这段关系里，感觉过一种「这就是了」的确定感？","options":[{"key":"left","text":"有，有时候会感觉他就是那个对的人","sub":"高关系确认感","score":85},{"key":"right","text":"不太确定，这种感觉偶尔有但不稳定","sub":"低确认感，关系方向模糊","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-47', 49, 'EV', 'choice', 1.5, 'positive', '他在你的未来计划里吗？', '{"options":[{"key":"A","text":"在，我想象未来的时候他自然就在里面","sub":"高未来整合度","score":90},{"key":"B","text":"有时候在，但不是每次都想到他","sub":"中等，不够稳定","score":65},{"key":"C","text":"不太确定，还没想到那么远","sub":"低未来整合度，或关系阶段还早","score":50},{"key":"D","text":"我刻意不去想，因为想了会有压力","sub":"回避型，有焦虑","score":35}],"source_question":{"id":"EV-F-47","order":47,"layer":"EV","weight":1.5,"type":"choice","direction":"positive","text":"他在你的未来计划里吗？","options":[{"key":"A","text":"在，我想象未来的时候他自然就在里面","sub":"高未来整合度","score":90},{"key":"B","text":"有时候在，但不是每次都想到他","sub":"中等，不够稳定","score":65},{"key":"C","text":"不太确定，还没想到那么远","sub":"低未来整合度，或关系阶段还早","score":50},{"key":"D","text":"我刻意不去想，因为想了会有压力","sub":"回避型，有焦虑","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-48', 50, 'EV', 'slider', 1.5, 'positive', '你觉得你们现在的关系，处于一个什么样的动态？', '{"slider":{"min":0,"max":100,"min_label":"明显在走下坡，很多东西在消退","max_label":"明显在变好，我们越来越有默契","feedback":[{"range":[0,25],"text":"有一些让你担心的信号，值得认真正视"},{"range":[26,45],"text":"有些东西在消退，但还有可以挽回的空间"},{"range":[46,60],"text":"处于平台期，稳定但缺少新的动力"},{"range":[61,80],"text":"整体是在往好的方向走的"},{"range":[81,100],"text":"你们正处于关系里的一个好阶段"}]},"source_question":{"id":"EV-F-48","order":48,"layer":"EV","weight":1.5,"type":"slider","direction":"positive","text":"你觉得你们现在的关系，处于一个什么样的动态？","slider":{"min":0,"max":100,"min_label":"明显在走下坡，很多东西在消退","max_label":"明显在变好，我们越来越有默契","feedback":[{"range":[0,25],"text":"有一些让你担心的信号，值得认真正视"},{"range":[26,45],"text":"有些东西在消退，但还有可以挽回的空间"},{"range":[46,60],"text":"处于平台期，稳定但缺少新的动力"},{"range":[61,80],"text":"整体是在往好的方向走的"},{"range":[81,100],"text":"你们正处于关系里的一个好阶段"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-49', 51, 'EV', 'scale', 1.5, 'positive', '跟他在一起，我觉得自己是在往前走的，不是在原地等或者在后退。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"EV-F-49","order":49,"layer":"EV","weight":1.5,"type":"scale","direction":"positive","text":"跟他在一起，我觉得自己是在往前走的，不是在原地等或者在后退。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-F-50', 52, 'EV', 'scenario', 1.3, 'positive', '你的朋友问你「你们还会在一起吗」。你的第一反应是？', '{"scene":"关系稳定性的直觉判断","options":[{"key":"A","text":"会，我没有想过结束这段关系","sub":"高稳定性","score":90},{"key":"B","text":"应该会，但我没有完全确定","sub":"中等，有不确定感","score":65},{"key":"C","text":"不知道，说不准","sub":"低稳定性，方向模糊","score":40},{"key":"D","text":"我也在想这个问题","sub":"关系处于评估期","score":35}],"source_question":{"id":"EV-F-50","order":50,"layer":"EV","weight":1.3,"type":"scenario","direction":"positive","text":"你的朋友问你「你们还会在一起吗」。你的第一反应是？","scene":"关系稳定性的直觉判断","options":[{"key":"A","text":"会，我没有想过结束这段关系","sub":"高稳定性","score":90},{"key":"B","text":"应该会，但我没有完全确定","sub":"中等，有不确定感","score":65},{"key":"C","text":"不知道，说不准","sub":"低稳定性，方向模糊","score":40},{"key":"D","text":"我也在想这个问题","sub":"关系处于评估期","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-51', 53, 'RK', 'scenario', 1.5, 'reverse', '他有时候会说一些让你感到被否定或者不被尊重的话。这种情况？', '{"scene":"言语尊重程度","options":[{"key":"A","text":"几乎没有，他说话很注意我的感受","sub":"低风险","score":10},{"key":"B","text":"偶尔有，但他会意识到并道歉","sub":"低中风险，有修复机制","score":30},{"key":"C","text":"有时候有，他不太意识到，或者觉得我太敏感","sub":"中高风险","score":60},{"key":"D","text":"比较频繁，这是让我感到受伤的一个来源","sub":"高风险，需要认真对待","score":85}],"source_question":{"id":"RK-F-51","order":51,"layer":"RK","weight":1.5,"type":"scenario","direction":"reverse","text":"他有时候会说一些让你感到被否定或者不被尊重的话。这种情况？","scene":"言语尊重程度","options":[{"key":"A","text":"几乎没有，他说话很注意我的感受","sub":"低风险","score":10},{"key":"B","text":"偶尔有，但他会意识到并道歉","sub":"低中风险，有修复机制","score":30},{"key":"C","text":"有时候有，他不太意识到，或者觉得我太敏感","sub":"中高风险","score":60},{"key":"D","text":"比较频繁，这是让我感到受伤的一个来源","sub":"高风险，需要认真对待","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-52', 54, 'RK', 'binary', 1.5, 'reverse', '在这段关系里，你有没有感觉过一种「我在压抑自己」的时刻？', '{"options":[{"key":"left","text":"很少，我在他面前大多数时候可以做自己","sub":"低风险","score":15},{"key":"right","text":"有，有一些东西我不敢说或者不得不压着","sub":"中高风险，自我压抑信号","score":70}],"source_question":{"id":"RK-F-52","order":52,"layer":"RK","weight":1.5,"type":"binary","direction":"reverse","text":"在这段关系里，你有没有感觉过一种「我在压抑自己」的时刻？","options":[{"key":"left","text":"很少，我在他面前大多数时候可以做自己","sub":"低风险","score":15},{"key":"right","text":"有，有一些东西我不敢说或者不得不压着","sub":"中高风险，自我压抑信号","score":70}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-53', 55, 'RK', 'choice', 1.5, 'reverse', '他对你的情绪和感受，通常是什么态度？', '{"options":[{"key":"A","text":"认真对待，就算他不完全理解也会尊重","sub":"低风险","score":10},{"key":"B","text":"大多数时候会回应，但有时候觉得我想多了","sub":"中低风险","score":35},{"key":"C","text":"经常觉得我太敏感或者小题大做","sub":"中高风险，情感否定倾向","score":65},{"key":"D","text":"基本上不太在意，或者会用情绪反应来压过我","sub":"高风险","score":85}],"source_question":{"id":"RK-F-53","order":53,"layer":"RK","weight":1.5,"type":"choice","direction":"reverse","text":"他对你的情绪和感受，通常是什么态度？","options":[{"key":"A","text":"认真对待，就算他不完全理解也会尊重","sub":"低风险","score":10},{"key":"B","text":"大多数时候会回应，但有时候觉得我想多了","sub":"中低风险","score":35},{"key":"C","text":"经常觉得我太敏感或者小题大做","sub":"中高风险，情感否定倾向","score":65},{"key":"D","text":"基本上不太在意，或者会用情绪反应来压过我","sub":"高风险","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-54', 56, 'RK', 'slider', 1.5, 'reverse', '在这段关系里，你感觉自己是否有足够的安全感，可以真实地表达自己？', '{"slider":{"min":0,"max":100,"min_label":"我经常不敢说真实的想法","max_label":"我可以完全做自己，不需要表演","feedback":[{"range":[0,25],"text":"你在这段关系里有一种压抑感，这值得认真看"},{"range":[26,45],"text":"有一些部分你不太敢展示，慢慢在开放"},{"range":[46,65],"text":"大多数时候可以，但某些话题还是会收着"},{"range":[66,85],"text":"整体很有安全感，能做自己"},{"range":[86,100],"text":"这段关系给了你真实的安全感"}]},"source_question":{"id":"RK-F-54","order":54,"layer":"RK","weight":1.5,"type":"slider","direction":"reverse","text":"在这段关系里，你感觉自己是否有足够的安全感，可以真实地表达自己？","slider":{"min":0,"max":100,"min_label":"我经常不敢说真实的想法","max_label":"我可以完全做自己，不需要表演","feedback":[{"range":[0,25],"text":"你在这段关系里有一种压抑感，这值得认真看"},{"range":[26,45],"text":"有一些部分你不太敢展示，慢慢在开放"},{"range":[46,65],"text":"大多数时候可以，但某些话题还是会收着"},{"range":[66,85],"text":"整体很有安全感，能做自己"},{"range":[86,100],"text":"这段关系给了你真实的安全感"}]},"scoring":{"method":"reverse","formula":"100 - value"}}}'::jsonb, '{"method":"reverse","formula":"100 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-55', 57, 'RK', 'scenario', 1.5, 'reverse', '你们之间有没有一些反复出现、始终没有解决的问题？', '{"scene":"慢性问题的存在程度","options":[{"key":"A","text":"没有，我们遇到问题基本都能解决","sub":"低风险","score":10},{"key":"B","text":"有一个，但我们都知道，在慢慢改善","sub":"中低风险，有意识","score":30},{"key":"C","text":"有，而且说了很多次但没有真正改变","sub":"中高风险，模式固化","score":65},{"key":"D","text":"有几个，感觉已经没什么好说的了","sub":"高风险，消极循环","score":85}],"source_question":{"id":"RK-F-55","order":55,"layer":"RK","weight":1.5,"type":"scenario","direction":"reverse","text":"你们之间有没有一些反复出现、始终没有解决的问题？","scene":"慢性问题的存在程度","options":[{"key":"A","text":"没有，我们遇到问题基本都能解决","sub":"低风险","score":10},{"key":"B","text":"有一个，但我们都知道，在慢慢改善","sub":"中低风险，有意识","score":30},{"key":"C","text":"有，而且说了很多次但没有真正改变","sub":"中高风险，模式固化","score":65},{"key":"D","text":"有几个，感觉已经没什么好说的了","sub":"高风险，消极循环","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-56', 58, 'RK', 'binary', 1.3, 'reverse', '你在这段关系里，有没有感觉过一种「我失去了自己」的时刻？', '{"options":[{"key":"left","text":"没有，我在这段关系里还是我自己","sub":"低风险","score":10},{"key":"right","text":"有，有时候感觉自己为了这段关系失去了一些东西","sub":"中高风险，自我消融信号","score":70}],"source_question":{"id":"RK-F-56","order":56,"layer":"RK","weight":1.3,"type":"binary","direction":"reverse","text":"你在这段关系里，有没有感觉过一种「我失去了自己」的时刻？","options":[{"key":"left","text":"没有，我在这段关系里还是我自己","sub":"低风险","score":10},{"key":"right","text":"有，有时候感觉自己为了这段关系失去了一些东西","sub":"中高风险，自我消融信号","score":70}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-57', 59, 'RK', 'choice', 1.3, 'reverse', '你们之间有没有一些话，是你一直想说但没说的？', '{"options":[{"key":"A","text":"没有，我们之间没有什么藏着掖着的","sub":"低风险，高透明度","score":10},{"key":"B","text":"有一些小事，但不影响大局","sub":"低中风险","score":25},{"key":"C","text":"有一些比较重要的话，一直没找到好的时机","sub":"中风险，沟通有积压","score":55},{"key":"D","text":"有一些核心的东西，我不确定说了会怎样，所以没说","sub":"高风险，关键问题被回避","score":80}],"source_question":{"id":"RK-F-57","order":57,"layer":"RK","weight":1.3,"type":"choice","direction":"reverse","text":"你们之间有没有一些话，是你一直想说但没说的？","options":[{"key":"A","text":"没有，我们之间没有什么藏着掖着的","sub":"低风险，高透明度","score":10},{"key":"B","text":"有一些小事，但不影响大局","sub":"低中风险","score":25},{"key":"C","text":"有一些比较重要的话，一直没找到好的时机","sub":"中风险，沟通有积压","score":55},{"key":"D","text":"有一些核心的东西，我不确定说了会怎样，所以没说","sub":"高风险，关键问题被回避","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-58', 60, 'RK', 'scale', 1.5, 'reverse', '我在这段关系里，有时候会感到害怕——害怕说真心话，或者害怕他的反应。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"source_question":{"id":"RK-F-58","order":58,"layer":"RK","weight":1.5,"type":"scale","direction":"reverse","text":"我在这段关系里，有时候会感到害怕——害怕说真心话，或者害怕他的反应。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"scoring":{"method":"reverse_times_25","formula":"(value - 1) * 25"}}}'::jsonb, '{"method":"reverse_times_25","formula":"(value - 1) * 25"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-59', 61, 'RK', 'mood', 1.5, 'reverse', '你对这段关系整体的感觉，最接近？', '{"options":[{"key":"A","icon":"ti-heart","text":"珍惜，这段关系让我感到幸运","score":10},{"key":"B","icon":"ti-mood-happy","text":"满意，整体很好","score":15},{"key":"C","icon":"ti-mood-smile","text":"还不错，有一些小问题但可以接受","score":25},{"key":"D","icon":"ti-mood-confuzed","text":"复杂，好的坏的都有","score":45},{"key":"E","icon":"ti-mood-sad","text":"有些疲惫，但还在坚持","score":60},{"key":"F","icon":"ti-mood-nervous","text":"有点不安，不确定在哪里出了问题","score":65},{"key":"G","icon":"ti-mood-empty","text":"有时候感觉很空，说不清楚为什么","score":70},{"key":"H","icon":"ti-mood-angry","text":"有一些委屈和不满，还没说出来","score":75}],"source_question":{"id":"RK-F-59","order":59,"layer":"RK","weight":1.5,"type":"mood","direction":"reverse","text":"你对这段关系整体的感觉，最接近？","options":[{"key":"A","icon":"ti-heart","text":"珍惜，这段关系让我感到幸运","score":10},{"key":"B","icon":"ti-mood-happy","text":"满意，整体很好","score":15},{"key":"C","icon":"ti-mood-smile","text":"还不错，有一些小问题但可以接受","score":25},{"key":"D","icon":"ti-mood-confuzed","text":"复杂，好的坏的都有","score":45},{"key":"E","icon":"ti-mood-sad","text":"有些疲惫，但还在坚持","score":60},{"key":"F","icon":"ti-mood-nervous","text":"有点不安，不确定在哪里出了问题","score":65},{"key":"G","icon":"ti-mood-empty","text":"有时候感觉很空，说不清楚为什么","score":70},{"key":"H","icon":"ti-mood-angry","text":"有一些委屈和不满，还没说出来","score":75}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-F-60', 62, 'RK', 'scenario', 1.5, 'reverse', '如果你最好的朋友跟你描述一段跟你们很相似的关系，问你怎么看。你会对她说什么？', '{"scene":"旁观者视角的关系评估","options":[{"key":"A","text":"我会说这段关系挺好的，值得好好珍惜","sub":"低风险，关系认可度高","score":10},{"key":"B","text":"我会说有些地方需要注意，但整体是健康的","sub":"中低风险，有自我觉察","score":30},{"key":"C","text":"我会有些担心，会提醒她注意某些模式","sub":"中高风险，旁观者视角能看到问题","score":60},{"key":"D","text":"我可能会建议她认真想一想这段关系值不值得继续","sub":"高风险，理智层面已有判断","score":85}],"source_question":{"id":"RK-F-60","order":60,"layer":"RK","weight":1.5,"type":"scenario","direction":"reverse","text":"如果你最好的朋友跟你描述一段跟你们很相似的关系，问你怎么看。你会对她说什么？","scene":"旁观者视角的关系评估","options":[{"key":"A","text":"我会说这段关系挺好的，值得好好珍惜","sub":"低风险，关系认可度高","score":10},{"key":"B","text":"我会说有些地方需要注意，但整体是健康的","sub":"中低风险，有自我觉察","score":30},{"key":"C","text":"我会有些担心，会提醒她注意某些模式","sub":"中高风险，旁观者视角能看到问题","score":60},{"key":"D","text":"我可能会建议她认真想一想这段关系值不值得继续","sub":"高风险，理智层面已有判断","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();


-- Source: suite2_ros_male.json

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
VALUES ('s02_ros_male', '关系画像测试', '1.0', 'male'::public.test_gender, 60, 15, false, true, '{"id":"S02_ROS_MALE","name":"关系画像测试","gender":"male","version":"1.0","total_questions":60,"pre_questions":2,"estimated_minutes":15,"is_free":false,"layers":["AT","IN","CO","EV","RK"],"relationship_types":["彼此生长","难舍难分","温水同行","心甘情愿地累","烈火烹油","此刻刚好"],"relationship_stages":["怦然相遇","渐入佳境","暗流初现","磨合阵痛","倦怠低谷","十字路口","重建信任","深度联结","并肩同行"],"question_types_used":["slider","scenario","binary","choice","scale","mood","card","rank"]}'::jsonb)
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
SELECT id, 'ROS_V3', '1.0', '{"layers":{"AT":{"label":"吸引基础","direction":"positive","weight":0.2,"male_focus":"你对她的吸引感是真实的还是习惯了"},"IN":{"label":"互动质量","direction":"positive","weight":0.3,"male_focus":"跟她在一起轻不轻松，她的情绪对你影响有多大"},"CO":{"label":"兼容程度","direction":"positive","weight":0.25,"male_focus":"生活方式和节奏合不合，她带来的是助力还是阻力"},"EV":{"label":"关系走向","direction":"positive","weight":0.15,"male_focus":"这段关系有没有让你有动力往前走，还是在消耗你"},"RK":{"label":"风险信号","direction":"reverse","weight":0.1,"male_focus":"有没有让你感到消耗、压抑或者不对劲的信号"}},"overall":{"formula":"AT*0.20 + IN*0.30 + CO*0.25 + EV*0.15 + (100-RK)*0.10","display_adjustment":{"note":"所有分数向上平移，底部有托底，最低显示55","mapping":[{"raw_min":0,"raw_max":40,"display_min":55,"display_max":65},{"raw_min":41,"raw_max":60,"display_min":65,"display_max":75},{"raw_min":61,"raw_max":80,"display_min":75,"display_max":88},{"raw_min":81,"raw_max":100,"display_min":88,"display_max":96}]}},"resonance_levels":[{"min":88,"max":96,"name":"心有灵犀","desc":"你们之间有一种很难被替代的默契"},{"min":75,"max":87,"name":"深度共鸣","desc":"真实的联结，值得好好珍惜"},{"min":65,"max":74,"name":"温柔磨合","desc":"你们在彼此靠近的路上，慢慢来"},{"min":55,"max":64,"name":"初见雏形","desc":"关系还在成形，有空间，也有可能"}]}'::jsonb, '{"pre_questions":[{"id":"PRE-M-00A","type":"choice","text":"在开始之前，先告诉我你们的关系状态。","note":"此答案影响题目措辞、阶段判断和结果语言，不计分。","options":[{"key":"A","text":"我在暗恋她，还没有任何进展","tag":"secret_crush"},{"key":"B","text":"我们在暧昧中，还没正式在一起","tag":"ambiguous"},{"key":"C","text":"我们在一起不到一年","tag":"early"},{"key":"D","text":"我们在一起一到三年","tag":"mid"},{"key":"E","text":"我们在一起三年以上","tag":"long"},{"key":"F","text":"我们已婚或是长期伴侣","tag":"married"}]},{"id":"PRE-M-00B","type":"choice","text":"如果用一个词描述你们现在的关系，你会选哪个？","note":"辅助校准关系类型判断，不计分。","options":[{"key":"A","text":"心动但还没说出口"},{"key":"B","text":"说不清楚，但很在意"},{"key":"C","text":"在谈恋爱"},{"key":"D","text":"很稳定的伴侣"},{"key":"E","text":"复杂，一时说不清"}]}],"stage_rules":{"note":"结合时间输入和各层得分综合判断，男版更看重EV层和IN层的轻松感","time_constraints":{"secret_crush":{"locked_stages":["重建信任","深度联结","并肩同行"]},"ambiguous":{"locked_stages":["重建信任","深度联结","并肩同行"]},"married":{"low_resonance_language":"long_term_version"}},"score_mapping":{"①怦然相遇":{"EV_range":[75,100],"AT_range":[80,100],"IN_range":[0,100]},"②渐入佳境":{"EV_range":[70,100],"AT_range":[65,100],"IN_range":[60,100]},"③暗流初现":{"EV_range":[50,75],"AT_range":[50,80],"RK_range":[30,60]},"④磨合阵痛":{"EV_range":[40,65],"IN_range":[30,60],"RK_range":[40,70]},"⑤倦怠低谷":{"EV_range":[20,45],"RK_range":[60,100],"IN_range":[20,50]},"⑥十字路口":{"EV_range":[25,50],"RK_range":[55,85]},"⑦重建信任":{"EV_range":[55,75],"IN_range":[60,85],"RK_range":[20,50]},"⑧深度联结":{"EV_range":[70,90],"IN_range":[75,100],"AT_range":[60,100]},"⑨并肩同行":{"EV_range":[80,100],"CO_range":[75,100],"IN_range":[75,100]}}},"relationship_type_rules":{"彼此生长":{"condition":"EV >= 75 && IN >= 70 && RK <= 35","tagline":"在一起让你成为更好的自己","desc":"有助力、有成长、跟她在一起是充电","male_insight":"你在这段关系里不只是在付出，你也在得到——这种双向的滋养是最好的关系底色。"},"难舍难分":{"condition":"AT >= 75 && IN >= 65 && EV < 65","tagline":"深度融合，分不清是爱还是需要","desc":"离不开，但不确定是真正喜欢还是习惯了","male_insight":"你们之间有很深的联结，但值得想一想：是真的喜欢她，还是已经习惯了她在？"},"温水同行":{"condition":"RK <= 40 && IN < 65 && EV < 60","tagline":"不冷不热，舒适但缺少真正的联结","desc":"不吵架，但也没有真正在一起过","male_insight":"这段关系很平稳，但平稳有时候是因为双方都没有真正投入——值得问自己，你想要的是这样吗？"},"心甘情愿地累":{"condition":"RK >= 55 && EV < 55 && AT >= 60","tagline":"付出多于回报，但还在坚持","desc":"有消耗，但舍不得或者走不掉","male_insight":"你在这段关系里付出了很多，这值得被看见。但好的关系不应该让你一直在消耗——这不是你的问题，是关系本身需要调整。"},"烈火烹油":{"condition":"AT >= 75 && RK >= 50 && IN < 70","tagline":"极好极坏，情绪过山车","desc":"高强度的吸引和消耗并存","male_insight":"你们之间的吸引是真实的，但冲突和消耗也是真实的。这种组合很难维持，需要双方都愿意主动降温和建立规则。"},"此刻刚好":{"condition":"CO < 65 && EV < 60 && RK <= 45","tagline":"现在很好，但没有太多未来感","desc":"舒适但没有明确的方向","male_insight":"你们现在相处得还不错，但有些重要的问题还没有被认真面对——比如这段关系要走向哪里。"}},"attachment_collision_map":{"安全型×安全型":{"name":"天作之合","desc":"两个内心稳定的人在一起，是最少内耗的组合。不是没有问题，是有能力一起解决。"},"安全型×焦虑型":{"name":"避风港与浪","desc":"稳定的人能给焦虑的人真实的安全感，但时间久了容易出现不平衡——一个一直在给，一个一直在要。"},"安全型×回避型":{"name":"开门与关门","desc":"安全型足够稳定，不会因为回避型的后退而崩溃——这是这个组合能走下去的原因。"},"安全型×混合型":{"name":"稳中有变","desc":"安全型是这段关系的锚，混合型的情绪起伏会被安全型的稳定慢慢平衡。"},"焦虑型×焦虑型":{"name":"双向拉扯","desc":"两个都需要确认的人在一起，前期浓烈，后期容易把彼此都耗尽。"},"焦虑型×回避型":{"name":"欢喜冤家","desc":"最常见也最戏剧性的组合。一个追，一个退，形成经典的追逃模式。吸引力是真实的，但如果不打破这个模式，最终会耗尽双方。"},"焦虑型×混合型":{"name":"迷雾中的彼此","desc":"两个人都不够稳定，但方式不同。对方的忽冷忽热会持续触发焦虑型的不安全感。"},"回避型×回避型":{"name":"平行宇宙","desc":"两个人都不主动靠近，关系很平静，但也很难真正深入。"},"回避型×混合型":{"name":"捉摸不定","desc":"混合型的忽冷忽热反而能让回避型感到相对舒适。但这个组合很难建立真正的深度。"},"混合型×混合型":{"name":"一团烟火","desc":"两个情绪都不稳定的人在一起，会非常热烈，也会非常混乱。"},"高边界安全型×焦虑型":{"name":"冰与火","desc":"高边界的安全感让焦虑型感到有依靠，但边界的硬度也会让焦虑型觉得进不去。"},"高边界安全型×回避型":{"name":"两座山","desc":"两个都有很强边界感的人在一起，相互尊重，但也可能相互疏远。"},"低自我高投入型×任意":{"name":"全心付出","desc":"无论对方是什么类型，这个组合的核心风险不在对方，在自己——需要先学会照顾自己。"},"高边界安全型×混合型":{"name":"规则与例外","desc":"高边界的清晰给混合型一种难得的稳定感，只要双方愿意沟通，互补性很强。"},"低自我高投入型×回避型":{"name":"给不到的距离","desc":"付出最多的人遇到了最难靠近的人。这个组合需要付出型学会有边界地爱。"}},"score_display_rules":{"note":"所有分数转化为描述性语言，不直接显示原始数字","positive_language_principle":"永远不输出让人难堪的判断，风险信号用温和提示代替警告","ranges":[{"min":0,"max":30,"label":"这个维度还有一些值得关注的地方"},{"min":31,"max":50,"label":"这个维度还有成长空间"},{"min":51,"max":65,"label":"这个维度表现稳定"},{"min":66,"max":80,"label":"这个维度是你们的重要基础"},{"min":81,"max":100,"label":"这个维度是你们关系的核心优势"}]}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"ROS"}'::jsonb, true
FROM public.test_suites WHERE slug = 's02_ros_male'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '彼此生长', '彼此生长', 'male'::public.test_gender, '{"condition":"EV >= 75 && IN >= 70 && RK <= 35","tagline":"在一起让你成为更好的自己","desc":"有助力、有成长、跟她在一起是充电","male_insight":"你在这段关系里不只是在付出，你也在得到——这种双向的滋养是最好的关系底色。"}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's02_ros_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '难舍难分', '难舍难分', 'male'::public.test_gender, '{"condition":"AT >= 75 && IN >= 65 && EV < 65","tagline":"深度融合，分不清是爱还是需要","desc":"离不开，但不确定是真正喜欢还是习惯了","male_insight":"你们之间有很深的联结，但值得想一想：是真的喜欢她，还是已经习惯了她在？"}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's02_ros_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '温水同行', '温水同行', 'male'::public.test_gender, '{"condition":"RK <= 40 && IN < 65 && EV < 60","tagline":"不冷不热，舒适但缺少真正的联结","desc":"不吵架，但也没有真正在一起过","male_insight":"这段关系很平稳，但平稳有时候是因为双方都没有真正投入——值得问自己，你想要的是这样吗？"}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's02_ros_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '心甘情愿地累', '心甘情愿地累', 'male'::public.test_gender, '{"condition":"RK >= 55 && EV < 55 && AT >= 60","tagline":"付出多于回报，但还在坚持","desc":"有消耗，但舍不得或者走不掉","male_insight":"你在这段关系里付出了很多，这值得被看见。但好的关系不应该让你一直在消耗——这不是你的问题，是关系本身需要调整。"}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's02_ros_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '烈火烹油', '烈火烹油', 'male'::public.test_gender, '{"condition":"AT >= 75 && RK >= 50 && IN < 70","tagline":"极好极坏，情绪过山车","desc":"高强度的吸引和消耗并存","male_insight":"你们之间的吸引是真实的，但冲突和消耗也是真实的。这种组合很难维持，需要双方都愿意主动降温和建立规则。"}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's02_ros_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '此刻刚好', '此刻刚好', 'male'::public.test_gender, '{"condition":"CO < 65 && EV < 60 && RK <= 45","tagline":"现在很好，但没有太多未来感","desc":"舒适但没有明确的方向","male_insight":"你们现在相处得还不错，但有些重要的问题还没有被认真面对——比如这段关系要走向哪里。"}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's02_ros_male'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'PRE-M-00A', 1, 'PRE', 'choice', 0, 'neutral', '在开始之前，先告诉我你们的关系状态。', '{"note":"此答案影响题目措辞、阶段判断和结果语言，不计分。","options":[{"key":"A","text":"我在暗恋她，还没有任何进展","tag":"secret_crush"},{"key":"B","text":"我们在暧昧中，还没正式在一起","tag":"ambiguous"},{"key":"C","text":"我们在一起不到一年","tag":"early"},{"key":"D","text":"我们在一起一到三年","tag":"mid"},{"key":"E","text":"我们在一起三年以上","tag":"long"},{"key":"F","text":"我们已婚或是长期伴侣","tag":"married"}],"source_question":{"id":"PRE-M-00A","type":"choice","text":"在开始之前，先告诉我你们的关系状态。","note":"此答案影响题目措辞、阶段判断和结果语言，不计分。","options":[{"key":"A","text":"我在暗恋她，还没有任何进展","tag":"secret_crush"},{"key":"B","text":"我们在暧昧中，还没正式在一起","tag":"ambiguous"},{"key":"C","text":"我们在一起不到一年","tag":"early"},{"key":"D","text":"我们在一起一到三年","tag":"mid"},{"key":"E","text":"我们在一起三年以上","tag":"long"},{"key":"F","text":"我们已婚或是长期伴侣","tag":"married"}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'PRE-M-00B', 2, 'PRE', 'choice', 0, 'neutral', '如果用一个词描述你们现在的关系，你会选哪个？', '{"note":"辅助校准关系类型判断，不计分。","options":[{"key":"A","text":"心动但还没说出口"},{"key":"B","text":"说不清楚，但很在意"},{"key":"C","text":"在谈恋爱"},{"key":"D","text":"很稳定的伴侣"},{"key":"E","text":"复杂，一时说不清"}],"source_question":{"id":"PRE-M-00B","type":"choice","text":"如果用一个词描述你们现在的关系，你会选哪个？","note":"辅助校准关系类型判断，不计分。","options":[{"key":"A","text":"心动但还没说出口"},{"key":"B","text":"说不清楚，但很在意"},{"key":"C","text":"在谈恋爱"},{"key":"D","text":"很稳定的伴侣"},{"key":"E","text":"复杂，一时说不清"}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-01', 3, 'AT', 'slider', 1.5, 'positive', '你现在对她的吸引感，跟最开始相比是什么状态？', '{"alt_text_secret_crush":"你对她的吸引感，随着时间是在加深还是在消退？","slider":{"min":0,"max":100,"min_label":"比最开始淡了很多","max_label":"还是一样强烈，甚至更深了","feedback":[{"range":[0,20],"text":"吸引感明显减弱，值得认真想一想这是为什么"},{"range":[21,40],"text":"有些东西在消退，但还有留下来的理由"},{"range":[41,60],"text":"趋于平稳，是正常的关系演化"},{"range":[61,80],"text":"吸引感很稳定，有些地方甚至更深了"},{"range":[81,100],"text":"你对她的感觉一直都在，甚至在加深"}]},"source_question":{"id":"AT-M-01","order":1,"layer":"AT","weight":1.5,"type":"slider","direction":"positive","text":"你现在对她的吸引感，跟最开始相比是什么状态？","alt_text_secret_crush":"你对她的吸引感，随着时间是在加深还是在消退？","slider":{"min":0,"max":100,"min_label":"比最开始淡了很多","max_label":"还是一样强烈，甚至更深了","feedback":[{"range":[0,20],"text":"吸引感明显减弱，值得认真想一想这是为什么"},{"range":[21,40],"text":"有些东西在消退，但还有留下来的理由"},{"range":[41,60],"text":"趋于平稳，是正常的关系演化"},{"range":[61,80],"text":"吸引感很稳定，有些地方甚至更深了"},{"range":[81,100],"text":"你对她的感觉一直都在，甚至在加深"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-02', 4, 'AT', 'scenario', 1.3, 'positive', '你们分开一段时间后再见面。你见到她的第一眼，脑子里闪过的是？', '{"scene":"重逢的第一眼感受","options":[{"key":"A","text":"还是会有那种感觉，她一出现我就注意到了","sub":"吸引感持续","score":85},{"key":"B","text":"有点放松，就是熟悉的感觉，不是心跳","sub":"从吸引转向依恋，正常演化","score":75},{"key":"C","text":"没什么特别的，就是见到了","sub":"吸引感明显减弱","score":40},{"key":"D","text":"有点复杂，说不清楚是什么感觉","sub":"关系进入模糊期","score":55}],"source_question":{"id":"AT-M-02","order":2,"layer":"AT","weight":1.3,"type":"scenario","direction":"positive","text":"你们分开一段时间后再见面。你见到她的第一眼，脑子里闪过的是？","scene":"重逢的第一眼感受","options":[{"key":"A","text":"还是会有那种感觉，她一出现我就注意到了","sub":"吸引感持续","score":85},{"key":"B","text":"有点放松，就是熟悉的感觉，不是心跳","sub":"从吸引转向依恋，正常演化","score":75},{"key":"C","text":"没什么特别的，就是见到了","sub":"吸引感明显减弱","score":40},{"key":"D","text":"有点复杂，说不清楚是什么感觉","sub":"关系进入模糊期","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-03', 5, 'AT', 'binary', 1.5, 'positive', '当初让你喜欢上她的那些东西，现在还在吗？', '{"options":[{"key":"left","text":"在，了解越深反而越喜欢","sub":"吸引力深化型","score":85},{"key":"right","text":"有些还在，但有些随着了解消退了","sub":"吸引力分化型","score":55}],"source_question":{"id":"AT-M-03","order":3,"layer":"AT","weight":1.5,"type":"binary","direction":"positive","text":"当初让你喜欢上她的那些东西，现在还在吗？","options":[{"key":"left","text":"在，了解越深反而越喜欢","sub":"吸引力深化型","score":85},{"key":"right","text":"有些还在，但有些随着了解消退了","sub":"吸引力分化型","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-04', 6, 'AT', 'choice', 1.0, 'auxiliary', '你喜欢她，最核心的原因是？', '{"note":"辅助关系类型判断，分数相近","options":[{"key":"A","text":"跟她在一起，我感觉很放松，不需要表演","sub":"舒适感驱动","score":75},{"key":"B","text":"她让我想成为更好的自己","sub":"成长驱动","score":80},{"key":"C","text":"我就是被她吸引，说不清楚，就是想靠近","sub":"本能吸引","score":70},{"key":"D","text":"她是一个我真正欣赏的人，不只是喜欢","sub":"尊重驱动","score":80}],"source_question":{"id":"AT-M-04","order":4,"layer":"AT","weight":1.0,"type":"choice","direction":"auxiliary","text":"你喜欢她，最核心的原因是？","note":"辅助关系类型判断，分数相近","options":[{"key":"A","text":"跟她在一起，我感觉很放松，不需要表演","sub":"舒适感驱动","score":75},{"key":"B","text":"她让我想成为更好的自己","sub":"成长驱动","score":80},{"key":"C","text":"我就是被她吸引，说不清楚，就是想靠近","sub":"本能吸引","score":70},{"key":"D","text":"她是一个我真正欣赏的人，不只是喜欢","sub":"尊重驱动","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-05', 7, 'AT', 'scale', 1.5, 'positive', '我喜欢她这件事，是真实的，不是因为习惯了她在或者不想一个人。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"AT-M-05","order":5,"layer":"AT","weight":1.5,"type":"scale","direction":"positive","text":"我喜欢她这件事，是真实的，不是因为习惯了她在或者不想一个人。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-06', 8, 'AT', 'mood', 1.2, 'positive', '你想到她的时候，出现频率最高的感觉是？', '{"options":[{"key":"A","icon":"ti-heart","text":"会不自觉地想见她","score":85},{"key":"B","icon":"ti-mood-happy","text":"心情会好一点","score":80},{"key":"C","icon":"ti-mood-smile","text":"习惯了，她就是生活的一部分","score":65},{"key":"D","icon":"ti-mood-nervous","text":"有时候会担心，不知道她在想什么","score":55},{"key":"E","icon":"ti-mood-confuzed","text":"复杂，说不清楚","score":50},{"key":"F","icon":"ti-mood-sad","text":"有时候会觉得累或者烦","score":35},{"key":"G","icon":"ti-mood-empty","text":"没什么特别的感觉了","score":25},{"key":"H","icon":"ti-mood-suprised","text":"她还是会做一些让我意外的事","score":80}],"source_question":{"id":"AT-M-06","order":6,"layer":"AT","weight":1.2,"type":"mood","direction":"positive","text":"你想到她的时候，出现频率最高的感觉是？","options":[{"key":"A","icon":"ti-heart","text":"会不自觉地想见她","score":85},{"key":"B","icon":"ti-mood-happy","text":"心情会好一点","score":80},{"key":"C","icon":"ti-mood-smile","text":"习惯了，她就是生活的一部分","score":65},{"key":"D","icon":"ti-mood-nervous","text":"有时候会担心，不知道她在想什么","score":55},{"key":"E","icon":"ti-mood-confuzed","text":"复杂，说不清楚","score":50},{"key":"F","icon":"ti-mood-sad","text":"有时候会觉得累或者烦","score":35},{"key":"G","icon":"ti-mood-empty","text":"没什么特别的感觉了","score":25},{"key":"H","icon":"ti-mood-suprised","text":"她还是会做一些让我意外的事","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-07', 9, 'AT', 'scenario', 1.2, 'positive', '她今天穿了一件你没见过的衣服，状态很好。你的反应是？', '{"scene":"外形吸引感的活跃程度","options":[{"key":"A","text":"会注意到，觉得她好看，想说出来","sub":"吸引感活跃","score":85},{"key":"B","text":"注意到了，但没觉得特别","sub":"吸引感趋于平稳","score":65},{"key":"C","text":"没有特别留意","sub":"吸引感钝化","score":40},{"key":"D","text":"会注意到，但心里没什么反应","sub":"吸引感明显减弱","score":30}],"source_question":{"id":"AT-M-07","order":7,"layer":"AT","weight":1.2,"type":"scenario","direction":"positive","text":"她今天穿了一件你没见过的衣服，状态很好。你的反应是？","scene":"外形吸引感的活跃程度","options":[{"key":"A","text":"会注意到，觉得她好看，想说出来","sub":"吸引感活跃","score":85},{"key":"B","text":"注意到了，但没觉得特别","sub":"吸引感趋于平稳","score":65},{"key":"C","text":"没有特别留意","sub":"吸引感钝化","score":40},{"key":"D","text":"会注意到，但心里没什么反应","sub":"吸引感明显减弱","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-08', 10, 'AT', 'binary', 1.3, 'positive', '如果她现在从你的生活里消失，你的第一反应会是？', '{"options":[{"key":"left","text":"会很难受，她在我生活里有真实的重量","sub":"深度依恋","score":80},{"key":"right","text":"会有影响，但我能想象没有她的生活","sub":"联结不够深","score":50}],"source_question":{"id":"AT-M-08","order":8,"layer":"AT","weight":1.3,"type":"binary","direction":"positive","text":"如果她现在从你的生活里消失，你的第一反应会是？","options":[{"key":"left","text":"会很难受，她在我生活里有真实的重量","sub":"深度依恋","score":80},{"key":"right","text":"会有影响，但我能想象没有她的生活","sub":"联结不够深","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-09', 11, 'AT', 'slider', 1.5, 'positive', '你觉得你们之间的吸引是对等的吗？你对她的感觉，和她对你的感觉，大概是几比几？', '{"slider":{"min":0,"max":100,"min_label":"我明显更喜欢她","max_label":"她明显更喜欢我","midpoint_label":"50 = 大致对等","feedback":[{"range":[0,30],"text":"你在这段关系里投入更多，这值得留意"},{"range":[31,45],"text":"稍微不平衡，但在正常范围内"},{"range":[46,55],"text":"大致对等，关系基础比较稳"},{"range":[56,70],"text":"她对你的喜欢多一些"},{"range":[71,100],"text":"你感觉她喜欢你很多，但确认过吗"}]},"source_question":{"id":"AT-M-09","order":9,"layer":"AT","weight":1.5,"type":"slider","direction":"positive","text":"你觉得你们之间的吸引是对等的吗？你对她的感觉，和她对你的感觉，大概是几比几？","slider":{"min":0,"max":100,"min_label":"我明显更喜欢她","max_label":"她明显更喜欢我","midpoint_label":"50 = 大致对等","feedback":[{"range":[0,30],"text":"你在这段关系里投入更多，这值得留意"},{"range":[31,45],"text":"稍微不平衡，但在正常范围内"},{"range":[46,55],"text":"大致对等，关系基础比较稳"},{"range":[56,70],"text":"她对你的喜欢多一些"},{"range":[71,100],"text":"你感觉她喜欢你很多，但确认过吗"}]},"scoring":{"method":"distance_from_midpoint","formula":"100 - abs(value - 50) * 1.5"}}}'::jsonb, '{"method":"distance_from_midpoint","formula":"100 - abs(value - 50) * 1.5"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'AT-M-10', 12, 'AT', 'scale', 1.3, 'positive', '我觉得她喜欢我这件事，是真实可感的，不是我自己的判断或者猜测。', '{"alt_text_secret_crush":"我觉得她对我有一些不一样的感觉，哪怕还没说出来。","scale":{"min":1,"max":5,"min_label":"完全不确定，靠猜","max_label":"很确定，能感受到"},"source_question":{"id":"AT-M-10","order":10,"layer":"AT","weight":1.3,"type":"scale","direction":"positive","text":"我觉得她喜欢我这件事，是真实可感的，不是我自己的判断或者猜测。","alt_text_secret_crush":"我觉得她对我有一些不一样的感觉，哪怕还没说出来。","scale":{"min":1,"max":5,"min_label":"完全不确定，靠猜","max_label":"很确定，能感受到"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-11', 13, 'IN', 'scenario', 1.5, 'positive', '你今天心情不好，不想说话。她的反应通常是？', '{"scene":"对方对你情绪状态的感知和处理","options":[{"key":"A","text":"感觉到了，给我空间，但让我知道她在","sub":"高情感智识，尊重边界","score":90},{"key":"B","text":"问我怎么了，想帮我解决问题","sub":"关心型，但可能会增加压力","score":65},{"key":"C","text":"没感觉到，照常说话","sub":"情感感知弱","score":45},{"key":"D","text":"感觉到了，但开始担心是不是自己的问题","sub":"情感负担转移，增加压力","score":35}],"source_question":{"id":"IN-M-11","order":11,"layer":"IN","weight":1.5,"type":"scenario","direction":"positive","text":"你今天心情不好，不想说话。她的反应通常是？","scene":"对方对你情绪状态的感知和处理","options":[{"key":"A","text":"感觉到了，给我空间，但让我知道她在","sub":"高情感智识，尊重边界","score":90},{"key":"B","text":"问我怎么了，想帮我解决问题","sub":"关心型，但可能会增加压力","score":65},{"key":"C","text":"没感觉到，照常说话","sub":"情感感知弱","score":45},{"key":"D","text":"感觉到了，但开始担心是不是自己的问题","sub":"情感负担转移，增加压力","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-12', 14, 'IN', 'slider', 1.5, 'positive', '跟她在一起，你整体的感觉是轻松还是有负担？', '{"slider":{"min":0,"max":100,"min_label":"经常感到有压力或者消耗","max_label":"跟她在一起非常轻松，不需要注意什么","feedback":[{"range":[0,25],"text":"相处本身对你是一种消耗，这很重要"},{"range":[26,45],"text":"有时候会感到压力，但不是一直"},{"range":[46,65],"text":"整体还好，偶尔有点累"},{"range":[66,85],"text":"跟她在一起大多数时候很轻松"},{"range":[86,100],"text":"她是让你感到最放松的人之一"}]},"source_question":{"id":"IN-M-12","order":12,"layer":"IN","weight":1.5,"type":"slider","direction":"positive","text":"跟她在一起，你整体的感觉是轻松还是有负担？","slider":{"min":0,"max":100,"min_label":"经常感到有压力或者消耗","max_label":"跟她在一起非常轻松，不需要注意什么","feedback":[{"range":[0,25],"text":"相处本身对你是一种消耗，这很重要"},{"range":[26,45],"text":"有时候会感到压力，但不是一直"},{"range":[46,65],"text":"整体还好，偶尔有点累"},{"range":[66,85],"text":"跟她在一起大多数时候很轻松"},{"range":[86,100],"text":"她是让你感到最放松的人之一"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-13', 15, 'IN', 'choice', 1.5, 'positive', '你们吵架或者有矛盾之后，通常是怎么收场的？', '{"alt_text_secret_crush":"当你们有过误会或者不愉快，通常怎么化解？","options":[{"key":"A","text":"真正说清楚了，然后和好，感觉更近了","sub":"高质量修复","score":90},{"key":"B","text":"冷静了就和好了，但没有完全说清楚","sub":"表面修复，问题积累","score":65},{"key":"C","text":"其中一个人先让步了，然后过去了","sub":"不均衡修复","score":50},{"key":"D","text":"冷处理，然后假装没发生过","sub":"低质量修复，风险积累","score":30}],"source_question":{"id":"IN-M-13","order":13,"layer":"IN","weight":1.5,"type":"choice","direction":"positive","text":"你们吵架或者有矛盾之后，通常是怎么收场的？","alt_text_secret_crush":"当你们有过误会或者不愉快，通常怎么化解？","options":[{"key":"A","text":"真正说清楚了，然后和好，感觉更近了","sub":"高质量修复","score":90},{"key":"B","text":"冷静了就和好了，但没有完全说清楚","sub":"表面修复，问题积累","score":65},{"key":"C","text":"其中一个人先让步了，然后过去了","sub":"不均衡修复","score":50},{"key":"D","text":"冷处理，然后假装没发生过","sub":"低质量修复，风险积累","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-14', 16, 'IN', 'binary', 1.5, 'positive', '她的情绪状态，对你的情绪影响大吗？', '{"options":[{"key":"left","text":"不太大，我能把自己的状态和她的情绪分开","sub":"情绪独立性强","score":80},{"key":"right","text":"比较大，她不高兴我就很难放松","sub":"情绪联动，有一定消耗","score":45}],"source_question":{"id":"IN-M-14","order":14,"layer":"IN","weight":1.5,"type":"binary","direction":"positive","text":"她的情绪状态，对你的情绪影响大吗？","options":[{"key":"left","text":"不太大，我能把自己的状态和她的情绪分开","sub":"情绪独立性强","score":80},{"key":"right","text":"比较大，她不高兴我就很难放松","sub":"情绪联动，有一定消耗","score":45}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-15', 17, 'IN', 'scenario', 1.5, 'positive', '她今天情绪不好，发了很多消息跟你抱怨。你的感受是？', '{"scene":"接收对方情绪倾诉的感受","options":[{"key":"A","text":"愿意听，这是她信任我的方式","sub":"高情感接收，低消耗","score":85},{"key":"B","text":"愿意陪，但有时候不知道怎么回应","sub":"意愿有，能力有限","score":65},{"key":"C","text":"有点烦，但不会说出来","sub":"有消耗，压抑反应","score":40},{"key":"D","text":"直接感到很累，不太想处理这些","sub":"高消耗，情感承接弱","score":25}],"source_question":{"id":"IN-M-15","order":15,"layer":"IN","weight":1.5,"type":"scenario","direction":"positive","text":"她今天情绪不好，发了很多消息跟你抱怨。你的感受是？","scene":"接收对方情绪倾诉的感受","options":[{"key":"A","text":"愿意听，这是她信任我的方式","sub":"高情感接收，低消耗","score":85},{"key":"B","text":"愿意陪，但有时候不知道怎么回应","sub":"意愿有，能力有限","score":65},{"key":"C","text":"有点烦，但不会说出来","sub":"有消耗，压抑反应","score":40},{"key":"D","text":"直接感到很累，不太想处理这些","sub":"高消耗，情感承接弱","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-16', 18, 'IN', 'scale', 1.5, 'positive', '跟她在一起，我大多数时候感觉是充电，而不是放电。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合，更多是消耗","max_label":"完全符合，跟她在一起让我恢复状态"},"source_question":{"id":"IN-M-16","order":16,"layer":"IN","weight":1.5,"type":"scale","direction":"positive","text":"跟她在一起，我大多数时候感觉是充电，而不是放电。","scale":{"min":1,"max":5,"min_label":"完全不符合，更多是消耗","max_label":"完全符合，跟她在一起让我恢复状态"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-17', 19, 'IN', 'mood', 1.3, 'positive', '你们最近一次发生矛盾，事后你的感受是？', '{"options":[{"key":"A","icon":"ti-mood-happy","text":"说清楚了，感觉反而更踏实了","score":90},{"key":"B","icon":"ti-mood-smile","text":"和好了，没有太多残留","score":70},{"key":"C","icon":"ti-mood-confuzed","text":"和好了，但问题好像没真正解决","score":55},{"key":"D","icon":"ti-mood-sad","text":"有点累，不确定下次还会不会这样","score":45},{"key":"E","icon":"ti-mood-empty","text":"已经习惯了，不太有感觉","score":35},{"key":"F","icon":"ti-mood-angry","text":"还有一些情绪没有消化","score":40},{"key":"G","icon":"ti-mood-nervous","text":"担心她还在介意","score":55},{"key":"H","icon":"ti-mood-tongue","text":"我们很少有真正的矛盾","score":75}],"source_question":{"id":"IN-M-17","order":17,"layer":"IN","weight":1.3,"type":"mood","direction":"positive","text":"你们最近一次发生矛盾，事后你的感受是？","options":[{"key":"A","icon":"ti-mood-happy","text":"说清楚了，感觉反而更踏实了","score":90},{"key":"B","icon":"ti-mood-smile","text":"和好了，没有太多残留","score":70},{"key":"C","icon":"ti-mood-confuzed","text":"和好了，但问题好像没真正解决","score":55},{"key":"D","icon":"ti-mood-sad","text":"有点累，不确定下次还会不会这样","score":45},{"key":"E","icon":"ti-mood-empty","text":"已经习惯了，不太有感觉","score":35},{"key":"F","icon":"ti-mood-angry","text":"还有一些情绪没有消化","score":40},{"key":"G","icon":"ti-mood-nervous","text":"担心她还在介意","score":55},{"key":"H","icon":"ti-mood-tongue","text":"我们很少有真正的矛盾","score":75}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-18', 20, 'IN', 'scenario', 1.3, 'positive', '你有件事想跟她说，但不是什么大事。你会主动说吗？', '{"scene":"日常分享的主动性","options":[{"key":"A","text":"会，我们之间什么都可以说","sub":"高开放度，联结感强","score":85},{"key":"B","text":"看情况，重要的说，小事不一定","sub":"选择性沟通","score":70},{"key":"C","text":"不太确定她感不感兴趣，有时候就不说了","sub":"分享欲被抑制","score":45},{"key":"D","text":"我不太习惯主动分享，各自的事各自处理","sub":"低联结感","score":40}],"source_question":{"id":"IN-M-18","order":18,"layer":"IN","weight":1.3,"type":"scenario","direction":"positive","text":"你有件事想跟她说，但不是什么大事。你会主动说吗？","scene":"日常分享的主动性","options":[{"key":"A","text":"会，我们之间什么都可以说","sub":"高开放度，联结感强","score":85},{"key":"B","text":"看情况，重要的说，小事不一定","sub":"选择性沟通","score":70},{"key":"C","text":"不太确定她感不感兴趣，有时候就不说了","sub":"分享欲被抑制","score":45},{"key":"D","text":"我不太习惯主动分享，各自的事各自处理","sub":"低联结感","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-19', 21, 'IN', 'binary', 1.3, 'positive', '你们之间有话说吗？两个人坐在一起，不会冷场？', '{"options":[{"key":"left","text":"有，聊什么都能聊，不需要找话题","sub":"高话题密度，联结感强","score":85},{"key":"right","text":"有时候会不知道说什么，需要找话题","sub":"联结感有待加深","score":50}],"source_question":{"id":"IN-M-19","order":19,"layer":"IN","weight":1.3,"type":"binary","direction":"positive","text":"你们之间有话说吗？两个人坐在一起，不会冷场？","options":[{"key":"left","text":"有，聊什么都能聊，不需要找话题","sub":"高话题密度，联结感强","score":85},{"key":"right","text":"有时候会不知道说什么，需要找话题","sub":"联结感有待加深","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-20', 22, 'IN', 'choice', 1.5, 'positive', '她说话算数吗？答应你的事，她做到的概率是？', '{"options":[{"key":"A","text":"很高，她说了基本上会做到","sub":"高可靠度","score":85},{"key":"B","text":"一般，大事会做到，小事有时候忘了","sub":"中等","score":65},{"key":"C","text":"不太稳定，经常有变化","sub":"低可靠度","score":40},{"key":"D","text":"我没有太在意这个，也很少对她有期待","sub":"期待值已经很低","score":25}],"source_question":{"id":"IN-M-20","order":20,"layer":"IN","weight":1.5,"type":"choice","direction":"positive","text":"她说话算数吗？答应你的事，她做到的概率是？","options":[{"key":"A","text":"很高，她说了基本上会做到","sub":"高可靠度","score":85},{"key":"B","text":"一般，大事会做到，小事有时候忘了","sub":"中等","score":65},{"key":"C","text":"不太稳定，经常有变化","sub":"低可靠度","score":40},{"key":"D","text":"我没有太在意这个，也很少对她有期待","sub":"期待值已经很低","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-21', 23, 'IN', 'slider', 1.5, 'positive', '在你们的关系里，你感觉自己被她真正理解的程度是多少？', '{"slider":{"min":0,"max":100,"min_label":"她不太了解真正的我","max_label":"她是少数真正懂我的人之一","feedback":[{"range":[0,25],"text":"你在这段关系里有一种孤独感"},{"range":[26,45],"text":"被了解的部分有限，很多东西她不知道"},{"range":[46,65],"text":"她了解你的一部分，还有一部分没打开"},{"range":[66,85],"text":"她真的懂你的很多，这很珍贵"},{"range":[86,100],"text":"你在她这里有一种被真正看见的感觉"}]},"source_question":{"id":"IN-M-21","order":21,"layer":"IN","weight":1.5,"type":"slider","direction":"positive","text":"在你们的关系里，你感觉自己被她真正理解的程度是多少？","slider":{"min":0,"max":100,"min_label":"她不太了解真正的我","max_label":"她是少数真正懂我的人之一","feedback":[{"range":[0,25],"text":"你在这段关系里有一种孤独感"},{"range":[26,45],"text":"被了解的部分有限，很多东西她不知道"},{"range":[46,65],"text":"她了解你的一部分，还有一部分没打开"},{"range":[66,85],"text":"她真的懂你的很多，这很珍贵"},{"range":[86,100],"text":"你在她这里有一种被真正看见的感觉"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-22', 24, 'IN', 'scenario', 1.5, 'positive', '你们有一件事意见不一样，都觉得自己是对的。通常最后是怎么解决的？', '{"scene":"分歧解决方式","options":[{"key":"A","text":"真的把各自的想法摆出来，找到双方能接受的方式","sub":"高质量冲突解决","score":90},{"key":"B","text":"其中一个人让步了，虽然不完全认同","sub":"让步式解决","score":60},{"key":"C","text":"搁置了，不了了之","sub":"回避型解决","score":45},{"key":"D","text":"争到最后变成情绪问题","sub":"冲突升级","score":25}],"source_question":{"id":"IN-M-22","order":22,"layer":"IN","weight":1.5,"type":"scenario","direction":"positive","text":"你们有一件事意见不一样，都觉得自己是对的。通常最后是怎么解决的？","scene":"分歧解决方式","options":[{"key":"A","text":"真的把各自的想法摆出来，找到双方能接受的方式","sub":"高质量冲突解决","score":90},{"key":"B","text":"其中一个人让步了，虽然不完全认同","sub":"让步式解决","score":60},{"key":"C","text":"搁置了，不了了之","sub":"回避型解决","score":45},{"key":"D","text":"争到最后变成情绪问题","sub":"冲突升级","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-23', 25, 'IN', 'scale', 1.3, 'positive', '我们有了矛盾之后，会真正解决，不会让问题一直悬着。', '{"alt_text_secret_crush":"当我们有误会，我们能很快把它说清楚。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"IN-M-23","order":23,"layer":"IN","weight":1.3,"type":"scale","direction":"positive","text":"我们有了矛盾之后，会真正解决，不会让问题一直悬着。","alt_text_secret_crush":"当我们有误会，我们能很快把它说清楚。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-24', 26, 'IN', 'card', 1.2, 'positive', '你们相处的日常，最接近哪张？', '{"options":[{"key":"A","text":"有很多话说，什么都能聊","sub":"高话题密度","score":80},{"key":"B","text":"不需要一直说话，待在一起就很舒服","sub":"高舒适度","score":85},{"key":"C","text":"有时候会不知道聊什么","sub":"联结感有待加深","score":50},{"key":"D","text":"各做各的，交集不多","sub":"平行状态","score":35}],"source_question":{"id":"IN-M-24","order":24,"layer":"IN","weight":1.2,"type":"card","direction":"positive","text":"你们相处的日常，最接近哪张？","options":[{"key":"A","text":"有很多话说，什么都能聊","sub":"高话题密度","score":80},{"key":"B","text":"不需要一直说话，待在一起就很舒服","sub":"高舒适度","score":85},{"key":"C","text":"有时候会不知道聊什么","sub":"联结感有待加深","score":50},{"key":"D","text":"各做各的，交集不多","sub":"平行状态","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-25', 27, 'IN', 'binary', 1.5, 'positive', '你需要她，她出现了吗？', '{"options":[{"key":"left","text":"出现了，而且做到了我需要的","sub":"高情感在场","score":85},{"key":"right","text":"有时候出现，有时候顾不上，不太稳定","sub":"情感在场不稳定","score":40}],"source_question":{"id":"IN-M-25","order":25,"layer":"IN","weight":1.5,"type":"binary","direction":"positive","text":"你需要她，她出现了吗？","options":[{"key":"left","text":"出现了，而且做到了我需要的","sub":"高情感在场","score":85},{"key":"right","text":"有时候出现，有时候顾不上，不太稳定","sub":"情感在场不稳定","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'IN-M-26', 28, 'IN', 'scenario', 1.5, 'positive', '你工作上压力很大，状态不好。她有没有感觉到，她怎么做的？', '{"scene":"压力状态下对方的支持方式","options":[{"key":"A","text":"感觉到了，没有给我额外的压力，给了我空间","sub":"高情感智识","score":90},{"key":"B","text":"感觉到了，主动问我，想帮忙","sub":"关心型，出发点好","score":70},{"key":"C","text":"没太感觉到，照常","sub":"情感感知弱","score":45},{"key":"D","text":"感觉到了，但反而更需要我陪她","sub":"情感需求不对等，增加消耗","score":25}],"source_question":{"id":"IN-M-26","order":26,"layer":"IN","weight":1.5,"type":"scenario","direction":"positive","text":"你工作上压力很大，状态不好。她有没有感觉到，她怎么做的？","scene":"压力状态下对方的支持方式","options":[{"key":"A","text":"感觉到了，没有给我额外的压力，给了我空间","sub":"高情感智识","score":90},{"key":"B","text":"感觉到了，主动问我，想帮忙","sub":"关心型，出发点好","score":70},{"key":"C","text":"没太感觉到，照常","sub":"情感感知弱","score":45},{"key":"D","text":"感觉到了，但反而更需要我陪她","sub":"情感需求不对等，增加消耗","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-27', 29, 'CO', 'scenario', 1.5, 'positive', '你们谈到了未来——住在哪里、要不要孩子、怎么分工。你们的方向是？', '{"alt_text_secret_crush":"从你对她的了解，你们对未来生活的设想大概一致吗？","scene":"未来规划的一致性","options":[{"key":"A","text":"基本一致，细节可以商量","sub":"高兼容性","score":90},{"key":"B","text":"有些不同，但都愿意妥协","sub":"中等，有弹性","score":70},{"key":"C","text":"有一个比较核心的分歧，暂时搁置着","sub":"潜在风险","score":45},{"key":"D","text":"没有认真谈过，或者谈了发现差很多","sub":"低兼容性或未探索","score":30}],"source_question":{"id":"CO-M-27","order":27,"layer":"CO","weight":1.5,"type":"scenario","direction":"positive","text":"你们谈到了未来——住在哪里、要不要孩子、怎么分工。你们的方向是？","alt_text_secret_crush":"从你对她的了解，你们对未来生活的设想大概一致吗？","scene":"未来规划的一致性","options":[{"key":"A","text":"基本一致，细节可以商量","sub":"高兼容性","score":90},{"key":"B","text":"有些不同，但都愿意妥协","sub":"中等，有弹性","score":70},{"key":"C","text":"有一个比较核心的分歧，暂时搁置着","sub":"潜在风险","score":45},{"key":"D","text":"没有认真谈过，或者谈了发现差很多","sub":"低兼容性或未探索","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-28', 30, 'CO', 'binary', 1.3, 'positive', '她的生活节奏和习惯，跟你合得来吗？', '{"options":[{"key":"left","text":"合得来，不需要特别迁就","sub":"高生活兼容性","score":85},{"key":"right","text":"有差异，需要双方调整","sub":"需要磨合","score":55}],"source_question":{"id":"CO-M-28","order":28,"layer":"CO","weight":1.3,"type":"binary","direction":"positive","text":"她的生活节奏和习惯，跟你合得来吗？","options":[{"key":"left","text":"合得来，不需要特别迁就","sub":"高生活兼容性","score":85},{"key":"right","text":"有差异，需要双方调整","sub":"需要磨合","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-29', 31, 'CO', 'choice', 1.5, 'positive', '她对你的工作和事业，是什么态度？', '{"options":[{"key":"A","text":"真心支持，会为我的成就高兴，不会因为我忙而给压力","sub":"高支持度，低阻力","score":90},{"key":"B","text":"支持，但有时候会因为我忙感到不满","sub":"中等，有潜在摩擦","score":65},{"key":"C","text":"态度一般，不太在意我的事业","sub":"关注度低","score":50},{"key":"D","text":"有时候会因为工作相关的事产生矛盾","sub":"事业观不兼容","score":30}],"source_question":{"id":"CO-M-29","order":29,"layer":"CO","weight":1.5,"type":"choice","direction":"positive","text":"她对你的工作和事业，是什么态度？","options":[{"key":"A","text":"真心支持，会为我的成就高兴，不会因为我忙而给压力","sub":"高支持度，低阻力","score":90},{"key":"B","text":"支持，但有时候会因为我忙感到不满","sub":"中等，有潜在摩擦","score":65},{"key":"C","text":"态度一般，不太在意我的事业","sub":"关注度低","score":50},{"key":"D","text":"有时候会因为工作相关的事产生矛盾","sub":"事业观不兼容","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-30', 32, 'CO', 'slider', 1.5, 'positive', '你们在核心价值观上——对家庭、工作、生活方式的看法——有多一致？', '{"slider":{"min":0,"max":100,"min_label":"差异很大，经常感觉不是一路人","max_label":"高度一致，很少在这些事上有分歧","feedback":[{"range":[0,25],"text":"有一些根本性的差距，需要认真对待"},{"range":[26,45],"text":"有重要的分歧，但还没到无法共存的程度"},{"range":[46,65],"text":"大方向一致，细节有差异"},{"range":[66,85],"text":"你们底层逻辑相近，是同一类人"},{"range":[86,100],"text":"在很多根本性的问题上高度一致，这很难得"}]},"source_question":{"id":"CO-M-30","order":30,"layer":"CO","weight":1.5,"type":"slider","direction":"positive","text":"你们在核心价值观上——对家庭、工作、生活方式的看法——有多一致？","slider":{"min":0,"max":100,"min_label":"差异很大，经常感觉不是一路人","max_label":"高度一致，很少在这些事上有分歧","feedback":[{"range":[0,25],"text":"有一些根本性的差距，需要认真对待"},{"range":[26,45],"text":"有重要的分歧，但还没到无法共存的程度"},{"range":[46,65],"text":"大方向一致，细节有差异"},{"range":[66,85],"text":"你们底层逻辑相近，是同一类人"},{"range":[86,100],"text":"在很多根本性的问题上高度一致，这很难得"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-31', 33, 'CO', 'scale', 1.5, 'positive', '我觉得她是一个跟我能走很远的人，不只是现在合适。', '{"alt_text_secret_crush":"从我对她的了解，我觉得她是一个跟我能走很远的人。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"CO-M-31","order":31,"layer":"CO","weight":1.5,"type":"scale","direction":"positive","text":"我觉得她是一个跟我能走很远的人，不只是现在合适。","alt_text_secret_crush":"从我对她的了解，我觉得她是一个跟我能走很远的人。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-32', 34, 'CO', 'scenario', 1.3, 'positive', '你们各自的家庭对这段关系的态度，大概是什么情况？', '{"skip_for":["secret_crush"],"scene":"家庭外部支持情况","options":[{"key":"A","text":"双方家庭都支持，没有外部压力","sub":"低风险，强支撑","score":90},{"key":"B","text":"一边支持，一边有些保留","sub":"中等，有潜在压力","score":65},{"key":"C","text":"双方家庭都有一些不同意见","sub":"中高风险","score":45},{"key":"D","text":"家庭因素是我们关系里一个比较大的挑战","sub":"高风险","score":25}],"source_question":{"id":"CO-M-32","order":32,"layer":"CO","weight":1.3,"type":"scenario","direction":"positive","text":"你们各自的家庭对这段关系的态度，大概是什么情况？","skip_for":["secret_crush"],"scene":"家庭外部支持情况","options":[{"key":"A","text":"双方家庭都支持，没有外部压力","sub":"低风险，强支撑","score":90},{"key":"B","text":"一边支持，一边有些保留","sub":"中等，有潜在压力","score":65},{"key":"C","text":"双方家庭都有一些不同意见","sub":"中高风险","score":45},{"key":"D","text":"家庭因素是我们关系里一个比较大的挑战","sub":"高风险","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-33', 35, 'CO', 'binary', 1.5, 'positive', '她对你需要的个人空间，理解吗？', '{"options":[{"key":"left","text":"理解，她不会因为我需要一个人待着而有意见","sub":"高空间兼容","score":85},{"key":"right","text":"有时候不理解，我需要空间时会有摩擦","sub":"空间需求不对等","score":40}],"source_question":{"id":"CO-M-33","order":33,"layer":"CO","weight":1.5,"type":"binary","direction":"positive","text":"她对你需要的个人空间，理解吗？","options":[{"key":"left","text":"理解，她不会因为我需要一个人待着而有意见","sub":"高空间兼容","score":85},{"key":"right","text":"有时候不理解，我需要空间时会有摩擦","sub":"空间需求不对等","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-34', 36, 'CO', 'choice', 1.3, 'positive', '你们对钱和消费的态度，大概是？', '{"options":[{"key":"A","text":"很接近，不会在这件事上有摩擦","sub":"高兼容","score":85},{"key":"B","text":"有差异，但互相理解，不影响关系","sub":"中等","score":70},{"key":"C","text":"有一些摩擦，还在可以接受的范围","sub":"中低，潜在压力","score":50},{"key":"D","text":"差距比较大，这是关系里的一个压力来源","sub":"低兼容，显性风险","score":25}],"source_question":{"id":"CO-M-34","order":34,"layer":"CO","weight":1.3,"type":"choice","direction":"positive","text":"你们对钱和消费的态度，大概是？","options":[{"key":"A","text":"很接近，不会在这件事上有摩擦","sub":"高兼容","score":85},{"key":"B","text":"有差异，但互相理解，不影响关系","sub":"中等","score":70},{"key":"C","text":"有一些摩擦，还在可以接受的范围","sub":"中低，潜在压力","score":50},{"key":"D","text":"差距比较大，这是关系里的一个压力来源","sub":"低兼容，显性风险","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-35', 37, 'CO', 'scale', 1.5, 'positive', '我们对「这段关系会走向哪里」有相似的期待，不需要靠猜测来确认。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"CO-M-35","order":35,"layer":"CO","weight":1.5,"type":"scale","direction":"positive","text":"我们对「这段关系会走向哪里」有相似的期待，不需要靠猜测来确认。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-36', 38, 'CO', 'scenario', 1.2, 'positive', '你们聊到彼此的朋友圈和社交。她对你的朋友和社交，是什么态度？', '{"scene":"对对方社交圈的尊重程度","options":[{"key":"A","text":"尊重，不干涉，偶尔一起参与","sub":"高兼容，低阻力","score":90},{"key":"B","text":"基本尊重，但有时候会有意见","sub":"轻度干涉","score":65},{"key":"C","text":"她不太了解我的圈子，也不太感兴趣","sub":"低融合度","score":50},{"key":"D","text":"有时候会因为我的社交产生摩擦","sub":"社交兼容性低，有风险","score":30}],"source_question":{"id":"CO-M-36","order":36,"layer":"CO","weight":1.2,"type":"scenario","direction":"positive","text":"你们聊到彼此的朋友圈和社交。她对你的朋友和社交，是什么态度？","scene":"对对方社交圈的尊重程度","options":[{"key":"A","text":"尊重，不干涉，偶尔一起参与","sub":"高兼容，低阻力","score":90},{"key":"B","text":"基本尊重，但有时候会有意见","sub":"轻度干涉","score":65},{"key":"C","text":"她不太了解我的圈子，也不太感兴趣","sub":"低融合度","score":50},{"key":"D","text":"有时候会因为我的社交产生摩擦","sub":"社交兼容性低，有风险","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-37', 39, 'CO', 'rank', 1.0, 'auxiliary', '在你们的关系里，哪些事情你们最一致？从最一致到最有分歧排序。', '{"items":[{"id":"a","text":"对未来生活方式的设想"},{"id":"b","text":"对家庭和婚育的看法"},{"id":"c","text":"对钱和消费的态度"},{"id":"d","text":"对彼此需要多少空间的理解"}],"source_question":{"id":"CO-M-37","order":37,"layer":"CO","weight":1.0,"type":"rank","direction":"auxiliary","text":"在你们的关系里，哪些事情你们最一致？从最一致到最有分歧排序。","items":[{"id":"a","text":"对未来生活方式的设想"},{"id":"b","text":"对家庭和婚育的看法"},{"id":"c","text":"对钱和消费的态度"},{"id":"d","text":"对彼此需要多少空间的理解"}],"scoring":{"method":"auxiliary","note":"辅助AI生成个性化建议，识别具体薄弱点"}}}'::jsonb, '{"method":"auxiliary","note":"辅助AI生成个性化建议，识别具体薄弱点"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'CO-M-38', 40, 'CO', 'binary', 1.3, 'positive', '从根本上来说，你们是同一类人吗？', '{"options":[{"key":"left","text":"是，底层的很多东西是相似的","sub":"高深层兼容","score":80},{"key":"right","text":"不完全是，有一些根本性的不同","sub":"差异型组合，需要更多努力","score":55}],"source_question":{"id":"CO-M-38","order":38,"layer":"CO","weight":1.3,"type":"binary","direction":"positive","text":"从根本上来说，你们是同一类人吗？","options":[{"key":"left","text":"是，底层的很多东西是相似的","sub":"高深层兼容","score":80},{"key":"right","text":"不完全是，有一些根本性的不同","sub":"差异型组合，需要更多努力","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-39', 41, 'EV', 'slider', 1.5, 'positive', '跟她在一起这段时间，你觉得自己有没有在进步？', '{"slider":{"min":0,"max":100,"min_label":"这段关系让我停滞甚至退步了","max_label":"在这段关系里我明显变得更好了","feedback":[{"range":[0,20],"text":"这段关系在消耗你的精力，值得认真看"},{"range":[21,40],"text":"有一些被拖拽的感觉，但也有好的地方"},{"range":[41,60],"text":"平稳，没有特别的成长也没有明显的消耗"},{"range":[61,80],"text":"你在这段关系里是在往前走的"},{"range":[81,100],"text":"这段关系是你生命里真正有助力的关系之一"}]},"source_question":{"id":"EV-M-39","order":39,"layer":"EV","weight":1.5,"type":"slider","direction":"positive","text":"跟她在一起这段时间，你觉得自己有没有在进步？","slider":{"min":0,"max":100,"min_label":"这段关系让我停滞甚至退步了","max_label":"在这段关系里我明显变得更好了","feedback":[{"range":[0,20],"text":"这段关系在消耗你的精力，值得认真看"},{"range":[21,40],"text":"有一些被拖拽的感觉，但也有好的地方"},{"range":[41,60],"text":"平稳，没有特别的成长也没有明显的消耗"},{"range":[61,80],"text":"你在这段关系里是在往前走的"},{"range":[81,100],"text":"这段关系是你生命里真正有助力的关系之一"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-40', 42, 'EV', 'scenario', 1.5, 'positive', '你想象一年后的你们。第一个浮现的画面是？', '{"scene":"对关系未来的直觉预期","options":[{"key":"A","text":"比现在更好，我能清楚地想象我们在一起的样子","sub":"正向预期，关系上升期","score":90},{"key":"B","text":"差不多，继续现在这样","sub":"平台期，稳定但缺少动力","score":60},{"key":"C","text":"有点模糊，不确定","sub":"方向不清","score":45},{"key":"D","text":"很难想象，或者想到就有点担心","sub":"关系走向不乐观","score":25}],"source_question":{"id":"EV-M-40","order":40,"layer":"EV","weight":1.5,"type":"scenario","direction":"positive","text":"你想象一年后的你们。第一个浮现的画面是？","scene":"对关系未来的直觉预期","options":[{"key":"A","text":"比现在更好，我能清楚地想象我们在一起的样子","sub":"正向预期，关系上升期","score":90},{"key":"B","text":"差不多，继续现在这样","sub":"平台期，稳定但缺少动力","score":60},{"key":"C","text":"有点模糊，不确定","sub":"方向不清","score":45},{"key":"D","text":"很难想象，或者想到就有点担心","sub":"关系走向不乐观","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-41', 43, 'EV', 'binary', 1.5, 'positive', '这段关系最近的趋势，你感觉是？', '{"options":[{"key":"left","text":"在变好，我们越来越有默契","sub":"上升趋势","score":85},{"key":"right","text":"有些东西在变淡，或者出现了以前没有的问题","sub":"下降或平台趋势","score":40}],"source_question":{"id":"EV-M-41","order":41,"layer":"EV","weight":1.5,"type":"binary","direction":"positive","text":"这段关系最近的趋势，你感觉是？","options":[{"key":"left","text":"在变好，我们越来越有默契","sub":"上升趋势","score":85},{"key":"right","text":"有些东西在变淡，或者出现了以前没有的问题","sub":"下降或平台趋势","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-42', 44, 'EV', 'choice', 1.3, 'positive', '这段关系，有没有让你在某些方面改变？', '{"options":[{"key":"A","text":"有，而且是好的改变，我认可这些变化","sub":"正向成长","score":90},{"key":"B","text":"有，但不确定是不是好的","sub":"被动改变，需要审视","score":55},{"key":"C","text":"没有特别，我还是我自己","sub":"关系影响有限","score":65},{"key":"D","text":"有，但感觉失去了一些原来的东西","sub":"自我消融风险","score":30}],"source_question":{"id":"EV-M-42","order":42,"layer":"EV","weight":1.3,"type":"choice","direction":"positive","text":"这段关系，有没有让你在某些方面改变？","options":[{"key":"A","text":"有，而且是好的改变，我认可这些变化","sub":"正向成长","score":90},{"key":"B","text":"有，但不确定是不是好的","sub":"被动改变，需要审视","score":55},{"key":"C","text":"没有特别，我还是我自己","sub":"关系影响有限","score":65},{"key":"D","text":"有，但感觉失去了一些原来的东西","sub":"自我消融风险","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-43', 45, 'EV', 'scale', 1.5, 'positive', '我对这段关系的未来有期待，不只是走一步看一步。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"EV-M-43","order":43,"layer":"EV","weight":1.5,"type":"scale","direction":"positive","text":"我对这段关系的未来有期待，不只是走一步看一步。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-44', 46, 'EV', 'mood', 1.5, 'positive', '你有没有想过结束这段关系？这个念头出现的频率是？', '{"options":[{"key":"A","icon":"ti-mood-smile","text":"几乎没有，我没有想过","score":90},{"key":"B","icon":"ti-mood-happy","text":"偶尔一闪而过，但很快就消了","score":75},{"key":"C","icon":"ti-mood-confuzed","text":"有时候会想，但不确定自己真的想","score":55},{"key":"D","icon":"ti-mood-sad","text":"认真想过，后来放下了","score":50},{"key":"E","icon":"ti-mood-nervous","text":"最近这个念头出现得比较频繁","score":30},{"key":"F","icon":"ti-mood-empty","text":"想过很多次，但一直没有行动","score":35},{"key":"G","icon":"ti-mood-angry","text":"情绪激动时想过，冷静了就不想了","score":55},{"key":"H","icon":"ti-mood-tongue","text":"这段关系还很新，没想到这一步","score":80}],"source_question":{"id":"EV-M-44","order":44,"layer":"EV","weight":1.5,"type":"mood","direction":"positive","text":"你有没有想过结束这段关系？这个念头出现的频率是？","options":[{"key":"A","icon":"ti-mood-smile","text":"几乎没有，我没有想过","score":90},{"key":"B","icon":"ti-mood-happy","text":"偶尔一闪而过，但很快就消了","score":75},{"key":"C","icon":"ti-mood-confuzed","text":"有时候会想，但不确定自己真的想","score":55},{"key":"D","icon":"ti-mood-sad","text":"认真想过，后来放下了","score":50},{"key":"E","icon":"ti-mood-nervous","text":"最近这个念头出现得比较频繁","score":30},{"key":"F","icon":"ti-mood-empty","text":"想过很多次，但一直没有行动","score":35},{"key":"G","icon":"ti-mood-angry","text":"情绪激动时想过，冷静了就不想了","score":55},{"key":"H","icon":"ti-mood-tongue","text":"这段关系还很新，没想到这一步","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-45', 47, 'EV', 'scenario', 1.5, 'positive', '你回顾你们在一起的这段时间。整体感受是？', '{"scene":"关系整体价值的回顾","options":[{"key":"A","text":"值得，有很多真实的快乐，我不后悔","sub":"高关系价值感","score":90},{"key":"B","text":"有好有坏，总体还是值得的","sub":"中等，接受复杂性","score":70},{"key":"C","text":"有些累，但还没想清楚要怎样","sub":"消耗感明显","score":40},{"key":"D","text":"如果能重来，我可能会做不同的选择","sub":"低关系价值感","score":20}],"source_question":{"id":"EV-M-45","order":45,"layer":"EV","weight":1.5,"type":"scenario","direction":"positive","text":"你回顾你们在一起的这段时间。整体感受是？","scene":"关系整体价值的回顾","options":[{"key":"A","text":"值得，有很多真实的快乐，我不后悔","sub":"高关系价值感","score":90},{"key":"B","text":"有好有坏，总体还是值得的","sub":"中等，接受复杂性","score":70},{"key":"C","text":"有些累，但还没想清楚要怎样","sub":"消耗感明显","score":40},{"key":"D","text":"如果能重来，我可能会做不同的选择","sub":"低关系价值感","score":20}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-46', 48, 'EV', 'binary', 1.3, 'positive', '你有没有在这段关系里，感觉过一种「这就是了」的确定感？', '{"options":[{"key":"left","text":"有，有时候会觉得她就是那个对的人","sub":"高关系确认感","score":85},{"key":"right","text":"不太确定，这种感觉偶尔有但不稳定","sub":"低确认感","score":50}],"source_question":{"id":"EV-M-46","order":46,"layer":"EV","weight":1.3,"type":"binary","direction":"positive","text":"你有没有在这段关系里，感觉过一种「这就是了」的确定感？","options":[{"key":"left","text":"有，有时候会觉得她就是那个对的人","sub":"高关系确认感","score":85},{"key":"right","text":"不太确定，这种感觉偶尔有但不稳定","sub":"低确认感","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-47', 49, 'EV', 'choice', 1.5, 'positive', '她在你的未来计划里吗？', '{"options":[{"key":"A","text":"在，想到未来她自然就在里面","sub":"高未来整合度","score":90},{"key":"B","text":"有时候在，但不是每次都想到她","sub":"中等，不够稳定","score":65},{"key":"C","text":"不太确定，还没想到那么远","sub":"低未来整合度","score":50},{"key":"D","text":"我刻意不去想，因为想了会有压力","sub":"回避型，有焦虑","score":35}],"source_question":{"id":"EV-M-47","order":47,"layer":"EV","weight":1.5,"type":"choice","direction":"positive","text":"她在你的未来计划里吗？","options":[{"key":"A","text":"在，想到未来她自然就在里面","sub":"高未来整合度","score":90},{"key":"B","text":"有时候在，但不是每次都想到她","sub":"中等，不够稳定","score":65},{"key":"C","text":"不太确定，还没想到那么远","sub":"低未来整合度","score":50},{"key":"D","text":"我刻意不去想，因为想了会有压力","sub":"回避型，有焦虑","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-48', 50, 'EV', 'slider', 1.5, 'positive', '你觉得你们现在的关系，处于什么动态？', '{"slider":{"min":0,"max":100,"min_label":"明显在走下坡","max_label":"明显在变好，越来越有默契","feedback":[{"range":[0,25],"text":"有一些让你担心的信号，值得正视"},{"range":[26,45],"text":"有些东西在消退，还有挽回的空间"},{"range":[46,60],"text":"处于平台期，稳定但缺少新的动力"},{"range":[61,80],"text":"整体在往好的方向走"},{"range":[81,100],"text":"你们正处于关系里的一个好阶段"}]},"source_question":{"id":"EV-M-48","order":48,"layer":"EV","weight":1.5,"type":"slider","direction":"positive","text":"你觉得你们现在的关系，处于什么动态？","slider":{"min":0,"max":100,"min_label":"明显在走下坡","max_label":"明显在变好，越来越有默契","feedback":[{"range":[0,25],"text":"有一些让你担心的信号，值得正视"},{"range":[26,45],"text":"有些东西在消退，还有挽回的空间"},{"range":[46,60],"text":"处于平台期，稳定但缺少新的动力"},{"range":[61,80],"text":"整体在往好的方向走"},{"range":[81,100],"text":"你们正处于关系里的一个好阶段"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-49', 51, 'EV', 'scale', 1.5, 'positive', '这段关系让我有动力往前走，而不是让我停在原地。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"EV-M-49","order":49,"layer":"EV","weight":1.5,"type":"scale","direction":"positive","text":"这段关系让我有动力往前走，而不是让我停在原地。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'EV-M-50', 52, 'EV', 'scenario', 1.3, 'positive', '哥们问你「你们还会在一起吗」。你的第一反应是？', '{"scene":"关系稳定性的直觉判断","options":[{"key":"A","text":"会，这个我没有想过要结束","sub":"高稳定性","score":90},{"key":"B","text":"应该会，但没有完全确定","sub":"有不确定感","score":65},{"key":"C","text":"不知道，说不准","sub":"低稳定性","score":40},{"key":"D","text":"我也在想这个问题","sub":"关系处于评估期","score":35}],"source_question":{"id":"EV-M-50","order":50,"layer":"EV","weight":1.3,"type":"scenario","direction":"positive","text":"哥们问你「你们还会在一起吗」。你的第一反应是？","scene":"关系稳定性的直觉判断","options":[{"key":"A","text":"会，这个我没有想过要结束","sub":"高稳定性","score":90},{"key":"B","text":"应该会，但没有完全确定","sub":"有不确定感","score":65},{"key":"C","text":"不知道，说不准","sub":"低稳定性","score":40},{"key":"D","text":"我也在想这个问题","sub":"关系处于评估期","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-51', 53, 'RK', 'scenario', 1.5, 'reverse', '她有时候会用情绪或者沉默来表达不满，而不是直接说。这种情况？', '{"scene":"间接表达不满的频率","options":[{"key":"A","text":"几乎没有，她会直接说她的感受","sub":"低风险","score":10},{"key":"B","text":"偶尔有，但她之后会说清楚","sub":"低中风险，有修复","score":30},{"key":"C","text":"有时候有，我需要自己猜她在不满什么","sub":"中高风险，沟通压力","score":60},{"key":"D","text":"比较频繁，这是我们关系里让我感到消耗的来源","sub":"高风险","score":85}],"source_question":{"id":"RK-M-51","order":51,"layer":"RK","weight":1.5,"type":"scenario","direction":"reverse","text":"她有时候会用情绪或者沉默来表达不满，而不是直接说。这种情况？","scene":"间接表达不满的频率","options":[{"key":"A","text":"几乎没有，她会直接说她的感受","sub":"低风险","score":10},{"key":"B","text":"偶尔有，但她之后会说清楚","sub":"低中风险，有修复","score":30},{"key":"C","text":"有时候有，我需要自己猜她在不满什么","sub":"中高风险，沟通压力","score":60},{"key":"D","text":"比较频繁，这是我们关系里让我感到消耗的来源","sub":"高风险","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-52', 54, 'RK', 'binary', 1.5, 'reverse', '在这段关系里，你有没有感觉过一种「我在压抑自己」的时刻？', '{"options":[{"key":"left","text":"很少，我在她面前大多数时候可以做自己","sub":"低风险","score":15},{"key":"right","text":"有，有一些东西我不敢说或者不得不压着","sub":"中高风险，自我压抑信号","score":70}],"source_question":{"id":"RK-M-52","order":52,"layer":"RK","weight":1.5,"type":"binary","direction":"reverse","text":"在这段关系里，你有没有感觉过一种「我在压抑自己」的时刻？","options":[{"key":"left","text":"很少，我在她面前大多数时候可以做自己","sub":"低风险","score":15},{"key":"right","text":"有，有一些东西我不敢说或者不得不压着","sub":"中高风险，自我压抑信号","score":70}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-53', 55, 'RK', 'choice', 1.5, 'reverse', '她对你的社交和朋友，态度是？', '{"options":[{"key":"A","text":"尊重，不干涉，偶尔一起参与","sub":"低风险","score":10},{"key":"B","text":"基本尊重，但有时候会有点意见","sub":"低中风险","score":30},{"key":"C","text":"经常有意见，会让我减少某些社交","sub":"中高风险，控制倾向","score":65},{"key":"D","text":"这是我们关系里比较大的摩擦来源","sub":"高风险","score":85}],"source_question":{"id":"RK-M-53","order":53,"layer":"RK","weight":1.5,"type":"choice","direction":"reverse","text":"她对你的社交和朋友，态度是？","options":[{"key":"A","text":"尊重，不干涉，偶尔一起参与","sub":"低风险","score":10},{"key":"B","text":"基本尊重，但有时候会有点意见","sub":"低中风险","score":30},{"key":"C","text":"经常有意见，会让我减少某些社交","sub":"中高风险，控制倾向","score":65},{"key":"D","text":"这是我们关系里比较大的摩擦来源","sub":"高风险","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-54', 56, 'RK', 'slider', 1.5, 'reverse', '在这段关系里，你有多少空间做自己想做的事，不需要解释或者顾虑？', '{"slider":{"min":0,"max":100,"min_label":"很受限，很多事情要顾虑她的反应","max_label":"空间很大，我能做自己，不需要解释","feedback":[{"range":[0,25],"text":"你在这段关系里感受到明显的束缚感"},{"range":[26,45],"text":"有一些限制，但还能接受"},{"range":[46,65],"text":"大多数时候可以，但某些地方会有顾虑"},{"range":[66,85],"text":"整体空间感很好"},{"range":[86,100],"text":"这段关系给了你很大的自由度"}]},"source_question":{"id":"RK-M-54","order":54,"layer":"RK","weight":1.5,"type":"slider","direction":"reverse","text":"在这段关系里，你有多少空间做自己想做的事，不需要解释或者顾虑？","slider":{"min":0,"max":100,"min_label":"很受限，很多事情要顾虑她的反应","max_label":"空间很大，我能做自己，不需要解释","feedback":[{"range":[0,25],"text":"你在这段关系里感受到明显的束缚感"},{"range":[26,45],"text":"有一些限制，但还能接受"},{"range":[46,65],"text":"大多数时候可以，但某些地方会有顾虑"},{"range":[66,85],"text":"整体空间感很好"},{"range":[86,100],"text":"这段关系给了你很大的自由度"}]},"scoring":{"method":"reverse","formula":"100 - value"}}}'::jsonb, '{"method":"reverse","formula":"100 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-55', 57, 'RK', 'scenario', 1.5, 'reverse', '你们之间有没有反复出现、始终没有解决的问题？', '{"scene":"慢性问题的存在程度","options":[{"key":"A","text":"没有，遇到问题基本都能解决","sub":"低风险","score":10},{"key":"B","text":"有一个，但我们都知道，在慢慢改善","sub":"低中风险，有意识","score":30},{"key":"C","text":"有，说了很多次但没有真正改变","sub":"中高风险，模式固化","score":65},{"key":"D","text":"有几个，感觉已经说不下去了","sub":"高风险，消极循环","score":85}],"source_question":{"id":"RK-M-55","order":55,"layer":"RK","weight":1.5,"type":"scenario","direction":"reverse","text":"你们之间有没有反复出现、始终没有解决的问题？","scene":"慢性问题的存在程度","options":[{"key":"A","text":"没有，遇到问题基本都能解决","sub":"低风险","score":10},{"key":"B","text":"有一个，但我们都知道，在慢慢改善","sub":"低中风险，有意识","score":30},{"key":"C","text":"有，说了很多次但没有真正改变","sub":"中高风险，模式固化","score":65},{"key":"D","text":"有几个，感觉已经说不下去了","sub":"高风险，消极循环","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-56', 58, 'RK', 'binary', 1.5, 'reverse', '她的情绪和需求，有没有让你感到一种持续的压力？', '{"options":[{"key":"left","text":"没有，她的状态对我的日常影响不大","sub":"低风险","score":10},{"key":"right","text":"有，有时候会因为她的情绪状态而感到紧张或者消耗","sub":"中高风险，情绪负担信号","score":70}],"source_question":{"id":"RK-M-56","order":56,"layer":"RK","weight":1.5,"type":"binary","direction":"reverse","text":"她的情绪和需求，有没有让你感到一种持续的压力？","options":[{"key":"left","text":"没有，她的状态对我的日常影响不大","sub":"低风险","score":10},{"key":"right","text":"有，有时候会因为她的情绪状态而感到紧张或者消耗","sub":"中高风险，情绪负担信号","score":70}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-57', 59, 'RK', 'choice', 1.3, 'reverse', '你们之间有没有一些话，是你一直想说但没说的？', '{"options":[{"key":"A","text":"没有，没什么藏着掖着的","sub":"低风险，高透明度","score":10},{"key":"B","text":"有一些小事，不影响大局","sub":"低中风险","score":25},{"key":"C","text":"有一些比较重要的，一直没找到合适的时机","sub":"中风险，积压","score":55},{"key":"D","text":"有一些核心的东西，不确定说了会怎样","sub":"高风险，关键问题被回避","score":80}],"source_question":{"id":"RK-M-57","order":57,"layer":"RK","weight":1.3,"type":"choice","direction":"reverse","text":"你们之间有没有一些话，是你一直想说但没说的？","options":[{"key":"A","text":"没有，没什么藏着掖着的","sub":"低风险，高透明度","score":10},{"key":"B","text":"有一些小事，不影响大局","sub":"低中风险","score":25},{"key":"C","text":"有一些比较重要的，一直没找到合适的时机","sub":"中风险，积压","score":55},{"key":"D","text":"有一些核心的东西，不确定说了会怎样","sub":"高风险，关键问题被回避","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-58', 60, 'RK', 'scale', 1.5, 'reverse', '在这段关系里，有时候我会感到一种不自由的感觉——做某些事需要顾虑她的反应。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"source_question":{"id":"RK-M-58","order":58,"layer":"RK","weight":1.5,"type":"scale","direction":"reverse","text":"在这段关系里，有时候我会感到一种不自由的感觉——做某些事需要顾虑她的反应。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"scoring":{"method":"reverse_times_25","formula":"(value - 1) * 25"}}}'::jsonb, '{"method":"reverse_times_25","formula":"(value - 1) * 25"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-59', 61, 'RK', 'mood', 1.5, 'reverse', '你对这段关系整体的感觉，最接近？', '{"options":[{"key":"A","icon":"ti-heart","text":"很珍惜，这段关系让我感到幸运","score":10},{"key":"B","icon":"ti-mood-happy","text":"满意，整体很好","score":15},{"key":"C","icon":"ti-mood-smile","text":"还不错，有小问题但可以接受","score":25},{"key":"D","icon":"ti-mood-confuzed","text":"复杂，好的坏的都有","score":45},{"key":"E","icon":"ti-mood-sad","text":"有些累，但还在坚持","score":60},{"key":"F","icon":"ti-mood-nervous","text":"有点不安，不确定哪里出了问题","score":65},{"key":"G","icon":"ti-mood-empty","text":"有时候感觉很空","score":70},{"key":"H","icon":"ti-mood-angry","text":"有一些压抑的情绪，还没处理","score":75}],"source_question":{"id":"RK-M-59","order":59,"layer":"RK","weight":1.5,"type":"mood","direction":"reverse","text":"你对这段关系整体的感觉，最接近？","options":[{"key":"A","icon":"ti-heart","text":"很珍惜，这段关系让我感到幸运","score":10},{"key":"B","icon":"ti-mood-happy","text":"满意，整体很好","score":15},{"key":"C","icon":"ti-mood-smile","text":"还不错，有小问题但可以接受","score":25},{"key":"D","icon":"ti-mood-confuzed","text":"复杂，好的坏的都有","score":45},{"key":"E","icon":"ti-mood-sad","text":"有些累，但还在坚持","score":60},{"key":"F","icon":"ti-mood-nervous","text":"有点不安，不确定哪里出了问题","score":65},{"key":"G","icon":"ti-mood-empty","text":"有时候感觉很空","score":70},{"key":"H","icon":"ti-mood-angry","text":"有一些压抑的情绪，还没处理","score":75}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'RK-M-60', 62, 'RK', 'scenario', 1.5, 'reverse', '如果你最好的哥们跟你描述一段跟你们很相似的关系，问你怎么看。你会对他说什么？', '{"scene":"旁观者视角的关系评估","options":[{"key":"A","text":"挺好的，值得珍惜","sub":"低风险，关系认可度高","score":10},{"key":"B","text":"有些地方需要注意，但整体健康","sub":"中低风险，有觉察","score":30},{"key":"C","text":"我会有点担心，提醒他注意某些模式","sub":"中高风险，旁观者视角","score":60},{"key":"D","text":"我可能会建议他认真想想值不值得继续","sub":"高风险，理智层面已有判断","score":85}],"source_question":{"id":"RK-M-60","order":60,"layer":"RK","weight":1.5,"type":"scenario","direction":"reverse","text":"如果你最好的哥们跟你描述一段跟你们很相似的关系，问你怎么看。你会对他说什么？","scene":"旁观者视角的关系评估","options":[{"key":"A","text":"挺好的，值得珍惜","sub":"低风险，关系认可度高","score":10},{"key":"B","text":"有些地方需要注意，但整体健康","sub":"中低风险，有觉察","score":30},{"key":"C","text":"我会有点担心，提醒他注意某些模式","sub":"中高风险，旁观者视角","score":60},{"key":"D","text":"我可能会建议他认真想想值不值得继续","sub":"高风险，理智层面已有判断","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's02_ros_male'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();


-- Source: suite3_mate_female.json

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
VALUES ('s03_mate_female', '择偶坐标测试', '1.0', 'female'::public.test_gender, 80, 18, false, true, '{"id":"S03_MATE_FEMALE","name":"择偶坐标测试","gender":"female","version":"1.0","total_questions":80,"estimated_minutes":18,"is_free":false,"modules":["FS1","FS2","FS3","FS4","FS5"],"result_types":["让人想留下来的人","被读懂之前的人","一眼就懂的人","需要被正确打开的人","还没到时候的人","越了解越值钱的人"],"question_types_used":["slider","scenario","binary","choice","scale","card","mood","rank"]}'::jsonb)
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
SELECT id, 'ROS_V3', '1.0', '{"axes":{"horizontal":{"name":"市场显示度","formula":"FS1 * 0.55 + FS2 * 0.45","description":"别人第一眼和相处后感受到的吸引力综合"},"vertical":{"name":"现实支撑力","formula":"FS3 * 0.60 + (100 - FS5) * 0.40","description":"你能给关系托底的现实能力和风险净值"}},"modules":{"FS1":{"label":"吸引力资产","weight":0.35,"sub":{"FS1_A":{"label":"外形管理水平","weight":0.4},"FS1_B":{"label":"气质与存在感","weight":0.35},"FS1_C":{"label":"新鲜感存续力","weight":0.25}}},"FS2":{"label":"情感价值输出","weight":0.3,"sub":{"FS2_A":{"label":"情绪滋养能力","weight":0.4},"FS2_B":{"label":"趣味与话题质量","weight":0.3},"FS2_C":{"label":"被需要感制造力","weight":0.3}}},"FS3":{"label":"现实自主性","weight":0.2,"sub":{"FS3_A":{"label":"经济独立程度","weight":0.4},"FS3_B":{"label":"家庭助力情况","weight":0.35},"FS3_C":{"label":"生活自主能力","weight":0.25}}},"FS4":{"label":"关系成熟度","weight":0.1,"sub":{"FS4_A":{"label":"边界清晰度","weight":0.4},"FS4_B":{"label":"情绪处理方式","weight":0.35},"FS4_C":{"label":"依赖与独立平衡","weight":0.25}}},"FS5":{"label":"风险净值","weight":0.05,"direction":"reverse","note":"此模块分数越低越好，反向计入纵轴","sub":{"FS5_A":{"label":"过去关系包袱","weight":0.35},"FS5_B":{"label":"情感依赖风险","weight":0.4},"FS5_C":{"label":"家庭干预风险","weight":0.25}}}}}'::jsonb, '{"quadrant_logic":{"note":"以50分为轴线中点，判断所在象限","Q1":{"condition":"horizontal >= 60 && vertical >= 60","type":"让人想留下来的人"},"Q2":{"condition":"horizontal < 50 && vertical >= 60","type":"被读懂之前的人"},"Q4":{"condition":"horizontal >= 60 && vertical < 50","type":"一眼就懂的人"},"Q3":{"condition":"horizontal < 50 && vertical < 50","type":"还没到时候的人"},"special_1":{"condition":"50 <= horizontal < 60 && 50 <= vertical < 60","type":"需要被正确打开的人"},"special_2":{"condition":"horizontal < 50 && vertical >= 55 && FS2 >= 65","type":"越了解越值钱的人"}},"score_display_rules":{"note":"所有分数转化为描述性语言输出，不直接显示数字","ranges":[{"min":0,"max":30,"label":"这个维度还有很大的成长空间"},{"min":31,"max":50,"label":"这个维度处于发展阶段"},{"min":51,"max":65,"label":"这个维度表现稳定"},{"min":66,"max":80,"label":"这个维度是你的重要资产"},{"min":81,"max":100,"label":"这个维度是你的核心竞争力"}],"sensitive_fields":{"FS1_A_base":"外形基础值不直接显示，转化为：高辨识度/中等辨识度/自然型/待提升","FS3_A_income":"收入档位不直接显示，转化为：经济独立/基本独立/发展阶段","FS3_A_education":"学历作为修正系数，不单独显示"}}}'::jsonb, '{"source":"ROS_V3_whitepaper_optimized.docx","storage_strategy":"whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB","product_set":"MATE"}'::jsonb, true
FROM public.test_suites WHERE slug = 's03_mate_female'
ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET
  scoring_formula = EXCLUDED.scoring_formula,
  type_rules = EXCLUDED.type_rules,
  ros_config = EXCLUDED.ros_config,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '让人想留下来的人', '让人想留下来的人', 'female'::public.test_gender, '{"tagline":"你不是最耀眼的那个，但待在你身边有一种说不清的舒服。","tags":["情感浓度高","安全感制造者","越处越好"],"market_read":"你的吸引力是慢热型的，第一眼不一定赢，但留存率极高。你在关系里能给对方持续的情绪价值，对方很难找到替代品。","upper_match":"需要稳定情感着陆点、有一定阅历、不追求即时刺激的成熟男性","sweet_spot":"重视稳定感、不喜欢刺激和不确定性、愿意花时间了解你的男性","lower_match":"追求即时吸引力、需要强存在感刺激的男性","radar_baseline":{"FS1":72,"FS2":78,"FS3":70,"FS4":75,"FS5_risk":25}}'::jsonb, 1, true
FROM public.test_suites WHERE slug = 's03_mate_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '被读懂之前的人', '被读懂之前的人', 'female'::public.test_gender, '{"tagline":"你有很多好，但它们藏得很深——大多数人没有耐心等到那一刻。","tags":["高价值低显示度","需要对的频道","慢慢升值"],"market_read":"你的牌面没有被充分展示出来，第一印象可能低于你的实际价值。你不缺好，缺的是一个愿意停下来读你的人。","upper_match":"有阅历、不被表面吸引、懂得欣赏内在深度的男性","sweet_spot":"务实、重视稳定、不追求即时浪漫刺激的男性","lower_match":"追求第一眼感觉、需要你主动展示自己才能看见你的男性","radar_baseline":{"FS1":48,"FS2":68,"FS3":72,"FS4":70,"FS5_risk":20}}'::jsonb, 2, true
FROM public.test_suites WHERE slug = 's03_mate_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '一眼就懂的人', '一眼就懂的人', 'female'::public.test_gender, '{"tagline":"你把自己放在那里，清清楚楚，喜欢就来，不喜欢走开。","tags":["高辨识度","低迷失率","所见即所得"],"market_read":"你的吸引力是显性的，门面资产和气质都摆在明面上。筛选效率极高，但也意味着你吸引的范围已经被框定，制造惊喜感的空间需要主动创造。","upper_match":"资源好、审美在线、有一定阅历的成熟男性","sweet_spot":"目标清晰、不喜欢猜谜、追求匹配效率的务实型男性","lower_match":"条件一般、需要靠你的吸引力维持自信的男性","radar_baseline":{"FS1":82,"FS2":65,"FS3":55,"FS4":65,"FS5_risk":35}}'::jsonb, 3, true
FROM public.test_suites WHERE slug = 's03_mate_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '需要被正确打开的人', '需要被正确打开的人', 'female'::public.test_gender, '{"tagline":"你对了频道就是惊喜，频道不对就是误解——你不难，只是要对的人。","tags":["高个性","强烈的存在感","非标品"],"market_read":"你不走大众审美，也不符合标准模板，但你在特定人群里的吸引力是无可替代的。你的市场窄但深，找到就是真命。","upper_match":"有独立审美、不从众、愿意接受非标准答案的男性","sweet_spot":"同样有鲜明个性、能欣赏你独特之处的男性","lower_match":"追求大众标准、需要你符合某种模板的男性","radar_baseline":{"FS1":62,"FS2":72,"FS3":60,"FS4":68,"FS5_risk":30}}'::jsonb, 4, true
FROM public.test_suites WHERE slug = 's03_mate_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '还没到时候的人', '还没到时候的人', 'female'::public.test_gender, '{"tagline":"你现在的状态还不是最好版本，但方向是对的——时间站在你这边。","tags":["成长轨道清晰","当下不完整","潜力可见"],"market_read":"你目前的现实底牌或吸引力资产还在建设中，市场给你的即时报价低于你的长期价值。你需要的不是将就，而是等自己准备好。","upper_match":"有耐心、看重潜力而非现状、愿意一起成长的男性","sweet_spot":"同样在成长阶段、不追求即时完美、把关系当长期项目的男性","lower_match":"追求现成条件、不愿意等待的男性","radar_baseline":{"FS1":45,"FS2":50,"FS3":42,"FS4":48,"FS5_risk":55}}'::jsonb, 5, true
FROM public.test_suites WHERE slug = 's03_mate_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)
SELECT id, '越了解越值钱的人', '越了解越值钱的人', 'female'::public.test_gender, '{"tagline":"停留的时间越长，你给的东西越多——你不适合被快速评估。","tags":["复利型价值","深度体验者","长期主义"],"market_read":"你的价值不在第一印象，而在第三个月、第一年、第五年。你在短期市场里容易被低估，但一旦进入长期关系，你的优势会持续放大。","upper_match":"不追求即时满足、愿意投入时间、把关系当长期项目经营的男性","sweet_spot":"成熟稳重、有长期规划意识、不急于求成的男性","lower_match":"喜欢快节奏、需要即时回报、耐心不足的男性","radar_baseline":{"FS1":50,"FS2":75,"FS3":70,"FS4":72,"FS5_risk":22}}'::jsonb, 6, true
FROM public.test_suites WHERE slug = 's03_mate_female'
ON CONFLICT (suite_id, archetype_code) DO UPDATE SET
  archetype_name = EXCLUDED.archetype_name,
  gender = EXCLUDED.gender,
  profile_payload = EXCLUDED.profile_payload,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-A-F-01', 1, 'FS1', 'slider', 2.0, 'positive', '先来校准一下你的外形基础。根据下面的参考，你觉得自己大概在哪个区间？', '{"subtitle":"参考的是现实社交中的综合感受，不只是五官","note":"这个观察只帮助系统理解你的起点，不会以数字形式出现在结果里。","slider":{"min":1,"max":10,"step":1,"displayMode":"appearance","tierLabels":[{"range":[1,2],"label":"自然型"},{"range":[3,4],"label":"普通辨识度"},{"range":[5,6],"label":"有记忆点"},{"range":[7,8],"label":"高辨识度"},{"range":[9,10],"label":"极高辨识度"}],"footnote":"注意：不是素颜自拍视角，也不是美颜后的自己。\n参考：现实社交 + 日常状态 + 外形管理后的综合感受","reference":[{"score":1,"perception":"极少因为外形被注意","behavior":"外形基本不构成优势"},{"score":2,"perception":"不太关注外在呈现","behavior":"穿搭、妆容、管理较少"},{"score":3,"perception":"偶尔被夸","behavior":"熟人礼貌性评价更多"},{"score":4,"perception":"普通水平","behavior":"放在人群里不突出"},{"score":5,"perception":"中位值","behavior":"朋友会说「挺顺眼」"},{"score":6,"perception":"有辨识度","behavior":"社交场合容易留下印象"},{"score":7,"perception":"明显好看","behavior":"陌生场景会有人主动注意"},{"score":8,"perception":"同龄前10%左右","behavior":"经常被夸气质/颜值"},{"score":9,"perception":"同龄前3%左右","behavior":"经常有人主动表达好感"},{"score":10,"perception":"极少数","behavior":"外形成为明显优势资产"}]},"source_question":{"id":"FS1-A-F-01","order":1,"module":"FS1","sub":"FS1_A","type":"slider","weight":2.0,"direction":"positive","text":"先来校准一下你的外形基础。根据下面的参考，你觉得自己大概在哪个区间？","subtitle":"参考的是现实社交中的综合感受，不只是五官","note":"这个观察只帮助系统理解你的起点，不会以数字形式出现在结果里。","slider":{"min":1,"max":10,"step":1,"displayMode":"appearance","tierLabels":[{"range":[1,2],"label":"自然型"},{"range":[3,4],"label":"普通辨识度"},{"range":[5,6],"label":"有记忆点"},{"range":[7,8],"label":"高辨识度"},{"range":[9,10],"label":"极高辨识度"}],"footnote":"注意：不是素颜自拍视角，也不是美颜后的自己。\n参考：现实社交 + 日常状态 + 外形管理后的综合感受","reference":[{"score":1,"perception":"极少因为外形被注意","behavior":"外形基本不构成优势"},{"score":2,"perception":"不太关注外在呈现","behavior":"穿搭、妆容、管理较少"},{"score":3,"perception":"偶尔被夸","behavior":"熟人礼貌性评价更多"},{"score":4,"perception":"普通水平","behavior":"放在人群里不突出"},{"score":5,"perception":"中位值","behavior":"朋友会说「挺顺眼」"},{"score":6,"perception":"有辨识度","behavior":"社交场合容易留下印象"},{"score":7,"perception":"明显好看","behavior":"陌生场景会有人主动注意"},{"score":8,"perception":"同龄前10%左右","behavior":"经常被夸气质/颜值"},{"score":9,"perception":"同龄前3%左右","behavior":"经常有人主动表达好感"},{"score":10,"perception":"极少数","behavior":"外形成为明显优势资产"}]},"scoring":{"method":"direct_times_10","sensitive":"appearance","calibrationSignals":["FS1-A-F-03","FS1-A-F-02","FS1-B-F-12"]}}}'::jsonb, '{"method":"direct_times_10","sensitive":"appearance","calibrationSignals":["FS1-A-F-03","FS1-A-F-02","FS1-B-F-12"]}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-A-F-02', 2, 'FS1', 'scenario', 1.2, 'positive', '你和朋友们一起去参加一个聚会，里面大多数是你们不太熟的人。聚会结束后，你朋友悄悄告诉你，今晚有人问起你了。你听到这个消息的第一反应是？', '{"scene":"社交聚会场合","options":[{"key":"A","text":"有点意外，没想到会有人注意我","sub":"自我外形认知偏低","score":25},{"key":"B","text":"还好，我今天状态不错","sub":"状态依赖型，有感知","score":55},{"key":"C","text":"正常吧，这种场合还挺常见的","sub":"自我认知稳定","score":75},{"key":"D","text":"谁啊，我去看看","sub":"习以为常，高自信","score":90}],"source_question":{"id":"FS1-A-F-02","order":2,"module":"FS1","sub":"FS1_A","type":"scenario","weight":1.2,"direction":"positive","text":"你和朋友们一起去参加一个聚会，里面大多数是你们不太熟的人。聚会结束后，你朋友悄悄告诉你，今晚有人问起你了。你听到这个消息的第一反应是？","scene":"社交聚会场合","options":[{"key":"A","text":"有点意外，没想到会有人注意我","sub":"自我外形认知偏低","score":25},{"key":"B","text":"还好，我今天状态不错","sub":"状态依赖型，有感知","score":55},{"key":"C","text":"正常吧，这种场合还挺常见的","sub":"自我认知稳定","score":75},{"key":"D","text":"谁啊，我去看看","sub":"习以为常，高自信","score":90}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-A-F-03', 3, 'FS1', 'scale', 1.3, 'positive', '我会主动维护自己的外形状态——比如定期护肤、注意穿搭、保持体重在自己满意的范围内。', '{"scale":{"min":1,"max":5,"min_label":"几乎不在意","max_label":"非常主动维护"},"source_question":{"id":"FS1-A-F-03","order":3,"module":"FS1","sub":"FS1_A","type":"scale","weight":1.3,"direction":"positive","text":"我会主动维护自己的外形状态——比如定期护肤、注意穿搭、保持体重在自己满意的范围内。","scale":{"min":1,"max":5,"min_label":"几乎不在意","max_label":"非常主动维护"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-A-F-04', 4, 'FS1', 'binary', 1.0, 'positive', '你觉得自己的外形吸引力，更多来自哪里？', '{"options":[{"key":"left","text":"天生的底子，基础条件不错","sub":"先天优势型","score":70},{"key":"right","text":"后天维护出来的，我花了功夫","sub":"管理维护型","score":80}],"source_question":{"id":"FS1-A-F-04","order":4,"module":"FS1","sub":"FS1_A","type":"binary","weight":1.0,"direction":"positive","text":"你觉得自己的外形吸引力，更多来自哪里？","options":[{"key":"left","text":"天生的底子，基础条件不错","sub":"先天优势型","score":70},{"key":"right","text":"后天维护出来的，我花了功夫","sub":"管理维护型","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-A-F-05', 5, 'FS1', 'choice', 1.3, 'positive', '你上一次被陌生人主动要联系方式或者表白，大概是什么时候？', '{"options":[{"key":"A","text":"好几年前了，记不太清","sub":"低频","score":25},{"key":"B","text":"一两年以内","sub":"中低频","score":50},{"key":"C","text":"半年以内","sub":"中高频","score":70},{"key":"D","text":"最近三个月内就有","sub":"高频，吸引力持续有效","score":90}],"source_question":{"id":"FS1-A-F-05","order":5,"module":"FS1","sub":"FS1_A","type":"choice","weight":1.3,"direction":"positive","text":"你上一次被陌生人主动要联系方式或者表白，大概是什么时候？","options":[{"key":"A","text":"好几年前了，记不太清","sub":"低频","score":25},{"key":"B","text":"一两年以内","sub":"中低频","score":50},{"key":"C","text":"半年以内","sub":"中高频","score":70},{"key":"D","text":"最近三个月内就有","sub":"高频，吸引力持续有效","score":90}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-A-F-06', 6, 'FS1', 'slider', 1.0, 'positive', '你对自己目前外形状态的满意程度是多少？', '{"slider":{"min":0,"max":100,"min_label":"很不满意，觉得自己还差很多","max_label":"非常满意，觉得自己状态很好","feedback":[{"range":[0,30],"text":"你对自己的外形有明确的不满意点，这说明你有感知，也有提升空间"},{"range":[31,50],"text":"你觉得自己还不在最好的状态，还在努力中"},{"range":[51,70],"text":"基本满意，偶尔觉得可以更好"},{"range":[71,85],"text":"整体满意，状态稳定"},{"range":[86,100],"text":"你对自己的外形状态很自信"}]},"source_question":{"id":"FS1-A-F-06","order":6,"module":"FS1","sub":"FS1_A","type":"slider","weight":1.0,"direction":"positive","text":"你对自己目前外形状态的满意程度是多少？","slider":{"min":0,"max":100,"min_label":"很不满意，觉得自己还差很多","max_label":"非常满意，觉得自己状态很好","feedback":[{"range":[0,30],"text":"你对自己的外形有明确的不满意点，这说明你有感知，也有提升空间"},{"range":[31,50],"text":"你觉得自己还不在最好的状态，还在努力中"},{"range":[51,70],"text":"基本满意，偶尔觉得可以更好"},{"range":[71,85],"text":"整体满意，状态稳定"},{"range":[86,100],"text":"你对自己的外形状态很自信"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-B-F-07', 7, 'FS1', 'scenario', 1.5, 'positive', '你走进一家咖啡馆找朋友，朋友还没到，你一个人在那儿等。这时候店里还有几桌陌生人。通常会发生什么？', '{"scene":"独自等待的公共场合","options":[{"key":"A","text":"我找个角落坐下，尽量不引人注意","sub":"存在感主动收敛","score":25},{"key":"B","text":"坐下来刷手机，没注意周围","sub":"中性，无特别存在感信号","score":45},{"key":"C","text":"偶尔会感觉到有人看了我一眼，但不确定","sub":"有一定存在感","score":70},{"key":"D","text":"我进去的时候，通常会有人抬头看","sub":"自然存在感强","score":90}],"source_question":{"id":"FS1-B-F-07","order":7,"module":"FS1","sub":"FS1_B","type":"scenario","weight":1.5,"direction":"positive","text":"你走进一家咖啡馆找朋友，朋友还没到，你一个人在那儿等。这时候店里还有几桌陌生人。通常会发生什么？","scene":"独自等待的公共场合","options":[{"key":"A","text":"我找个角落坐下，尽量不引人注意","sub":"存在感主动收敛","score":25},{"key":"B","text":"坐下来刷手机，没注意周围","sub":"中性，无特别存在感信号","score":45},{"key":"C","text":"偶尔会感觉到有人看了我一眼，但不确定","sub":"有一定存在感","score":70},{"key":"D","text":"我进去的时候，通常会有人抬头看","sub":"自然存在感强","score":90}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-B-F-08', 8, 'FS1', 'slider', 1.2, 'positive', '在你的朋友圈里，你觉得自己的颜值排名大概在哪里？', '{"slider":{"min":0,"max":100,"min_label":"我是朋友里比较普通的那个","max_label":"我是朋友里明显好看的那个","feedback":[{"range":[0,30],"text":"你在朋友圈里不以外形见长，其他特质更突出"},{"range":[31,55],"text":"中等偏下，外形不是你的核心优势"},{"range":[56,70],"text":"中等偏上，朋友里算好看的"},{"range":[71,85],"text":"明显好看，是朋友圈里被认可的"},{"range":[86,100],"text":"你是朋友圈里的颜值担当"}]},"source_question":{"id":"FS1-B-F-08","order":8,"module":"FS1","sub":"FS1_B","type":"slider","weight":1.2,"direction":"positive","text":"在你的朋友圈里，你觉得自己的颜值排名大概在哪里？","slider":{"min":0,"max":100,"min_label":"我是朋友里比较普通的那个","max_label":"我是朋友里明显好看的那个","feedback":[{"range":[0,30],"text":"你在朋友圈里不以外形见长，其他特质更突出"},{"range":[31,55],"text":"中等偏下，外形不是你的核心优势"},{"range":[56,70],"text":"中等偏上，朋友里算好看的"},{"range":[71,85],"text":"明显好看，是朋友圈里被认可的"},{"range":[86,100],"text":"你是朋友圈里的颜值担当"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-B-F-09', 9, 'FS1', 'card', 1.3, 'positive', '你的朋友或者同事，通常怎么形容你的整体气质？选一张最接近的。', '{"options":[{"key":"A","text":"清新自然，看着舒服","sub":"亲和气质型","score":65},{"key":"B","text":"有点神秘，不太好猜","sub":"神秘感型","score":70},{"key":"C","text":"很有存在感，进来就注意到你","sub":"强存在感型","score":85},{"key":"D","text":"普通，但相处久了觉得你好看","sub":"慢热吸引力型","score":60}],"source_question":{"id":"FS1-B-F-09","order":9,"module":"FS1","sub":"FS1_B","type":"card","weight":1.3,"direction":"positive","text":"你的朋友或者同事，通常怎么形容你的整体气质？选一张最接近的。","options":[{"key":"A","text":"清新自然，看着舒服","sub":"亲和气质型","score":65},{"key":"B","text":"有点神秘，不太好猜","sub":"神秘感型","score":70},{"key":"C","text":"很有存在感，进来就注意到你","sub":"强存在感型","score":85},{"key":"D","text":"普通，但相处久了觉得你好看","sub":"慢热吸引力型","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-B-F-10', 10, 'FS1', 'binary', 1.0, 'positive', '你发的自拍或者照片，朋友们的反应通常是？', '{"options":[{"key":"left","text":"夸的人挺多的，经常有人说好看","sub":"外形认可度高","score":80},{"key":"right","text":"朋友不怎么评论外形，更多聊内容","sub":"外形认可度中等，内容感更强","score":55}],"source_question":{"id":"FS1-B-F-10","order":10,"module":"FS1","sub":"FS1_B","type":"binary","weight":1.0,"direction":"positive","text":"你发的自拍或者照片，朋友们的反应通常是？","options":[{"key":"left","text":"夸的人挺多的，经常有人说好看","sub":"外形认可度高","score":80},{"key":"right","text":"朋友不怎么评论外形，更多聊内容","sub":"外形认可度中等，内容感更强","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-B-F-11', 11, 'FS1', 'choice', 1.2, 'positive', '你拍照出来的效果，跟你真人相比？', '{"options":[{"key":"A","text":"拍出来比真人好看很多，镜头很喜欢我","sub":"真人可能略低于照片预期","score":60},{"key":"B","text":"差不多，照片和真人相符","sub":"一致性高，预期稳定","score":70},{"key":"C","text":"真人比照片好看，见到真人会惊喜","sub":"真人加分项，线下吸引力更强","score":85},{"key":"D","text":"看情况，有时候照片好，有时候真人好","sub":"不稳定，状态依赖型","score":55}],"source_question":{"id":"FS1-B-F-11","order":11,"module":"FS1","sub":"FS1_B","type":"choice","weight":1.2,"direction":"positive","text":"你拍照出来的效果，跟你真人相比？","options":[{"key":"A","text":"拍出来比真人好看很多，镜头很喜欢我","sub":"真人可能略低于照片预期","score":60},{"key":"B","text":"差不多，照片和真人相符","sub":"一致性高，预期稳定","score":70},{"key":"C","text":"真人比照片好看，见到真人会惊喜","sub":"真人加分项，线下吸引力更强","score":85},{"key":"D","text":"看情况，有时候照片好，有时候真人好","sub":"不稳定，状态依赖型","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-B-F-12', 12, 'FS1', 'scale', 1.3, 'positive', '我走在路上或者在公共场合，会感觉到有人注意我。', '{"scale":{"min":1,"max":5,"min_label":"几乎从来没有","max_label":"经常会感觉到"},"source_question":{"id":"FS1-B-F-12","order":12,"module":"FS1","sub":"FS1_B","type":"scale","weight":1.3,"direction":"positive","text":"我走在路上或者在公共场合，会感觉到有人注意我。","scale":{"min":1,"max":5,"min_label":"几乎从来没有","max_label":"经常会感觉到"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-C-F-13', 13, 'FS1', 'scenario', 1.5, 'positive', '你跟一个男生约会了三次。第一次他很主动，第二次也还好，但第三次开始你感觉他没有最开始那么热情了。你觉得这种情况最可能的原因是？', '{"scene":"约会热度下降的判断","options":[{"key":"A","text":"他可能对我失去兴趣了，我也没想太多","sub":"吸引力自评偏低，归因外部","score":30},{"key":"B","text":"他可能只是最近有事，我的吸引力应该没问题","sub":"自我认知稳定","score":65},{"key":"C","text":"我感觉我们相处久了我反而更有意思了，可能是他不懂欣赏","sub":"慢热吸引力自信","score":80},{"key":"D","text":"约会第三次热度降一点挺正常的，不一定说明什么","sub":"理性认知，不过度解读","score":70}],"source_question":{"id":"FS1-C-F-13","order":13,"module":"FS1","sub":"FS1_C","type":"scenario","weight":1.5,"direction":"positive","text":"你跟一个男生约会了三次。第一次他很主动，第二次也还好，但第三次开始你感觉他没有最开始那么热情了。你觉得这种情况最可能的原因是？","scene":"约会热度下降的判断","options":[{"key":"A","text":"他可能对我失去兴趣了，我也没想太多","sub":"吸引力自评偏低，归因外部","score":30},{"key":"B","text":"他可能只是最近有事，我的吸引力应该没问题","sub":"自我认知稳定","score":65},{"key":"C","text":"我感觉我们相处久了我反而更有意思了，可能是他不懂欣赏","sub":"慢热吸引力自信","score":80},{"key":"D","text":"约会第三次热度降一点挺正常的，不一定说明什么","sub":"理性认知，不过度解读","score":70}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-C-F-14', 14, 'FS1', 'slider', 1.2, 'positive', '你觉得自己的吸引力，是「第一眼型」还是「越处越好看型」？', '{"slider":{"min":0,"max":100,"min_label":"完全是第一眼型，初见最惊艳","max_label":"完全是越处越好看型，相处才出来","feedback":[{"range":[0,25],"text":"你的吸引力在第一印象最强，需要主动创造相处机会来维持"},{"range":[26,45],"text":"偏第一眼，但相处也有加分"},{"range":[46,60],"text":"两者都有，比较平衡"},{"range":[61,80],"text":"偏慢热，了解后吸引力上升"},{"range":[81,100],"text":"典型慢热型，第一眼可能平平，深处有惊喜"}]},"source_question":{"id":"FS1-C-F-14","order":14,"module":"FS1","sub":"FS1_C","type":"slider","weight":1.2,"direction":"positive","text":"你觉得自己的吸引力，是「第一眼型」还是「越处越好看型」？","slider":{"min":0,"max":100,"min_label":"完全是第一眼型，初见最惊艳","max_label":"完全是越处越好看型，相处才出来","feedback":[{"range":[0,25],"text":"你的吸引力在第一印象最强，需要主动创造相处机会来维持"},{"range":[26,45],"text":"偏第一眼，但相处也有加分"},{"range":[46,60],"text":"两者都有，比较平衡"},{"range":[61,80],"text":"偏慢热，了解后吸引力上升"},{"range":[81,100],"text":"典型慢热型，第一眼可能平平，深处有惊喜"}]},"scoring":{"method":"slow_heat_mapping","note":"两端各有优势，映射到FS1_C慢热系数"}}}'::jsonb, '{"method":"slow_heat_mapping","note":"两端各有优势，映射到FS1_C慢热系数"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-C-F-15', 15, 'FS1', 'choice', 1.3, 'positive', '跟你相处过一段时间的男生，通常会怎么评价你？', '{"options":[{"key":"A","text":"「跟你在一起很舒服，就是有时候不知道你在想什么」","sub":"安全感强，神秘感存在","score":70},{"key":"B","text":"「你这个人太有意思了，老是有新东西」","sub":"新鲜感持续输出型","score":85},{"key":"C","text":"「跟你在一起很开心，但感觉你不怎么需要我」","sub":"独立性强，情感粘性待提升","score":65},{"key":"D","text":"「我觉得你很好，就是刚开始还好，后来好像慢慢有点了解了」","sub":"新鲜感存续力中等","score":55}],"source_question":{"id":"FS1-C-F-15","order":15,"module":"FS1","sub":"FS1_C","type":"choice","weight":1.3,"direction":"positive","text":"跟你相处过一段时间的男生，通常会怎么评价你？","options":[{"key":"A","text":"「跟你在一起很舒服，就是有时候不知道你在想什么」","sub":"安全感强，神秘感存在","score":70},{"key":"B","text":"「你这个人太有意思了，老是有新东西」","sub":"新鲜感持续输出型","score":85},{"key":"C","text":"「跟你在一起很开心，但感觉你不怎么需要我」","sub":"独立性强，情感粘性待提升","score":65},{"key":"D","text":"「我觉得你很好，就是刚开始还好，后来好像慢慢有点了解了」","sub":"新鲜感存续力中等","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-C-F-16', 16, 'FS1', 'binary', 1.5, 'positive', '你跟一个人相处越久，你觉得自己对他的吸引力会？', '{"options":[{"key":"left","text":"越来越强，了解我才知道我好","sub":"慢热升值型","score":80},{"key":"right","text":"一开始最强，后来慢慢正常化","sub":"初始冲击型","score":60}],"source_question":{"id":"FS1-C-F-16","order":16,"module":"FS1","sub":"FS1_C","type":"binary","weight":1.5,"direction":"positive","text":"你跟一个人相处越久，你觉得自己对他的吸引力会？","options":[{"key":"left","text":"越来越强，了解我才知道我好","sub":"慢热升值型","score":80},{"key":"right","text":"一开始最强，后来慢慢正常化","sub":"初始冲击型","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-C-F-17', 17, 'FS1', 'mood', 1.0, 'positive', '你发了一条没有特别用心拍的日常照片到朋友圈，收到的反应通常让你感觉？', '{"options":[{"key":"A","icon":"ti-mood-happy","text":"挺多人点赞，正常","score":70},{"key":"B","icon":"ti-mood-smile","text":"有几个人说好看，挺开心的","score":65},{"key":"C","icon":"ti-mood-confuzed","text":"反应一般，没什么特别","score":45},{"key":"D","icon":"ti-mood-sad","text":"感觉没人在意","score":25},{"key":"E","icon":"ti-mood-suprised","text":"经常有人专门来说「你好看」","score":90},{"key":"F","icon":"ti-mood-nervous","text":"我很少发日常照，不确定","score":50},{"key":"G","icon":"ti-mood-tongue","text":"我不太在意这个","score":60},{"key":"H","icon":"ti-mood-empty","text":"基本上就是朋友互动，没有外形评价","score":55}],"source_question":{"id":"FS1-C-F-17","order":17,"module":"FS1","sub":"FS1_C","type":"mood","weight":1.0,"direction":"positive","text":"你发了一条没有特别用心拍的日常照片到朋友圈，收到的反应通常让你感觉？","options":[{"key":"A","icon":"ti-mood-happy","text":"挺多人点赞，正常","score":70},{"key":"B","icon":"ti-mood-smile","text":"有几个人说好看，挺开心的","score":65},{"key":"C","icon":"ti-mood-confuzed","text":"反应一般，没什么特别","score":45},{"key":"D","icon":"ti-mood-sad","text":"感觉没人在意","score":25},{"key":"E","icon":"ti-mood-suprised","text":"经常有人专门来说「你好看」","score":90},{"key":"F","icon":"ti-mood-nervous","text":"我很少发日常照，不确定","score":50},{"key":"G","icon":"ti-mood-tongue","text":"我不太在意这个","score":60},{"key":"H","icon":"ti-mood-empty","text":"基本上就是朋友互动，没有外形评价","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS1-C-F-18', 18, 'FS1', 'scale', 1.2, 'positive', '我觉得自己在关系里，越相处越有吸引力，而不是越处越平淡。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"FS1-C-F-18","order":18,"module":"FS1","sub":"FS1_C","type":"scale","weight":1.2,"direction":"positive","text":"我觉得自己在关系里，越相处越有吸引力，而不是越处越平淡。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-A-F-19', 19, 'FS2', 'scenario', 1.5, 'positive', '你男朋友今天工作上遇到了很糟糕的事，回家之后一句话不说，坐在那里发呆。你的第一反应是？', '{"scene":"对方情绪低落时的应对","options":[{"key":"A","text":"走过去坐在他旁边，不说话，陪着他","sub":"情绪容纳型，高情感价值","score":90},{"key":"B","text":"问他怎么了，发生什么事了","sub":"主动关心型，略偏解决导向","score":70},{"key":"C","text":"给他倒杯水或者做点吃的，用行动表达","sub":"行动型情感支持","score":80},{"key":"D","text":"等他自己缓过来，不打扰他","sub":"边界尊重型，但情感主动性低","score":55}],"source_question":{"id":"FS2-A-F-19","order":19,"module":"FS2","sub":"FS2_A","type":"scenario","weight":1.5,"direction":"positive","text":"你男朋友今天工作上遇到了很糟糕的事，回家之后一句话不说，坐在那里发呆。你的第一反应是？","scene":"对方情绪低落时的应对","options":[{"key":"A","text":"走过去坐在他旁边，不说话，陪着他","sub":"情绪容纳型，高情感价值","score":90},{"key":"B","text":"问他怎么了，发生什么事了","sub":"主动关心型，略偏解决导向","score":70},{"key":"C","text":"给他倒杯水或者做点吃的，用行动表达","sub":"行动型情感支持","score":80},{"key":"D","text":"等他自己缓过来，不打扰他","sub":"边界尊重型，但情感主动性低","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-A-F-20', 20, 'FS2', 'mood', 1.2, 'positive', '你跟对方分享了一件让你很难受的事，他回应了一句「你想多了，没事的」。你的感受是？', '{"options":[{"key":"A","icon":"ti-mood-angry","text":"有点生气，这种回答根本没用","score":60},{"key":"B","icon":"ti-mood-sad","text":"有点失落，感觉他不理解我","score":65},{"key":"C","icon":"ti-mood-confuzed","text":"一时不知道怎么反应","score":55},{"key":"D","icon":"ti-mood-smile","text":"没关系，他不擅长这个，我理解","score":85},{"key":"E","icon":"ti-mood-nervous","text":"开始怀疑他是不是不在乎我","score":40},{"key":"F","icon":"ti-mood-empty","text":"算了，下次不说了","score":45},{"key":"G","icon":"ti-mood-tongue","text":"跟他说这种话本来就是错误","score":70},{"key":"H","icon":"ti-mood-happy","text":"其实他说得也对，我真的想多了","score":80}],"source_question":{"id":"FS2-A-F-20","order":20,"module":"FS2","sub":"FS2_A","type":"mood","weight":1.2,"direction":"positive","text":"你跟对方分享了一件让你很难受的事，他回应了一句「你想多了，没事的」。你的感受是？","options":[{"key":"A","icon":"ti-mood-angry","text":"有点生气，这种回答根本没用","score":60},{"key":"B","icon":"ti-mood-sad","text":"有点失落，感觉他不理解我","score":65},{"key":"C","icon":"ti-mood-confuzed","text":"一时不知道怎么反应","score":55},{"key":"D","icon":"ti-mood-smile","text":"没关系，他不擅长这个，我理解","score":85},{"key":"E","icon":"ti-mood-nervous","text":"开始怀疑他是不是不在乎我","score":40},{"key":"F","icon":"ti-mood-empty","text":"算了，下次不说了","score":45},{"key":"G","icon":"ti-mood-tongue","text":"跟他说这种话本来就是错误","score":70},{"key":"H","icon":"ti-mood-happy","text":"其实他说得也对，我真的想多了","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-A-F-21', 21, 'FS2', 'scale', 1.3, 'positive', '当对方情绪低落时，我通常能感知到，并且知道用什么方式让他感觉好一点。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"FS2-A-F-21","order":21,"module":"FS2","sub":"FS2_A","type":"scale","weight":1.3,"direction":"positive","text":"当对方情绪低落时，我通常能感知到，并且知道用什么方式让他感觉好一点。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-A-F-22', 22, 'FS2', 'binary', 1.5, 'positive', '对方跟你倾诉一件烦心事，你的本能反应更接近？', '{"options":[{"key":"left","text":"先听完，给他一个感受被理解的空间","sub":"情感接收型","score":85},{"key":"right","text":"边听边想，帮他分析问题在哪里","sub":"解决导向型","score":60}],"source_question":{"id":"FS2-A-F-22","order":22,"module":"FS2","sub":"FS2_A","type":"binary","weight":1.5,"direction":"positive","text":"对方跟你倾诉一件烦心事，你的本能反应更接近？","options":[{"key":"left","text":"先听完，给他一个感受被理解的空间","sub":"情感接收型","score":85},{"key":"right","text":"边听边想，帮他分析问题在哪里","sub":"解决导向型","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-A-F-23', 23, 'FS2', 'choice', 1.3, 'positive', '你在关系里，通常扮演什么角色？', '{"options":[{"key":"A","text":"那个给情绪价值的人，他有什么事都喜欢跟我说","sub":"高情感供给","score":85},{"key":"B","text":"比较平衡，互相给，互相接","sub":"健康互动型","score":80},{"key":"C","text":"我也需要被照顾，我不太擅长一直输出","sub":"情感供给有限","score":50},{"key":"D","text":"看人，有些人我给得多，有些人我没什么感觉","sub":"情感选择性供给","score":65}],"source_question":{"id":"FS2-A-F-23","order":23,"module":"FS2","sub":"FS2_A","type":"choice","weight":1.3,"direction":"positive","text":"你在关系里，通常扮演什么角色？","options":[{"key":"A","text":"那个给情绪价值的人，他有什么事都喜欢跟我说","sub":"高情感供给","score":85},{"key":"B","text":"比较平衡，互相给，互相接","sub":"健康互动型","score":80},{"key":"C","text":"我也需要被照顾，我不太擅长一直输出","sub":"情感供给有限","score":50},{"key":"D","text":"看人，有些人我给得多，有些人我没什么感觉","sub":"情感选择性供给","score":65}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-A-F-24', 24, 'FS2', 'scenario', 1.2, 'positive', '你们异地，他今晚发消息说很想你，但你今天也很累，真的不想打电话。你通常会怎么做？', '{"scene":"异地情感需求与个人状态冲突","options":[{"key":"A","text":"跟他说我今天太累了，明天补，然后发个晚安","sub":"直接表达，有边界","score":65},{"key":"B","text":"撑着跟他打了，累是累但他需要我","sub":"高情感供给，但可能过度消耗","score":70},{"key":"C","text":"发几条消息回应他，没有打电话","sub":"折中，维持连接","score":60},{"key":"D","text":"跟他说今天状态不好，但给他发了段语音","sub":"有情感温度，找到平衡","score":85}],"source_question":{"id":"FS2-A-F-24","order":24,"module":"FS2","sub":"FS2_A","type":"scenario","weight":1.2,"direction":"positive","text":"你们异地，他今晚发消息说很想你，但你今天也很累，真的不想打电话。你通常会怎么做？","scene":"异地情感需求与个人状态冲突","options":[{"key":"A","text":"跟他说我今天太累了，明天补，然后发个晚安","sub":"直接表达，有边界","score":65},{"key":"B","text":"撑着跟他打了，累是累但他需要我","sub":"高情感供给，但可能过度消耗","score":70},{"key":"C","text":"发几条消息回应他，没有打电话","sub":"折中，维持连接","score":60},{"key":"D","text":"跟他说今天状态不好，但给他发了段语音","sub":"有情感温度，找到平衡","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-B-F-25', 25, 'FS2', 'scenario', 1.3, 'positive', '你和他约会，饭吃完了，还不想回去。通常接下来你们会怎么办？', '{"scene":"约会续集安排","options":[{"key":"A","text":"我会提议去哪里，他一般都跟着","sub":"主导型，趣味输出强","score":80},{"key":"B","text":"我们会聊着聊着自然想到去哪里","sub":"互动自然，双向趣味","score":85},{"key":"C","text":"他来决定，我跟着就好","sub":"被动型，趣味输出低","score":50},{"key":"D","text":"通常就各自回家了，没有特别的续集","sub":"话题和互动密度偏低","score":40}],"source_question":{"id":"FS2-B-F-25","order":25,"module":"FS2","sub":"FS2_B","type":"scenario","weight":1.3,"direction":"positive","text":"你和他约会，饭吃完了，还不想回去。通常接下来你们会怎么办？","scene":"约会续集安排","options":[{"key":"A","text":"我会提议去哪里，他一般都跟着","sub":"主导型，趣味输出强","score":80},{"key":"B","text":"我们会聊着聊着自然想到去哪里","sub":"互动自然，双向趣味","score":85},{"key":"C","text":"他来决定，我跟着就好","sub":"被动型，趣味输出低","score":50},{"key":"D","text":"通常就各自回家了，没有特别的续集","sub":"话题和互动密度偏低","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-B-F-26', 26, 'FS2', 'choice', 1.3, 'positive', '你跟喜欢的人聊天，通常是什么状态？', '{"options":[{"key":"A","text":"我话比较多，能聊很多东西，他经常说跟我聊天不无聊","sub":"高话题输出","score":80},{"key":"B","text":"双方都挺有话说，很自然","sub":"均衡互动","score":85},{"key":"C","text":"我不太擅长主动找话题，更多是接话","sub":"被动聊天型","score":45},{"key":"D","text":"看对方，遇到聊得来的我话很多，遇不到就很安静","sub":"选择性输出","score":65}],"source_question":{"id":"FS2-B-F-26","order":26,"module":"FS2","sub":"FS2_B","type":"choice","weight":1.3,"direction":"positive","text":"你跟喜欢的人聊天，通常是什么状态？","options":[{"key":"A","text":"我话比较多，能聊很多东西，他经常说跟我聊天不无聊","sub":"高话题输出","score":80},{"key":"B","text":"双方都挺有话说，很自然","sub":"均衡互动","score":85},{"key":"C","text":"我不太擅长主动找话题，更多是接话","sub":"被动聊天型","score":45},{"key":"D","text":"看对方，遇到聊得来的我话很多，遇不到就很安静","sub":"选择性输出","score":65}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-B-F-27', 27, 'FS2', 'slider', 1.2, 'positive', '你觉得跟你在一起，对方会觉得有意思的程度是多少？', '{"slider":{"min":0,"max":100,"min_label":"我可能比较无聊，没什么特别","max_label":"跟我在一起很有意思，不无聊","feedback":[{"range":[0,30],"text":"你可能需要发展一些让对方感到有趣的话题或者兴趣点"},{"range":[31,55],"text":"中等，有的时候有趣，有的时候比较平"},{"range":[56,75],"text":"整体有趣，对方跟你在一起体验不错"},{"range":[76,100],"text":"你是那种让人觉得跟你在一起不会无聊的人"}]},"source_question":{"id":"FS2-B-F-27","order":27,"module":"FS2","sub":"FS2_B","type":"slider","weight":1.2,"direction":"positive","text":"你觉得跟你在一起，对方会觉得有意思的程度是多少？","slider":{"min":0,"max":100,"min_label":"我可能比较无聊，没什么特别","max_label":"跟我在一起很有意思，不无聊","feedback":[{"range":[0,30],"text":"你可能需要发展一些让对方感到有趣的话题或者兴趣点"},{"range":[31,55],"text":"中等，有的时候有趣，有的时候比较平"},{"range":[56,75],"text":"整体有趣，对方跟你在一起体验不错"},{"range":[76,100],"text":"你是那种让人觉得跟你在一起不会无聊的人"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-B-F-28', 28, 'FS2', 'binary', 1.0, 'positive', '你在关系里，更多是？', '{"options":[{"key":"left","text":"制造惊喜和新鲜感的那个","sub":"主动趣味输出","score":75},{"key":"right","text":"稳定舒适、让他放松的那个","sub":"安全感输出型","score":80}],"source_question":{"id":"FS2-B-F-28","order":28,"module":"FS2","sub":"FS2_B","type":"binary","weight":1.0,"direction":"positive","text":"你在关系里，更多是？","options":[{"key":"left","text":"制造惊喜和新鲜感的那个","sub":"主动趣味输出","score":75},{"key":"right","text":"稳定舒适、让他放松的那个","sub":"安全感输出型","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-B-F-29', 29, 'FS2', 'rank', 1.2, 'positive', '在你看来，让一段关系保持新鲜感，最重要的是什么？从最重要到最不重要排序。', '{"items":[{"id":"a","text":"我本身就很有趣，有自己的生活和想法"},{"id":"b","text":"经常一起做新鲜的事情"},{"id":"c","text":"保持适当的神秘感，不把自己全部摊开"},{"id":"d","text":"对方足够好奇，愿意持续了解我"}],"source_question":{"id":"FS2-B-F-29","order":29,"module":"FS2","sub":"FS2_B","type":"rank","weight":1.2,"direction":"positive","text":"在你看来，让一段关系保持新鲜感，最重要的是什么？从最重要到最不重要排序。","items":[{"id":"a","text":"我本身就很有趣，有自己的生活和想法"},{"id":"b","text":"经常一起做新鲜的事情"},{"id":"c","text":"保持适当的神秘感，不把自己全部摊开"},{"id":"d","text":"对方足够好奇，愿意持续了解我"}],"scoring":{"method":"rank_self_awareness","note":"a排第一=自身趣味性强=高分；d排第一=依赖对方=偏低分","score_map":{"a_first":85,"b_first":75,"c_first":70,"d_first":50}}}}'::jsonb, '{"method":"rank_self_awareness","note":"a排第一=自身趣味性强=高分；d排第一=依赖对方=偏低分","score_map":{"a_first":85,"b_first":75,"c_first":70,"d_first":50}}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-C-F-30', 30, 'FS2', 'scenario', 1.5, 'positive', '你们在一起六个月了，最近他朋友问他「你女朋友有什么特别的地方」。你觉得他最可能说的是？', '{"scene":"被问及你的特别之处","options":[{"key":"A","text":"「跟她在一起很舒服，说不清楚，就是不想离开」","sub":"高情感粘性，被需要感强","score":90},{"key":"B","text":"「她很好看/很温柔/很体贴」——具体某一个特质","sub":"有明确辨识点","score":75},{"key":"C","text":"「她挺好的」——然后说不下去了","sub":"存在感和差异化不够明显","score":40},{"key":"D","text":"「她对我很好，我们相处不错」","sub":"关系质量好但独特性待提升","score":65}],"source_question":{"id":"FS2-C-F-30","order":30,"module":"FS2","sub":"FS2_C","type":"scenario","weight":1.5,"direction":"positive","text":"你们在一起六个月了，最近他朋友问他「你女朋友有什么特别的地方」。你觉得他最可能说的是？","scene":"被问及你的特别之处","options":[{"key":"A","text":"「跟她在一起很舒服，说不清楚，就是不想离开」","sub":"高情感粘性，被需要感强","score":90},{"key":"B","text":"「她很好看/很温柔/很体贴」——具体某一个特质","sub":"有明确辨识点","score":75},{"key":"C","text":"「她挺好的」——然后说不下去了","sub":"存在感和差异化不够明显","score":40},{"key":"D","text":"「她对我很好，我们相处不错」","sub":"关系质量好但独特性待提升","score":65}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-C-F-31', 31, 'FS2', 'binary', 1.5, 'positive', '你觉得如果你们分开，他会？', '{"options":[{"key":"left","text":"很难找到像我这样的，会想起我很久","sub":"不可替代感强","score":85},{"key":"right","text":"慢慢会好，我不确定我有多难被替代","sub":"替代性评估中等","score":50}],"source_question":{"id":"FS2-C-F-31","order":31,"module":"FS2","sub":"FS2_C","type":"binary","weight":1.5,"direction":"positive","text":"你觉得如果你们分开，他会？","options":[{"key":"left","text":"很难找到像我这样的，会想起我很久","sub":"不可替代感强","score":85},{"key":"right","text":"慢慢会好，我不确定我有多难被替代","sub":"替代性评估中等","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-C-F-32', 32, 'FS2', 'choice', 1.3, 'positive', '在一段关系里，对方通常更需要你，还是你更需要对方？', '{"options":[{"key":"A","text":"他更需要我，他依赖我多一些","sub":"被需要感强","score":85},{"key":"B","text":"差不多，互相需要","sub":"均衡型","score":75},{"key":"C","text":"我需要他多一些，我比较黏","sub":"被需要感弱，依赖倾向","score":40},{"key":"D","text":"看阶段，不同时期不一样","sub":"动态型","score":65}],"source_question":{"id":"FS2-C-F-32","order":32,"module":"FS2","sub":"FS2_C","type":"choice","weight":1.3,"direction":"positive","text":"在一段关系里，对方通常更需要你，还是你更需要对方？","options":[{"key":"A","text":"他更需要我，他依赖我多一些","sub":"被需要感强","score":85},{"key":"B","text":"差不多，互相需要","sub":"均衡型","score":75},{"key":"C","text":"我需要他多一些，我比较黏","sub":"被需要感弱，依赖倾向","score":40},{"key":"D","text":"看阶段，不同时期不一样","sub":"动态型","score":65}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-C-F-33', 33, 'FS2', 'scale', 1.2, 'positive', '在关系里，我有自己的价值和位置，不容易被替代。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"FS2-C-F-33","order":33,"module":"FS2","sub":"FS2_C","type":"scale","weight":1.2,"direction":"positive","text":"在关系里，我有自己的价值和位置，不容易被替代。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS2-C-F-34', 34, 'FS2', 'slider', 1.0, 'positive', '你觉得在你经历过的关系里，对方对你的依赖程度有多深？', '{"slider":{"min":0,"max":100,"min_label":"他们很独立，不太需要我","max_label":"对方非常依赖我，我在他生活里很重要","feedback":[{"range":[0,25],"text":"你在关系里的存在感可能偏弱，或者你遇到的都是非常独立的人"},{"range":[26,50],"text":"中等依赖，正常范围"},{"range":[51,75],"text":"你在对方生活里有重要位置"},{"range":[76,100],"text":"你制造被需要感的能力很强"}]},"source_question":{"id":"FS2-C-F-34","order":34,"module":"FS2","sub":"FS2_C","type":"slider","weight":1.0,"direction":"positive","text":"你觉得在你经历过的关系里，对方对你的依赖程度有多深？","slider":{"min":0,"max":100,"min_label":"他们很独立，不太需要我","max_label":"对方非常依赖我，我在他生活里很重要","feedback":[{"range":[0,25],"text":"你在关系里的存在感可能偏弱，或者你遇到的都是非常独立的人"},{"range":[26,50],"text":"中等依赖，正常范围"},{"range":[51,75],"text":"你在对方生活里有重要位置"},{"range":[76,100],"text":"你制造被需要感的能力很强"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-A-F-35', 35, 'FS3', 'choice', 1.5, 'positive', '你目前的经济状态，最接近哪种描述？', '{"options":[{"key":"A","text":"有稳定工作，收入能覆盖自己的生活，还有余钱可以存或者花","sub":"经济独立","score":70},{"key":"B","text":"有收入，但不多，基本够用，偶尔需要家里补贴","sub":"半独立","score":50},{"key":"C","text":"主要靠家里，自己收入很少或者没有","sub":"依赖型","score":25},{"key":"D","text":"我收入很好，明显高于同龄人平均水平","sub":"高度独立，资源强","score":90}],"source_question":{"id":"FS3-A-F-35","order":35,"module":"FS3","sub":"FS3_A","type":"choice","weight":1.5,"direction":"positive","text":"你目前的经济状态，最接近哪种描述？","options":[{"key":"A","text":"有稳定工作，收入能覆盖自己的生活，还有余钱可以存或者花","sub":"经济独立","score":70},{"key":"B","text":"有收入，但不多，基本够用，偶尔需要家里补贴","sub":"半独立","score":50},{"key":"C","text":"主要靠家里，自己收入很少或者没有","sub":"依赖型","score":25},{"key":"D","text":"我收入很好，明显高于同龄人平均水平","sub":"高度独立，资源强","score":90}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-A-F-36', 36, 'FS3', 'binary', 1.5, 'positive', '如果你们分手，你的生活质量会？', '{"options":[{"key":"left","text":"基本不受影响，我自己过得很好","sub":"经济完全独立","score":85},{"key":"right","text":"会有一些影响，我有一部分依赖对方","sub":"有一定经济依赖","score":45}],"source_question":{"id":"FS3-A-F-36","order":36,"module":"FS3","sub":"FS3_A","type":"binary","weight":1.5,"direction":"positive","text":"如果你们分手，你的生活质量会？","options":[{"key":"left","text":"基本不受影响，我自己过得很好","sub":"经济完全独立","score":85},{"key":"right","text":"会有一些影响，我有一部分依赖对方","sub":"有一定经济依赖","score":45}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-A-F-37', 37, 'FS3', 'scale', 1.3, 'positive', '我不需要靠对方的收入或者资源来维持我想要的生活方式。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"FS3-A-F-37","order":37,"module":"FS3","sub":"FS3_A","type":"scale","weight":1.3,"direction":"positive","text":"我不需要靠对方的收入或者资源来维持我想要的生活方式。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-A-F-38', 38, 'FS3', 'choice', 1.0, 'positive', '你的最高学历是？', '{"note":"学历作为修正系数，结合职业和收入综合判断，不单独显示在结果里。","options":[{"key":"A","text":"高中/中专及以下","score":30},{"key":"B","text":"大专","score":45},{"key":"C","text":"本科","score":65},{"key":"D","text":"硕士研究生","score":80},{"key":"E","text":"博士及以上","score":90}],"source_question":{"id":"FS3-A-F-38","order":38,"module":"FS3","sub":"FS3_A","type":"choice","weight":1.0,"direction":"positive","text":"你的最高学历是？","note":"学历作为修正系数，结合职业和收入综合判断，不单独显示在结果里。","options":[{"key":"A","text":"高中/中专及以下","score":30},{"key":"B","text":"大专","score":45},{"key":"C","text":"本科","score":65},{"key":"D","text":"硕士研究生","score":80},{"key":"E","text":"博士及以上","score":90}],"scoring":{"method":"modifier","note":"作为FS3_A的修正系数，不直接计分"}}}'::jsonb, '{"method":"modifier","note":"作为FS3_A的修正系数，不直接计分"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-A-F-39', 39, 'FS3', 'scenario', 1.2, 'positive', '你和对方讨论未来的生活规划，他说他希望你可以专注家庭，收入他来负责。你的真实感受是？', '{"scene":"关于经济分工的讨论","options":[{"key":"A","text":"挺好的，我本来就不太在意工作，专心生活挺好","sub":"低经济独立需求","score":35},{"key":"B","text":"可以接受，但我也想保留一份自己的工作","sub":"平衡型","score":65},{"key":"C","text":"不太舒服，我需要有自己的经济来源","sub":"高独立意识","score":80},{"key":"D","text":"完全不接受，我不会放弃工作和经济独立","sub":"强独立型","score":90}],"source_question":{"id":"FS3-A-F-39","order":39,"module":"FS3","sub":"FS3_A","type":"scenario","weight":1.2,"direction":"positive","text":"你和对方讨论未来的生活规划，他说他希望你可以专注家庭，收入他来负责。你的真实感受是？","scene":"关于经济分工的讨论","options":[{"key":"A","text":"挺好的，我本来就不太在意工作，专心生活挺好","sub":"低经济独立需求","score":35},{"key":"B","text":"可以接受，但我也想保留一份自己的工作","sub":"平衡型","score":65},{"key":"C","text":"不太舒服，我需要有自己的经济来源","sub":"高独立意识","score":80},{"key":"D","text":"完全不接受，我不会放弃工作和经济独立","sub":"强独立型","score":90}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-B-F-40', 40, 'FS3', 'card', 1.5, 'positive', '你的原生家庭，在你的感情和生活里，通常扮演什么角色？选最接近的一张。', '{"options":[{"key":"A","text":"后盾——需要的时候支持我，不干涉我的选择","sub":"家庭是净资产","score":85},{"key":"B","text":"存在感不强——基本不管我，我自己做决定","sub":"中性，独立型","score":75},{"key":"C","text":"有时候会有意见——偶尔干预，但总体还好","sub":"轻度干预","score":55},{"key":"D","text":"参与度很高——他们对我的感情有很多想法和要求","sub":"高干预，潜在风险","score":30}],"source_question":{"id":"FS3-B-F-40","order":40,"module":"FS3","sub":"FS3_B","type":"card","weight":1.5,"direction":"positive","text":"你的原生家庭，在你的感情和生活里，通常扮演什么角色？选最接近的一张。","options":[{"key":"A","text":"后盾——需要的时候支持我，不干涉我的选择","sub":"家庭是净资产","score":85},{"key":"B","text":"存在感不强——基本不管我，我自己做决定","sub":"中性，独立型","score":75},{"key":"C","text":"有时候会有意见——偶尔干预，但总体还好","sub":"轻度干预","score":55},{"key":"D","text":"参与度很高——他们对我的感情有很多想法和要求","sub":"高干预，潜在风险","score":30}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-B-F-41', 41, 'FS3', 'binary', 1.3, 'positive', '如果你男朋友和你家人之间有摩擦，你通常会？', '{"options":[{"key":"left","text":"先站在他那边，私下再跟家人沟通","sub":"边界感强，关系优先","score":80},{"key":"right","text":"先照顾家人感受，再跟他解释","sub":"家庭优先，边界待建立","score":50}],"source_question":{"id":"FS3-B-F-41","order":41,"module":"FS3","sub":"FS3_B","type":"binary","weight":1.3,"direction":"positive","text":"如果你男朋友和你家人之间有摩擦，你通常会？","options":[{"key":"left","text":"先站在他那边，私下再跟家人沟通","sub":"边界感强，关系优先","score":80},{"key":"right","text":"先照顾家人感受，再跟他解释","sub":"家庭优先，边界待建立","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-B-F-42', 42, 'FS3', 'choice', 1.5, 'positive', '你家里对你未来伴侣的条件，大概是什么态度？', '{"options":[{"key":"A","text":"基本尊重我的选择，没有太具体的硬性要求","sub":"低干预，低风险","score":85},{"key":"B","text":"有一些期待，比如希望对方工作稳定，但不强求","sub":"轻度期待，可沟通","score":70},{"key":"C","text":"有比较明确的条件要求，比如户籍/职业/收入","sub":"中度干预，需要协调","score":50},{"key":"D","text":"要求比较多，而且很坚持，这是我谈恋爱的压力来源之一","sub":"高干预，显著风险","score":25}],"source_question":{"id":"FS3-B-F-42","order":42,"module":"FS3","sub":"FS3_B","type":"choice","weight":1.5,"direction":"positive","text":"你家里对你未来伴侣的条件，大概是什么态度？","options":[{"key":"A","text":"基本尊重我的选择，没有太具体的硬性要求","sub":"低干预，低风险","score":85},{"key":"B","text":"有一些期待，比如希望对方工作稳定，但不强求","sub":"轻度期待，可沟通","score":70},{"key":"C","text":"有比较明确的条件要求，比如户籍/职业/收入","sub":"中度干预，需要协调","score":50},{"key":"D","text":"要求比较多，而且很坚持，这是我谈恋爱的压力来源之一","sub":"高干预，显著风险","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-B-F-43', 43, 'FS3', 'rank', 1.2, 'positive', '在你看来，家庭背景对一段关系的影响，主要体现在哪里？从影响最大到最小排序。', '{"items":[{"id":"a","text":"家人的态度和支持程度"},{"id":"b","text":"自己的经济和生活背景"},{"id":"c","text":"原生家庭带来的性格和习惯"},{"id":"d","text":"家庭对未来婚育的期待和干预"}],"source_question":{"id":"FS3-B-F-43","order":43,"module":"FS3","sub":"FS3_B","type":"rank","weight":1.2,"direction":"positive","text":"在你看来，家庭背景对一段关系的影响，主要体现在哪里？从影响最大到最小排序。","items":[{"id":"a","text":"家人的态度和支持程度"},{"id":"b","text":"自己的经济和生活背景"},{"id":"c","text":"原生家庭带来的性格和习惯"},{"id":"d","text":"家庭对未来婚育的期待和干预"}],"scoring":{"method":"rank_awareness","note":"d排第一=家庭干预意识强=中高风险信号；c排第一=自我觉察强=正向","score_map":{"a_first":60,"b_first":70,"c_first":80,"d_first":45}}}}'::jsonb, '{"method":"rank_awareness","note":"d排第一=家庭干预意识强=中高风险信号；c排第一=自我觉察强=正向","score_map":{"a_first":60,"b_first":70,"c_first":80,"d_first":45}}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-B-F-44', 44, 'FS3', 'scenario', 1.3, 'positive', '你们谈了半年，他第一次见你父母。你对这件事的预期是？', '{"scene":"男友见家长的预期判断","options":[{"key":"A","text":"应该没问题，我爸妈挺好相处的，不会为难他","sub":"低风险，家庭助力","score":85},{"key":"B","text":"会有点紧张，但应该能过，我爸妈有要求但讲理","sub":"中等，可控","score":65},{"key":"C","text":"我比他更紧张，我爸妈比较难搞，不好说","sub":"中高风险，家庭是挑战","score":40},{"key":"D","text":"我一般不太想让他们见面，见了容易出问题","sub":"高风险，家庭干预大","score":20}],"source_question":{"id":"FS3-B-F-44","order":44,"module":"FS3","sub":"FS3_B","type":"scenario","weight":1.3,"direction":"positive","text":"你们谈了半年，他第一次见你父母。你对这件事的预期是？","scene":"男友见家长的预期判断","options":[{"key":"A","text":"应该没问题，我爸妈挺好相处的，不会为难他","sub":"低风险，家庭助力","score":85},{"key":"B","text":"会有点紧张，但应该能过，我爸妈有要求但讲理","sub":"中等，可控","score":65},{"key":"C","text":"我比他更紧张，我爸妈比较难搞，不好说","sub":"中高风险，家庭是挑战","score":40},{"key":"D","text":"我一般不太想让他们见面，见了容易出问题","sub":"高风险，家庭干预大","score":20}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-C-F-45', 45, 'FS3', 'binary', 1.3, 'positive', '你一个人生活的话，能不能过得很好？', '{"options":[{"key":"left","text":"完全没问题，我很能照顾自己","sub":"高生活自主","score":85},{"key":"right","text":"还好，但有很多事我需要有人帮我","sub":"中等，有依赖点","score":50}],"source_question":{"id":"FS3-C-F-45","order":45,"module":"FS3","sub":"FS3_C","type":"binary","weight":1.3,"direction":"positive","text":"你一个人生活的话，能不能过得很好？","options":[{"key":"left","text":"完全没问题，我很能照顾自己","sub":"高生活自主","score":85},{"key":"right","text":"还好，但有很多事我需要有人帮我","sub":"中等，有依赖点","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-C-F-46', 46, 'FS3', 'choice', 1.2, 'positive', '生活里需要做决定的时候，你通常是？', '{"options":[{"key":"A","text":"自己想清楚就做，很少需要别人帮我拿主意","sub":"高自主","score":85},{"key":"B","text":"会跟身边人商量，但最终自己决定","sub":"中等，参考型","score":75},{"key":"C","text":"比较依赖别人的意见，不太敢一个人做决定","sub":"低自主","score":35},{"key":"D","text":"看事情大小，小事自己决定，大事需要支撑","sub":"分类型，正常","score":70}],"source_question":{"id":"FS3-C-F-46","order":46,"module":"FS3","sub":"FS3_C","type":"choice","weight":1.2,"direction":"positive","text":"生活里需要做决定的时候，你通常是？","options":[{"key":"A","text":"自己想清楚就做，很少需要别人帮我拿主意","sub":"高自主","score":85},{"key":"B","text":"会跟身边人商量，但最终自己决定","sub":"中等，参考型","score":75},{"key":"C","text":"比较依赖别人的意见，不太敢一个人做决定","sub":"低自主","score":35},{"key":"D","text":"看事情大小，小事自己决定，大事需要支撑","sub":"分类型，正常","score":70}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-C-F-47', 47, 'FS3', 'scale', 1.2, 'positive', '我能独立处理生活里大多数事务，不需要依赖对方解决问题。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"FS3-C-F-47","order":47,"module":"FS3","sub":"FS3_C","type":"scale","weight":1.2,"direction":"positive","text":"我能独立处理生活里大多数事务，不需要依赖对方解决问题。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS3-C-F-48', 48, 'FS3', 'slider', 1.3, 'positive', '如果你现在单身，你觉得自己一个人生活的质量是多少分？', '{"slider":{"min":0,"max":100,"min_label":"一个人过得很差，需要有人陪才行","max_label":"一个人也过得很好，不依赖任何人","feedback":[{"range":[0,30],"text":"你对关系的依赖度比较高，一个人状态不太好"},{"range":[31,55],"text":"中等，一个人能过，但不太享受"},{"range":[56,75],"text":"一个人过得还不错，有自己的生活"},{"range":[76,100],"text":"你是那种单身状态依然很好的人，关系对你是锦上添花"}]},"source_question":{"id":"FS3-C-F-48","order":48,"module":"FS3","sub":"FS3_C","type":"slider","weight":1.3,"direction":"positive","text":"如果你现在单身，你觉得自己一个人生活的质量是多少分？","slider":{"min":0,"max":100,"min_label":"一个人过得很差，需要有人陪才行","max_label":"一个人也过得很好，不依赖任何人","feedback":[{"range":[0,30],"text":"你对关系的依赖度比较高，一个人状态不太好"},{"range":[31,55],"text":"中等，一个人能过，但不太享受"},{"range":[56,75],"text":"一个人过得还不错，有自己的生活"},{"range":[76,100],"text":"你是那种单身状态依然很好的人，关系对你是锦上添花"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-A-F-49', 49, 'FS4', 'scenario', 1.5, 'positive', '你男朋友做了一件让你很不舒服的事，但他没有意识到。你通常会？', '{"scene":"边界被越过的处理方式","options":[{"key":"A","text":"直接告诉他，这件事让我不舒服，我希望你注意","sub":"边界清晰，直接表达","score":90},{"key":"B","text":"暗示一下，希望他能自己意识到","sub":"间接表达，边界模糊","score":55},{"key":"C","text":"忍着，不想因为这个闹矛盾","sub":"边界弱，自我压抑","score":30},{"key":"D","text":"先冷处理，看他有没有反应","sub":"被动边界，测试性","score":45}],"source_question":{"id":"FS4-A-F-49","order":49,"module":"FS4","sub":"FS4_A","type":"scenario","weight":1.5,"direction":"positive","text":"你男朋友做了一件让你很不舒服的事，但他没有意识到。你通常会？","scene":"边界被越过的处理方式","options":[{"key":"A","text":"直接告诉他，这件事让我不舒服，我希望你注意","sub":"边界清晰，直接表达","score":90},{"key":"B","text":"暗示一下，希望他能自己意识到","sub":"间接表达，边界模糊","score":55},{"key":"C","text":"忍着，不想因为这个闹矛盾","sub":"边界弱，自我压抑","score":30},{"key":"D","text":"先冷处理，看他有没有反应","sub":"被动边界，测试性","score":45}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-A-F-50', 50, 'FS4', 'binary', 1.5, 'positive', '在关系里，你对自己的底线清不清楚？', '{"options":[{"key":"left","text":"很清楚，我知道什么能接受什么不能","sub":"边界意识强","score":85},{"key":"right","text":"不太确定，有时候自己也说不清楚","sub":"边界模糊","score":40}],"source_question":{"id":"FS4-A-F-50","order":50,"module":"FS4","sub":"FS4_A","type":"binary","weight":1.5,"direction":"positive","text":"在关系里，你对自己的底线清不清楚？","options":[{"key":"left","text":"很清楚，我知道什么能接受什么不能","sub":"边界意识强","score":85},{"key":"right","text":"不太确定，有时候自己也说不清楚","sub":"边界模糊","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-A-F-51', 51, 'FS4', 'choice', 1.3, 'positive', '你在关系里说「没事」的时候，通常是？', '{"options":[{"key":"A","text":"真的没事，我不憋着","sub":"内外一致，边界健康","score":90},{"key":"B","text":"有时候是真没事，有时候是懒得说","sub":"混合型","score":65},{"key":"C","text":"大多数时候是有事但不想说","sub":"内外不一致，压抑型","score":35},{"key":"D","text":"说没事但其实心里记着，等以后一起算","sub":"积压型，高风险","score":20}],"source_question":{"id":"FS4-A-F-51","order":51,"module":"FS4","sub":"FS4_A","type":"choice","weight":1.3,"direction":"positive","text":"你在关系里说「没事」的时候，通常是？","options":[{"key":"A","text":"真的没事，我不憋着","sub":"内外一致，边界健康","score":90},{"key":"B","text":"有时候是真没事，有时候是懒得说","sub":"混合型","score":65},{"key":"C","text":"大多数时候是有事但不想说","sub":"内外不一致，压抑型","score":35},{"key":"D","text":"说没事但其实心里记着，等以后一起算","sub":"积压型，高风险","score":20}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-A-F-52', 52, 'FS4', 'scale', 1.2, 'positive', '我知道自己在感情里要什么，不要什么，而且我能直接说出来。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"FS4-A-F-52","order":52,"module":"FS4","sub":"FS4_A","type":"scale","weight":1.2,"direction":"positive","text":"我知道自己在感情里要什么，不要什么，而且我能直接说出来。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-A-F-53', 53, 'FS4', 'scenario', 1.5, 'positive', '他希望你减少跟某个男性朋友的联系，理由是他不舒服。但那个朋友是你的老朋友，关系很正常。你会？', '{"scene":"社交自主权与关系安全感的冲突","options":[{"key":"A","text":"告诉他我跟那个朋友只是普通朋友，不会改变来往","sub":"边界清晰，自主性强","score":90},{"key":"B","text":"跟他解释清楚，但也会主动减少一些让他安心","sub":"折中，有边界但会妥协","score":65},{"key":"C","text":"为了不让他不开心，就减少了","sub":"边界弱，讨好型","score":30},{"key":"D","text":"当面答应，但实际上没有改变","sub":"回避冲突，内外不一","score":40}],"source_question":{"id":"FS4-A-F-53","order":53,"module":"FS4","sub":"FS4_A","type":"scenario","weight":1.5,"direction":"positive","text":"他希望你减少跟某个男性朋友的联系，理由是他不舒服。但那个朋友是你的老朋友，关系很正常。你会？","scene":"社交自主权与关系安全感的冲突","options":[{"key":"A","text":"告诉他我跟那个朋友只是普通朋友，不会改变来往","sub":"边界清晰，自主性强","score":90},{"key":"B","text":"跟他解释清楚，但也会主动减少一些让他安心","sub":"折中，有边界但会妥协","score":65},{"key":"C","text":"为了不让他不开心，就减少了","sub":"边界弱，讨好型","score":30},{"key":"D","text":"当面答应，但实际上没有改变","sub":"回避冲突，内外不一","score":40}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-B-F-54', 54, 'FS4', 'mood', 1.5, 'positive', '你跟他吵架了，气还没消。你现在的状态最接近？', '{"options":[{"key":"A","icon":"ti-mood-angry","text":"很生气，可能说出一些激烈的话","score":30},{"key":"B","icon":"ti-mood-sad","text":"委屈，想哭但不想让他看到","score":45},{"key":"C","icon":"ti-mood-empty","text":"冷着，不想说话","score":50},{"key":"D","icon":"ti-mood-confuzed","text":"乱，不知道怎么处理","score":40},{"key":"E","icon":"ti-mood-nervous","text":"担心他会不会因此不要我了","score":35},{"key":"F","icon":"ti-mood-smile","text":"冷静下来了，想着怎么解决","score":80},{"key":"G","icon":"ti-mood-tongue","text":"给自己一点时间，然后去沟通","score":85},{"key":"H","icon":"ti-mood-happy","text":"已经想好要说什么了","score":90}],"source_question":{"id":"FS4-B-F-54","order":54,"module":"FS4","sub":"FS4_B","type":"mood","weight":1.5,"direction":"positive","text":"你跟他吵架了，气还没消。你现在的状态最接近？","options":[{"key":"A","icon":"ti-mood-angry","text":"很生气，可能说出一些激烈的话","score":30},{"key":"B","icon":"ti-mood-sad","text":"委屈，想哭但不想让他看到","score":45},{"key":"C","icon":"ti-mood-empty","text":"冷着，不想说话","score":50},{"key":"D","icon":"ti-mood-confuzed","text":"乱，不知道怎么处理","score":40},{"key":"E","icon":"ti-mood-nervous","text":"担心他会不会因此不要我了","score":35},{"key":"F","icon":"ti-mood-smile","text":"冷静下来了，想着怎么解决","score":80},{"key":"G","icon":"ti-mood-tongue","text":"给自己一点时间，然后去沟通","score":85},{"key":"H","icon":"ti-mood-happy","text":"已经想好要说什么了","score":90}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-B-F-55', 55, 'FS4', 'scenario', 1.5, 'positive', '你工作上受了委屈，情绪很差。回家后他随口说了一句让你不舒服的话（他不是故意的）。你通常会？', '{"scene":"情绪迁移的自我觉察","options":[{"key":"A","text":"告诉他我今天状态不好，那句话让我有点难受","sub":"情绪清晰，能区分来源","score":90},{"key":"B","text":"比平时敏感，有点过激，但事后知道是自己的问题","sub":"有觉察，控制有限","score":65},{"key":"C","text":"直接爆发，后来才意识到是工作的事影响的","sub":"情绪迁移，觉察晚","score":40},{"key":"D","text":"没说什么，心里憋着，开始冷战","sub":"积压型，不表达","score":35}],"source_question":{"id":"FS4-B-F-55","order":55,"module":"FS4","sub":"FS4_B","type":"scenario","weight":1.5,"direction":"positive","text":"你工作上受了委屈，情绪很差。回家后他随口说了一句让你不舒服的话（他不是故意的）。你通常会？","scene":"情绪迁移的自我觉察","options":[{"key":"A","text":"告诉他我今天状态不好，那句话让我有点难受","sub":"情绪清晰，能区分来源","score":90},{"key":"B","text":"比平时敏感，有点过激，但事后知道是自己的问题","sub":"有觉察，控制有限","score":65},{"key":"C","text":"直接爆发，后来才意识到是工作的事影响的","sub":"情绪迁移，觉察晚","score":40},{"key":"D","text":"没说什么，心里憋着，开始冷战","sub":"积压型，不表达","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-B-F-56', 56, 'FS4', 'binary', 1.3, 'positive', '你委屈了，你更倾向于？', '{"options":[{"key":"left","text":"直接说出来，我不憋着","sub":"直接表达型","score":85},{"key":"right","text":"等他自己发现，或者等我气消了再说","sub":"间接表达型","score":50}],"source_question":{"id":"FS4-B-F-56","order":56,"module":"FS4","sub":"FS4_B","type":"binary","weight":1.3,"direction":"positive","text":"你委屈了，你更倾向于？","options":[{"key":"left","text":"直接说出来，我不憋着","sub":"直接表达型","score":85},{"key":"right","text":"等他自己发现，或者等我气消了再说","sub":"间接表达型","score":50}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-B-F-57', 57, 'FS4', 'choice', 1.3, 'positive', '你在关系里最常用的情绪处理方式是？', '{"options":[{"key":"A","text":"直接说，当下处理，不拖","sub":"健康表达","score":85},{"key":"B","text":"先给自己一点时间冷静，然后再说","sub":"节奏型，健康","score":90},{"key":"C","text":"靠时间消化，不一定会说出来","sub":"内化型，有积压风险","score":50},{"key":"D","text":"用行动表示，比如冷战或者突然很好，让他感觉到","sub":"间接表达，高风险","score":25}],"source_question":{"id":"FS4-B-F-57","order":57,"module":"FS4","sub":"FS4_B","type":"choice","weight":1.3,"direction":"positive","text":"你在关系里最常用的情绪处理方式是？","options":[{"key":"A","text":"直接说，当下处理，不拖","sub":"健康表达","score":85},{"key":"B","text":"先给自己一点时间冷静，然后再说","sub":"节奏型，健康","score":90},{"key":"C","text":"靠时间消化，不一定会说出来","sub":"内化型，有积压风险","score":50},{"key":"D","text":"用行动表示，比如冷战或者突然很好，让他感觉到","sub":"间接表达，高风险","score":25}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-B-F-58', 58, 'FS4', 'scale', 1.3, 'positive', '我在关系里不会用冷战、消失或者发脾气来表达情绪，我更倾向于直接说出来。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"FS4-B-F-58","order":58,"module":"FS4","sub":"FS4_B","type":"scale","weight":1.3,"direction":"positive","text":"我在关系里不会用冷战、消失或者发脾气来表达情绪，我更倾向于直接说出来。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"direct_times_20"}}}'::jsonb, '{"method":"direct_times_20"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-C-F-59', 59, 'FS4', 'slider', 1.3, 'positive', '在一段关系里，你有多能保持自己原来的生活——朋友、爱好、个人目标？', '{"slider":{"min":0,"max":100,"min_label":"我容易把全部重心放在关系上","max_label":"我能很好地保持自己的生活","feedback":[{"range":[0,25],"text":"你倾向于把关系放在一切之上，容易在感情里失去自我"},{"range":[26,45],"text":"会有一些迷失，关系会占据你大部分注意力"},{"range":[46,65],"text":"中等，能保持一部分，但关系会明显影响你"},{"range":[66,85],"text":"大多数时候能守住自己的生活节奏"},{"range":[86,100],"text":"你在关系里依然活得很完整，不依附"}]},"source_question":{"id":"FS4-C-F-59","order":59,"module":"FS4","sub":"FS4_C","type":"slider","weight":1.3,"direction":"positive","text":"在一段关系里，你有多能保持自己原来的生活——朋友、爱好、个人目标？","slider":{"min":0,"max":100,"min_label":"我容易把全部重心放在关系上","max_label":"我能很好地保持自己的生活","feedback":[{"range":[0,25],"text":"你倾向于把关系放在一切之上，容易在感情里失去自我"},{"range":[26,45],"text":"会有一些迷失，关系会占据你大部分注意力"},{"range":[46,65],"text":"中等，能保持一部分，但关系会明显影响你"},{"range":[66,85],"text":"大多数时候能守住自己的生活节奏"},{"range":[86,100],"text":"你在关系里依然活得很完整，不依附"}]},"scoring":{"method":"direct"}}}'::jsonb, '{"method":"direct"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-C-F-60', 60, 'FS4', 'binary', 1.5, 'positive', '自从谈恋爱之后，你的个人生活？', '{"options":[{"key":"left","text":"基本没变，我还是我，关系是额外的部分","sub":"独立型，健康","score":85},{"key":"right","text":"变了很多，他成了我生活的中心","sub":"融合型，依赖风险","score":35}],"source_question":{"id":"FS4-C-F-60","order":60,"module":"FS4","sub":"FS4_C","type":"binary","weight":1.5,"direction":"positive","text":"自从谈恋爱之后，你的个人生活？","options":[{"key":"left","text":"基本没变，我还是我，关系是额外的部分","sub":"独立型，健康","score":85},{"key":"right","text":"变了很多，他成了我生活的中心","sub":"融合型，依赖风险","score":35}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-C-F-61', 61, 'FS4', 'rank', 1.2, 'positive', '在关系里，你最看重哪种状态？从最理想到最不重要排序。', '{"items":[{"id":"a","text":"我们非常亲密，彼此是对方最重要的人"},{"id":"b","text":"我们各有各的生活，但感情很深"},{"id":"c","text":"他非常需要我，我在他生活里不可或缺"},{"id":"d","text":"我们一起成长，互相推动变得更好"}],"source_question":{"id":"FS4-C-F-61","order":61,"module":"FS4","sub":"FS4_C","type":"rank","weight":1.2,"direction":"positive","text":"在关系里，你最看重哪种状态？从最理想到最不重要排序。","items":[{"id":"a","text":"我们非常亲密，彼此是对方最重要的人"},{"id":"b","text":"我们各有各的生活，但感情很深"},{"id":"c","text":"他非常需要我，我在他生活里不可或缺"},{"id":"d","text":"我们一起成长，互相推动变得更好"}],"scoring":{"method":"rank_independence","note":"b或d排第一=独立型关系观=高分；c排第一=依赖倾向=中低分","score_map":{"a_first":60,"b_first":85,"c_first":45,"d_first":80}}}}'::jsonb, '{"method":"rank_independence","note":"b或d排第一=独立型关系观=高分；c排第一=依赖倾向=中低分","score_map":{"a_first":60,"b_first":85,"c_first":45,"d_first":80}}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS4-C-F-62', 62, 'FS4', 'choice', 1.2, 'positive', '分手之后，你通常需要多长时间走出来？', '{"options":[{"key":"A","text":"很快，我能理清楚，继续过自己的生活","sub":"情感弹性好，独立性强","score":85},{"key":"B","text":"需要一段时间，但能恢复","sub":"正常范围","score":70},{"key":"C","text":"需要很久，分手对我影响很大","sub":"依赖度高，恢复慢","score":35},{"key":"D","text":"我没怎么经历过分手，不确定","sub":"样本不足，中性处理","score":60}],"source_question":{"id":"FS4-C-F-62","order":62,"module":"FS4","sub":"FS4_C","type":"choice","weight":1.2,"direction":"positive","text":"分手之后，你通常需要多长时间走出来？","options":[{"key":"A","text":"很快，我能理清楚，继续过自己的生活","sub":"情感弹性好，独立性强","score":85},{"key":"B","text":"需要一段时间，但能恢复","sub":"正常范围","score":70},{"key":"C","text":"需要很久，分手对我影响很大","sub":"依赖度高，恢复慢","score":35},{"key":"D","text":"我没怎么经历过分手，不确定","sub":"样本不足，中性处理","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-A-F-63', 63, 'FS5', 'scenario', 1.5, 'reverse', '新认识一个男生，聊得很好，他问你上一段感情是怎么结束的。你最真实的回答是？', '{"scene":"被问及过去感情","options":[{"key":"A","text":"简单说了，双方都有问题，已经过去了","sub":"处理成熟，包袱轻","score":10},{"key":"B","text":"说了一些，但没有完全展开，还有一些说不清楚的部分","sub":"中等，尚未完全消化","score":35},{"key":"C","text":"说了很多，有点收不住，那段感情对我影响还挺大的","sub":"情感创伤尚未愈合","score":65},{"key":"D","text":"不太想提，提了情绪会有波动","sub":"高包袱，前任阴影明显","score":80}],"source_question":{"id":"FS5-A-F-63","order":63,"module":"FS5","sub":"FS5_A","type":"scenario","weight":1.5,"direction":"reverse","text":"新认识一个男生，聊得很好，他问你上一段感情是怎么结束的。你最真实的回答是？","scene":"被问及过去感情","options":[{"key":"A","text":"简单说了，双方都有问题，已经过去了","sub":"处理成熟，包袱轻","score":10},{"key":"B","text":"说了一些，但没有完全展开，还有一些说不清楚的部分","sub":"中等，尚未完全消化","score":35},{"key":"C","text":"说了很多，有点收不住，那段感情对我影响还挺大的","sub":"情感创伤尚未愈合","score":65},{"key":"D","text":"不太想提，提了情绪会有波动","sub":"高包袱，前任阴影明显","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-A-F-64', 64, 'FS5', 'binary', 1.5, 'reverse', '你现在跟前任还有联系吗？', '{"options":[{"key":"left","text":"没有，已经完全断开了","sub":"低风险","score":10},{"key":"right","text":"偶尔还有，关系说复杂也不复杂","sub":"中高风险","score":60}],"source_question":{"id":"FS5-A-F-64","order":64,"module":"FS5","sub":"FS5_A","type":"binary","weight":1.5,"direction":"reverse","text":"你现在跟前任还有联系吗？","options":[{"key":"left","text":"没有，已经完全断开了","sub":"低风险","score":10},{"key":"right","text":"偶尔还有，关系说复杂也不复杂","sub":"中高风险","score":60}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-A-F-65', 65, 'FS5', 'choice', 1.3, 'reverse', '过去的感情经历对你现在的影响是？', '{"options":[{"key":"A","text":"基本没有，我已经走出来了","sub":"低包袱","score":10},{"key":"B","text":"让我更了解自己，有一些收获","sub":"正向消化","score":20},{"key":"C","text":"让我在某些方面变得谨慎，有一些防御","sub":"中等，有轻度影响","score":50},{"key":"D","text":"还是会影响我，有时候会把过去的事情带进现在","sub":"高包袱，影响显著","score":75}],"source_question":{"id":"FS5-A-F-65","order":65,"module":"FS5","sub":"FS5_A","type":"choice","weight":1.3,"direction":"reverse","text":"过去的感情经历对你现在的影响是？","options":[{"key":"A","text":"基本没有，我已经走出来了","sub":"低包袱","score":10},{"key":"B","text":"让我更了解自己，有一些收获","sub":"正向消化","score":20},{"key":"C","text":"让我在某些方面变得谨慎，有一些防御","sub":"中等，有轻度影响","score":50},{"key":"D","text":"还是会影响我，有时候会把过去的事情带进现在","sub":"高包袱，影响显著","score":75}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-A-F-66', 66, 'FS5', 'scale', 1.3, 'reverse', '我过去的感情经历，有时候会让我在新的关系里变得过度谨慎或者不信任。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"FS5-A-F-66","order":66,"module":"FS5","sub":"FS5_A","type":"scale","weight":1.3,"direction":"reverse","text":"我过去的感情经历，有时候会让我在新的关系里变得过度谨慎或者不信任。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"reverse_times_25","formula":"(value - 1) * 25"}}}'::jsonb, '{"method":"reverse_times_25","formula":"(value - 1) * 25"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-A-F-67', 67, 'FS5', 'slider', 1.2, 'reverse', '你觉得自己目前从过去感情里走出来的程度是多少？', '{"slider":{"min":0,"max":100,"min_label":"完全没走出来，还在那段感情里","max_label":"完全走出来了，已经是另一个阶段","feedback":[{"range":[0,30],"text":"你还在消化过去，现在可能不是最好的开始新关系的时机"},{"range":[31,55],"text":"还有一些残留，但在慢慢好转"},{"range":[56,75],"text":"基本走出来了，偶尔会想起"},{"range":[76,100],"text":"完全走出来了，已经是新的开始"}]},"source_question":{"id":"FS5-A-F-67","order":67,"module":"FS5","sub":"FS5_A","type":"slider","weight":1.2,"direction":"reverse","text":"你觉得自己目前从过去感情里走出来的程度是多少？","slider":{"min":0,"max":100,"min_label":"完全没走出来，还在那段感情里","max_label":"完全走出来了，已经是另一个阶段","feedback":[{"range":[0,30],"text":"你还在消化过去，现在可能不是最好的开始新关系的时机"},{"range":[31,55],"text":"还有一些残留，但在慢慢好转"},{"range":[56,75],"text":"基本走出来了，偶尔会想起"},{"range":[76,100],"text":"完全走出来了，已经是新的开始"}]},"scoring":{"method":"reverse","formula":"100 - value"}}}'::jsonb, '{"method":"reverse","formula":"100 - value"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-A-F-68', 68, 'FS5', 'scenario', 1.2, 'reverse', '新男友发现你手机里还有前任的照片。他问你为什么留着。你最真实的答案是？', '{"scene":"前任照片的留存原因","options":[{"key":"A","text":"我删了，我习惯定期清理","sub":"低风险，干净利落","score":5},{"key":"B","text":"忘记删了，没什么特别的意思","sub":"低风险，无刻意保留","score":15},{"key":"C","text":"留着是因为那段时间有意义，不是因为人","sub":"中等，可解释","score":45},{"key":"D","text":"有点舍不得删，说不清楚为什么","sub":"较高风险，情感未完全割断","score":70}],"source_question":{"id":"FS5-A-F-68","order":68,"module":"FS5","sub":"FS5_A","type":"scenario","weight":1.2,"direction":"reverse","text":"新男友发现你手机里还有前任的照片。他问你为什么留着。你最真实的答案是？","scene":"前任照片的留存原因","options":[{"key":"A","text":"我删了，我习惯定期清理","sub":"低风险，干净利落","score":5},{"key":"B","text":"忘记删了，没什么特别的意思","sub":"低风险，无刻意保留","score":15},{"key":"C","text":"留着是因为那段时间有意义，不是因为人","sub":"中等，可解释","score":45},{"key":"D","text":"有点舍不得删，说不清楚为什么","sub":"较高风险，情感未完全割断","score":70}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-B-F-69', 69, 'FS5', 'scenario', 1.5, 'reverse', '你发消息给他，两个小时没回。你的状态最接近？', '{"scene":"消息未回时的焦虑程度","options":[{"key":"A","text":"没什么，他可能在忙","sub":"低依赖，安全感内化","score":10},{"key":"B","text":"有点在意，但能控制住不乱想","sub":"轻微焦虑，可控","score":30},{"key":"C","text":"开始想是不是我说错了什么","sub":"中等焦虑，依赖倾向","score":60},{"key":"D","text":"很不安，忍不住发第二条消息确认他还好","sub":"高依赖，安全感外化","score":85}],"source_question":{"id":"FS5-B-F-69","order":69,"module":"FS5","sub":"FS5_B","type":"scenario","weight":1.5,"direction":"reverse","text":"你发消息给他，两个小时没回。你的状态最接近？","scene":"消息未回时的焦虑程度","options":[{"key":"A","text":"没什么，他可能在忙","sub":"低依赖，安全感内化","score":10},{"key":"B","text":"有点在意，但能控制住不乱想","sub":"轻微焦虑，可控","score":30},{"key":"C","text":"开始想是不是我说错了什么","sub":"中等焦虑，依赖倾向","score":60},{"key":"D","text":"很不安，忍不住发第二条消息确认他还好","sub":"高依赖，安全感外化","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-B-F-70', 70, 'FS5', 'binary', 1.5, 'reverse', '你在关系里，安全感主要来自？', '{"options":[{"key":"left","text":"我自己内心比较稳，不太需要对方时刻确认","sub":"低依赖风险","score":10},{"key":"right","text":"对方的回应和行动，他不稳定我就不稳定","sub":"高依赖风险","score":80}],"source_question":{"id":"FS5-B-F-70","order":70,"module":"FS5","sub":"FS5_B","type":"binary","weight":1.5,"direction":"reverse","text":"你在关系里，安全感主要来自？","options":[{"key":"left","text":"我自己内心比较稳，不太需要对方时刻确认","sub":"低依赖风险","score":10},{"key":"right","text":"对方的回应和行动，他不稳定我就不稳定","sub":"高依赖风险","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-B-F-71', 71, 'FS5', 'choice', 1.3, 'reverse', '当对方比平时冷淡一些的时候，你的第一反应是？', '{"options":[{"key":"A","text":"观察一下，可能他最近有事","sub":"低依赖，理性判断","score":10},{"key":"B","text":"有点在意，会找机会问一下他怎么了","sub":"中等，主动沟通","score":35},{"key":"C","text":"开始反思是不是自己哪里出了问题","sub":"高依赖，自我归因","score":65},{"key":"D","text":"情绪会受影响，开始担心关系出了问题","sub":"高依赖，灾难化思维","score":80}],"source_question":{"id":"FS5-B-F-71","order":71,"module":"FS5","sub":"FS5_B","type":"choice","weight":1.3,"direction":"reverse","text":"当对方比平时冷淡一些的时候，你的第一反应是？","options":[{"key":"A","text":"观察一下，可能他最近有事","sub":"低依赖，理性判断","score":10},{"key":"B","text":"有点在意，会找机会问一下他怎么了","sub":"中等，主动沟通","score":35},{"key":"C","text":"开始反思是不是自己哪里出了问题","sub":"高依赖，自我归因","score":65},{"key":"D","text":"情绪会受影响，开始担心关系出了问题","sub":"高依赖，灾难化思维","score":80}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-B-F-72', 72, 'FS5', 'scale', 1.3, 'reverse', '当对方没有及时回应我时，我会感到焦虑或者开始怀疑关系。', '{"scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"source_question":{"id":"FS5-B-F-72","order":72,"module":"FS5","sub":"FS5_B","type":"scale","weight":1.3,"direction":"reverse","text":"当对方没有及时回应我时，我会感到焦虑或者开始怀疑关系。","scale":{"min":1,"max":5,"min_label":"从不","max_label":"经常"},"scoring":{"method":"reverse_times_25","formula":"(value - 1) * 25"}}}'::jsonb, '{"method":"reverse_times_25","formula":"(value - 1) * 25"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-B-F-73', 73, 'FS5', 'scenario', 1.5, 'reverse', '你们吵架了，他说需要冷静一下，今晚不想说话。你会怎么做？', '{"scene":"冷静期的等待能力","options":[{"key":"A","text":"好，给他时间，我也去做自己的事","sub":"低依赖，尊重边界","score":10},{"key":"B","text":"忍着，但心里很不安，一直看手机","sub":"中高焦虑，表面克制","score":45},{"key":"C","text":"过一会儿忍不住发消息确认他还好","sub":"高依赖，难以等待","score":70},{"key":"D","text":"越想越不对，开始担心他是不是要分手","sub":"极高依赖，灾难化","score":90}],"source_question":{"id":"FS5-B-F-73","order":73,"module":"FS5","sub":"FS5_B","type":"scenario","weight":1.5,"direction":"reverse","text":"你们吵架了，他说需要冷静一下，今晚不想说话。你会怎么做？","scene":"冷静期的等待能力","options":[{"key":"A","text":"好，给他时间，我也去做自己的事","sub":"低依赖，尊重边界","score":10},{"key":"B","text":"忍着，但心里很不安，一直看手机","sub":"中高焦虑，表面克制","score":45},{"key":"C","text":"过一会儿忍不住发消息确认他还好","sub":"高依赖，难以等待","score":70},{"key":"D","text":"越想越不对，开始担心他是不是要分手","sub":"极高依赖，灾难化","score":90}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-B-F-74', 74, 'FS5', 'slider', 1.2, 'reverse', '在关系里，你需要多高频率的确认才能感到安心？', '{"slider":{"min":0,"max":100,"min_label":"完全不需要，我内心很稳","max_label":"需要非常频繁的回应才能放心","feedback":[{"range":[0,20],"text":"你的安全感来自内部，很独立"},{"range":[21,40],"text":"偶尔需要确认，但不依赖"},{"range":[41,60],"text":"中等需求，正常范围"},{"range":[61,80],"text":"比较依赖对方的回应"},{"range":[81,100],"text":"高度依赖，安全感来自外部确认"}]},"source_question":{"id":"FS5-B-F-74","order":74,"module":"FS5","sub":"FS5_B","type":"slider","weight":1.2,"direction":"reverse","text":"在关系里，你需要多高频率的确认才能感到安心？","slider":{"min":0,"max":100,"min_label":"完全不需要，我内心很稳","max_label":"需要非常频繁的回应才能放心","feedback":[{"range":[0,20],"text":"你的安全感来自内部，很独立"},{"range":[21,40],"text":"偶尔需要确认，但不依赖"},{"range":[41,60],"text":"中等需求，正常范围"},{"range":[61,80],"text":"比较依赖对方的回应"},{"range":[81,100],"text":"高度依赖，安全感来自外部确认"}]},"scoring":{"method":"direct_as_risk"}}}'::jsonb, '{"method":"direct_as_risk"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-C-F-75', 75, 'FS5', 'card', 1.5, 'reverse', '你父母对你的感情生活，态度最接近哪张？', '{"options":[{"key":"A","text":"「你自己决定，我们信任你」","sub":"低干预，健康边界","score":10},{"key":"B","text":"「会问问，有意见，但最终尊重你」","sub":"中等，可沟通","score":35},{"key":"C","text":"「有具体要求，不太容易商量」","sub":"中高干预","score":60},{"key":"D","text":"「参与度很高，我的感情他们必须满意」","sub":"高干预，显著风险","score":85}],"source_question":{"id":"FS5-C-F-75","order":75,"module":"FS5","sub":"FS5_C","type":"card","weight":1.5,"direction":"reverse","text":"你父母对你的感情生活，态度最接近哪张？","options":[{"key":"A","text":"「你自己决定，我们信任你」","sub":"低干预，健康边界","score":10},{"key":"B","text":"「会问问，有意见，但最终尊重你」","sub":"中等，可沟通","score":35},{"key":"C","text":"「有具体要求，不太容易商量」","sub":"中高干预","score":60},{"key":"D","text":"「参与度很高，我的感情他们必须满意」","sub":"高干预，显著风险","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-C-F-76', 76, 'FS5', 'binary', 1.5, 'reverse', '你家里有没有需要你承担的经济或者情感责任？比如补贴家用、照顾弟妹、处理家庭矛盾等。', '{"options":[{"key":"left","text":"没有，或者很少，家里不需要我操心","sub":"低负担","score":10},{"key":"right","text":"有，我在家里承担了一些责任","sub":"中高负担，需了解程度","score":55}],"source_question":{"id":"FS5-C-F-76","order":76,"module":"FS5","sub":"FS5_C","type":"binary","weight":1.5,"direction":"reverse","text":"你家里有没有需要你承担的经济或者情感责任？比如补贴家用、照顾弟妹、处理家庭矛盾等。","options":[{"key":"left","text":"没有，或者很少，家里不需要我操心","sub":"低负担","score":10},{"key":"right","text":"有，我在家里承担了一些责任","sub":"中高负担，需了解程度","score":55}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-C-F-77', 77, 'FS5', 'choice', 1.3, 'reverse', '如果你跟对方因为家庭原因产生矛盾，你通常倾向于？', '{"options":[{"key":"A","text":"跟家人说清楚，我的感情我做主","sub":"边界清晰，低风险","score":10},{"key":"B","text":"跟对方解释，也跟家人沟通，尽量两边都照顾","sub":"折中，中等压力","score":35},{"key":"C","text":"家人那边我很难拒绝，对方需要理解我的处境","sub":"家庭优先，中高风险","score":65},{"key":"D","text":"这是我很难解决的困境，两边都很难","sub":"高风险，家庭干预大","score":85}],"source_question":{"id":"FS5-C-F-77","order":77,"module":"FS5","sub":"FS5_C","type":"choice","weight":1.3,"direction":"reverse","text":"如果你跟对方因为家庭原因产生矛盾，你通常倾向于？","options":[{"key":"A","text":"跟家人说清楚，我的感情我做主","sub":"边界清晰，低风险","score":10},{"key":"B","text":"跟对方解释，也跟家人沟通，尽量两边都照顾","sub":"折中，中等压力","score":35},{"key":"C","text":"家人那边我很难拒绝，对方需要理解我的处境","sub":"家庭优先，中高风险","score":65},{"key":"D","text":"这是我很难解决的困境，两边都很难","sub":"高风险，家庭干预大","score":85}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-C-F-78', 78, 'FS5', 'scale', 1.2, 'reverse', '我的家庭情况，可能会给我的感情带来一些额外的压力或者复杂性。', '{"scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"source_question":{"id":"FS5-C-F-78","order":78,"module":"FS5","sub":"FS5_C","type":"scale","weight":1.2,"direction":"reverse","text":"我的家庭情况，可能会给我的感情带来一些额外的压力或者复杂性。","scale":{"min":1,"max":5,"min_label":"完全不符合","max_label":"完全符合"},"scoring":{"method":"reverse_times_25","formula":"(value - 1) * 25"}}}'::jsonb, '{"method":"reverse_times_25","formula":"(value - 1) * 25"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-C-F-79', 79, 'FS5', 'scenario', 0.8, 'positive', '你男友提出，结婚后希望你们住得离他父母近一些，方便照顾。你的反应是？', '{"scene":"关于居住安排的灵活性","options":[{"key":"A","text":"可以商量，看具体情况","sub":"开放，灵活","score":75},{"key":"B","text":"没问题，我觉得这很正常","sub":"接受度高","score":65},{"key":"C","text":"需要看他父母是什么样的，再决定","sub":"理性评估","score":80},{"key":"D","text":"这是个问题，我需要想清楚，我不确定能接受","sub":"有顾虑，但正常","score":70}],"source_question":{"id":"FS5-C-F-79","order":79,"module":"FS5","sub":"FS5_C","type":"scenario","weight":0.8,"direction":"positive","text":"你男友提出，结婚后希望你们住得离他父母近一些，方便照顾。你的反应是？","scene":"关于居住安排的灵活性","options":[{"key":"A","text":"可以商量，看具体情况","sub":"开放，灵活","score":75},{"key":"B","text":"没问题，我觉得这很正常","sub":"接受度高","score":65},{"key":"C","text":"需要看他父母是什么样的，再决定","sub":"理性评估","score":80},{"key":"D","text":"这是个问题，我需要想清楚，我不确定能接受","sub":"有顾虑，但正常","score":70}]}}'::jsonb, '{}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();

INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)
SELECT s.id, 'FS5-C-F-80', 80, 'FS5', 'slider', 1.2, 'reverse', '你觉得你的家庭背景，在择偶市场上是加分项还是需要对方接受的部分？', '{"slider":{"min":0,"max":100,"min_label":"坦白说是对方需要接受的负担","max_label":"是我的加分项，对方会觉得我家庭好","feedback":[{"range":[0,25],"text":"你的家庭背景在择偶中可能需要额外解释和接受过程"},{"range":[26,50],"text":"中性，不加分也不太扣分"},{"range":[51,75],"text":"算是加分项，家庭情况不差"},{"range":[76,100],"text":"你的家庭背景是明显的加分项"}]},"source_question":{"id":"FS5-C-F-80","order":80,"module":"FS5","sub":"FS5_C","type":"slider","weight":1.2,"direction":"reverse","text":"你觉得你的家庭背景，在择偶市场上是加分项还是需要对方接受的部分？","slider":{"min":0,"max":100,"min_label":"坦白说是对方需要接受的负担","max_label":"是我的加分项，对方会觉得我家庭好","feedback":[{"range":[0,25],"text":"你的家庭背景在择偶中可能需要额外解释和接受过程"},{"range":[26,50],"text":"中性，不加分也不太扣分"},{"range":[51,75],"text":"算是加分项，家庭情况不差"},{"range":[76,100],"text":"你的家庭背景是明显的加分项"}]},"scoring":{"method":"reverse","formula":"100 - value","note":"反向作为风险参考值"}}}'::jsonb, '{"method":"reverse","formula":"100 - value","note":"反向作为风险参考值"}'::jsonb, true
FROM public.test_suites s WHERE s.slug = 's03_mate_female'
ON CONFLICT (suite_id, external_question_id) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  dimension_code = EXCLUDED.dimension_code,
  question_type = EXCLUDED.question_type,
  weight = EXCLUDED.weight,
  direction = EXCLUDED.direction,
  question_text = EXCLUDED.question_text,
  question_payload = EXCLUDED.question_payload,
  scoring_payload = EXCLUDED.scoring_payload,
  is_active = EXCLUDED.is_active,
  updated_at = now();


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
SELECT s.id, 'MS4-A-M-49', 49, 'MS4', 'slider', 1.5, 'positive', '你觉得自己的外形资产大概在哪个位置？', '{"subtitle":"包含长相、身材、穿搭、整体气质","note":"这个观察只帮助系统理解你的起点，不会以数字形式出现在结果里。","slider":{"min":1,"max":10,"step":1,"displayMode":"appearance","tierLabels":[{"range":[1,2],"label":"自然型"},{"range":[3,4],"label":"普通辨识度"},{"range":[5,6],"label":"有记忆点"},{"range":[7,8],"label":"高辨识度"},{"range":[9,10],"label":"极高辨识度"}],"footnote":"注意：不是素颜自拍视角，也不是美颜后的自己。\n参考：现实社交 + 日常状态 + 外形管理后的综合感受","reference":[{"score":1,"perception":"外形存在明显短板","behavior":"整体形象管理较少"},{"score":2,"perception":"很少因为外形被关注","behavior":"基本不构成优势"},{"score":3,"perception":"偶尔被夸精神","behavior":"熟人评价更多"},{"score":4,"perception":"普通水平","behavior":"放在人群里不突出"},{"score":5,"perception":"中位值","behavior":"干净舒服，不减分"},{"score":6,"perception":"有记忆点","behavior":"身材/气质/穿搭有亮点"},{"score":7,"perception":"明显加分","behavior":"异性会主动注意"},{"score":8,"perception":"同龄前10%左右","behavior":"常被夸有魅力"},{"score":9,"perception":"同龄前3%左右","behavior":"外形会带来社交优势"},{"score":10,"perception":"极少数","behavior":"长相或整体气质非常突出"}]},"source_question":{"id":"MS4-A-M-49","order":49,"module":"MS4","sub":"MS4_A","type":"slider","weight":1.5,"direction":"positive","text":"你觉得自己的外形资产大概在哪个位置？","subtitle":"包含长相、身材、穿搭、整体气质","note":"这个观察只帮助系统理解你的起点，不会以数字形式出现在结果里。","slider":{"min":1,"max":10,"step":1,"displayMode":"appearance","tierLabels":[{"range":[1,2],"label":"自然型"},{"range":[3,4],"label":"普通辨识度"},{"range":[5,6],"label":"有记忆点"},{"range":[7,8],"label":"高辨识度"},{"range":[9,10],"label":"极高辨识度"}],"footnote":"注意：不是素颜自拍视角，也不是美颜后的自己。\n参考：现实社交 + 日常状态 + 外形管理后的综合感受","reference":[{"score":1,"perception":"外形存在明显短板","behavior":"整体形象管理较少"},{"score":2,"perception":"很少因为外形被关注","behavior":"基本不构成优势"},{"score":3,"perception":"偶尔被夸精神","behavior":"熟人评价更多"},{"score":4,"perception":"普通水平","behavior":"放在人群里不突出"},{"score":5,"perception":"中位值","behavior":"干净舒服，不减分"},{"score":6,"perception":"有记忆点","behavior":"身材/气质/穿搭有亮点"},{"score":7,"perception":"明显加分","behavior":"异性会主动注意"},{"score":8,"perception":"同龄前10%左右","behavior":"常被夸有魅力"},{"score":9,"perception":"同龄前3%左右","behavior":"外形会带来社交优势"},{"score":10,"perception":"极少数","behavior":"长相或整体气质非常突出"}]},"scoring":{"method":"direct_times_10","sensitive":"appearance","calibrationSignals":["MS4-A-M-50","MS4-A-M-53","MS4-A-M-52"]}}}'::jsonb, '{"method":"direct_times_10","sensitive":"appearance","calibrationSignals":["MS4-A-M-50","MS4-A-M-53","MS4-A-M-52"]}'::jsonb, true
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
