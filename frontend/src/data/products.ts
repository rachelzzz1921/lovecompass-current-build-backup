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
  resultPath?: string;
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
    status: "free",
    badge: "FREE · 基础版免费",
    accent: "violet",
    dimensions: ["亲密需求", "情绪表达", "独立倾向", "沟通风格", "冲突处理", "承诺意愿"],
    resultPath: "/result/self/demo",
  },
  {
    id: "ros",
    code: "SET · 02 / ROS",
    title: "具体恋情评估",
    subtitle: "你们之间，到底怎么样",
    description:
      "心里有一个具体的人才能作答。AT 吸引 / IN 亲密 / CO 协作 / EV 成长 / RK 风险 五层全覆盖，AI 自动叠加 SELF 数据做双层分析。",
    duration: "约 12 分钟",
    questionCount: "80 题",
    status: "locked",
    badge: "PAID · 兑换码解锁",
    accent: "cyan",
    dimensions: ["吸引力", "亲密度", "协作度", "成长性", "风险信号"],
  },
  {
    id: "mate",
    code: "SET · 03 / MATE",
    title: "择偶标准定位",
    subtitle: "你在找什么，你的市场位置在哪",
    description:
      "外貌、收入、学历、地域、婚育、生活方式的底线和上限。做完之后，三套数据合并，AI 画像达到最完整状态——解锁终极人格档案。",
    duration: "约 10 分钟",
    questionCount: "60 题",
    status: "locked",
    badge: "PAID · 兑换码解锁",
    accent: "rose",
    dimensions: ["颜值偏好", "经济门槛", "学历地域", "婚育态度", "生活节奏", "三观契合"],
  },
];
