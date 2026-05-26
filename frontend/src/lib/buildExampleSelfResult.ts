import type { SelfResult } from "@/data/mockResult";
import type { ExampleCharacter } from "@/data/exampleCharacters";
import {
  CHARACTER_EMOJI,
  coreQuestionThirdPerson,
  dimensionDisplaySummary,
  MATCH_BY_ATTACHMENT,
  resolvePrimaryAttachmentType,
  SELF_DIMENSIONS,
} from "@/data/selfSuiteSpec";

const TRAIT_ICONS = ["shield", "key", "eye"] as const;

export function buildExampleSelfResult(character: ExampleCharacter): SelfResult {
  const attachment = resolvePrimaryAttachmentType(character.attachment, character.name);
  const possessive = character.gender === "female" ? "她的" : "他的";
  const pronoun = character.gender === "female" ? "她" : "他";
  const traitByDimension = Object.fromEntries(
    character.profileTraits
      .filter((t) => t.source_dimension)
      .map((t) => [t.source_dimension!.toLowerCase(), t.body]),
  );
  const dimensions = SELF_DIMENSIONS.map((d) => {
    const dimKey = d.code.toLowerCase();
    return {
      key: dimKey,
      label: d.name,
      value: character.selfScores[d.code],
      color: d.color,
      displaySummary: dimensionDisplaySummary(d.code, character.selfScores[d.code], pronoun),
      coreQuestion: coreQuestionThirdPerson(d.code, pronoun),
      profileNote: traitByDimension[dimKey],
    };
  });
  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.value, 0) / Math.max(dimensions.length, 1),
  );
  const matchPresets = MATCH_BY_ATTACHMENT[attachment] ?? MATCH_BY_ATTACHMENT["安全型"];
  const matches = matchPresets.map((m, i) => ({
    code: `M-0${i + 1}`,
    name: m.name,
    pct: m.pct,
    tagline: m.tagline,
    top: i === 0,
  }));

  return {
    archetype: {
      badge: `示范 · ${attachment}`,
      name: attachment,
      code: `SELF · ${attachment.toUpperCase()} · EX`,
      tagline: character.attachmentSummary,
      description: `以下推演假设 ${character.name} 完整作答 SELF。呈现${possessive}${attachment}底色，以及六维曲线在关系里的落点。`,
    },
    overallScore,
    dimensions,
    matches,
    insights: character.analystHighlights,
    behaviors: character.profileBehaviors,
    coreTraits: character.profileTraits.map((t, i) => ({
      icon: t.icon ?? TRAIT_ICONS[i] ?? "shield",
      title: t.title,
      body: t.body,
      highlight: t.highlight,
      source_dimension: t.source_dimension,
    })),
    character: {
      emoji: CHARACTER_EMOJI[character.name] ?? "✨",
      name: character.name,
      pinyin: `${character.name.toUpperCase()} · ${attachment} · ${character.epithet}`,
      archetypeLine: character.redChamberLine,
      quote: character.literaryQuote,
      reasons: character.mirrorReasons,
    },
  };
}
