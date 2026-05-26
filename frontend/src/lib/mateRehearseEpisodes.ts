import rehearseLibrary from "@/data/mate_rehearse_library_v1.json";
import type { MateProfileEngine, MateRehearseEpisode, MateResult, MateTimelineNode } from "@/data/mateTypes";

type RehearseLib = typeof rehearseLibrary;

const EP_META = [
  { day: 1, name: "EP1 初见阶段", time: "Day 1 - 3", desc: "心动发生的瞬间" },
  { day: 30, name: "EP2 试探阶段", time: "Day 30", desc: "情绪稳定性的博弈" },
  { day: 90, name: "EP3 真实阶段", time: "Day 90+", desc: "核心资产的沉淀" },
] as const;

function stablePick(options: string[], key: string): string {
  if (!options.length) return "";
  const idx = [...key].reduce((sum, c) => sum + c.charCodeAt(0), 0) % options.length;
  return options[idx] ?? options[0] ?? "";
}

function nearestTimelineNode(loveTimeline: MateTimelineNode[], targetDay: number): MateTimelineNode | undefined {
  if (!loveTimeline.length) return undefined;
  return loveTimeline.reduce((best, node) =>
    Math.abs(node.day - targetDay) < Math.abs(best.day - targetDay) ? node : best,
  );
}

function traitDisplayKey(traitAtoms: string[]): "低显示" | "高显示" | "default" {
  if (traitAtoms.some((t) => t.includes("低显示"))) return "低显示";
  if (traitAtoms.some((t) => t.includes("高显示"))) return "高显示";
  return "default";
}

function looksLikeUserAction(advice: string): boolean {
  const text = advice.trim();
  if (!text || text.length > 72) return false;
  const narrativeMarkers = ["的真实价值", "开始浮现", "往往", "容易被", "第一印象往往", "低估", "高估"];
  if (narrativeMarkers.some((m) => text.includes(m))) return false;
  const actionMarkers = ["主动", "别", "不要", "用", "给", "约", "说", "分享", "表达", "保持", "把", "让", "先"];
  return actionMarkers.some((m) => text.includes(m));
}

function resolvePlot(
  lib: RehearseLib,
  options: {
    positionName: string;
    subType: string;
    day: number;
    sceneAtoms: string[];
    timelineNode?: MateTimelineNode;
    pickKey: string;
  },
): string {
  const { positionName, subType, day, sceneAtoms, timelineNode, pickKey } = options;
  const candidates: string[] = [];

  const posBlock = (lib.plot_by_position as Record<string, Record<string, string[]>>)[positionName];
  if (posBlock?.[String(day)]) candidates.push(...posBlock[String(day)]);

  const subBlock = (lib.plot_by_sub_type as Record<string, Record<string, string>>)[subType];
  if (subBlock?.[String(day)]) candidates.push(subBlock[String(day)]);

  const mood = timelineNode?.mood?.trim() ?? "";
  if (mood.length > 4 && mood.length <= 96 && !candidates.includes(mood)) {
    candidates.push(mood);
  }

  const sceneIdx = { 1: 0, 30: 1, 90: 2 }[day] ?? 0;
  const scene = sceneAtoms[sceneIdx]?.trim();
  if (scene && scene.length > 6) {
    candidates.push(`这个阶段，${scene}——关系往往在这里分出走向。`);
  }

  if (!candidates.length) {
    const hooks = lib.golden_lines?.plot_hooks ?? [];
    if (hooks.length) candidates.push(String(hooks[sumPick(hooks, pickKey) % hooks.length]));
  }

  if (candidates.length) return stablePick(candidates, pickKey);

  const meta = EP_META.find((e) => e.day === day);
  return meta?.desc ?? "关系进入新阶段";
}

function sumPick(items: unknown[], key: string): number {
  return [...key].reduce((sum, c) => sum + c.charCodeAt(0), 0) % Math.max(items.length, 1);
}

function resolvePartnerPsychology(
  lib: RehearseLib,
  options: {
    traitKey: ReturnType<typeof traitDisplayKey>;
    subType: string;
    day: number;
    gender: string;
    pickKey: string;
  },
): string {
  const { traitKey, subType, day, gender, pickKey } = options;
  const optionsList: string[] = [];

  const traitBlock = (lib.partner_psychology_by_trait as Record<string, Record<string, string[]>>)[traitKey]
    ?? lib.partner_psychology_by_trait.default;
  if (traitBlock?.[String(day)]) optionsList.push(...traitBlock[String(day)]);

  const subLine = (lib.partner_psychology_by_sub_type as Record<string, Record<string, string>>)[subType]?.[String(day)];
  if (subLine) optionsList.push(subLine);

  const partner = gender === "male" ? "她" : "他";
  const localized = optionsList.map((text) =>
    text.replace(/她很好/g, `${partner}很好`).replace(/她到底有没有/g, `${partner}到底有没有`),
  );

  if (localized.length) return stablePick(localized, pickKey + traitKey);

  const voices = lib.golden_lines?.partner_voice ?? [];
  return stablePick(voices.map(String), pickKey) || "还在观察，但开始认真想「要不要继续靠近」。";
}

function resolveWarning(
  lib: RehearseLib,
  options: {
    day: number;
    lowDisplay: boolean;
    fs2: number;
    fs4: number;
    fs5: number;
    positionName: string;
    timelineNode?: MateTimelineNode;
  },
): string {
  const { day, lowDisplay, fs2, fs4, fs5, positionName, timelineNode } = options;
  const danger = timelineNode?.danger?.trim();
  if (danger) return danger;

  const warnings = lib.warnings as Record<string, string>;
  const parts: string[] = [];
  if (day === 30 && lowDisplay && warnings.low_display_day30) parts.push(warnings.low_display_day30);
  if (fs5 >= 60 && warnings.high_risk_fs5) parts.push(warnings.high_risk_fs5);
  if (day >= 30 && fs2 >= 70 && fs4 < 55 && warnings.emotion_demand_mismatch) parts.push(warnings.emotion_demand_mismatch);
  if (day === 30 && fs2 >= 65 && fs4 < 50 && warnings.pace_mismatch) parts.push(warnings.pace_mismatch);
  if (day === 90 && !lowDisplay && fs2 < 55 && warnings.over_display_under_depth) {
    parts.push(warnings.over_display_under_depth);
  }
  if (positionName === "还没到时候的人" && day === 30 && warnings.building_phase) {
    parts.push(warnings.building_phase);
  }
  return parts.slice(0, 2).join(" ").trim();
}

function resolveSuggestion(
  lib: RehearseLib,
  options: {
    behaviorAtoms: string[];
    positionName: string;
    day: number;
    timelineNode?: MateTimelineNode;
    pickKey: string;
  },
): string {
  const { behaviorAtoms, positionName, day, timelineNode, pickKey } = options;
  const advice = timelineNode?.advice?.trim();
  if (advice && looksLikeUserAction(advice)) return advice;

  const byBehavior = lib.suggestions_by_behavior as Record<string, Record<string, string>>;
  for (const atom of behaviorAtoms) {
    const line = byBehavior[atom]?.[String(day)];
    if (line) return line;
  }

  const posLine = (lib.suggestions_by_position as Record<string, Record<string, string>>)[positionName]?.[String(day)];
  if (posLine) return posLine;

  const defaultLine = byBehavior.default?.[String(day)];
  if (defaultLine) return defaultLine;

  const matchmaker = lib.golden_lines?.matchmaker_voice ?? [];
  return stablePick(matchmaker.map(String), pickKey + String(day)) || "主动共享一个今天发生的小情绪，降低对方的猜测成本。";
}

function comfortIndex(options: {
  day: number;
  fs2: number;
  fs4: number;
  fs5: number;
  axisY: number;
  lowDisplay: boolean;
}): string {
  const { day, fs2, fs4, fs5, axisY, lowDisplay } = options;
  let hearts = Math.round((fs2 * 0.45 + fs4 * 0.35 + (100 - fs5) * 0.2) / 22);
  if (day === 1) hearts += fs2 >= 60 ? 1 : 0;
  else if (day === 30) {
    if (lowDisplay) hearts -= 1;
    if (fs5 >= 60) hearts -= 1;
  } else {
    if (axisY >= 65) hearts += 1;
    if (fs4 >= 65) hearts += 1;
  }
  hearts = Math.min(5, Math.max(1, hearts));
  return "💙".repeat(hearts) + "○".repeat(5 - hearts);
}

export type BuildRehearseOptions = {
  profileEngine?: MateProfileEngine;
  gender?: MateResult["gender"];
  positionName?: string;
  moduleScores?: Record<string, number>;
  axisY?: number;
  lowDisplay?: boolean;
};

export function buildRehearseEpisodes(
  loveTimeline: MateTimelineNode[],
  options: BuildRehearseOptions = {},
): MateRehearseEpisode[] {
  const lib = rehearseLibrary;
  const profile = options.profileEngine;
  const gender = options.gender ?? "female";
  const positionName = options.positionName ?? profile?.main_type ?? "";
  const subType = profile?.sub_type ?? "稳定推进型";
  const traitAtoms = profile?.trait_atoms ?? [];
  const behaviorAtoms = profile?.behavior_atoms ?? [];
  const sceneAtoms = profile?.scene_atoms ?? [];
  const scores = options.moduleScores ?? {};
  const fs2 = scores.FS2 ?? scores.MS3 ?? 55;
  const fs4 = scores.FS4 ?? scores.MS2 ?? 55;
  const fs5 = scores.FS5 ?? scores.MS5 ?? 50;
  const axisY = options.axisY ?? 55;
  const traitKey = traitDisplayKey(traitAtoms);
  const lowDisplay =
    options.lowDisplay ?? (traitKey === "低显示" || traitAtoms.some((t) => t.includes("慢热")));
  const partnerTraitKey = lowDisplay ? "低显示" : traitKey;

  return EP_META.map((meta) => {
    const node = nearestTimelineNode(loveTimeline, meta.day);
    const pickKey = `${positionName}:${subType}:${gender}:${meta.day}`;

    return {
      name: meta.name,
      time: meta.time,
      desc: meta.desc,
      plot: resolvePlot(lib, {
        positionName,
        subType,
        day: meta.day,
        sceneAtoms,
        timelineNode: node,
        pickKey,
      }),
      partnerPsychology: resolvePartnerPsychology(lib, {
        traitKey: partnerTraitKey,
        subType,
        day: meta.day,
        gender,
        pickKey,
      }),
      warning: resolveWarning(lib, {
        day: meta.day,
        lowDisplay,
        fs2,
        fs4,
        fs5,
        positionName,
        timelineNode: node,
      }),
      suggestion: resolveSuggestion(lib, {
        behaviorAtoms,
        positionName,
        day: meta.day,
        timelineNode: node,
        pickKey,
      }),
      comfortIndex: comfortIndex({ day: meta.day, fs2, fs4, fs5, axisY, lowDisplay }),
    };
  });
}

/** @deprecated 使用 buildRehearseEpisodes */
export function buildRehearseEpisodesFromTimeline(
  loveTimeline: MateTimelineNode[],
  options?: { lowDisplay?: boolean },
): MateRehearseEpisode[] {
  return buildRehearseEpisodes(loveTimeline, { lowDisplay: options?.lowDisplay });
}

export function resolveRehearseEpisodes(
  result: Pick<
    MateResult,
    "rehearseEpisodes" | "loveTimeline" | "profileEngine" | "gender" | "positionName" | "marketCoordinate" | "modules"
  >,
): MateRehearseEpisode[] {
  if (result.rehearseEpisodes && result.rehearseEpisodes.length >= 3) {
    return result.rehearseEpisodes;
  }
  if (result.loveTimeline?.length) {
    const moduleScores = Object.fromEntries(
      (result.modules ?? [])
        .filter((m) => m.score != null)
        .map((m) => [m.code, m.score as number]),
    );
    return buildRehearseEpisodes(result.loveTimeline, {
      profileEngine: result.profileEngine,
      gender: result.gender,
      positionName: result.positionName || result.profileEngine?.main_type,
      moduleScores,
      axisY: result.marketCoordinate?.axisY,
    });
  }
  return result.rehearseEpisodes ?? [];
}
