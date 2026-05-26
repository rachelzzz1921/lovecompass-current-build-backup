/** Strip internal dimension/module codes from user-visible analysis copy. */

const INTERNAL_CODE_RE =
  /\b(?:FS[1-5]|MS[1-5]|SA[1-6]|P[1-6]|AT|IN|CO|EV|RK|AS|SF)(?:_[A-Z0-9]+)?\b/gi;

const SEMANTIC_REPLACE: Record<string, string> = {
  FS1: "第一眼吸引力",
  FS2: "情绪支撑能力",
  FS3: "现实自主性",
  FS4: "关系成熟度",
  FS5: "相处风险信号",
  MS1: "现实托底能力",
  MS2: "稳定可靠度",
  MS3: "情感供给能力",
  MS4: "门面与社交存在感",
  MS5: "相处风险信号",
  SA1: "自我吸引感知",
  SA2: "依恋焦虑",
  SA3: "依恋回避",
  SA4: "自我边界",
  SA5: "情绪调节",
  SA6: "关系投入方式",
  AT: "吸引基础",
  IN: "互动质量",
  CO: "兼容程度",
  EV: "关系走向",
  RK: "风险信号",
  P1: "推进节奏",
  P2: "情绪托底",
  P3: "现实匹配",
  P4: "长期方向感",
  P5: "边界与节奏",
  P6: "修复与回弹",
  AS: "第一眼吸引力",
  SF: "情绪支撑能力",
};

function codePattern(code: string): RegExp {
  return new RegExp(`(?<![A-Za-z0-9_])${code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_])`, "gi");
}

export function sanitizeUserFacingText(text: string): string {
  if (!text?.trim()) return text;
  let out = text;
  for (const [code, label] of Object.entries(SEMANTIC_REPLACE).sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    out = out.replace(codePattern(code), label);
  }
  out = out.replace(INTERNAL_CODE_RE, "");
  out = out.replace(/\s{2,}/g, " ");
  out = out.replace(/[，。；]\s*[，。；]/g, "，");
  return out.trim();
}

export function sanitizeUserFacingDeep<T>(value: T): T {
  if (typeof value === "string") return sanitizeUserFacingText(value) as T;
  if (Array.isArray(value)) return value.map((item) => sanitizeUserFacingDeep(item)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitizeUserFacingDeep(v);
    }
    return out as T;
  }
  return value;
}
