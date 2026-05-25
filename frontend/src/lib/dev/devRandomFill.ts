/**
 * DEV-ONLY · 随机填答工具
 * ─────────────────────────
 * 测试用：一键为所有题目生成随机答案。
 * 上线前删除整个 `frontend/src/lib/dev/` 与 `frontend/src/components/dev/` 目录，
 * 并移除 `tests.$id.run.tsx` 里标记为 DEV ONLY 的 import 与按钮。
 */

import type { AnswerPayload, ApiQuestion } from "@/lib/questionTypes";

export const DEV_RANDOM_FILL_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_DEV_RANDOM_FILL === "true";

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function randomChoiceAnswer(question: ApiQuestion): AnswerPayload {
  const options = question.options ?? [];
  if (!options.length) {
    return { value: randInt(question.ui.min ?? 1, question.ui.max ?? 5) };
  }
  const index = randInt(0, options.length - 1);
  const opt = options[index];
  const key = opt.key || String.fromCharCode(65 + index);
  return {
    optionKey: key,
    optionIndex: opt.storageIndex ?? index,
  };
}

export function randomAnswerForQuestion(question: ApiQuestion): AnswerPayload {
  switch (question.kind) {
    case "slider": {
      const min = question.ui.min ?? 0;
      const max = question.ui.max ?? 100;
      const step = question.ui.step ?? 1;
      const steps = Math.max(1, Math.floor((max - min) / step) + 1);
      const picked = randInt(0, steps - 1);
      return { value: min + picked * step };
    }
    case "scale": {
      const min = question.ui.min ?? 1;
      const max = question.ui.max ?? 5;
      return { value: randInt(min, max) };
    }
    case "rank": {
      const ids = (question.ui.items ?? []).map((item) => item.id);
      return { orderedItemIds: shuffle(ids) };
    }
    case "choice":
    case "binary":
    case "card":
    case "mood":
    default:
      return randomChoiceAnswer(question);
  }
}

export function buildRandomAnswers(questions: ApiQuestion[]): Record<string, AnswerPayload> {
  return Object.fromEntries(questions.map((q) => [q.id, randomAnswerForQuestion(q)]));
}

export function buildRandomDurations(questions: ApiQuestion[]): Record<string, number> {
  return Object.fromEntries(
    questions.map((q) => [q.id, randInt(400, 2200)]),
  );
}
