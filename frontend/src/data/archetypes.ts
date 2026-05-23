// 34 婚恋画像原型（去学术化的对外名称 + 体验式描述）
export type Archetype = {
  code: string;
  gender: "M" | "F";
  name: string;        // 对外名称
  emoji: string;
  tagline: string;     // 一句话
  traits: string[];    // 高光特质
  cautions: string[];  // 留意点
  description: string; // 适配画像描述
  // 维度指纹（用于匹配）: at, in, co, ev (0-100 范围内的"理想分布")
  fingerprint: { at: number; in: number; co: number; ev: number; risk?: number };
};

export const ARCHETYPES: Archetype[] = [
  { code: "M01", gender: "M", name: "原野开拓者", emoji: "🏔️", tagline: "光环鲜明，但生活协作还在路上", traits: ["主见强", "魅力足", "目标清晰"], cautions: ["把生活组织默认丢给伴侣", "贡献者多于合作者"], description: "你身上有一种自带光环的气场，能让人愿意靠近，但在日常协作里，常常默认让伴侣承担更多。把'我来主导'换成'我们一起'，关系会更稳。", fingerprint: { at: 80, in: 55, co: 75, ev: 65 } },
  { code: "M02", gender: "M", name: "潜力成长股", emoji: "🌱", tagline: "互动温度够，但现实证据还在搭建", traits: ["真诚投入", "成长意愿强", "情绪可在场"], cautions: ["承诺有时跑在落地前", "现实资源仍在积累"], description: "和你相处的时光是温热的，未来的轮廓也很美。让那些'以后会……'变成可以验证的小事，魅力会从想象转为信任。", fingerprint: { at: 65, in: 78, co: 55, ev: 75 } },
  { code: "M03", gender: "M", name: "稳健基石", emoji: "🪨", tagline: "深水温和，不爆点但极可依", traits: ["可靠守时", "情绪稳定", "长期主义"], cautions: ["初期吸引力释放偏慢", "情绪张力略弱"], description: "你不是一眼惊艳的类型，但相处越久越被信任。在前几次互动多展示一点表达和情绪张力，会让人更愿意走到深处。", fingerprint: { at: 55, in: 80, co: 82, ev: 70 } },
  { code: "M04", gender: "M", name: "魅力浪人", emoji: "🌊", tagline: "高吸引力，但生活协同需要校准", traits: ["新鲜感强", "表达力佳", "氛围制造者"], cautions: ["稳定度有波动", "责任感需主动巩固"], description: "你能轻易让一段关系起飞，但要让它落地，需要一点结构感——固定的节奏、可兑现的承诺，会让你的魅力变成长期资产。", fingerprint: { at: 85, in: 60, co: 55, ev: 60 } },
  { code: "M05", gender: "M", name: "构建者", emoji: "🏛️", tagline: "四层均衡，关系基石型选手", traits: ["目标清晰", "执行扎实", "全维成熟"], cautions: ["标准偏刚性", "可能过度筛选"], description: "你像一座完工的建筑，结构、外形、采光都到位。注意：不要把'适配'变成'达标'，给关系留一点不可预测的空间。", fingerprint: { at: 75, in: 78, co: 82, ev: 78 } },
  { code: "M06", gender: "M", name: "专业沉浸者", emoji: "🔬", tagline: "深度有余，情感展示在补课", traits: ["专注", "可信", "认知力强"], cautions: ["情绪表达偏弱", "易缺席浪漫细节"], description: "你的世界很专注，让人安心。让一些温柔的小事'有意被看见'，亲密会更立体。", fingerprint: { at: 50, in: 65, co: 80, ev: 65 } },
  { code: "M07", gender: "M", name: "通透行者", emoji: "🌒", tagline: "阅历丰厚，需要更多透明度", traits: ["看人通透", "情绪稳", "经验丰富"], cautions: ["历史复杂，信任样本待积累", "易让人感到信息不对称"], description: "你看人很准，也走过很多路。给关系多一点'被看见'的窗口，过去越透明，现在越能被信任。", fingerprint: { at: 70, in: 65, co: 70, ev: 72 } },
  { code: "M08", gender: "M", name: "传统实干者", emoji: "🏡", tagline: "责任厚重，价值观需对齐", traits: ["责任感强", "家庭导向", "稳定可靠"], cautions: ["传统观念易被误读为控制", "需要价值观对齐"], description: "你是会把家放在中心的人。把'传统'表达为'我会承担'，而不是'你应该……'，会让伴侣更愿意走进来。", fingerprint: { at: 55, in: 72, co: 80, ev: 70 } },
  { code: "M09", gender: "M", name: "魅力释放者", emoji: "✨", tagline: "短期张力极强，承诺重量需补", traits: ["吸引力顶级", "氛围满分"], cautions: ["承诺与边界需要严格", "易释放暧昧信号"], description: "你天生有让人心动的能力，但心动之后呢？把激情转化为承诺的深度，是你这一关。", fingerprint: { at: 92, in: 55, co: 50, ev: 45, risk: 60 } },
  { code: "M10", gender: "M", name: "温柔配合者", emoji: "🍃", tagline: "支持有余，自我表达待练", traits: ["温柔贴心", "情绪在场", "极少冲突"], cautions: ["自我容易隐形", "需求表达偏弱"], description: "你是关系里的避风港，但要小心'自我消失'。让伴侣知道你也想要什么，关系才不会失衡。", fingerprint: { at: 60, in: 80, co: 55, ev: 65 } },
  { code: "M11", gender: "M", name: "认知极客", emoji: "🧠", tagline: "高认知，情绪识别在升级中", traits: ["逻辑清晰", "解决力强", "理性可靠"], cautions: ["情绪识别偏弱", "易被解读为冷淡"], description: "你能把任何问题拆解清楚，但情绪不是问题。先共情再分析，亲密度会跳一档。", fingerprint: { at: 55, in: 55, co: 78, ev: 65 } },
  { code: "M12", gender: "M", name: "理想主义者", emoji: "🌙", tagline: "精神浪漫，现实落地需补", traits: ["精神连接强", "审美在线", "情绪表达细腻"], cautions: ["现实规划偏弱", "易在执行上拖延"], description: "你给的是月光，但关系也需要面包。把愿景拆成可执行的小步，会让你的浪漫真正抵达。", fingerprint: { at: 78, in: 70, co: 55, ev: 70 } },
  { code: "M13", gender: "M", name: "自律工作型", emoji: "⚙️", tagline: "高自控，但陪伴时间在被挤压", traits: ["自律", "可靠", "目标导向"], cautions: ["陪伴密度低", "关系易让位事业"], description: "你能把自己管理得很好，但关系需要被排进日程。给关系一个固定的位置，它会回报你。", fingerprint: { at: 65, in: 55, co: 80, ev: 65 } },
  { code: "M14", gender: "M", name: "社交达人", emoji: "🎭", tagline: "外放愉悦，深度还在路上", traits: ["氛围高手", "朋友多", "幽默"], cautions: ["深度对话偏少", "承诺易被回避"], description: "你能让任何场合发光，但亲密需要安静的对话。试着在一对一时关掉'表演模式'。", fingerprint: { at: 78, in: 70, co: 55, ev: 55 } },
  { code: "M15", gender: "M", name: "资源型继承者", emoji: "🏯", tagline: "外部资源足，个人证据待建", traits: ["资源充沛", "起点高", "见识广"], cautions: ["易依赖家庭标签", "个人独立性需展示"], description: "你拥有的不少，但伴侣最想看的是你自己创造的部分。让'我能做到'盖过'我有什么'，会更有重量。", fingerprint: { at: 70, in: 65, co: 75, ev: 60 } },
  { code: "M16", gender: "M", name: "理性回避者", emoji: "🗿", tagline: "高理性，亲密表达待解锁", traits: ["稳定", "克制", "可靠"], cautions: ["亲密时易冷处理", "情感隔离风险"], description: "你的稳定是真的，但亲密需要一点'脆弱被允许'。说出一次真实感受，比一百次克制更有力量。", fingerprint: { at: 50, in: 50, co: 75, ev: 55 } },

  { code: "F01", gender: "F", name: "精英框架者", emoji: "💎", tagline: "自我框架清晰，边界需要更稳", traits: ["独立", "审美在线", "事业感强"], cautions: ["在强势对象前易过度适配", "边界规则不稳定"], description: "你知道自己是谁，但有时会为强势的人调低自己。把'我可以适配'换成'我们要共同协商'，关系会更对等。", fingerprint: { at: 75, in: 70, co: 80, ev: 70 } },
  { code: "F02", gender: "F", name: "情绪容器", emoji: "🫖", tagline: "高情绪供给，自己也需要被照顾", traits: ["共情力顶级", "稳定包容", "陪伴感强"], cautions: ["承接太多别人的情绪", "能量边界容易破"], description: "你能让人在你身边卸下盔甲，但也要给自己留一个出口。被滋养，不是义务，是必需。", fingerprint: { at: 65, in: 85, co: 65, ev: 70 } },
  { code: "F03", gender: "F", name: "慕强成长型", emoji: "🌅", tagline: "被光吸引，也想自己发光", traits: ["欣赏强者", "学习力强", "向上"], cautions: ["易依赖对方光环", "自我评价随对方浮动"], description: "你能从优秀的人身上吸收很多，但请记得：你也在发光。从仰望转为并肩,你会更轻盈。", fingerprint: { at: 78, in: 65, co: 65, ev: 70 } },
  { code: "F04", gender: "F", name: "务实合作者", emoji: "🏗️", tagline: "高稳定生活共建", traits: ["规划清晰", "执行强", "可靠"], cautions: ["激情供给易偏弱", "标准较硬"], description: "你是天然的搭档型，能一起把生活搭建好。记得给关系留一点'非理性的浪漫'，会让日常更甜。", fingerprint: { at: 60, in: 78, co: 82, ev: 72 } },
  { code: "F05", gender: "F", name: "高付出者", emoji: "🌷", tagline: "付出极多，需要先建底线", traits: ["细腻", "照顾力强", "无怨"], cautions: ["边界易被入侵", "易被索取"], description: "你给的真的很多，但对的人不会让你单向流出。先建立可被尊重的底线，再去付出。", fingerprint: { at: 65, in: 80, co: 55, ev: 60, risk: 55 } },
  { code: "F06", gender: "F", name: "拯救者", emoji: "🕊️", tagline: "想拯救对方，却忘了拯救自己", traits: ["共情极强", "韧性", "宽容"], cautions: ["拯救—依赖循环", "易陷入失衡关系"], description: "你想用爱让对方变好，但爱不是疗法。从拯救者退回到平等的伴侣，才是健康的位置。", fingerprint: { at: 60, in: 78, co: 55, ev: 60, risk: 50 } },
  { code: "F07", gender: "F", name: "舞台魅力者", emoji: "🌟", tagline: "被关注时闪耀，长期需要新刺激", traits: ["魅力顶级", "表达力强", "感染力"], cautions: ["关系进入日常后易厌倦", "承诺感偏弱"], description: "你站上舞台时无人能挡，但长期关系也可以是一种作品。把它当成持续创作的对象，新鲜感不会消失。", fingerprint: { at: 88, in: 65, co: 55, ev: 55 } },
  { code: "F08", gender: "F", name: "谨慎守护者", emoji: "🛡️", tagline: "经历过失望，所以更慎重", traits: ["敏锐", "独立", "保护自己"], cautions: ["过度防御", "易把旧伤投射到现在"], description: "你的谨慎是经验给的，不是缺点。学会分辨'真实风险'与'旧伤投射'，你会重新打开。", fingerprint: { at: 60, in: 65, co: 75, ev: 60 } },
  { code: "F09", gender: "F", name: "极致浪漫者", emoji: "🌹", tagline: "向往诗意，但需要落地的桥", traits: ["浪漫感强", "情感细腻", "审美在线"], cautions: ["现实匹配度评估偏弱", "易陷失望循环"], description: "你心里住着诗,这很珍贵。让浪漫和现实承诺连成桥，你才能稳稳走过去。", fingerprint: { at: 82, in: 70, co: 55, ev: 65 } },
  { code: "F10", gender: "F", name: "事业主导者", emoji: "👑", tagline: "事业感强，关系也想用规则跑", traits: ["独立", "高效", "目标感强"], cautions: ["关系易被工作逻辑压制", "柔性不足"], description: "你能把事业做漂亮，但亲密不是项目管理。在关系里允许一些非效率的温柔。", fingerprint: { at: 70, in: 65, co: 82, ev: 72 } },
  { code: "F11", gender: "F", name: "理性观察者", emoji: "🔭", tagline: "分析力强，体验感稍欠", traits: ["逻辑清晰", "判断准确", "独立思考"], cautions: ["把关系拆解为问题集", "感受易缺席"], description: "你看得比别人都清楚，但请允许自己'糊涂'地享受一下。身体和情绪在场，关系才完整。", fingerprint: { at: 55, in: 60, co: 80, ev: 65 } },
  { code: "F12", gender: "F", name: "公平捍卫者", emoji: "⚖️", tagline: "极致平等，但亲密需要弹性", traits: ["原则强", "互惠意识", "诚实"], cautions: ["过度计量易消解亲密", "柔软度待加"], description: "你信奉公平，这是一种力量。但在亲密里偶尔少计较一点,会让对方更愿意主动给。", fingerprint: { at: 65, in: 70, co: 80, ev: 70 } },
  { code: "F13", gender: "F", name: "眼缘优先者", emoji: "👁️", tagline: "第一眼很重要,长期价值需验证", traits: ["直觉强", "审美在线", "果断"], cautions: ["AT 权重过高", "易忽略长期风险"], description: "你相信眼缘,这没错。但请把第一眼之后留出验证窗口——长期价值不在脸上,在行为里。", fingerprint: { at: 85, in: 60, co: 55, ev: 60 } },
  { code: "F14", gender: "F", name: "深沉倾诉者", emoji: "🌧️", tagline: "情感丰沛,但能量流偏负向", traits: ["真实", "感受深", "诚实表达"], cautions: ["叙事偏悲观", "易耗竭对方"], description: "你愿意把真实的自己摊开,这很可贵。试着把倾诉的一半留给问题解决,你会感觉更有力。", fingerprint: { at: 55, in: 65, co: 60, ev: 50 } },
  { code: "F15", gender: "F", name: "焦虑守望者", emoji: "🕯️", tagline: "需要确定,但用控制找不到安全", traits: ["在意关系", "投入深", "感受敏锐"], cautions: ["查岗式行为", "控制—逃离循环"], description: "你的不安是因为太想要这段关系。学着用沟通替代查证,安全感会从对方那里真的回来。", fingerprint: { at: 65, in: 60, co: 55, ev: 55, risk: 55 } },
  { code: "F16", gender: "F", name: "文艺逃逸者", emoji: "🪶", tagline: "想象力丰富,现实承担在补课", traits: ["精神世界丰富", "审美独特", "敏感"], cautions: ["现实责任偏弱", "易逃避日常"], description: "你的内心是一个完整宇宙,但关系也住在地球上。把幻想分一些给共同的日常,才能长久。", fingerprint: { at: 72, in: 60, co: 50, ev: 60 } },
  { code: "F17", gender: "F", name: "家庭依附者", emoji: "🏮", tagline: "高奉献,自我资产需建设", traits: ["温暖", "顾家", "稳定"], cautions: ["自我价值依附家庭", "独立资产偏弱"], description: "你愿意把家放在第一位,这很美。也请记得给自己留一个'之外的世界',它会反过来滋养这个家。", fingerprint: { at: 60, in: 75, co: 65, ev: 60 } },
  { code: "F18", gender: "F", name: "关系考验者", emoji: "🧪", tagline: "需要确认,但考验会反噬信任", traits: ["在意真相", "投入深", "敏锐"], cautions: ["以测试代替表达", "考验破坏信任"], description: "你想要的是确定,但考验会让对方走开。用直接表达替代设局,你会得到更真实的答案。", fingerprint: { at: 65, in: 60, co: 60, ev: 55 } },
];

export function findArchetype(
  scores: { at: number; in: number; co: number; ev: number; rk?: number },
  gender: "M" | "F" | null
): Archetype {
  const pool = gender ? ARCHETYPES.filter(a => a.gender === gender) : ARCHETYPES;
  // Match by minimum Euclidean distance in fingerprint
  let best = pool[0]; let bestDist = Infinity;
  for (const a of pool) {
    const d =
      Math.pow(a.fingerprint.at - scores.at, 2) +
      Math.pow(a.fingerprint.in - scores.in, 2) +
      Math.pow(a.fingerprint.co - scores.co, 2) +
      Math.pow(a.fingerprint.ev - scores.ev, 2);
    if (d < bestDist) { bestDist = d; best = a; }
  }
  return best;
}

export function getArchetypeByCode(code: string): Archetype | undefined {
  return ARCHETYPES.find(a => a.code === code);
}
