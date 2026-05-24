import type {
  Behavior,
  CoreTrait,
  Dimension,
  Insight,
  MatchType,
  SelfResult,
} from "@/data/mockResult";
import {
  BEHAVIORS_BY_ATTACHMENT,
  CHARACTER_EMOJI,
  growthAdviceForAttachment,
  isAttachmentGreyZone,
  MATCH_BY_ATTACHMENT,
  normalizeDimensionScore,
  positiveFramingForAttachment,
  scoreDisplaySummary,
  SELF_DIMENSION_BY_CODE,
  SELF_DIMENSIONS,
  type SelfDimensionCode,
} from "@/data/selfSuiteSpec";

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
      radar_baseline?: Record<string, number>;
    };
  };
  ai_report?: string | null;
};

type ScoredDimension = Dimension & {
  rawScore: number;
  coreQuestion: string;
};

function rawScores(input: AttemptResultInput): Record<string, number> {
  if (input.dimension_scores && typeof input.dimension_scores === "object") {
    return input.dimension_scores;
  }
  const fromPayload = input.result_payload?.dimensions ?? [];
  return Object.fromEntries(fromPayload.map((d) => [d.code, Number(d.score)]));
}

function normalizeDimensions(input: AttemptResultInput): ScoredDimension[] {
  const scores = rawScores(input);
  const payloadDims = input.result_payload?.dimensions ?? [];

  return SELF_DIMENSIONS.map((spec) => {
    const payloadItem = payloadDims.find((d) => d.code === spec.code);
    const rawScore = normalizeDimensionScore(
      spec.code,
      Number(scores[spec.code] ?? payloadItem?.score ?? 0),
    );
    return {
      key: spec.code,
      label: spec.name,
      coreQuestion: spec.coreQuestion,
      value: rawScore,
      rawScore,
      color: spec.color,
      displaySummary: scoreDisplaySummary(rawScore),
    };
  });
}

function buildCoreTraits(
  profile: NonNullable<AttemptResultInput["result_payload"]>["archetype_profile"],
  attachment: string,
  dimensions: ScoredDimension[],
  greyZone: boolean,
): CoreTrait[] {
  const sorted = [...dimensions].sort((a, b) => b.rawScore - a.rawScore);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const description = profile?.description ?? "";
  const sentences = description.split(/(?<=[。！？])/).map((s) => s.trim()).filter(Boolean);

  const traits: CoreTrait[] = [
    {
      icon: "shield",
      highlight: true,
      title: highest ? `${highest.label}：${highest.displaySummary}` : "你在关系里有清晰的自我底色",
      body:
        sentences[0] ??
        `${highest?.coreQuestion ?? "你在关系里的模式"} —— 这是套一 SELF 六维里与你最贴近的一维。`,
    },
    {
      icon: "key",
      title: `${attachment}的相处节奏`,
      body: profile?.matching_logic
        ? `${profile.matching_logic}。${positiveFramingForAttachment(attachment)}`
        : positiveFramingForAttachment(attachment),
    },
    {
      icon: "eye",
      title: lowest ? `${lowest.label}：${lowest.displaySummary}` : "还有一些面在展开",
      body: greyZone
        ? `${lowest?.coreQuestion ?? "你的依恋维度"} 目前处于套一体系定义的「临界状态」—— 不是定论，而是提醒你有更大的弹性空间。`
        : `${lowest?.coreQuestion ?? "这一维"} 不是缺陷。${scoreDisplaySummary(lowest?.rawScore ?? 0)}，值得被温柔看见而不是被否定。`,
    },
  ];

  return traits;
}

function buildBehaviors(attachment: string): Behavior[] {
  return BEHAVIORS_BY_ATTACHMENT[attachment] ?? BEHAVIORS_BY_ATTACHMENT["安全型"];
}

function buildInsights(
  attachment: string,
  dimensions: ScoredDimension[],
  profile: NonNullable<AttemptResultInput["result_payload"]>["archetype_profile"],
  greyZone: boolean,
): Insight[] {
  const sorted = [...dimensions].sort((a, b) => b.rawScore - a.rawScore);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const matches = MATCH_BY_ATTACHMENT[attachment] ?? [];

  return [
    {
      kind: "strength",
      title: "你的高光",
      body: highest
        ? `在「${highest.label}」上，${highest.displaySummary}。套一里这一维对应：${highest.coreQuestion}`
        : "你在关系里已经有可依靠的稳定资源。",
    },
    {
      kind: "watch",
      title: "可以温柔留意",
      body: greyZone
        ? `你的 SA2/SA3 至少有一维落在 45–60 的灰色地带—— 主类型仍成立，但依恋模式还在过渡区，不必用单一标签限制自己。`
        : lowest
          ? `「${lowest.label}」${lowest.displaySummary}。${positiveFramingForAttachment(attachment)}`
          : "留意那些反复出现的内耗模式，它们往往指向真正需要被照顾的部分。",
    },
    {
      kind: "match",
      title: "匹配建议",
      body: matches[0]
        ? `与你同体系判断最同频的是 ${matches[0].name}（${matches[0].pct}% 参考契合）。${matches[0].tagline}。`
        : profile?.matching_logic ?? "优先找能读懂你节奏、也愿意一起练习沟通的人。",
    },
    {
      kind: "growth",
      title: "下一段关系里",
      body: growthAdviceForAttachment(attachment),
    },
  ];
}

function buildMatches(attachment: string): MatchType[] {
  const presets = MATCH_BY_ATTACHMENT[attachment] ?? MATCH_BY_ATTACHMENT["安全型"];
  return presets.map((item, index) => ({
    code: `M-${index + 1}`,
    name: item.name,
    pct: item.pct,
    tagline: item.tagline,
    top: index === 0,
  }));
}

function buildCharacterReasons(
  name: string,
  attachment: string,
  dimensions: ScoredDimension[],
  profile: NonNullable<AttemptResultInput["result_payload"]>["archetype_profile"],
): Array<{ title: string; body: string; highlight?: boolean }> {
  const baseline = profile?.radar_baseline ?? {};
  const deltas = dimensions
    .map((d) => ({
      dim: d,
      delta: d.rawScore - normalizeDimensionScore(d.key, Number(baseline[d.key as SelfDimensionCode] ?? d.rawScore)),
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const closest = deltas[0]?.dim;
  const contrasting = deltas[deltas.length - 1]?.dim;

  return [
    {
      highlight: true,
      title: `同样的「${attachment}」人格底色`,
      body: profile?.description ?? `${name} 在红楼人格谱系里，代表的是 ${attachment} 的关系模式。`,
    },
    {
      title: closest ? `在「${closest.label}」上，你和她的轨迹相近` : "你们在关系里都有可被识别的稳定模式",
      body: closest
        ? `套一雷达基准里，${name} 型在 ${closest.key} 有典型轮廓；你目前是「${closest.displaySummary}」，这与该原型的核心逻辑一致。`
        : profile?.matching_logic ?? "你们的相似不在表演，而在相处结构。",
    },
    {
      title: contrasting ? `在「${contrasting.label}」上，你有自己的变体` : "你并不是课本式的人物复刻",
      body: contrasting
        ? `${contrasting.coreQuestion} 对你而言是「${contrasting.displaySummary}」。这正是真人比标签更生动的地方。`
        : "体系给你方向，不是牢笼。",
    },
  ];
}

function attachmentCodeLabel(attachment: string, greyZone: boolean): string {
  const base = `SELF · ${attachment.toUpperCase().replace(/\s+/g, " ")}`;
  return greyZone ? `${base} · GREY ZONE` : base;
}

export function mapAttemptToSelfResult(input: AttemptResultInput): SelfResult {
  const payload = input.result_payload ?? {};
  const profile = payload.archetype_profile ?? {};
  const name = String(payload.archetype_code ?? input.archetype_code ?? "你的关系画像");
  const attachment = String(profile.attachment_type ?? payload.attachment_type ?? "独特关系模式");
  const scores = rawScores(input);
  const greyZone = isAttachmentGreyZone(scores);
  const dimensions = normalizeDimensions(input);
  const overallScore = normalizeDimensionScore(
    "SA1",
    Number(input.ros_index ?? average(dimensions.map((d) => d.rawScore))),
  );

  return {
    archetype: {
      badge: "你的依恋类型",
      name,
      code: attachmentCodeLabel(attachment, greyZone),
      tagline: profile.tagline ?? "这是一面会进化的关系镜子。",
      description: profile.description ?? "你的画像来自套一 SELF 六维模型与红楼人格原型匹配。",
    },
    overallScore,
    dimensions,
    matches: buildMatches(attachment),
    insights: buildInsights(attachment, dimensions, profile, greyZone),
    behaviors: buildBehaviors(attachment),
    coreTraits: buildCoreTraits(profile, attachment, dimensions, greyZone),
    character: {
      emoji: CHARACTER_EMOJI[name] ?? "🪞",
      name,
      pinyin: `${name} · ${attachment}`,
      archetypeLine: profile.tagline ?? "在红楼梦的世界里，你也有对应的人格原型。",
      quote: profile.description ?? "这不是固定标签，而是理解你关系模式的一扇窗。",
      reasons: buildCharacterReasons(name, attachment, dimensions, profile),
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
