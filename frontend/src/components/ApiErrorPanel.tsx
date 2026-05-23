import { Link } from "@tanstack/react-router";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiErrorHint } from "@/lib/apiErrors";

type BackLink = {
  to: string;
  params?: Record<string, string>;
  label?: string;
};

type ApiErrorPanelProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  backTo?: BackLink;
};

export function ApiErrorPanel({ message, title = "暂时无法加载", onRetry, backTo }: ApiErrorPanelProps) {
  const hint = getApiErrorHint(message);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full bg-glass-strong rounded-3xl p-8 text-center animate-float-up">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-destructive/15 text-destructive mb-5">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl text-foreground/95">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{message}</p>
        {hint && (
          <p className="mt-4 text-xs text-muted-foreground/90 leading-relaxed rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-left">
            {hint}
          </p>
        )}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <Button variant="default" className="rounded-xl w-full sm:w-auto" onClick={onRetry}>
              <RefreshCw className="mr-1.5 h-4 w-4" /> 重试
            </Button>
          )}
          {backTo && (
            <Button asChild variant="outline" className="rounded-xl w-full sm:w-auto border-border/60">
              <Link to={backTo.to} params={backTo.params}>
                {backTo.label ?? "返回"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
