import type { ExampleCharacter } from "@/data/exampleCharacters";
import type { RosDim, RosLayerDetail, RosLayerExpansion, RosSingleResult } from "@/data/rosTypes";

type LayerKey = RosDim["key"];

const LAYER_LABELS: Record<LayerKey, string> = {
  at: "吸引基础",
  in: "互动质量",
  co: "兼容程度",
  ev: "关系走向",
  rk: "风险信号",
};

const SUBDIM_DEFS: Record<string, { key: string; label: string; offset: number }[]> = {
  AT: [
    { key: "initial", label: "初始吸引力", offset: 4 },
    { key: "sustain", label: "吸引持续性", offset: 0 },
    { key: "parity", label: "吸引对等感", offset: -3 },
  ],
  IN: [
    { key: "comm", label: "沟通质量", offset: 5 },
    { key: "conflict", label: "冲突处理", offset: -4 },
    { key: "presence", label: "陪伴密度", offset: -1 },
  ],
  CO: [
    { key: "values", label: "价值观一致度", offset: 3 },
    { key: "pace", label: "生活节奏", offset: -2 },
    { key: "space", label: "空间需求", offset: -3 },
  ],
  EV: [
    { key: "growth", label: "成长感", offset: 4 },
    { key: "future", label: "未来清晰度", offset: -2 },
    { key: "momentum", label: "关系动能", offset: 0 },
  ],
  RK: [
    { key: "pressure", label: "沟通压力", offset: 2 },
    { key: "suppress", label: "自我压抑程度", offset: -1 },
    { key: "loop", label: "循环模式", offset: 3 },
  ],
};

const LAYER_PROBES: Record<LayerKey, string> = {
  at: "当初让你心动的那件事，最近还发生过类似的吗？",
  in: "你们上一次把一件矛盾真正说清楚，是什么时候？",
  co: "有没有一件事，你们谈过但始终没达成一致？",
  ev: "你能想象三年后你们是什么样子吗？",
  rk: "有没有一句话，你一直想说但没说？",
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreBandLabel(score: number): string {
  if (score >= 80) return "这个维度是你的核心竞争力";
  if (score >= 65) return "这个维度是你的重要资产";
  if (score >= 51) return "这个维度表现稳定";
  if (score >= 31) return "这个维度还在发展阶段";
  return "这个维度还有很大的成长空间";
}

function subdimSummary(score: number): string {
  const s = clampScore(score);
  if (s >= 81) return "基本能说到点上";
  if (s >= 66) return "整体表现不错";
  if (s >= 51) return "还有可以一起打磨的空间";
  if (s >= 31) return "值得单独用心一次";
  return "这是你们可以慢慢补强的角落";
}

function buildSubdims(code: string, layerScore: number): RosLayerExpansion["subdims"] {
  return (SUBDIM_DEFS[code] ?? []).map((item) => {
    const score = clampScore(layerScore + item.offset);
    return {
      key: item.key,
      label: item.label,
      score,
      summary: subdimSummary(score),
    };
  });
}

function behaviorForLayer(
  character: ExampleCharacter,
  key: LayerKey,
): { title: string; body: string } | null {
  const scene =
    key === "at" ? "亲密" : key === "in" ? "冲突" : key === "ev" ? "分离" : null;
  if (!scene) return null;
  const hit = character.profileBehaviors.find((b) => b.scene === scene);
  return hit ? { title: hit.title, body: hit.body } : null;
}

function insightForLayer(character: ExampleCharacter, key: LayerKey): string | null {
  const code = key.toUpperCase();
  const hit = character.ros.insights.find(
    (i) => i.body.includes(code) || i.title.includes(LAYER_LABELS[key].slice(0, 2)),
  );
  return hit ? `${hit.title}：${hit.body}` : null;
}

function exampleEvidence(character: ExampleCharacter, key: LayerKey, score: number): string {
  const behavior = behaviorForLayer(character, key);
  if (behavior) {
    return `档案场景「${behavior.title}」——${behavior.body}`;
  }

  const insight = insightForLayer(character, key);
  if (insight) return insight;

  const { name, ros } = character;
  const label = LAYER_LABELS[key];
  if (key === "co") {
    return `${name} 与 ${ros.partner}：${ros.typeDescription} 兼容度落在 ${score} 分——${ros.relationshipNote}。`;
  }
  if (key === "rk") {
    return ros.blindSpot
      ? `风险侧写：${ros.blindSpot}`
      : `${label} ${score} 分——小摩擦会不会被误读成「不爱」，是这段关系的关键变量。`;
  }
  return `${label} ${score} 分：${ros.typeOneLiner}`;
}

function buildLayerDetail(key: LayerKey, score: number, character: ExampleCharacter): RosLayerDetail {
  const label = LAYER_LABELS[key];
  const summary = scoreBandLabel(score);

  if (key === "rk") {
    if (score >= 65) {
      return {
        displaySummary: summary,
        read: exampleEvidence(character, key, score),
        watch: "争执容易升级，需要先降温度再谈事——档案里这类循环出现不止一次。",
        bright: "两人并非对风险无感，愿意正视问题本身就是投入。",
        tags: [label, "需降温"],
      };
    }
    if (score >= 45) {
      return {
        displaySummary: summary,
        read: exampleEvidence(character, key, score),
        watch: "有些敏感点还没被双方真正看见，容易在相似场景里反复触发。",
        bright: "整体仍在可控区间，适合建立低伤害的修复仪式。",
        tags: [label, "可修复"],
      };
    }
    return {
      displaySummary: summary,
      read: exampleEvidence(character, key, score),
      watch: "留意小摩擦累积，但不必把每一次波动都解读成关系要完。",
      bright: "安全感基础相对稳，可以慢慢加深联结。",
      tags: [label, "低风险"],
    };
  }

  if (score >= 75) {
    return {
      displaySummary: summary,
      read: exampleEvidence(character, key, score),
      watch: `${label}还有微调空间——别把它当成永远不变，关系会随阶段起伏。`,
      bright: `${label}（${summary}）是 ${character.name} 与 ${character.ros.partner} 现在最稳的支点。`,
      tags: [label, "支点"],
    };
  }
  if (score >= 55) {
    return {
      displaySummary: summary,
      read: exampleEvidence(character, key, score),
      watch: `${label}在消耗与滋养之间摇摆，值得单独聊一次，而不是靠猜。`,
      bright: `${label}不算差——${summary}。`,
      tags: [label, "磨合"],
    };
  }
  return {
    displaySummary: summary,
    read: exampleEvidence(character, key, score),
    watch: `${label}是当前最需要温柔补强的区域，硬推只会更错位。`,
    bright: `${character.name} 愿意认真看这段关系，这本身就是投入。`,
    tags: [label, "待补强"],
  };
}

function exampleProbe(character: ExampleCharacter, key: LayerKey): string {
  const base = LAYER_PROBES[key];
  const { name, ros } = character;
  if (key === "in") {
    return `在 ${name} 与 ${ros.partner} 的档案里，${base.replace("你们", "两人")}`;
  }
  if (key === "at") {
    return `${name} 还会不会因为 ${ros.partner} 的一个细节而心软？${base}`;
  }
  return base;
}

export function buildExampleRosLayerPayload(
  character: ExampleCharacter,
  dims: RosSingleResult["dims"],
): {
  layerDetails: NonNullable<RosSingleResult["layerDetails"]>;
  layerExpansion: NonNullable<NonNullable<RosSingleResult["aiContent"]>["layer_expansion"]>;
} {
  const layerDetails: NonNullable<RosSingleResult["layerDetails"]> = {};
  const layerExpansion: NonNullable<NonNullable<RosSingleResult["aiContent"]>["layer_expansion"]> = {};

  for (const dim of dims) {
    const key = dim.key;
    const score = dim.value;
    const code = key.toUpperCase();
    const detail = buildLayerDetail(key, score, character);

    layerDetails[key] = detail;
    layerExpansion[key] = {
      tier_label: detail.displaySummary,
      evidence_text: detail.read,
      probe_question: exampleProbe(character, key),
      subdims: buildSubdims(code, score),
    };
  }

  return { layerDetails, layerExpansion };
}
