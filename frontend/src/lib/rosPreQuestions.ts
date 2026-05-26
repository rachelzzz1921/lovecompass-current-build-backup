import { STAGE_OPTIONS } from "@/data/rosTypes";
import type { AnswerPayload, ApiQuestion } from "@/lib/questionTypes";

export const ROS_STAGE_SESSION_KEY = "ros:stageUi";

const PRE_A_EXTERNAL_IDS = new Set(["PRE-F-00A", "PRE-M-00A"]);

/** ros.start 阶段 id → PRE-00A 选项 key */
const STAGE_UI_TO_OPTION_KEY = Object.fromEntries(
  STAGE_OPTIONS.map((opt, index) => [opt.id, String.fromCharCode(65 + index)]),
) as Record<string, string>;

export function isRosPreQuestionA(externalId: string): boolean {
  return PRE_A_EXTERNAL_IDS.has(externalId);
}

export function readRosEntryStage(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ROS_STAGE_SESSION_KEY);
}

export function preAnswerForRosStage(stageUiId: string): AnswerPayload | null {
  const optionKey = STAGE_UI_TO_OPTION_KEY[stageUiId];
  return optionKey ? { optionKey } : null;
}

/** 入口已选阶段时：预填 PRE-00A 并从 UI 隐藏（仍参与提交计 tag） */
export function applyRosEntryStagePrefill(
  questions: ApiQuestion[],
  existingAnswers: Record<string, AnswerPayload>,
): { answers: Record<string, AnswerPayload>; hiddenIds: Set<string> } {
  const stage = readRosEntryStage();
  const preAnswer = stage ? preAnswerForRosStage(stage) : null;
  if (!preAnswer) return { answers: existingAnswers, hiddenIds: new Set() };

  const hiddenIds = new Set<string>();
  const answers = { ...existingAnswers };
  for (const question of questions) {
    if (!isRosPreQuestionA(question.externalId)) continue;
    hiddenIds.add(question.id);
    answers[question.id] = preAnswer;
  }
  return { answers, hiddenIds };
}

/** 提交前合并：滑块默认值 + ROS 入口阶段预填（隐藏 PRE 题仍参与计分） */
export function prepareSubmitAnswers(
  questions: ApiQuestion[],
  answers: Record<string, AnswerPayload>,
  fillSliderDefault: (question: ApiQuestion) => AnswerPayload,
  isAnsweredFn: (q: ApiQuestion | undefined, p: AnswerPayload | undefined) => boolean,
): Record<string, AnswerPayload> {
  const next = { ...answers };
  for (const item of questions) {
    if (item.kind === "slider" && !isAnsweredFn(item, next[item.id])) {
      next[item.id] = fillSliderDefault(item);
    }
  }
  return applyRosEntryStagePrefill(questions, next).answers;
}

export function visibleRosQuestions(
  questions: ApiQuestion[],
  hiddenIds: ReadonlySet<string>,
): ApiQuestion[] {
  if (!hiddenIds.size) return questions;
  return questions.filter((q) => !hiddenIds.has(q.id));
}
