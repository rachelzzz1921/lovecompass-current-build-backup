import type { ApiQuestion, QuestionOption } from "@/lib/questionTypes";

const SEED_PREFIX = "presentation-seed:";

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createSeed(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0]!;
  }
  return Math.floor(Math.random() * 4294967296);
}

function fisherYates<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]!];
  }
  return out;
}

function presentationSeedKey(suiteSlug: string): string {
  return `${SEED_PREFIX}${suiteSlug}`;
}

export function resetPresentationSeed(suiteSlug: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(presentationSeedKey(suiteSlug));
}

function rngForSuite(suiteSlug: string): () => number {
  if (typeof window === "undefined") return () => Math.random();
  const key = presentationSeedKey(suiteSlug);
  const existing = window.sessionStorage.getItem(key);
  const seed = existing ? Number(existing) : createSeed();
  if (!existing) window.sessionStorage.setItem(key, String(seed));
  return mulberry32(Number.isFinite(seed) ? seed : createSeed());
}

const OPTION_SHUFFLE_KINDS = new Set<ApiQuestion["kind"]>(["choice", "binary", "card", "mood"]);

function withStorageIndex(options: QuestionOption[]): QuestionOption[] {
  return options.map((opt, storageIndex) => ({ ...opt, storageIndex }));
}

function shuffleOptions(question: ApiQuestion, rng: () => number): ApiQuestion {
  if (!OPTION_SHUFFLE_KINDS.has(question.kind) || question.options.length <= 1) {
    return { ...question, options: withStorageIndex(question.options) };
  }
  const indexed = withStorageIndex(question.options);
  return { ...question, options: fisherYates(indexed, rng) };
}

function shuffleRankItems(question: ApiQuestion, rng: () => number): ApiQuestion {
  if (question.kind !== "rank" || !question.ui.items?.length) return question;
  return {
    ...question,
    ui: {
      ...question.ui,
      items: fisherYates(question.ui.items, rng),
    },
  };
}

/** Randomize question and option order for display; DB order and option keys stay unchanged. */
export function prepareQuestionsForPresentation(
  questions: ApiQuestion[],
  suiteSlug: string,
): ApiQuestion[] {
  const sorted = [...questions].sort((a, b) => a.order - b.order);
  const rng = rngForSuite(suiteSlug);
  return fisherYates(sorted, rng).map((question) =>
    shuffleRankItems(shuffleOptions(question, rng), rng),
  );
}
