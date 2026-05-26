/** 各套题分享卡视觉主题 —— 对齐小红书 3:4 竖版卡片规范。 */

export type ShareCardThemeId = "self" | "ros" | "mate" | "ros-couple";

export type ShareCardTheme = {
  id: ShareCardThemeId;
  brand: string;
  setLabel: string;
  gradient: [string, string, string];
  accent: string;
  accentSoft: string;
  accentGlow: string;
  chipBg: string;
  hashtags: string[];
};

export const SHARE_CARD_THEMES: Record<ShareCardThemeId, ShareCardTheme> = {
  self: {
    id: "self",
    brand: "MIRROR · 关系画像",
    setLabel: "SET · 01 / SELF",
    gradient: ["#1a1528", "#12101c", "#0e0c14"],
    accent: "#c4b5fd",
    accentSoft: "rgba(196, 181, 253, 0.75)",
    accentGlow: "rgba(160, 140, 255, 0.35)",
    chipBg: "rgba(140, 120, 240, 0.18)",
    hashtags: ["#关系画像", "#MIRROR", "#了解自己", "#把爱当真"],
  },
  ros: {
    id: "ros",
    brand: "MIRROR · 关系画像",
    setLabel: "SET · 02 / ROS",
    gradient: ["#141828", "#10131a", "#0c0e11"],
    accent: "#a5a8ff",
    accentSoft: "rgba(165, 168, 255, 0.85)",
    accentGlow: "rgba(99, 102, 241, 0.35)",
    chipBg: "rgba(99, 102, 241, 0.15)",
    hashtags: ["#关系画像", "#ROS", "#这段关系", "#MIRROR"],
  },
  mate: {
    id: "mate",
    brand: "MIRROR · 择偶坐标",
    setLabel: "SET · 03 / MATE",
    gradient: ["#1c1018", "#140c12", "#0e080c"],
    accent: "#fb7185",
    accentSoft: "rgba(251, 113, 133, 0.9)",
    accentGlow: "rgba(244, 114, 182, 0.32)",
    chipBg: "rgba(251, 113, 133, 0.14)",
    hashtags: ["#择偶坐标", "#MATE", "#MIRROR", "#关系市场"],
  },
  "ros-couple": {
    id: "ros-couple",
    brand: "MIRROR · 双人关系",
    setLabel: "SET · 02 / ROS · 双人",
    gradient: ["#141828", "#111520", "#0c0e11"],
    accent: "#c2c4ff",
    accentSoft: "rgba(194, 196, 255, 0.85)",
    accentGlow: "rgba(165, 168, 255, 0.3)",
    chipBg: "rgba(165, 168, 255, 0.12)",
    hashtags: ["#双人报告", "#关系契合", "#ROS", "#MIRROR"],
  },
};

export const SHARE_CARD_PORTRAIT = { width: 1080, height: 1440 } as const;
export const SHARE_CARD_WIDE = { width: 900, height: 520 } as const;
export const SHARE_CARD_RX = { width: 800, height: 960 } as const;
