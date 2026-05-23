import type { AnswerPayload, ApiQuestion, QuestionOption } from "@/lib/questionTypes";

type Props = {
  question: ApiQuestion;
  value?: AnswerPayload;
  onChange: (payload: AnswerPayload) => void;
};

const optionKey = (opt: QuestionOption, index: number) => opt.key || String.fromCharCode(65 + index);

export function QuestionRenderer({ question, value, onChange }: Props) {
  if (question.kind === "slider") {
    const min = question.ui.min ?? 0;
    const max = question.ui.max ?? 100;
    const current = "value" in (value ?? {}) ? Number((value as { value: number }).value) : Math.round((min + max) / 2);
    const feedback = question.ui.feedback?.find((f) => current >= f.range[0] && current <= f.range[1]);
    return (
      <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/20 p-4">
        <input
          type="range"
          min={min}
          max={max}
          step={question.ui.step ?? 1}
          value={current}
          onChange={(e) => onChange({ value: Number(e.target.value) })}
          className="w-full accent-[oklch(0.68_0.18_285)]"
        />
        <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
          <span>{question.ui.minLabel ?? min}</span>
          <span className="font-mono text-foreground/90">{current}</span>
          <span>{question.ui.maxLabel ?? max}</span>
        </div>
        {feedback && <p className="mt-3 text-sm text-foreground/75 leading-relaxed">{feedback.text}</p>}
      </div>
    );
  }

  if (question.kind === "scale") {
    const min = question.ui.min ?? 1;
    const max = question.ui.max ?? 5;
    const current = "value" in (value ?? {}) ? Number((value as { value: number }).value) : undefined;
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
    const ordered = "orderedItemIds" in (value ?? {}) ? [...(value as { orderedItemIds: string[] }).orderedItemIds] : [];
    const toggle = (id: string) => {
      onChange({ orderedItemIds: ordered.includes(id) ? ordered.filter((x) => x !== id) : [...ordered, id] });
    };
    return (
      <div className="mt-6 space-y-2.5">
        {items.map((item) => {
          const pos = ordered.indexOf(item.id);
          return (
            <button key={item.id} onClick={() => toggle(item.id)} className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all ${pos >= 0 ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)]" : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)]"}`}>
              <span className="w-7 h-7 rounded-md border border-border/70 grid place-items-center font-mono text-[11px]">{pos >= 0 ? pos + 1 : "—"}</span>
              <span className="text-sm text-foreground/90">{item.text}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const selected = "optionKey" in (value ?? {}) ? (value as { optionKey: string }).optionKey : undefined;
  const grid = question.kind === "mood" ? "grid grid-cols-2 md:grid-cols-4 gap-2.5" : "space-y-2.5";
  return (
    <div className="mt-6">
      {question.ui.scene && <div className="mb-4 rounded-xl border border-border/60 bg-secondary/25 p-3 text-sm text-foreground/75">{question.ui.scene}</div>}
      <div className={grid}>
        {question.options.map((opt, i) => {
          const key = optionKey(opt, i);
          const active = selected === key;
          const binary = question.kind === "binary";
          return (
            <button
              key={key}
              onClick={() => onChange({ optionKey: key, optionIndex: i })}
              className={`group w-full text-left flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 ${active ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)] glow-violet" : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)] hover:bg-[oklch(0.50_0.20_285_/_0.07)]"} ${binary ? "min-h-28" : ""}`}
            >
              <span className={`shrink-0 w-6 h-6 rounded-md grid place-items-center text-[11px] font-mono transition-all ${active ? "bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)] text-[oklch(0.10_0.018_270)] border-transparent" : "border border-border/70 text-muted-foreground group-hover:text-foreground/90"}`}>{opt.icon ? "·" : key}</span>
              <span className="text-[14px] leading-relaxed pt-0.5 text-foreground/90">
                {opt.text}
                {opt.sub && <span className="block mt-1 text-[12px] text-muted-foreground">{opt.sub}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
