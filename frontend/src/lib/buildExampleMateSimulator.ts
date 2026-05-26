import type { ExampleCharacter } from "@/data/exampleCharacters";
import type { MateSimulator } from "@/data/mateTypes";

function moduleAction(code: string, evidence: string, name: string): string {
  if (/FS4|MS4/.test(code)) return `增加可复制的社交触点——${evidence}`;
  if (/FS3|MS1/.test(code)) return `把「可执行的未来」说清楚——${evidence}`;
  if (/FS2|MS3/.test(code)) return `稳定输出情感供给信号——${evidence}`;
  if (/FS1|MS2/.test(code)) return `强化门面与可靠度叙事——${evidence}`;
  return `${name}：${evidence}`;
}

function shortGapDiagnosis(gap: number, marketInsight: string): string {
  if (gap >= 10) {
    const tail = marketInsight.split("；")[1]?.trim();
    return tail
      ? `瓶颈在「第一眼印象跑在长期托底前面」——${tail}`
      : "第一印象跑在现实托底前面，长期关系容易卡在「好看但难落地」。";
  }
  if (gap <= -10) {
    return "底牌扎实但曝光不足，需要更多「第一眼证据」。";
  }
  return "坐标相对均衡，优先补最弱模块，比全面加码更有效。";
}

export function buildExampleMateSimulator(character: ExampleCharacter): MateSimulator {
  const { mate, gender, name } = character;
  const { axisX, axisY, moduleScores, positionName, marketInsight } = mate;
  const gap = axisX - axisY;
  const nonRisk = moduleScores.filter((m) => !m.code.endsWith("5"));
  const weakest = nonRisk.reduce((a, b) => (a.score <= b.score ? a : b));
  const byCode = Object.fromEntries(moduleScores.map((m) => [m.code, m]));
  const realityMod = byCode.FS3 ?? byCode.MS1;
  const displayMod = byCode.FS4 ?? byCode.MS4 ?? byCode.FS1;

  type Lever = {
    name: string;
    baseline: number;
    baselineLabel: string;
    defaultBoost: number;
    method: string;
    evidence: string;
    peerAxis: { label: string; value: number };
    outcome: string;
    targetArchetype: string;
  };

  let lever: Lever;

  if (gap >= 10) {
    const defaultBoost = Math.min(20, Math.max(8, Math.round(gap / 2)));
    const mod = realityMod ?? weakest;
    lever = {
      name: "现实支撑叙事",
      baseline: axisY,
      baselineLabel: "现实托底感",
      defaultBoost,
      method: mod
        ? moduleAction(mod.code, mod.evidence, mod.label)
        : "补足长期可执行感：规划、节奏与承诺叙事",
      evidence: mod?.evidence ?? marketInsight,
      peerAxis: { label: "第一印象", value: axisX },
      outcome: `第一印象更清晰后，不再显得「浪漫但难落地」，误读「只靠情绪价值」的概率下降。`,
      targetArchetype:
        axisY + defaultBoost >= 62 && axisX >= 60 ? "让人想留下来的人" : positionName,
    };
  } else if (gap <= -10) {
    const defaultBoost = Math.min(20, Math.max(8, Math.round(-gap / 2)));
    const mod = displayMod ?? weakest;
    lever = {
      name: gender === "female" ? "门面/社交存在感" : "门面与情感",
      baseline: axisX,
      baselineLabel: "第一印象",
      defaultBoost,
      method: mod
        ? moduleAction(mod.code, mod.evidence, mod.label)
        : "轻度主动曝光 + 稳定输出",
      evidence: mod?.evidence ?? marketInsight,
      peerAxis: { label: "现实托底感", value: axisY },
      outcome: `现实托底感 ${axisY} 不再被「看不见」拖累，匹配效率会明显缩短。`,
      targetArchetype:
        axisX + defaultBoost >= 62 && axisY >= 55 ? "让人想留下来的人" : positionName,
    };
  } else {
    const defaultBoost = Math.min(18, Math.max(8, Math.round((72 - weakest.score) / 2.5)));
    const shortName = weakest.label.replace(/模块|资产|净值/g, "").trim() || weakest.label;
    lever = {
      name: shortName,
      baseline: weakest.score,
      baselineLabel: weakest.label,
      defaultBoost,
      method: moduleAction(weakest.code, weakest.evidence, weakest.label),
      evidence: weakest.evidence,
      peerAxis: { label: "整体坐标", value: Math.round((axisX + axisY) / 2) },
      outcome: `${shortName}上抬后，${name} 的整体感知更均衡——${mate.tagline}`,
      targetArchetype: positionName,
    };
  }

  const projected = Math.min(100, lever.baseline + lever.defaultBoost);

  return {
    title: "档案重组 · 参数模拟",
    slogan: `若调整「${lever.name}」，${name} 的坐标会怎么动？`,
    diagnosis: `当前 ${lever.peerAxis.label} ${lever.peerAxis.value} · ${lever.baselineLabel} ${lever.baseline}。${shortGapDiagnosis(gap, marketInsight)}`,
    slider: {
      name: lever.name,
      boostPercent: lever.defaultBoost,
      method: lever.method.split("——")[0] ?? lever.method,
      max: 25,
    },
    dynamicText:
      `拉动 {{boost}}% 后，${lever.baselineLabel} 从 {{baseline}} → 约 {{projected}}。` +
      `坐标更接近「${lever.targetArchetype}」——${lever.outcome}`,
    baselineDisplay: lever.baseline,
    baselineLabel: lever.baselineLabel,
    projectedDisplay: projected,
    leverEvidence: lever.evidence,
    peerAxis: lever.peerAxis,
    targetArchetype: lever.targetArchetype,
  };
}

/** 渲染模拟器文案中的占位符 */
export function renderMateSimulatorText(
  template: string,
  vars: {
    boost: number;
    baseline: number;
    projected: number;
    baselineLabel?: string;
  },
): string {
  return template
    .replace(/\{\{boost\}\}/g, String(vars.boost))
    .replace(/\{\{baseline\}\}/g, String(vars.baseline))
    .replace(/\{\{projected\}\}/g, String(vars.projected))
    .replace(/\{\{baselineLabel\}\}/g, vars.baselineLabel ?? "基准分");
}
