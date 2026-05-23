import type { ButtonHTMLAttributes, ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type HintButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  blocked?: boolean;
  blockedHint?: string;
  children: ReactNode;
};

/** Clickable even when blocked — shows a toast explaining why action is unavailable. */
export function HintButton({
  blocked,
  blockedHint,
  onClick,
  className,
  children,
  ...rest
}: HintButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      aria-disabled={blocked || rest.disabled}
      onClick={(event) => {
        if (blocked) {
          if (blockedHint) toast.info(blockedHint);
          return;
        }
        onClick?.(event);
      }}
      className={cn(className, blocked && "opacity-50 cursor-not-allowed")}
    >
      {children}
    </button>
  );
}
