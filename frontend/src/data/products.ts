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
      "依恋风格 · 边界能力 · 情绪调节 · 投入模式。50 道情境题，画出属于你自己的关系底片——和具体的某个人无关。",
    duration: "约 8 分钟",
    questionCount: "50 题",
    status: "locked",
    badge: "CODE · 兑换码解锁",
    accent: "violet",
    dimensions: ["亲密需求", "情绪表达", "独立倾向", "沟通风格", "冲突处理", "承诺意愿"],
  },
  {
    id: "ros",
    code: "SET · 02 / ROS",
    title: "具体恋情评估",
    subtitle: "你们之间，到底怎么样",
    description:
      "心里有一个具体的人才能作答。AT 吸引 / IN 亲密 / CO 协作 / EV 成长 / RK 风险 五层全覆盖，完成后生成关系码邀请 TA 解锁双人报告。入口：/ros/start",
    duration: "约 12 分钟",
    questionCount: "62 题",
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
      "吸引力 × 情感价值 × 现实支撑——80 道情境题，输出四象限坐标与红娘档案。完成后与 SELF、ROS 合并，AI 画像达到最完整状态。",
    duration: "约 18 分钟",
    questionCount: "80 题",
    status: "locked",
    badge: "PAID · 兑换码解锁",
    accent: "rose",
    dimensions: ["吸引力资产", "情感价值", "现实自主", "关系成熟度", "风险净值"],
  },
];
