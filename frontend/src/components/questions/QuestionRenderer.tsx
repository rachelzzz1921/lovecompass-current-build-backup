import type { AnswerPayload, ApiQuestion, QuestionOption } from "@/lib/questionTypes";
import {
  appearanceReferenceRow,
  appearanceTierLabel,
  APPEARANCE_SLIDER_FOOTNOTE,
} from "@/lib/appearanceSlider";

type Props = {
  question: ApiQuestion;
  value?: AnswerPayload;
  onChange: (payload: AnswerPayload) => void;
};

const optionKey = (opt: QuestionOption, index: number) =>
  opt.key || String.fromCharCode(65 + index);

const optionStorageIndex = (opt: QuestionOption, displayIndex: number) =>
  opt.storageIndex ?? displayIndex;

function resolveTierLabel(
  value: number,
  tierLabels?: Array<{ range: [number, number]; label: string }>,
): string {
  if (tierLabels?.length) {
    const tier = tierLabels.find((item) => value >= item.range[0] && value <= item.range[1]);
    if (tier) return tier.label;
  }
  return appearanceTierLabel(value);
}

function AppearanceSlider({
  question,
  current,
  hasExplicitValue,
  onChange,
}: {
  question: ApiQuestion;
  current: number;
  hasExplicitValue: boolean;
  onChange: (payload: AnswerPayload) => void;
}) {
  const min = question.ui.min ?? 1;
  const max = question.ui.max ?? 10;
  const tierLabel = resolveTierLabel(current, question.ui.tierLabels);
  const activeRef = appearanceReferenceRow(
    current,
    question.ui.reference?.map((row) => ({
      score: row.score,
      perception: row.perception ?? row.desc ?? "",
      behavior: row.behavior ?? "",
    })),
  );
  const footnote = question.ui.footnote ?? APPEARANCE_SLIDER_FOOTNOTE;

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4">
        <div className="text-center mb-5">
          <div className="font-display text-2xl text-gradient-violet">{tierLabel}</div>
          <p className="mt-1 text-[11px] font-mono tracking-[0.18em] text-muted-foreground">
            同龄人中的辨识度 · 被注意频率 · 外形管理后的现实感受
          </p>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={question.ui.step ?? 1}
          value={current}
          onChange={(e) => onChange({ value: Number(e.target.value) })}
          data-testid="slider-answer"
          className="w-full accent-[oklch(0.68_0.18_285)]"
        />
        <div className="mt-3 flex justify-between text-[10px] font-mono text-muted-foreground tabular-nums">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((mark) => (
            <span key={mark} className={mark === current ? "text-foreground/90" : ""}>
              {mark}
            </span>
          ))}
        </div>
        {!hasExplicitValue && (
          <button
            type="button"
            data-testid="confirm-slider-default"
            onClick={() => onChange({ value: current })}
            className="mt-4 w-full rounded-xl border border-border/70 px-3 py-2 text-xs font-mono tracking-[0.15em] text-muted-foreground transition hover:border-[oklch(0.68_0.18_285_/_0.55)] hover:text-foreground"
          >
            确认当前感受 · {tierLabel}
          </button>
        )}
        {activeRef && (
          <div className="mt-4 rounded-xl border border-[oklch(0.68_0.18_285_/_0.25)] bg-[oklch(0.50_0.20_285_/_0.08)] p-3.5">
            <p className="text-sm text-foreground/90 leading-relaxed">{activeRef.perception}</p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{activeRef.behavior}</p>
          </div>
        )}
      </div>

      {question.ui.reference && question.ui.reference.length > 0 && (
        <details className="rounded-xl border border-border/50 bg-secondary/10 px-3 py-2">
          <summary className="cursor-pointer text-xs font-mono tracking-[0.12em] text-muted-foreground py-1.5">
            展开参考说明（帮助校准，不是打分标准）
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-[11px]">
              <thead>
                <tr className="text-muted-foreground border-b border-border/40">
                  <th className="py-2 pr-2 font-mono w-10">分值</th>
                  <th className="py-2 pr-2">用户感知</th>
                  <th className="py-2">行为参考</th>
                </tr>
              </thead>
              <tbody>
                {question.ui.reference.map((row) => {
                  const perception = row.perception ?? row.desc ?? "";
                  const active = row.score === current;
                  return (
                    <tr
                      key={row.score}
                      className={`border-b border-border/30 ${active ? "bg-[oklch(0.50_0.20_285_/_0.10)]" : ""}`}
                    >
                      <td className="py-2 pr-2 font-mono tabular-nums text-foreground/80">{row.score}</td>
                      <td className="py-2 pr-2 text-foreground/85">{perception}</td>
                      <td className="py-2 text-muted-foreground">{row.behavior ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      )}

      <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">{footnote}</p>
    </div>
  );
}

export function QuestionRenderer({ question, value, onChange }: Props) {
  if (question.kind === "slider") {
    const min = question.ui.min ?? 0;
    const max = question.ui.max ?? 100;
    const hasExplicitValue = "value" in (value ?? {});
    const current = hasExplicitValue
      ? Number((value as { value: number }).value)
      : Math.round((min + max) / 2);
    const feedback = question.ui.feedback?.find(
      (f) => current >= f.range[0] && current <= f.range[1],
    );

    if (question.ui.displayMode === "appearance") {
      return (
        <AppearanceSlider
          question={question}
          current={current}
          hasExplicitValue={hasExplicitValue}
          onChange={onChange}
        />
      );
    }

    return (
      <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/20 p-4">
        <input
          type="range"
          min={min}
          max={max}
          step={question.ui.step ?? 1}
          value={current}
          onChange={(e) => onChange({ value: Number(e.target.value) })}
          data-testid="slider-answer"
          className="w-full accent-[oklch(0.68_0.18_285)]"
        />
        {!hasExplicitValue && (
          <button
            type="button"
            data-testid="confirm-slider-default"
            onClick={() => onChange({ value: current })}
            className="mt-3 w-full rounded-xl border border-border/70 px-3 py-2 text-xs font-mono tracking-[0.15em] text-muted-foreground transition hover:border-[oklch(0.68_0.18_285_/_0.55)] hover:text-foreground"
          >
            使用当前值 {current}
          </button>
        )}
        <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
          <span>{question.ui.minLabel ?? min}</span>
          <span className="font-mono text-foreground/90">{current}</span>
          <span>{question.ui.maxLabel ?? max}</span>
        </div>
        {feedback && (
          <p className="mt-3 text-sm text-foreground/75 leading-relaxed">{feedback.text}</p>
        )}
      </div>
    );
  }

  if (question.kind === "scale") {
    const min = question.ui.min ?? 1;
    const max = question.ui.max ?? 5;
    const current =
      "value" in (value ?? {}) ? Number((value as { value: number }).value) : undefined;
    return (
      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{question.ui.minLabel ?? "完全不符合"}</span>
          <span>{question.ui.maxLabel ?? "完全符合"}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: max - min + 1 }).map((_, i) => {
            const v = min + i;
            const active = current === v;
            return (
              <button
                key={v}
                data-testid="scale-answer"
                onClick={() => onChange({ value: v })}
                className={`h-12 rounded-xl border font-mono transition-all ${active ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.18)] glow-violet" : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)]"}`}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.kind === "rank") {
    const items = question.ui.items ?? [];
    const ordered =
      "orderedItemIds" in (value ?? {})
        ? [...(value as { orderedItemIds: string[] }).orderedItemIds]
        : [];
    const toggle = (id: string) => {
      onChange({
        orderedItemIds: ordered.includes(id) ? ordered.filter((x) => x !== id) : [...ordered, id],
      });
    };
    return (
      <div className="mt-6 space-y-2.5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          请按你的真实优先级依次点击全部选项；左侧数字会显示当前排序，全部选完后才能进入下一题。
        </p>
        {items.map((item) => {
          const pos = ordered.indexOf(item.id);
          return (
            <button
              key={item.id}
              data-testid="rank-answer"
              onClick={() => toggle(item.id)}
              className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all ${pos >= 0 ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)]" : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)]"}`}
            >
              <span className="w-7 h-7 rounded-md border border-border/70 grid place-items-center font-mono text-[11px]">
                {pos >= 0 ? pos + 1 : "—"}
              </span>
              <span className="text-sm text-foreground/90">{item.text}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const selected =
    "optionKey" in (value ?? {}) ? (value as { optionKey: string }).optionKey : undefined;
  const grid = question.kind === "mood" ? "grid grid-cols-2 md:grid-cols-4 gap-2.5" : "space-y-2.5";
  return (
    <div className="mt-6">
      {question.ui.scene && (
        <div className="mb-4 rounded-xl border border-border/60 bg-secondary/25 p-3 text-sm text-foreground/75">
          {question.ui.scene}
        </div>
      )}
      <div className={grid}>
        {question.options.map((opt, i) => {
          const key = optionKey(opt, i);
          const active = selected === key;
          const binary = question.kind === "binary";
          return (
            <button
              key={key}
              data-testid="option-answer"
              onClick={() =>
                onChange({
                  optionKey: key,
                  optionIndex: optionStorageIndex(opt, i),
                })
              }
              className={`group w-full text-left flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 ${active ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)] glow-violet" : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)] hover:bg-[oklch(0.50_0.20_285_/_0.07)]"} ${binary ? "min-h-28" : ""}`}
            >
              <span
                className={`shrink-0 w-6 h-6 rounded-md grid place-items-center text-[11px] font-mono transition-all ${active ? "bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)] text-[oklch(0.10_0.018_270)] border-transparent" : "border border-border/70 text-muted-foreground group-hover:text-foreground/90"}`}
              >
                {opt.icon ? "·" : key}
              </span>
              <span className="text-[14px] leading-relaxed pt-0.5 text-foreground/90">
                {opt.text}
                {opt.sub && (
                  <span className="block mt-1 text-[12px] text-muted-foreground">{opt.sub}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
