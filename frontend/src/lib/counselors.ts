/** MIRROR 四位 AI 顾问 — 与 backend `chat_analysts.slug` 及 Agent Skill 对齐 */

export type CounselorAccent = "amber" | "cyan" | "rose" | "violet";

export type Counselor = {
  id: string;
  name: string;
  englishName: string;
  title: string;
  tagline: string;
  emoji: string;
  accent: CounselorAccent;
  description: string;
  prompts: string[];
};

export const COUNSELORS: Counselor[] = [
  {
    id: "oracle",
    name: "祖师爷",
    englishName: "Oracle",
    title: "直球真话顾问",
    tagline: "说有用的话，不灌让你舒坦的空话",
    emoji: "🏮",
    accent: "amber",
    description:
      "街头智慧型导师：读懂信号与边界，谈吸引、体面与真诚。适合「他到底什么意思」「我该进还是退」。",
    prompts: [
      "你直说，他这样是不是不喜欢我？",
      "我是不是在讨好里越陷越深？",
      "想见一个人，怎么说才不尴尬？",
      "我该怎么分清真心和表演？",
    ],
  },
  {
    id: "darwin",
    name: "进化论",
    englishName: "Darwin",
    title: "关系策略顾问",
    tagline: "清醒是为了更好地爱，不是为了逃离爱",
    emoji: "🧬",
    accent: "cyan",
    description:
      "用关系进化视角帮你看投入产出、错配与长期节奏。适合「值不值得继续」「怎么设边界」。",
    prompts: [
      "这段关系继续投入明智吗？",
      "我们之间的价值交换平衡吗？",
      "我该提高标准还是先观察？",
      "怎么判断这是消耗型还是成长型关系？",
    ],
  },
  {
    id: "haven",
    name: "是妻子也是母亲",
    englishName: "Haven",
    title: "港湾陪伴者",
    tagline: "你可以暂时不坚强",
    emoji: "🕯️",
    accent: "rose",
    description:
      "分手、失去、走不出来时的温柔陪伴。不催促、不设时间表，先接住情绪。",
    prompts: [
      "分手很久了还是走不出来，正常吗？",
      "今晚特别想他，我该怎么办？",
      "为什么别人都能放下，我不行？",
      "我只是想有人听我说完。",
    ],
  },
  {
    id: "sage",
    name: "学者",
    englishName: "Sage",
    title: "关系结构分析师",
    tagline: "帮你看清结构，而不是替你做决定",
    emoji: "📜",
    accent: "violet",
    description:
      "五层结构 + 重复模式觉察。适合「为什么总在同一个点卡住」「这段关系到底哪里不对」。",
    prompts: [
      "我为什么总是在同一个点上吵架？",
      "我和现在这个人合适吗？",
      "我的依恋模式到底是什么样的？",
      "这段关系里，权力和边界哪里失衡了？",
    ],
  },
];

export const DEFAULT_COUNSELOR_ID = "sage" as const;

/** @deprecated 旧链接 analystId=mirror 等 */
export const LEGACY_ANALYST_ALIASES: Record<string, string> = {
  mirror: "sage",
  default: "sage",
  default_relationship_analyst: "sage",
};

export function resolveCounselorId(raw: string | undefined): string {
  if (!raw) return DEFAULT_COUNSELOR_ID;
  const key = raw.trim().toLowerCase();
  return LEGACY_ANALYST_ALIASES[key] ?? key;
}

export function getCounselor(id: string | undefined): Counselor {
  const resolved = resolveCounselorId(id);
  return COUNSELORS.find((c) => c.id === resolved) ?? COUNSELORS.find((c) => c.id === DEFAULT_COUNSELOR_ID)!;
}

const ACCENT_RING: Record<CounselorAccent, string> = {
  amber: "border-[oklch(0.72_0.16_75_/_0.7)] bg-[oklch(0.55_0.14_75_/_0.14)]",
  cyan: "border-[oklch(0.72_0.14_200_/_0.7)] bg-[oklch(0.45_0.12_200_/_0.14)]",
  rose: "border-[oklch(0.68_0.14_15_/_0.7)] bg-[oklch(0.48_0.12_15_/_0.14)]",
  violet: "border-[oklch(0.68_0.18_285_/_0.7)] bg-[oklch(0.50_0.20_285_/_0.14)] glow-violet",
};

const ACCENT_AVATAR: Record<CounselorAccent, string> = {
  amber: "from-[oklch(0.72_0.16_75)] to-[oklch(0.62_0.14_55)]",
  cyan: "from-[oklch(0.62_0.14_200)] to-[oklch(0.72_0.12_220)]",
  rose: "from-[oklch(0.62_0.16_15)] to-[oklch(0.72_0.12_350)]",
  violet: "from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]",
};

export function counselorActiveRing(accent: CounselorAccent): string {
  return ACCENT_RING[accent];
}

export function counselorAvatarGradient(accent: CounselorAccent): string {
  return ACCENT_AVATAR[accent];
}

export function buildCounselorGreeting(counselor: Counselor, bound: boolean, ctx: { archetype?: string; attachmentType?: string | null; suiteName?: string | null; tagline?: string | null } | null): string {
  const who = `${counselor.name} · ${counselor.englishName} ${counselor.emoji}`;
  if (ctx && bound) {
    const tagline = ctx.tagline ? `\n「${ctx.tagline}」` : "";
    const attach = ctx.attachmentType ? `（${ctx.attachmentType}）` : "";
    return `你好，我是 ${who}，MIRROR 的${counselor.title}。\n\n我已读取你在 **${ctx.suiteName ?? "SELF"}** 的画像：**${ctx.archetype}**${attach}。${tagline}\n\n${counselor.tagline}。你可以直接问我，或点下面的快捷问题。`;
  }
  if (bound) {
    return `你好，我是 ${who}，${counselor.title}。\n\n我已读取你的最新测试画像。${counselor.tagline}。`;
  }
  return `你好，我是 ${who}，MIRROR 的${counselor.title}。\n\n你还没有可绑定的测试画像。建议先完成 SELF 测试；完成后我会结合你的六维分数与红楼人格原型来回答。\n\n${counselor.description}`;
}
