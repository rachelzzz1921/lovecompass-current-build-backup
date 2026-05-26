/**
 * 套一 SELF 体系规范 —— 与 `套一体系.json` / suite1 题库 JSON 对齐。
 * 结果页映射、AI 聊天上下文应引用此文件，避免凭感觉写文案。
 */

export type SelfDimensionCode = "SA1" | "SA2" | "SA3" | "SA4" | "SA5" | "SA6";

export type SelfDimensionSpec = {
  code: SelfDimensionCode;
  name: string;
  coreQuestion: string;
  scoreDirection: "positive" | "reverse";
  color: string;
};

/** 六维定义（与套一体系.json `sixDimensions` 一致） */
export const SELF_DIMENSIONS: SelfDimensionSpec[] = [
  {
    code: "SA1",
    name: "自我吸引感知",
    coreQuestion: "我相信自己值得被爱吗？",
    scoreDirection: "positive",
    color: "oklch(0.68 0.18 285)",
  },
  {
    code: "SA2",
    name: "依恋焦虑",
    coreQuestion: "我在关系里容易不安全感吗？",
    scoreDirection: "reverse",
    color: "oklch(0.78 0.15 165)",
  },
  {
    code: "SA3",
    name: "依恋回避",
    coreQuestion: "我在关系里容易逃避亲密吗？",
    scoreDirection: "reverse",
    color: "oklch(0.72 0.18 360)",
  },
  {
    code: "SA4",
    name: "自我边界",
    coreQuestion: "我能守住自己吗？",
    scoreDirection: "positive",
    color: "oklch(0.82 0.14 75)",
  },
  {
    code: "SA5",
    name: "情绪调节",
    coreQuestion: "我能好好处理关系里的情绪吗？",
    scoreDirection: "positive",
    color: "oklch(0.82 0.14 200)",
  },
  {
    code: "SA6",
    name: "关系投入模式",
    coreQuestion: "我是怎么爱人的？",
    scoreDirection: "positive",
    color: "oklch(0.82 0.10 285)",
  },
];

export const SELF_DIMENSION_BY_CODE = Object.fromEntries(
  SELF_DIMENSIONS.map((d) => [d.code, d]),
) as Record<SelfDimensionCode, SelfDimensionSpec>;

/** 维度分已是 0–100；SA2/SA3 在题目层完成反向，后端 `dimension_scores` 越高＝越安全，勿再取补数。 */
export function normalizeDimensionScore(code: string, score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** 套一 `scoreDisplayRules.scoreMapping` —— 用户可见描述，禁止暴露难堪原话。 */
export function scoreDisplaySummary(score: number, possessive = "你的"): string {
  const s = normalizeDimensionScore("", score);
  if (s <= 30) return "这个维度还有很大的成长空间";
  if (s <= 50) return "这个维度还在发展阶段";
  if (s <= 65) return "这个维度表现稳定";
  if (s <= 80) return `这一维是${possessive}重要资产`;
  return `这一维是${possessive}核心竞争力`;
}

/** 示范档案 / 第三人称：按维度语义生成描述，避免 SA2/SA3 反向轴误读。 */
export function dimensionDisplaySummary(
  code: SelfDimensionCode,
  score: number,
  pronoun: "你" | "她" | "他",
): string {
  const s = normalizeDimensionScore(code, score);
  const p = pronoun === "你" ? "你" : pronoun;

  if (code === "SA2") {
    if (s < 45) return `${p}在关系里容易感到不安，需要更多可验证的回应`;
    if (s < 60) return `${p}在关系里对不确定性的反应偏敏感，处于中间带`;
    if (s < 80) return `${p}在关系里相对稳定，不太会被沉默牵动`;
    return `${p}在关系里安全感较强，很少被猜测拖走`;
  }
  if (code === "SA3") {
    if (s < 45) return `${p}在亲密靠近时容易后撤，习惯保留距离`;
    if (s < 60) return `${p}对亲密的节奏偏谨慎，需要慢慢打开`;
    if (s < 80) return `${p}能承接亲密，也会保留必要的自我空间`;
    return `${p}在关系里愿意靠近，也不太害怕被看见`;
  }

  if (p === "你") return scoreDisplaySummary(s);
  const possessive = p === "她" ? "她的" : "他的";
  if (s <= 30) return `这一维对${p}来说还有较大展开空间`;
  if (s <= 50) return `这一维在${p}的画像里仍在形成中`;
  if (s <= 65) return `这一维在${p}的画像里表现稳定`;
  if (s <= 80) return `这一维是${possessive}重要资产`;
  return `这一维是${possessive}核心竞争力`;
}

export function coreQuestionThirdPerson(code: SelfDimensionCode, pronoun: "她" | "他"): string {
  const map: Record<SelfDimensionCode, string> = {
    SA1: `${pronoun}是否相信自己值得被爱？`,
    SA2: `${pronoun}在关系里是否容易感到不安？`,
    SA3: `${pronoun}在关系里是否容易回避亲密？`,
    SA4: `${pronoun}能否守住自己的边界？`,
    SA5: `${pronoun}能否好好处理关系里的情绪？`,
    SA6: `${pronoun}是怎么爱人的？`,
  };
  return map[code];
}

/** SA2/SA3 落在 45–60 为灰色地带（套一 `grey_zone`） */
export function isAttachmentGreyZone(scores: Record<string, number>): boolean {
  const sa2 = scores.SA2 ?? 0;
  const sa3 = scores.SA3 ?? 0;
  return (sa2 >= 45 && sa2 < 60) || (sa3 >= 45 && sa3 < 60);
}

export type MatchPreset = { name: string; pct: number; tagline: string };

/** 套一 `matchTypes` + `matchPercentageRule`（71%–92%） */
export const MATCH_BY_ATTACHMENT: Record<string, MatchPreset[]> = {
  焦虑型: [
    { name: "薛宝钗型（安全稳定者）", pct: 92, tagline: "情绪稳定、边界清晰，能承接你的敏感" },
    { name: "贾探春型（清醒独立者）", pct: 78, tagline: "有原则但不压迫，给你确认也给你空间" },
    { name: "北静王型（有分寸的稳定者）", pct: 71, tagline: "亲密而不失自我，成熟不是距离" },
  ],
  回避型: [
    { name: "薛宝钗型（稳定不强求者）", pct: 88, tagline: "不会追着你跑，但会在你靠近时稳稳接住" },
    { name: "史湘云型（热烈不黏人）", pct: 79, tagline: "真实有趣，尊重你的节奏与精神标准" },
    { name: "贾探春型（独立对等者）", pct: 72, tagline: "清醒独立，势均力敌的相处" },
  ],
  混合型: [
    { name: "北静王型（稳定有分寸）", pct: 85, tagline: "能接你的热烈，也尊重你的空间" },
    { name: "薛宝钗型（安全稳定）", pct: 80, tagline: "稳定底盘，减少关系里的表演感" },
    { name: "贾探春型（清醒独立）", pct: 73, tagline: "同频成长，不把复杂当成问题" },
  ],
  安全型: [
    { name: "林黛玉型（深情敏感）", pct: 82, tagline: "把感情当真，情感浓度与你相称" },
    { name: "史湘云型（真实有趣）", pct: 78, tagline: "生命力互补，关系有温度也有趣味" },
    { name: "贾宝玉型（用心认真）", pct: 74, tagline: "记得细节，愿意认真投入" },
  ],
  高边界安全型: [
    { name: "北静王型（分寸感对等）", pct: 89, tagline: "亲密有边界，尊重彼此标准" },
    { name: "贾探春型（清醒对等）", pct: 82, tagline: "不将就、不消耗，原则同频" },
    { name: "薛宝钗型（稳定互补）", pct: 75, tagline: "稳定可靠，减少无效拉扯" },
  ],
  低自我高投入型: [
    { name: "薛宝钗型（稳定给力）", pct: 86, tagline: "能给你稳定回应，帮你把爱落在日常" },
    { name: "北静王型（分寸照顾）", pct: 79, tagline: "看见你的付出，也提醒你值得被同样对待" },
    { name: "贾探春型（清醒稳定）", pct: 72, tagline: "帮你把边界找回来，而不是继续单向流出" },
  ],
};

export const CHARACTER_EMOJI: Record<string, string> = {
  薛宝钗: "🪬",
  林黛玉: "🌸",
  妙玉: "🕯️",
  史湘云: "🎐",
  王熙凤: "👑",
  袭人: "🌺",
  贾探春: "🌿",
  贾宝玉: "🎭",
  柳湘莲: "🌊",
  贾雨村: "📜",
  北静王: "🏯",
  蒋玉菡: "🎵",
};

/** 套一 result_types × attachment_type（纠正旧数据把人物名写入 attachment 的情况） */
export const ATTACHMENT_BY_CHARACTER: Record<string, string> = {
  薛宝钗: "安全型",
  林黛玉: "焦虑型",
  妙玉: "回避型",
  史湘云: "混合型",
  王熙凤: "高边界安全型",
  袭人: "低自我高投入型",
  贾探春: "安全型",
  贾宝玉: "焦虑型",
  柳湘莲: "回避型",
  贾雨村: "混合型",
  北静王: "高边界安全型",
  蒋玉菡: "低自我高投入型",
};

export function isRedChamberCharacter(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(CHARACTER_EMOJI, value.trim());
}

/** Hero 主结果必须是依恋类型，不能是红楼人物名 */
export function resolvePrimaryAttachmentType(
  attachmentRaw: string | undefined | null,
  characterCode: string | undefined | null,
): string {
  const raw = String(attachmentRaw ?? "").trim();
  if (raw && !isRedChamberCharacter(raw)) return raw;
  const code = String(characterCode ?? "").trim();
  if (code && ATTACHMENT_BY_CHARACTER[code]) return ATTACHMENT_BY_CHARACTER[code];
  return "独特关系模式";
}

/** 套一 `tabDetails.behaviorSimulation.scenes` × 依恋类型行为倾向 */
export const BEHAVIORS_BY_ATTACHMENT: Record<
  string,
  Array<{ scene: string; title: string; body: string }>
> = {
  安全型: [
    {
      scene: "第一次见面",
      title: "你会先观察，再稳稳打开自己",
      body: "你不急着证明什么，更在意对方是否可靠、是否同频。确认安全后，你才愿意把真实的自己交出去——这和薛宝钗/贾探春式的清醒温柔一致。",
    },
    {
      scene: "发生冲突时",
      title: "你会先把火降下来，再谈事情",
      body: "你倾向保护关系不被情绪烧坏，先冷却、再沟通。这不是回避，而是你在用成熟的方式守住关系的底盘。",
    },
    {
      scene: "喜欢一个人时",
      title: "你的喜欢落在细节和节奏里",
      body: "你不会用夸张表演证明爱，而是稳定在场、边界清晰、能给也能收。你的安全感是真实的，不是演给任何人看的。",
    },
  ],
  焦虑型: [
    {
      scene: "第一次见面",
      title: "你会比表面看起来更认真",
      body: "你在意对方的一举一动，因为你是把感情当真的人。你不是「太多」，而是比多数人更早进入「这段关系对我很重要」的状态。",
    },
    {
      scene: "发生冲突时",
      title: "沉默或距离容易触发你的不安全感",
      body: "你可能嘴上说没事，心里却在找证据。练习直接说「我需要一点确认」，比反复求证更有效——你的敏感是天赋，不是缺陷。",
    },
    {
      scene: "喜欢一个人时",
      title: "你的喜欢浓度高、细节多",
      body: "你会记得对方说过的话，也在意回应的频率。你值得一个同样认真的人，而不是让你不断缩小需求的人。",
    },
  ],
  回避型: [
    {
      scene: "第一次见面",
      title: "你会保持观察距离",
      body: "你不是慢热，而是对平庸的亲密没有兴趣。你在筛选「是否值得靠近」，精神标准高是你的骨气，不是冷漠。",
    },
    {
      scene: "发生冲突时",
      title: "你倾向先撤回，再决定是否回来谈",
      body: "距离是你整理情绪的方式。需要注意的是：撤回之后，记得用一句话告诉对方「我还在，只是需要先冷静」。",
    },
    {
      scene: "喜欢一个人时",
      title: "你的表达克制，但认定后会很深",
      body: "你不擅长大张旗鼓的告白，但一旦确认对方懂你的节奏，你会给出很纯粹的投入。",
    },
  ],
  混合型: [
    {
      scene: "第一次见面",
      title: "你有时开放，有时保留",
      body: "这不是不稳定，而是足够真实——你在不同场合会呈现不同面。懂你的人，会被这种生命力吸引。",
    },
    {
      scene: "发生冲突时",
      title: "你的反应取决于当时的状态与信任度",
      body: "有时想谈，有时想走。关键不是压制波动，而是识别「我现在需要的是空间还是连接」。",
    },
    {
      scene: "喜欢一个人时",
      title: "你会热烈，也需要呼吸口",
      body: "你能在靠近与独立之间切换，这不是表演，是复杂而真实的你。",
    },
  ],
  高边界安全型: [
    {
      scene: "第一次见面",
      title: "你会快速判断对方是否尊重你的标准",
      body: "你清楚自己要什么，不会被一时氛围带跑。边界不是冷漠，是你对关系和自己的尊重。",
    },
    {
      scene: "发生冲突时",
      title: "你不容易被情绪裹挟",
      body: "你会把问题拉回可讨论的范围，而不是在拉扯里失去方向。记得偶尔也暴露一点柔软，不等于示弱。",
    },
    {
      scene: "喜欢一个人时",
      title: "你爱得现实，也绝对忠诚",
      body: "你的投入有分寸、有重量。你适合同样清醒的人，而不是用混乱证明爱的人。",
    },
  ],
  低自我高投入型: [
    {
      scene: "第一次见面",
      title: "你会优先照顾对方的感受",
      body: "你很容易感知别人需要什么，并先给出温度。你的善意是礼物，但也别忘了把自己的需求放进关系里。",
    },
    {
      scene: "发生冲突时",
      title: "你可能先妥协，再内耗",
      body: "你习惯把关系放在第一位，甚至牺牲自己的边界。下一段关系里，练习先说感受，而不是先道歉。",
    },
    {
      scene: "喜欢一个人时",
      title: "你的爱具体、日常、落在细节里",
      body: "你会用行动表达在乎，这是很多人学不会的。你也值得被同样具体地珍视。",
    },
  ],
};

/** 套一 `typePositivePackaging` —— 弱点正向包装 */
export function positiveFramingForAttachment(attachment: string): string {
  if (attachment === "混合型") return "你足够真实，而不是「不稳定」";
  if (attachment === "低自我高投入型") return "有一些地方值得你在下一段关系前认真看一看——尤其是如何把自己也放进优先级";
  return "这些倾向不是缺陷，而是你在关系里长期形成的保护方式";
}

export function growthAdviceForAttachment(attachment: string): string {
  switch (attachment) {
    case "焦虑型":
      return "下一段关系里，练习把「我需要确认」说成一句话，而不是一连串试探。你的真心值得被直接回应。";
    case "回避型":
      return "当你想撤退时，先留一句「我在，只是需要先冷静」。这不会削弱你的独立，反而会让对方更信任你。";
    case "低自我高投入型":
      return "在付出之前，先问自己：这个选择也在照顾我吗？你值得被同样具体地对待。";
    case "高边界安全型":
      return "保持标准的同时，允许 10% 的脆弱被看见。成熟不等于永远正确。";
    case "混合型":
      return "识别你此刻需要的是空间还是连接，并告诉对方。真实比一致更重要。";
    default:
      return "继续把稳定当礼物，也记得在关系里保留一点不可预测的柔软。";
  }
}
