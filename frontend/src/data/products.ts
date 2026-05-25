// 测试库的前端展示元数据。题库和分析逻辑由后端注入。
export type ProductStatus = "free" | "locked" | "coming-soon";

export type Product = {
  id: "self" | "ros" | "mate";
  code: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  questionCount: string;
  status: ProductStatus;
  badge: string;
  accent: "violet" | "cyan" | "rose";
  dimensions: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "self",
    code: "SET · 01 / SELF",
    title: "自我关系模式",
    subtitle: "你是谁，在亲密关系里",
    description:
      "依恋风格 · 边界能力 · 情绪调节 · 投入模式。快速版 20 题免费体验；完整版 50 题画出更精准的关系底片。",
    duration: "快速版约 4 分钟",
    questionCount: "20 / 50 题",
    status: "free",
    badge: "FREE · 快速版开放",
    accent: "violet",
    dimensions: ["亲密需求", "情绪表达", "独立倾向", "沟通风格", "冲突处理", "承诺意愿"],
  },
  {
    id: "ros",
    code: "SET · 02 / ROS",
    title: "具体恋情评估",
    subtitle: "你们之间，到底怎么样",
    description:
      "心里有一个具体的人才能作答。快速版 20 题覆盖五层核心；完整版 62 题含校准与双人报告。入口：/ros/start",
    duration: "快速版约 5 分钟",
    questionCount: "20 / 62 题",
    status: "locked",
    badge: "PAID · 兑换码解锁",
    accent: "cyan",
    dimensions: ["吸引力", "亲密度", "协作度", "成长性", "风险信号"],
  },
  {
    id: "mate",
    code: "SET · 03 / MATE",
    title: "择偶坐标定位",
    subtitle: "你在市场上是什么牌面",
    description:
      "快速版 20 题输出四象限坐标预览；完整版 80 题生成红娘档案并与 SELF、ROS 合并为完整 AI 画像。",
    duration: "快速版约 5 分钟",
    questionCount: "20 / 80 题",
    status: "locked",
    badge: "PAID · 兑换码解锁",
    accent: "rose",
    dimensions: ["吸引力资产", "情感价值", "现实自主", "关系成熟度", "风险净值"],
  },
];
