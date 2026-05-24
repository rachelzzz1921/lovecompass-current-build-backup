import type {
  Behavior,
  CoreTrait,
  Dimension,
  Insight,
  MatchType,
  SelfResult,
} from "@/data/mockResult";

const DIMENSION_COLORS: Record<string, string> = {
  SA1: "oklch(0.68 0.18 285)",
  SA2: "oklch(0.78 0.15 165)",
  SA3: "oklch(0.72 0.18 360)",
  SA4: "oklch(0.82 0.14 75)",
  SA5: "oklch(0.82 0.14 200)",
  SA6: "oklch(0.82 0.10 285)",
};

const CHARACTER_EMOJI: Record<string, string> = {
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

const ATTACHMENT_BADGE: Record<string, string> = {
  安全型: "你的依恋类型",
  焦虑型: "你的依恋类型",
  回避型: "你的依恋类型",
  混合型: "你的依恋类型",
  高边界安全型: "你的依恋类型",
  低自我高投入型: "你的依恋类型",
};

export type AttemptResultInput = {
  test_id?: string;
  archetype_code?: string;
  archetype_gender?: string;
  ros_index?: number;
  dimension_scores?: Record<string, number>;
  result_payload?: {
    attachment_type?: string;
    archetype_code?: string;
    dimensions?: Array<{ code: string; name: string; core?: string; score: number }>;
    archetype_profile?: {
      attachment_type?: string;
      tagline?: string;
      description?: string;
      matching_logic?: string;
    };
  };
  ai_report?: string | null;
};

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function displayScore(code: string, score: number): number {
  if (code === "SA2" || code === "SA3") return clampScore(100 - score);
  return clampScore(score);
}

function normalizeDimensions(input: AttemptResultInput): Dimension[] {
  const raw =
    input.result_payload?.dimensions ??
    Object.entries(input.dimension_scores ?? {}).map(([code, score]) => ({
      code,
      name: code,
      score: Number(score),
    }));

  return raw.map((item) => ({
    key: item.code,
    label: item.name,
    value: displayScore(item.code, Number(item.score)),
    color: DIMENSION_COLORS[item.code] ?? "oklch(0.68 0.18 285)",
  }));
}

function buildCoreTraits(
  profile: NonNullable<AttemptResultInput["result_payload"]>["archetype_profile"],
  dimensions: Dimension[],
): CoreTrait[] {
  const sorted = [...dimensions].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const mid = sorted[Math.floor(sorted.length / 2)] ?? top;
  const low = sorted[sorted.length - 1];

  return [
    {
      icon: "shield",
      highlight: true,
      title: top ? `${top.label}是你最鲜明的底色` : "你在关系里有自己的节奏",
      body:
        profile?.description ??
        "你的画像来自 SELF 六维模型——不是标签，而是理解你在亲密关系里如何靠近、如何撤退、如何爱人。",
    },
    {
      icon: "key",
      title: profile?.attachment_type ? `${profile.attachment_type}的相处方式` : "你的依恋底色",
      body:
        profile?.matching_logic ??
        "你在关系里既需要被理解，也需要保留自己的空间。找到节奏同频的人，会比勉强适配更省力。",
    },
    {
      icon: "eye",
      title: low ? `${low.label}值得被温柔看见` : "还有一些面在慢慢展开",
      body: low
        ? `这一维（${low.value}）不是缺陷，而是你在压力或不确定时最容易摇摆的地方——给它练习，而不是苛责。`
        : "随着你完成更多测试与对话，MIRROR 会持续更新这份画像。",
    },
    {
      icon: "shield",
      title: mid ? `${mid.label}是你的弹性带` : "你的关系弹性",
      body: `在「${mid?.label ?? "日常相处"}」上，你往往能在坚持自我与照顾对方之间找到中间地带。`,
    },
  ].slice(0, 3) as CoreTrait[];
}

function buildBehaviors(name: string, attachment?: string): Behavior[] {
  return [
    {
      scene: "第一次见面",
      title: "你不会急着把所有自己交出去",
      body: `作为「${name}」型的人，你更习惯先观察、再打开——对方是否安全、是否同频，往往比第一印象更重要。`,
    },
    {
      scene: "发生冲突时",
      title: attachment?.includes("回避") ? "你会先拉开距离，再回来谈" : "你会先把情绪降下来",
      body:
        attachment?.includes("焦虑")
          ? "冲突容易触发你的不安全感，你可能会更想确认对方还在——学会先说感受，比反复求证更有效。"
          : "你倾向保护关系不被情绪烧坏，但别让对方误读为冷淡；一句「我在，只是需要先冷静」会很有帮助。",
    },
    {
      scene: "喜欢一个人时",
      title: "你的喜欢落在细节里",
      body: `你的「${name}」式温柔，往往体现在具体、日常、可感知的小事上——这比华丽的告白更接近真实的你。`,
    },
  ];
}

function buildInsights(dimensions: Dimension[], payload?: AttemptResultInput["result_payload"]): Insight[] {
  const sorted = [...dimensions].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const low = sorted[sorted.length - 1];

  return [
    {
      kind: "strength",
      title: "你的高光",
      body: top
        ? `${top.label}（${top.value}）是你当前最稳定的关系资源——在多数场景里，它都在支持你做出更成熟的选择。`
        : "你已经在关系里积累了不少可依靠的内在资源。",
    },
    {
      kind: "watch",
      title: "可以温柔留意",
      body: low
        ? `${low.label}（${low.value}）相对偏低——在压力或不确定时，这里最容易出现摇摆，值得被看见而不是被否定。`
        : "留意那些让你反复内耗的模式，它们往往指向真正需要被照顾的部分。",
    },
    {
      kind: "match",
      title: "匹配建议",
      body:
        payload?.archetype_profile?.matching_logic ??
        "优先找能读懂你节奏、也愿意一起练习沟通的人——同频比完美更重要。",
    },
    {
      kind: "growth",
      title: "下一段关系里",
      body: "练习先说感受、再讲道理。当你愿意先暴露一点脆弱，对方往往会用更多柔软回应你。",
    },
  ];
}

function buildMatches(payload?: AttemptResultInput["result_payload"]): MatchType[] {
  const logic = payload?.archetype_profile?.matching_logic ?? "情绪稳定、边界清晰、能给你安全感的人";
  const parts = logic.split(/[、，,；;]/).map((s) => s.trim()).filter(Boolean);
  const names = parts.slice(0, 3);
  while (names.length < 3) {
    names.push(["滋养型伴侣", "稳定型伴侣", "探索型伴侣"][names.length] ?? "同频伴侣");
  }
  const pcts = [88, 79, 71];
  return names.map((name, index) => ({
    code: `M-${index + 1}`,
    name: name.length > 12 ? `${name.slice(0, 11)}…` : name,
    pct: pcts[index] ?? 70,
    tagline: index === 0 ? "与当前画像最同频" : "值得继续观察的相处类型",
    top: index === 0,
  }));
}

function buildCharacterReasons(
  name: string,
  dimensions: Dimension[],
  payload?: AttemptResultInput["result_payload"],
): Array<{ title: string; body: string; highlight?: boolean }> {
  const sorted = [...dimensions].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const low = sorted[sorted.length - 1];
  const profile = payload?.archetype_profile;
  return [
    {
      highlight: true,
      title: `同样的「${payload?.attachment_type ?? profile?.attachment_type ?? "关系"}」底色`,
      body:
        profile?.description ??
        `${name}在关系里有一种可被依靠的稳定感——你的 ${top?.label ?? "核心维度"}（${top?.value ?? "—"}）也指向类似的方向。`,
    },
    {
      title: "同样把柔软藏在克制后面",
      body: low
        ? `你在 ${low.label}（${low.value}）上的表达偏克制——不是不在乎，而是习惯先把自己处理好，再把结果交出去。`
        : "你不擅长大张旗鼓地表达，但你的在场本身就是一种语言。",
    },
    {
      title: "同样懂得关系需要节奏",
      body:
        profile?.matching_logic ??
        "你知道什么时候靠近、什么时候保留边界——这是成熟关系里非常稀缺的能力。",
    },
  ];
}

export function mapAttemptToSelfResult(input: AttemptResultInput): SelfResult {
  const payload = input.result_payload ?? {};
  const profile = payload.archetype_profile ?? {};
  const name = String(payload.archetype_code ?? input.archetype_code ?? "你的关系画像");
  const attachment = String(profile.attachment_type ?? payload.attachment_type ?? "独特关系模式");
  const dimensions = normalizeDimensions(input);
  const overallScore = clampScore(Number(input.ros_index ?? average(dimensions.map((d) => d.value))));

  return {
    archetype: {
      badge: ATTACHMENT_BADGE[attachment] ?? "你的关系画像",
      name,
      code: `SELF · ${attachment.toUpperCase().replace(/\s+/g, " ")}`,
      tagline: profile.tagline ?? "这是一面会进化的关系镜子。",
      description: profile.description ?? "你的画像来自 SELF 测试与六维模型评分。",
    },
    overallScore,
    dimensions,
    matches: buildMatches(payload),
    insights: buildInsights(dimensions, payload),
    behaviors: buildBehaviors(name, attachment),
    coreTraits: buildCoreTraits(profile, dimensions),
    character: {
      emoji: CHARACTER_EMOJI[name] ?? "🪞",
      name,
      pinyin: `${name.toUpperCase()} · ${attachment}`,
      archetypeLine: profile.tagline ?? "在红楼梦的世界里，你也有对应的人格原型。",
      quote: profile.description ?? "这不是固定标签，而是理解你关系模式的一扇窗。",
      reasons: buildCharacterReasons(name, dimensions, payload),
    },
    lockedTeasers: [
      {
        id: "ros",
        title: "SET · 02 / ROS — 这段关系的画像",
        hint: "用 SELF 的底片叠加 ROS，看你和那个人之间真正发生了什么。",
      },
      {
        id: "mate",
        title: "SET · 03 / MATE — 你的择偶坐标",
        hint: "三套数据合成终极画像，解锁实时更新的人格档案。",
      },
    ],
  };
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}
