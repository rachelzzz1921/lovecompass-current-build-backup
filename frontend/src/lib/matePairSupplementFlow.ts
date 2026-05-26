import type { AnswerPayload, ApiQuestion } from "@/lib/questionTypes";

type OptionWithValue = ApiQuestion["options"][number] & { value?: string | number };

export function answerOutputValue(question: ApiQuestion, payload: AnswerPayload | undefined): string | number | null {
  if (!payload) return null;
  if ("value" in payload) return payload.value;
  if (!("optionKey" in payload)) return null;
  const opt = question.options.find((row) => row.key === payload.optionKey) as OptionWithValue | undefined;
  if (opt && opt.value !== undefined) return opt.value;
  return payload.optionKey;
}

export function supplementQuestionVisible(
  question: ApiQuestion,
  answers: Record<string, AnswerPayload>,
  allQuestions: ApiQuestion[],
): boolean {
  const showIf = question.showIf;
  if (!showIf) return true;
  const match = showIf.match(/^(\S+)\s*==\s*(\S+)$/);
  if (!match) return true;
  const [, depId, expected] = match;
  const dep = allQuestions.find((item) => item.id === depId);
  if (!dep) return false;
  const actual = answerOutputValue(dep, answers[depId]);
  return String(actual) === expected;
}

export function visibleSupplementQuestions(
  questions: ApiQuestion[],
  answers: Record<string, AnswerPayload>,
): ApiQuestion[] {
  return questions.filter((q) => supplementQuestionVisible(q, answers, questions));
}
