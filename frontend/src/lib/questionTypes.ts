export type QuestionKind = "choice" | "scale" | "slider" | "binary" | "card" | "mood" | "rank";

export type QuestionOption = {
  key: string;
  text: string;
  sub?: string | null;
  icon?: string | null;
};

export type QuestionUi = {
  component: QuestionKind | "choice";
  layout?: "list" | "grid" | "cards" | "binary";
  scene?: string | null;
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  feedback?: Array<{ range: [number, number]; text: string }>;
  reference?: Array<{ score: number; perception?: string; behavior?: string; desc?: string }>;
  tierLabels?: Array<{ range: [number, number]; label: string }>;
  displayMode?: "appearance" | string;
  footnote?: string;
  items?: Array<{ id: string; text: string }>;
  showOptionKey?: boolean;
};

export type ApiQuestion = {
  id: string;
  externalId: string;
  order: number;
  type: string;
  kind: QuestionKind;
  text: string;
  subtitle?: string | null;
  note?: string | null;
  required?: boolean;
  ui: QuestionUi;
  options: QuestionOption[];
};

export type AnswerPayload =
  | { optionKey: string; optionIndex: number }
  | { value: number }
  | { orderedItemIds: string[] };

export type AnswerDraft = {
  questionId: string;
  externalId: string;
  kind: QuestionKind;
  answerPayload: AnswerPayload;
  durationMs?: number;
};

export type TestQuestionsResponse = {
  suite: {
    id: string;
    slug: string;
    name: string;
    gender: "female" | "male" | "neutral";
    version: string;
    totalQuestions: number;
    estimatedMinutes?: number | null;
  };
  questions: ApiQuestion[];
};
