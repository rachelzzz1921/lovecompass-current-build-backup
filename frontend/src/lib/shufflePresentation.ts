import type { AnswerPayload, ApiQuestion } from "@/lib/questionTypes";

const SEED_PREFIX = "presentation-seed:";
const QUESTION_ORDER_PREFIX = "presentation-order:";
const OPTION_ORDER_PREFIX = "presentation-option-order:";

export type PresentationOrderMode = "shuffled" | "sequential";

export type PresentationSettings = {
  questionOrder: PresentationOrderMode;
  optionOrder: PresentationOrderMode;
};

export const QUESTION_ORDER_COPY: Record<PresentationOrderMode, { label: string; benefit: string }> = {
  shuffled: {
    label: "题目乱序",
    benefit: "除锚题/前置题外，题目出现顺序随机，更贴近第一反应。",
  },
  sequential: {
    label: "题目正序",
    benefit: "按设计章节 1→N 递进，维度过渡更顺，方便复盘。",
  },
};

export const OPTION_ORDER_COPY: Record<PresentationOrderMode, { label: string; benefit: string }> = {
  shuffled: {
    label: "选项乱序",
    benefit: "每道题内的选项随机排布，界面仍显示 A/B/C/D，减少位置偏见。",
  },
  sequential: {
    label: "选项正序",
    benefit: "选项按题库原始顺序展示，与说明文档一致。",
  },
};

/** @deprecated use QUESTION_ORDER_COPY / OPTION_ORDER_COPY */
export const PRESENTATION_ORDER_COPY = QUESTION_ORDER_COPY;

/** MATE appearance calibration — must stay with the anchor slider (see mate_scoring.py). */
const APPEARANCE_CALIBRATION_IDS = new Set([
  "FS1-A-F-02",
  "FS1-A-F-03",
  "FS1-B-F-12",
  "MS4-A-M-50",
  "MS4-A-M-52",
  "MS4-A-M-53",
]);

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

export function getQuestionOrderMode(suiteSlug: string): PresentationOrderMode {
  if (typeof window === "undefined") return "shuffled";
  const raw = window.sessionStorage.getItem(`${QUESTION_ORDER_PREFIX}${suiteSlug}`);
  return raw === "sequential" ? "sequential" : "shuffled";
}

export function setQuestionOrderMode(suiteSlug: string, mode: PresentationOrderMode): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${QUESTION_ORDER_PREFIX}${suiteSlug}`, mode);
}

export function getOptionOrderMode(suiteSlug: string): PresentationOrderMode {
  if (typeof window === "undefined") return "shuffled";
  const raw = window.sessionStorage.getItem(`${OPTION_ORDER_PREFIX}${suiteSlug}`);
  if (raw === "shuffled" || raw === "sequential") return raw;
  return getQuestionOrderMode(suiteSlug);
}

export function setOptionOrderMode(suiteSlug: string, mode: PresentationOrderMode): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${OPTION_ORDER_PREFIX}${suiteSlug}`, mode);
}

export function getPresentationSettings(suiteSlug: string): PresentationSettings {
  return {
    questionOrder: getQuestionOrderMode(suiteSlug),
    optionOrder: getOptionOrderMode(suiteSlug),
  };
}

export function setPresentationSettings(suiteSlug: string, settings: Partial<PresentationSettings>): void {
  if (settings.questionOrder) setQuestionOrderMode(suiteSlug, settings.questionOrder);
  if (settings.optionOrder) setOptionOrderMode(suiteSlug, settings.optionOrder);
}

/** @deprecated use getQuestionOrderMode */
export function getPresentationOrderMode(suiteSlug: string): PresentationOrderMode {
  return getQuestionOrderMode(suiteSlug);
}

/** @deprecated use setQuestionOrderMode */
export function setPresentationOrderMode(suiteSlug: string, mode: PresentationOrderMode): void {
  setQuestionOrderMode(suiteSlug, mode);
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

function withStorageIndex(options: ApiQuestion["options"]): ApiQuestion["options"] {
  return options.map((opt, storageIndex) => ({ ...opt, storageIndex }));
}

function shuffleOptions(question: ApiQuestion, rng: () => number): ApiQuestion {
  if (!OPTION_SHUFFLE_KINDS.has(question.kind) || question.options.length <= 1) {
    return { ...question, options: withStorageIndex(question.options) };
  }
  const indexed = withStorageIndex(question.options);
  return { ...question, options: fisherYates(indexed, rng) };
}

function sequentialOptions(question: ApiQuestion): ApiQuestion {
  return { ...question, options: withStorageIndex(question.options) };
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

function sequentialRankItems(question: ApiQuestion): ApiQuestion {
  return question;
}

export function isPinnedQuestion(question: ApiQuestion): boolean {
  if (question.dimensionCode === "PRE") return true;
  if (question.pinOrder != null) return true;
  if (question.scoringSensitive === "appearance") return true;
  if (APPEARANCE_CALIBRATION_IDS.has(question.externalId)) return true;
  if (question.foundationPinned) return true;
  return false;
}

function pinnedSortKey(question: ApiQuestion): number {
  return question.pinOrder ?? question.order;
}

function orderQuestions(
  questions: ApiQuestion[],
  suiteSlug: string,
  questionMode: PresentationOrderMode,
): ApiQuestion[] {
  const sorted = [...questions].sort((a, b) => a.order - b.order);
  if (questionMode === "sequential") return sorted;

  const pinned: ApiQuestion[] = [];
  const shuffleable: ApiQuestion[] = [];
  for (const question of sorted) {
    if (isPinnedQuestion(question)) pinned.push(question);
    else shuffleable.push(question);
  }
  pinned.sort((a, b) => pinnedSortKey(a) - pinnedSortKey(b));
  const rng = rngForSuite(suiteSlug);
  return [...pinned, ...fisherYates(shuffleable, rng)];
}

function applyOptionOrder(
  questions: ApiQuestion[],
  suiteSlug: string,
  optionMode: PresentationOrderMode,
): ApiQuestion[] {
  if (optionMode === "sequential") {
    return questions.map((q) => sequentialRankItems(sequentialOptions(q)));
  }
  const rng = rngForSuite(suiteSlug);
  return questions.map((q) => shuffleRankItems(shuffleOptions(q, rng), rng));
}

/**
 * Apply question order + option order independently.
 * Answers stay keyed by question id + option storage index — safe to switch mid-attempt.
 */
export function applyQuestionPresentation(
  questions: ApiQuestion[],
  suiteSlug: string,
  settings?: Partial<PresentationSettings>,
): ApiQuestion[] {
  if (!questions.length) return [];
  const resolved: PresentationSettings = {
    questionOrder: settings?.questionOrder ?? getQuestionOrderMode(suiteSlug),
    optionOrder: settings?.optionOrder ?? getOptionOrderMode(suiteSlug),
  };
  const ordered = orderQuestions(questions, suiteSlug, resolved.questionOrder);
  return applyOptionOrder(ordered, suiteSlug, resolved.optionOrder);
}

/** @deprecated Use applyQuestionPresentation */
export function prepareQuestionsForPresentation(
  questions: ApiQuestion[],
  suiteSlug: string,
): ApiQuestion[] {
  return applyQuestionPresentation(questions, suiteSlug, {
    questionOrder: "shuffled",
    optionOrder: "shuffled",
  });
}

export function presentationModeSummary(settings: PresentationSettings): string {
  const q = QUESTION_ORDER_COPY[settings.questionOrder].label;
  const o = OPTION_ORDER_COPY[settings.optionOrder].label;
  return `${q} · ${o}`;
}

type PresentationToggleContext = {
  productId: string;
  questions: ApiQuestion[];
  currentIndex: number;
  isAnswered: (question: ApiQuestion, payload: AnswerPayload | undefined) => boolean;
  answers: Record<string, AnswerPayload>;
};

/** Defer order/shuffle controls until preface & first question are done. */
export function shouldShowPresentationToggle(ctx: PresentationToggleContext): boolean {
  const current = ctx.questions[ctx.currentIndex];
  if (!current) return false;
  if (current.dimensionCode === "PRE") return false;

  if (ctx.productId === "ros") {
    const pendingPre = ctx.questions.some(
      (q) => q.dimensionCode === "PRE" && !ctx.isAnswered(q, ctx.answers[q.id]),
    );
    if (pendingPre) return false;
  }

  return ctx.currentIndex > 0;
}
