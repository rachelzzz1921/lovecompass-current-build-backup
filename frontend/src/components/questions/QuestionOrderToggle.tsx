import {
  OPTION_ORDER_COPY,
  QUESTION_ORDER_COPY,
  type PresentationOrderMode,
  type PresentationSettings,
} from "@/lib/shufflePresentation";

type Props = {
  settings: PresentationSettings;
  onQuestionChange: (mode: PresentationOrderMode) => void;
  onOptionChange: (mode: PresentationOrderMode) => void;
  disabled?: boolean;
  /** panel = 开始前说明页；inline = 答题页底部小开关 */
  variant?: "panel" | "inline";
};

const MODES: PresentationOrderMode[] = ["shuffled", "sequential"];

function ModeRow({
  axis,
  copy,
  mode,
  onChange,
  disabled,
  compact,
}: {
  axis: "题目" | "选项";
  copy: typeof QUESTION_ORDER_COPY;
  mode: PresentationOrderMode;
  onChange: (mode: PresentationOrderMode) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const groupLabel = axis === "题目" ? "题目顺序" : "选项顺序";

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground/70 w-7 shrink-0">
            {axis}
          </span>
          <div
            className="inline-flex items-center rounded-full border border-border/45 bg-background/50 p-0.5"
            role="radiogroup"
            aria-label={groupLabel}
          >
            {MODES.map((value) => {
              const active = mode === value;
              const item = copy[value];
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={item.benefit}
                  disabled={disabled}
                  data-testid={`${axis === "题目" ? "question" : "option"}-order-${value}`}
                  onClick={() => onChange(value)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "bg-secondary/80 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground/80"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground">{axis}顺序</span>
        <span className="text-[10px] text-muted-foreground/75">
          当前：{copy[mode].label}
        </span>
      </div>
      <div
        className="grid grid-cols-2 gap-1 rounded-xl border border-border/50 bg-background/40 p-1"
        role="radiogroup"
        aria-label={groupLabel}
      >
        {MODES.map((value) => {
          const active = mode === value;
          const item = copy[value];
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              data-testid={`${axis === "题目" ? "question" : "option"}-order-${value}`}
              onClick={() => onChange(value)}
              className={`rounded-lg px-3 py-2 text-left transition-all ${
                active
                  ? "bg-[oklch(0.50_0.20_285_/_0.16)] border border-[oklch(0.68_0.18_285_/_0.45)] shadow-sm"
                  : "border border-transparent hover:bg-secondary/30"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`block text-sm font-medium ${active ? "text-foreground" : "text-foreground/75"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 space-y-1 text-[11px]">
        {MODES.map((value) => {
          const item = copy[value];
          const active = mode === value;
          return (
            <p
              key={value}
              className={`leading-relaxed ${active ? "text-foreground/85" : "text-muted-foreground/70"}`}
            >
              <span className="font-mono tracking-wide">{item.label}</span>
              <span className="mx-1.5 text-border">·</span>
              {item.benefit}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function QuestionOrderToggle({
  settings,
  onQuestionChange,
  onOptionChange,
  disabled,
  variant = "panel",
}: Props) {
  if (variant === "inline") {
    return (
      <div
        className="mt-4 pt-3 border-t border-border/30 space-y-2"
        data-testid="question-order-toggle"
      >
        <p className="text-[10px] text-center text-muted-foreground/75 leading-relaxed">
          题目顺序与选项顺序互不影响，可分别切换
        </p>
        <ModeRow
          axis="题目"
          copy={QUESTION_ORDER_COPY}
          mode={settings.questionOrder}
          onChange={onQuestionChange}
          disabled={disabled}
          compact
        />
        <ModeRow
          axis="选项"
          copy={OPTION_ORDER_COPY}
          mode={settings.optionOrder}
          onChange={onOptionChange}
          disabled={disabled}
          compact
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-border/60 bg-secondary/15 p-4 space-y-4"
      data-testid="question-order-toggle"
    >
      <div>
        <span className="text-[10px] font-mono tracking-[0.22em] text-muted-foreground">
          作答顺序
        </span>
        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
          「题目顺序」和「选项顺序」互不影响，可自由组合。答题中也可随时切换，已答内容会保留。
        </p>
      </div>

      <ModeRow
        axis="题目"
        copy={QUESTION_ORDER_COPY}
        mode={settings.questionOrder}
        onChange={onQuestionChange}
        disabled={disabled}
      />

      <div className="border-t border-border/40 pt-4">
        <ModeRow
          axis="选项"
          copy={OPTION_ORDER_COPY}
          mode={settings.optionOrder}
          onChange={onOptionChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
