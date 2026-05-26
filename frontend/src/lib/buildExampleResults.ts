import type { SelfResult } from "@/data/mockResult";
import type { RosCoupleResult, RosSingleResult } from "@/data/rosTypes";
import type { MateResult } from "@/data/mateTypes";
import type { ExampleCharacter } from "@/data/exampleCharacters";

function buildExampleModuleMarketMapping(
  mod: ExampleCharacter["mate"]["moduleScores"][number],
): string {
  const isRisk = mod.code.endsWith("5");
  const effective = isRisk ? 100 - mod.score : mod.score;
  const tier =
    effective >= 81
      ? "在婚恋市场里，这是你的筛人优势。"
      : effective >= 66
        ? "在婚恋市场里，这是稳定加分项。"
        : effective >= 51
          ? "在婚恋市场里，这不会拖后腿，但别指望它单独替你筛人。"
          : effective >= 31
            ? "在婚恋市场里，这里还有明显提升空间。"
            : "在婚恋市场里，这是当前最值得优先建设的方向。";
  return `${mod.evidence}。${tier}`;
}
import { buildExampleSelfResult } from "@/lib/buildExampleSelfResult";
import { buildExampleRosLayerPayload } from "@/lib/buildExampleRosLayers";
import { buildExampleMateSimulator } from "@/lib/buildExampleMateSimulator";
import { buildRehearseEpisodes } from "@/lib/mateRehearseEpisodes";

function exampleBehaviorAtoms(attachment: string, tags: string[]): string[] {
  const atoms: string[] = [];
  if (attachment.includes("焦虑")) atoms.push("表达型");
  if (attachment.includes("回避") || tags.some((t) => t.includes("慢热") || t.includes("筛选"))) {
    atoms.push("筛选型", "观察型");
  }
  if (attachment.includes("安全")) atoms.push("托底型");
  if (!atoms.length) atoms.push("观察型");
  return atoms;
}

export { buildExampleSelfResult };

const ROS_DIM_META: Array<{ key: RosSingleResult["dims"][number]["key"]; label: string; color: string }> = [
  { key: "at", label: "吸引基础", color: "#a5b4fc" },
  { key: "in", label: "互动质量", color: "#818cf8" },
  { key: "co", label: "兼容程度", color: "#6366f1" },
  { key: "ev", label: "关系走向", color: "#4f46e5" },
  { key: "rk", label: "风险信号", color: "#f87171" },
];

export function buildExampleRosResult(character: ExampleCharacter): RosSingleResult {
  const { ros } = character;
  const dims = ROS_DIM_META.map((m) => ({
    key: m.key,
    label: m.label,
    value: ros.dims[m.key],
    color: m.color,
  }));
  const resonanceScore = Math.round(dims.reduce((s, d) => s + d.value, 0) / dims.length);
  const { layerDetails, layerExpansion } = buildExampleRosLayerPayload(character, dims);

  return {
    code: `EX-${character.id}`,
    type: {
      key: ros.typeName,
      name: ros.typeName,
      one_liner: ros.typeOneLiner,
      description: ros.typeDescription,
    },
    stageId: ros.stageId,
    timeLabel: "示范场景",
    dims,
    layerDetails,
    insights: ros.insights,
    resonance: {
      score: resonanceScore,
      tier: resonanceScore >= 75 ? "深度共鸣" : resonanceScore >= 60 ? "温柔磨合" : "初见雏形",
      desc: ros.relationshipNote,
    },
    weather: ros.weather,
    staticCopy: {
      hero_quote: ros.heroQuote,
      type: { hero_quote: ros.heroQuote, tagline: ros.typeOneLiner, desc: ros.typeDescription },
    },
    aiContent: {
      mode: "deterministic",
      ...(ros.blindSpot ? { blind_spot: ros.blindSpot } : {}),
      layer_expansion: layerExpansion,
    },
    keywords: [ros.partner, ros.typeName, "示范档案"],
  };
}

export function buildExampleRosCoupleResult(character: ExampleCharacter): RosCoupleResult {
  const single = buildExampleRosResult(character);
  const { ros } = character;
  const partnerOffset = character.id === "lin-daiyu" ? -8 : character.id === "jia-baoyu" ? 6 : -4;
  const youScore = single.resonance?.score ?? 72;
  const taScore = Math.max(55, Math.min(95, youScore + partnerOffset));
  const gap = Math.abs(youScore - taScore);

  const layerCompare = (["at", "in", "co", "ev", "rk"] as const).reduce<RosCoupleResult["layerCompare"]>(
    (acc, key) => {
      const youDim = single.dims.find((d) => d.key === key);
      const you = youDim?.value ?? 70;
      const ta = Math.max(40, Math.min(95, you + (key === "ev" ? partnerOffset * 1.5 : partnerOffset)));
      const layerGap = Math.abs(you - ta);
      acc[key] = {
        code: key.toUpperCase(),
        label: youDim?.label ?? key,
        you: Math.round(you),
        ta: Math.round(ta),
        gap: Math.round(layerGap),
        gap_signed: Math.round(you - ta),
        diff_level: layerGap < 10 ? "consistent" : layerGap < 20 ? "moderate" : "significant",
        diff_color: layerGap < 10 ? "green" : layerGap < 20 ? "blue" : "amber",
        diff_dots: layerGap < 10 ? 1 : layerGap < 20 ? 2 : 3,
        you_perspective: you >= 65 ? "感受较积极" : "还在展开",
        ta_perspective: ta >= 65 ? "信号较积极" : "有些保留",
        gap_text:
          layerGap >= 10
            ? `你在「${youDim?.label}」(${you}) 与对方 (${ta}) 感受有差距——值得一次不被打扰的对话。`
            : `你们在「${youDim?.label}」上感受接近。`,
        you_evidence: `你在「${youDim?.label}」相关场景里，作答模式偏 ${you >= 65 ? "积极" : "谨慎"}。`,
        ta_evidence: `对方在「${youDim?.label}」上的信号与你有 ${layerGap >= 10 ? "差异" : "同频"}。`,
      };
      return acc;
    },
    {},
  );

  return {
    code: `EX-COUPLE-${character.id}`,
    resonance: {
      score: Math.round((youScore + taScore) / 2),
      tier: "深度共鸣",
      desc: ros.relationshipNote,
    },
    perspectives: {
      you: { score: youScore, label: character.name },
      ta: { score: taScore, label: ros.partner },
    },
    perceptionGap: {
      value: gap,
      level: gap < 10 ? "consistent" : gap < 20 ? "moderate" : "significant",
      color: gap < 10 ? "green" : gap < 20 ? "blue" : "amber",
      label: gap < 10 ? "感知高度一致" : gap < 20 ? "有一些不同的感受" : "感知差距较大",
      message:
        gap < 10
          ? "你们对这段关系的感受比较接近——这是很难得的同频。"
          : "你们对这段关系的感受有一些不同——这不代表谁对谁错。",
    },
    weather: ros.weather,
    stageId: ros.stageId,
    type: single.type,
    dims: single.dims.map((d) => ({
      ...d,
      you: d.value,
      ta: Math.max(40, Math.min(95, d.value + partnerOffset)),
    })),
    layerCompare,
    insights: ros.insights,
    bond: {
      combo: `${character.attachment}×安全型`,
      name: "稳中有变",
      body: `${character.name} 的 ${character.attachment} 与 ${ros.partner} 的稳定感形成互补——吸引力真实，节奏需要对齐。`,
      you_type: character.attachment,
      ta_type: "安全型",
      gap_reason: "EV 层差值常见于一方更积极、一方更谨慎——不是谁错，是感受频道不同。",
      advice_you: "说需求，而不是等确认。",
      advice_ta: "留一句「我在」，而不是直接消失。",
      self_unlocked: true,
      partner_unlocked: true,
    },
    keywords: [character.name, ros.partner, "双人示范"],
    highlights: {
      glow: ros.insights.find((i) => i.kind === "strength")?.body ?? "你们有很难被替代的同频瞬间。",
      shadow: ros.insights.find((i) => i.kind === "watch")?.body ?? "有些层的感受还不完全一致。",
    },
    timeline: [],
    milestones: [],
    nextSignal: "",
    gap: { dimKey: "ev", dimLabel: "关系走向", body: layerCompare?.ev?.gap_text ?? "" },
    consensus: { dimLabel: "兼容程度", body: "你们在相处节奏上有一致的部分。" },
    strengths: [],
    blindspots: [],
    collision: { combo: `${character.attachment}×安全型`, name: "稳中有变", body: "" },
    triggers: { you: "", ta: "" },
    loop: [],
    bridge: `如果把 ${character.name} 与 ${ros.partner} 的分歧说具体，关系会自己告诉你们下一步。`,
    advice: [],
    horizons: [],
    doDont: { do: [], dont: [] },
    prescription: {
      warmup: "你们的关系不需要被修理——只需要被更清楚地看见。",
      chiefComplaint: `感知差 ${gap} 分 · ${ros.typeName}`,
      rx: "每周一次\n各说一件「想说但没说的话」",
      followUp: "三个月后",
    },
    shareLine: `我和 ${ros.partner}，是 ${ros.typeName} 的样子。`,
    ai_content: { mode: "deterministic" },
  };
}

export function buildExampleMateResult(character: ExampleCharacter, attemptId: string): MateResult {
  const { mate } = character;
  const isMale = character.gender === "male";
  const modulePrefix = isMale ? "MS" : "FS";
  const loveTimeline = [
    { day: 1, label: "初识", mood: "第一次见面，频道对了会有明显心动" },
    {
      day: 30,
      label: "熟悉",
      danger: mate.adviceWarning,
    },
    { day: 90, label: "深度", mood: mate.matchZone },
  ];

  return {
    attemptId,
    gender: character.gender,
    positionName: mate.positionName,
    quadrant: "Q-EX",
    identityCard: {
      title: mate.positionName,
      tags: mate.tags,
      tagline: mate.tagline,
      subtitle: character.epithet,
      subTitle: "EXAMPLE · MATE · 示范档案",
      quadrantResult: mate.positionName,
      quadrantDesc: mate.quadrantDesc,
      slogan: mate.tagline,
      assets: mate.assets,
      badges: mate.assets.map((a) => ({ name: a.label, result: a.summary })),
    },
    marketCoordinate: {
      axisX: mate.axisX,
      axisY: mate.axisY,
      horizontalLabel: "第一印象",
      verticalLabel: "现实托底感",
      summary: {
        firstImpression: mate.assets[0]?.summary ?? "",
        longTerm: mate.assets[2]?.summary ?? mate.tagline,
        retention: "示范推算",
        riskLevel: mate.moduleScores.find((m) => m.code.endsWith("5"))?.tag ?? "—",
      },
      insight: mate.marketInsight,
    },
    matchmakerRecords: [
      {
        id: "ex-1",
        title: "第一次见面时，约会对象会……",
        narrative: mate.marketInsight,
        remember: mate.tags.slice(0, 2),
        notRemember: ["具体细节", "你说了哪句话"],
        discover: mate.reverseFront,
      },
      {
        id: "ex-2",
        title: "五分钟后，对方开始……",
        remember: [mate.tags[1] ?? mate.tags[0], character.attachment],
        notRemember: ["你的条件清单"],
        discover: mate.matchZone,
      },
      {
        id: "ex-3",
        title: "离开以后，对方会……",
        remember: [mate.tagline.split("，")[0] ?? mate.tagline],
        notRemember: ["你对关系的全部定义"],
        discover: mate.reverseBack,
      },
    ],
    loveTimeline,
    upperMatch: {
      title: "对你来说 · 值得争取",
      bandLabel: "对你上限 · 适配 86",
      matchScore: 86,
      stableProbability: 84,
      summary: `对你来说，上限不是条件最好的人，而是——${mate.adviceGood}`,
      traits: { "现实条件(P1)": 78, "情感需求(P2)": 82, "长期规划(P4)": 80 },
      portraits: [
        {
          id: "ex-upper-1",
          name: isMale ? "成熟读懂型" : "成熟独立型",
          tags: isMale ? ["32-40岁", "一二线稳定职", "晚婚可接受"] : ["30-38岁", "有主见", "见过世面"],
          snapshot: isMale
            ? "事业收入在同龄中游以上，不会被慢热吓跑，第二次见面能记住细节。"
            : "自己有收入和生活，找并肩的人，不会因你慢热就作。",
          matchScore: 86,
          stableProbability: 84,
        },
      ],
    },
    sweetSpot: {
      title: "对你来说 · 最合拍",
      bandLabel: "对你甜区 · 适配 79",
      matchScore: 79,
      successRate: 79,
      stableProbability: 78,
      profile: { 现实差距: "≤15 分", 情感同步: "高", 相处节奏: "稳定推进", 婚恋观: "长期主义" },
      reason: `对你来说，最省力的是——${mate.matchZone}`,
      summary: `对你来说，最合拍的是——${mate.tagline}`,
      portraits: [
        {
          id: "ex-sweet-1",
          name: isMale ? "务实同频型" : "务实稳定型",
          tags: ["同城或邻近", "生活预期接近", "婚恋观偏现实"],
          snapshot: "条件差距不大，第一次就会聊城市、工作、未来三年计划，而不是只聊感觉。",
          matchScore: 79,
          stableProbability: 78,
        },
      ],
    },
    lowerMatch: {
      title: "对你来说 · 尽量避开",
      bandLabel: "对你风险偏高 · 46",
      matchScore: 46,
      summary: `对你来说，要尽量避开——${mate.adviceWarning}`,
      traits: { "风险碰撞(P5)": 58, "刺激需求": 72, "节奏错配": 65 },
      portraits: [
        {
          id: "ex-lower-1",
          name: isMale ? "快餐筛选型" : "强刺激需求型",
          tags: isMale ? ["耐心≤4周", "重第一印象"] : ["要高浓度浪漫", "耐心≤1个月"],
          snapshot: isMale
            ? "第一次见面没上头，第二面就开始降温；你的深度价值需要相处才看得见。"
            : "需要高频确认和仪式感——这类人对慢热型最难耐心，你的稳容易被误读成「不够上头」。",
          matchScore: 46,
        },
        {
          id: "ex-lower-2",
          name: isMale ? "第一眼派" : "现成条件派",
          tags: ["重外形/氛围", "耐心有限"],
          snapshot: "相亲像选秀，你的长期价值往往等不到被验证就已经离场。",
          matchScore: 44,
        },
      ],
    },
    matchZone: {
      sliderTitle: "什么样的对象更适合你",
      zones: ["风险区", "最佳适配区", "挑战上限区"],
      userZone: "最佳适配区",
      sweetScore: 79,
      upperScore: 86,
      lowerScore: 46,
      stableProbability: 78,
      targetPortrait: isMale ? "务实稳定型" : "务实同频型",
      matchingReason: mate.adviceGood,
      meetScene: `深度对话比热闹场合更适合 ${character.name}`,
      riskPortrait: mate.adviceWarning,
    },
    secularAdvice: [],
    aiLens: [],
    deepArchive: { title: "深度档案", items: [mate.reverseFront, mate.reverseBack], cta: "示范数据" },
    socialQuotes: [mate.socialQuote],
    modules: mate.moduleScores.map((m) => ({
      code: m.code,
      label: m.label,
      displaySummary: m.evidence,
      score: m.score,
    })),
    profileEngine: {
      main_type: mate.positionName,
      sub_type: character.epithet,
      trait_atoms: mate.tags,
      behavior_atoms: exampleBehaviorAtoms(character.attachment, mate.tags),
      relationship_atoms: [mate.matchZone],
      scene_atoms: ["示范场景"],
    },
    moduleAccordions: mate.moduleScores.map((m) => ({
      code: m.code,
      dimension: m.label,
      display: `${m.score} 分`,
      visual: `${modulePrefix} · ${m.tag}`,
      tag: m.tag,
      subBadges: [character.name, "示范"],
      answerEvidence: m.evidence,
      marketMapping: buildExampleModuleMarketMapping(m),
    })),
    reverse: {
      front: {
        title: "外界误读",
        subtitle: "第一眼标签",
        content: mate.reverseFront,
        tip: "点击翻转",
      },
      back: {
        title: "镜像反转",
        subtitle: "真实机制",
        content: mate.reverseBack,
        mechanism: "MATE「镜像反转」模块",
        cost: "被误读前的沟通成本",
        shareTip: "示范档案 · 非真实测评",
      },
    },
    observeSlices: [
      {
        slice: "01 / 03",
        title: "第一次见面时，约会对象会……",
        correctTraits: mate.tags.slice(0, 2).join("、"),
        missingTraits: "具体细节、你说了哪句话",
      },
      {
        slice: "02 / 03",
        title: "五分钟后，对方开始……",
        correctTraits: `${character.attachment}、${mate.tags[0]}`,
        missingTraits: "你的条件清单",
      },
      {
        slice: "03 / 03",
        title: "离开以后，对方会……",
        correctTraits: mate.matchZone,
        missingTraits: "你对关系的全部定义",
      },
    ],
    rehearseEpisodes: buildRehearseEpisodes(loveTimeline, {
      profileEngine: {
        main_type: mate.positionName,
        sub_type: character.epithet.split("·")[1]?.trim() || "稳定推进型",
        trait_atoms: mate.tags,
        behavior_atoms: exampleBehaviorAtoms(character.attachment, mate.tags),
        relationship_atoms: [mate.matchZone],
        scene_atoms: [
          "第一次见面容易留下「想再聊一次」的钩子",
          "试探期里，节奏比宣言更能说明问题",
          "深度阶段，细节记忆和情绪托底开始叠加",
        ],
      },
      gender: character.gender,
      positionName: mate.positionName,
      moduleScores: Object.fromEntries(mate.moduleScores.map((m) => [m.code, m.score])),
      axisY: mate.axisY,
      lowDisplay: mate.tags.some((t) => t.includes("低显示") || t.includes("慢热")),
    }),
    simulator: buildExampleMateSimulator(character),
    adviceV4: { goodNews: mate.adviceGood, warning: mate.adviceWarning },
    lensGrid: [
      { title: "市场视角", desc: mate.marketInsight },
      { title: "关系视角", desc: mate.reverseBack },
      { title: "跨套联动", desc: `完成 SELF 后，${character.attachment} 会与「${mate.positionName}」合并解读。` },
    ],
    insights: [
      {
        kind: "strength",
        title: "你的市场优势",
        body: `定位「${mate.positionName}」——${mate.tagline}`,
      },
      {
        kind: "watch",
        title: "可以温柔留意",
        body: mate.adviceWarning,
      },
      {
        kind: "match",
        title: "匹配建议",
        body: mate.matchZone,
      },
      {
        kind: "growth",
        title: "提升路径",
        body: mate.adviceGood,
      },
    ],
    footerMarquee: { marquee: [mate.socialQuote, mate.tagline, "示范档案 · 非真实测评"], intervalMs: 4000 },
    aiContent: { mode: "deterministic", status: "ready" },
  };
}
