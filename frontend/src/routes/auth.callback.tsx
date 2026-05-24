import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthChecking } from "@/lib/requireAuth";
import { takeOAuthReturn } from "@/lib/oauthReturn";
import { completeSupabaseAuthFromUrl, getSessionWithRefresh } from "@/lib/supabaseSession";

const CallbackSearchSchema = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (s) => CallbackSearchSchema.parse(s),
  ssr: false,
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const nav = useNavigate();
  const [message, setMessage] = useState("正在完成 Google 登录…");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const returnPath = takeOAuthReturn("/");

      const result = await completeSupabaseAuthFromUrl(window.location.href);
      if (cancelled) return;

      if (result.error) {
        setMessage("登录未完成");
        toast.error(result.error);
        void nav({ to: "/auth", search: { redirect: returnPath } });
        return;
      }

      const session = await getSessionWithRefresh();
      if (cancelled) return;

      if (session) {
        void nav({ href: returnPath });
        return;
      }

      setMessage("未能建立登录会话");
      toast.error("Google 登录未完成，请再试一次");
      void nav({ to: "/auth", search: { redirect: returnPath } });
    })();

    return () => {
      cancelled = true;
    };
  }, [nav]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
      <AuthChecking />
      <p>{message}</p>
    </main>
  );
}
