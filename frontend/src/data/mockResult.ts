// 前端展示用的 mock 结果数据 —— 真正的数据由后端 server function 返回，结构与此一致即可替换。
export type Dimension = { key: string; label: string; value: number; color: string };
export type MatchType = { code: string; name: string; pct: number; tagline: string; top?: boolean };
export type Insight = { kind: "strength" | "watch" | "match" | "growth"; title: string; body: string };

export type Behavior = { scene: string; title: string; body: string };

export type CoreTrait = { icon: "shield" | "key" | "eye"; title: string; body: string; highlight?: boolean };

export type CharacterReveal = {
  emoji: string;
  name: string;
  pinyin: string;
  archetypeLine: string;
  quote: string;
  reasons: Array<{ title: string; body: string; highlight?: boolean }>;
};

export type SelfResult = {
  archetype: {
    badge: string;
    name: string;
    code: string;
    tagline: string;
    description: string;
  };
  overallScore: number;
  dimensions: Dimension[];
  matches: MatchType[];
  insights: Insight[];
  behaviors: Behavior[];
  coreTraits: CoreTrait[];
  character: CharacterReveal;
  lockedTeasers: Array<{ id: "ros" | "mate"; title: string; hint: string }>;
};

export const MOCK_SELF_RESULT: SelfResult = {
  archetype: {
    badge: "你的依恋类型",
    name: "安全型探索者",
    code: "SELF-04 · SECURE EXPLORER",
    tagline: "既能独立，又懂得依赖；情绪稳定，偶尔过度理性。",
    description:
      "你在亲密关系里既能扎根，也能伸展。你享受被理解，却不靠他人定义自己。你的安全感来自内部秩序——这让你在大多数关系里都像一块温柔的压舱石，但偶尔，过度的合理化会让对方感到一丝距离。",
  },
  overallScore: 76,
  dimensions: [
    { key: "intimacy", label: "亲密需求", value: 78, color: "oklch(0.68 0.18 285)" },
    { key: "expression", label: "情绪表达", value: 55, color: "oklch(0.78 0.15 165)" },
    { key: "independence", label: "独立倾向", value: 82, color: "oklch(0.72 0.18 360)" },
    { key: "communication", label: "沟通风格", value: 66, color: "oklch(0.82 0.14 75)" },
    { key: "conflict", label: "冲突处理", value: 71, color: "oklch(0.82 0.14 200)" },
    { key: "commitment", label: "承诺意愿", value: 88, color: "oklch(0.82 0.10 285)" },
  ],
  matches: [
    { code: "N-07", name: "滋养型伴侣", pct: 92, tagline: "情感丰富，能补充你的理性", top: true },
    { code: "E-03", name: "探索型伴侣", pct: 81, tagline: "节奏同频，一起向外生长" },
    { code: "A-11", name: "稳定型伴侣", pct: 74, tagline: "踏实务实，给你慢下来的理由" },
  ],
  insights: [
    {
      kind: "strength",
      title: "你的高光",
      body: "高承诺意愿（88）与独立倾向（82）兼具——你给对方安全感的同时，不会让对方感到窒息。这是非常稀缺的关系底盘。",
    },
    {
      kind: "watch",
      title: "可以温柔留意",
      body: "情绪表达偏低（55）。当关系紧张时，你倾向用沉默和理性代替直接表达，这容易让对方误读为冷淡或不在乎。",
    },
    {
      kind: "match",
      title: "匹配建议",
      body: "最适合滋养型伴侣——对方的情感细腻能补你理性的边角，而你的稳定能给他们一个可以停靠的港湾。",
    },
    {
      kind: "growth",
      title: "下一段关系里",
      body: "练习先说感受、再讲道理。当你愿意先暴露 10% 的脆弱，对方往往会回应你 50% 的柔软。",
    },
  ],
  behaviors: [
    {
      scene: "第一次见面",
      title: "你会先观察，再慢慢打开自己",
      body: "你不急着证明什么，先用眼睛和耳朵收集信息——对方说话的节奏、停顿的位置、笑起来眼睛是否参与。等你确认对方是『安全』的，才会一点点把真实的自己交出去。",
    },
    {
      scene: "发生冲突时",
      title: "你倾向先撤回，再回头讨论情绪",
      body: "冲突当下你会本能地把音量降下来，物理或心理上拉出一段距离。等你把情绪处理完，才愿意回到桌面把事情说清楚——这让你显得稳，但也容易让对方误以为你『不在乎』。",
    },
    {
      scene: "喜欢一个人时",
      title: "你会变得高度专注，但表达克制",
      body: "你的『喜欢』是放在细节里的——记得对方说过的小事、在他状态不好时悄悄出现。你不擅长大张旗鼓的告白，但你的在场感本身就是一种语言。",
    },
  ],
  coreTraits: [
    {
      icon: "shield",
      highlight: true,
      title: "稳，是你给关系的第一份礼物",
      body: "你在『冲突瞬间』的反应是先把音量降下来——这不是回避，是你下意识在保护这段关系不被情绪烧坏。你的稳定，是别人能停靠的港湾。",
    },
    {
      icon: "key",
      title: "独立与依赖之间，你走得很稳",
      body: "你的独立倾向（82）很高，却没有掉进『谁也别靠近我』的极端。你愿意被看见、被理解——只是你需要节奏感，而不是被推着走。",
    },
    {
      icon: "eye",
      title: "情感是真的，只是出口比较窄",
      body: "你在『她第一次说我爱你』那题的犹豫不是没感动——是亲密触发了你的理性。等你确认对方是安全的，你的柔软是会一点点打开的。",
    },
  ],
  character: {
    emoji: "🪬",
    name: "薛宝钗",
    pinyin: "XUE BAOCHAI · 安全型 · 温柔的压舱石",
    archetypeLine: "她不是没有情绪，她只是把锋利收了起来——给关系一个不会碎的底。",
    quote: "她不抢、不闹、不刻意——\n却让身边的人都觉得，有她在，就有底。",
    reasons: [
      {
        highlight: true,
        title: "同样的『稳』，是关系里最稀缺的资源",
        body: "宝钗在贾府上下都被信赖——不是因为讨好，是因为她拎得清、不情绪化。你的承诺意愿（88）+ 独立倾向（82）就是这种底盘：能给安全感，又不让人窒息。",
      },
      {
        title: "同样把脆弱藏在理性后面",
        body: "宝钗很少哭，但她会在夜里独自整理药方。你的情绪表达（55）偏低——不是冷，是你习惯先把自己处理好，再把结果交出去。",
      },
      {
        title: "同样懂得『退一步』比赢更重要",
        body: "宝钗从不在冲突里争输赢。你处理冲突的得分（71）说明你也是——你愿意先把火降下来，再回头讲事情。这是关系里非常成熟的能力。",
      },
    ],
  },
  lockedTeasers: [
    { id: "ros", title: "SET · 02 / ROS — 这段关系的画像", hint: "用 SELF 的底片叠加 ROS，看你和那个人之间真正发生了什么。" },
    { id: "mate", title: "SET · 03 / MATE — 你的择偶坐标", hint: "三套数据合成终极画像，解锁实时更新的人格档案。" },
  ],
};
