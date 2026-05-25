import { motion } from "framer-motion";
import { forwardRef, type ReactNode } from "react";
import { Lock, Sparkles, Zap } from "lucide-react";
import type { ProductId, SuiteTier } from "@/lib/productRegistry";
import { tierMeta } from "@/lib/productRegistry";
import { normalizeRedemptionCode } from "@/lib/productAccessFlow";
import { optionClass, productTheme, tierOptionClass, type ProductTheme } from "@/lib/productTheme";

export { normalizeRedemptionCode };

type Gender = "female" | "male";

export function ProductFlowHeader({
  theme,
  productCode,
  back,
  rightLabel,
}: {
  theme: ProductTheme;
  productCode: string;
  back: ReactNode;
  rightLabel?: string;
}) {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
      {back}
      <span className={`chip ${theme.chipClass} font-mono`} style={theme.chipStyle}>
        {rightLabel ?? productCode}
      </span>
    </header>
  );
}

export function ProductFlowHero({
  theme,
  kicker,
  title,
  description,
  tierLabel,
}: {
  theme: ProductTheme;
  kicker: string;
  title: string;
  description?: string;
  tierLabel?: string;
}) {
  return (
    <div className="text-center mb-8 md:mb-10">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className={`chip ${theme.chipClass} font-mono inline-flex`} style={theme.chipStyle}>
          <Lock className="h-3 w-3" /> {kicker}
        </span>
        {tierLabel ? (
          <span className="text-[10px] font-mono tracking-[0.25em] text-muted-foreground">{tierLabel}</span>
        ) : null}
      </div>
      <h1 className={`font-display text-3xl md:text-4xl mt-5 leading-tight ${theme.titleGradient}`}>{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">{description}</p>
      ) : null}
    </div>
  );
}

export function FlowStepIndicator({
  theme,
  steps,
  currentIndex,
}: {
  theme: ProductTheme;
  steps: string[];
  currentIndex: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8 md:mb-10">
      {steps.map((label, i) => {
        const active = i === currentIndex;
        const done = i < currentIndex;
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 ? <div className="w-6 md:w-8 h-px bg-border" /> : null}
            <div
              className={`flex items-center gap-2 text-[11px] font-mono whitespace-nowrap ${
                active ? "text-foreground" : done ? theme.iconColor : "text-muted-foreground/60"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  active
                    ? `bg-gradient-to-br ${theme.ringGradient}`
                    : done
                      ? "bg-[oklch(0.78_0.15_165)]"
                      : "bg-border"
                }`}
              />
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProductFlowSection({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">{label}</div>
        {hint ? <span className="text-[10px] font-mono text-foreground/70">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function GenderSelect({
  productId,
  value,
  onChange,
}: {
  productId: ProductId;
  value: Gender | null;
  onChange: (g: Gender) => void;
}) {
  const theme = productTheme(productId);
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {(["female", "male"] as const).map((gender) => (
        <button
          key={gender}
          type="button"
          onClick={() => onChange(gender)}
          className={optionClass(theme, value === gender)}
        >
          {gender === "female" ? "女性版" : "男性版"}
        </button>
      ))}
    </div>
  );
}

export function TierSelect({
  productId,
  value,
  onChange,
}: {
  productId: ProductId;
  value: SuiteTier;
  onChange: (t: SuiteTier) => void;
}) {
  const theme = productTheme(productId);
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {(["lite", "full"] as const).map((tier) => {
        const meta = tierMeta(productId, tier);
        const selected = value === tier;
        return (
          <button
            key={tier}
            type="button"
            onClick={() => onChange(tier)}
            className={tierOptionClass(theme, selected)}
          >
            <div className="flex items-center gap-1.5 text-sm font-medium">
              {tier === "lite" ? <Zap className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              {meta.label}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {meta.questions} 题 · 约 {meta.minutes} 分钟
            </div>
          </button>
        );
      })}
    </div>
  );
}

const CODE_MAX = 32;

type RedemptionCodeInputProps = {
  productId: ProductId;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
};

export const RedemptionCodeInput = forwardRef<HTMLInputElement, RedemptionCodeInputProps>(
  function RedemptionCodeInput(
    { productId, value, onChange, onSubmit, placeholder = "例如 LOVE-COMPASS", label = "REDEEM CODE", disabled },
    ref,
  ) {
    const theme = productTheme(productId);
    const filled = Math.min(normalizeRedemptionCode(value).length, CODE_MAX);
    const pct = Math.round((filled / CODE_MAX) * 100);

    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">{label}</span>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {filled}/{CODE_MAX}
          </span>
        </div>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(normalizeRedemptionCode(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSubmit && !disabled) onSubmit();
          }}
          inputMode="text"
          autoCapitalize="characters"
          maxLength={CODE_MAX}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full h-14 rounded-2xl px-4 text-center font-mono text-lg md:text-xl uppercase bg-secondary/30 border border-border/60 transition-all outline-none caret-[oklch(0.82_0.14_200)] placeholder:text-muted-foreground/45 ${theme.inputFocus}`}
        />
        <div className="mt-4 h-[3px] rounded-full bg-secondary/40 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${theme.progressFrom} ${theme.progressTo}`}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    );
  },
);

export function UnlockStatusRow({
  productId,
  unlocked,
  freeTier,
  tierLabel,
  questionCount,
  loginLabel,
}: {
  productId: ProductId;
  unlocked: boolean;
  freeTier?: boolean;
  tierLabel: string;
  questionCount: number;
  loginLabel: string;
}) {
  const theme = productTheme(productId);
  const title = freeTier ? "快速版免费开放" : unlocked ? "已解锁，可以开始" : "需要兑换码解锁";

  return (
    <div className="flex items-start gap-3">
      <span className={`shrink-0 w-10 h-10 rounded-xl ${theme.iconBg} grid place-items-center ${theme.iconColor}`}>
        {unlocked || freeTier ? <Sparkles className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
      </span>
      <div className="min-w-0">
        <div className="font-display text-lg text-foreground/95">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {loginLabel} · {tierLabel} · {questionCount} 题
        </div>
      </div>
    </div>
  );
}

export function ProductFlowCard({
  theme,
  children,
  className = "",
}: {
  theme: ProductTheme;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative bg-glass-strong rounded-3xl p-6 md:p-8 overflow-hidden ${theme.cardGlow ?? ""} ${className}`}>
      <div className="relative">{children}</div>
    </div>
  );
}

export function PrimaryFlowButton({
  theme,
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { theme: ProductTheme; children: ReactNode }) {
  return (
    <button
      type="button"
      className={`w-full h-12 rounded-full bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground hover:opacity-95 disabled:opacity-40 inline-flex items-center justify-center gap-2 font-medium text-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function FlowOptionCard({
  theme,
  active,
  onClick,
  icon,
  title,
  sub,
}: {
  theme: ProductTheme;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition ${active ? theme.selectedOption : theme.unselectedOption}`}
    >
      <div className="mb-2">{icon}</div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </button>
  );
}

/** 测试入口页顶部的章节 Hero（ROS / 未来多步入口复用） */
export function ProductEntryHero({
  theme,
  productCode,
  title,
  description,
}: {
  theme: ProductTheme;
  productCode: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="text-center mb-8"
    >
      <span className={`chip ${theme.chipClass} font-mono inline-flex`}>{productCode}</span>
      <h1 className={`font-display text-4xl md:text-5xl mt-4 ${theme.titleGradient}`}>{title}</h1>
      <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-lg mx-auto whitespace-pre-line">
        {description}
      </p>
    </motion.div>
  );
}
