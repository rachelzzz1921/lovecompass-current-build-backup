import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RosCoupleResult } from "@/data/rosTypes";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { RosCoupleResultView } from "@/components/RosCoupleResultView";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { mapApiCouplePayload } from "@/lib/mapRosCoupleResult";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { takeResultPrefetch } from "@/lib/resultPrefetchCache";
import { ResultDataLoading } from "@/components/ResultDataLoading";

export const Route = createFileRoute("/result/ros/couple/$code")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "你们的双人报告 · MIRROR" },
      { name: "description", content: "ROS 双人报告 · 契合指数、感知差值、依恋碰撞、AI 处方签。" },
    ],
  }),
  component: CouplePage,
});

function CouplePage() {
  const { code } = useParams({ from: "/result/ros/couple/$code" });
  const { pending: authPending } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitingPartner, setWaitingPartner] = useState(false);
  const [r, setR] = useState<RosCoupleResult | null>(null);
  const [initiatorAttemptId, setInitiatorAttemptId] = useState<string | undefined>();

  useEffect(() => {
    if (authPending) return;
    let cancelled = false;
    const normalized = code.trim().toUpperCase();

    const cached = takeResultPrefetch(`couple:${normalized}`);
    if (cached?.kind === "ros-couple" && cached.code === normalized) {
      setR(mapApiCouplePayload(cached.data));
      const participants = cached.data.participants as { initiatorAttemptId?: string } | undefined;
      setInitiatorAttemptId(participants?.initiatorAttemptId || undefined);
      setLoading(false);
      return;
    }

    setLoading(true);
    lovecompassApi
      .getRosCoupleReport(code)
      .then((res) => {
        if (cancelled) return;
        setR(mapApiCouplePayload(res.couple));
        const participants = res.couple.participants as { initiatorAttemptId?: string } | undefined;
        setInitiatorAttemptId(participants?.initiatorAttemptId || undefined);
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = formatApiErrorMessage(e);
        if (/等待伴侣|409/.test(msg)) {
          setWaitingPartner(true);
          setError(null);
        } else {
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authPending, code]);

  useEffect(() => {
    if (!r) return;
    const mode = r.ai_content?.mode;
    if (mode && mode !== "deterministic") return;
    let ignore = false;
    const timer = window.setTimeout(() => {
      lovecompassApi
        .getRosCoupleReport(code)
        .then((res) => {
          if (ignore) return;
          const next = mapApiCouplePayload(res.couple);
          if (next.ai_content?.mode && next.ai_content.mode !== mode) {
            setR(next);
            const participants = res.couple.participants as { initiatorAttemptId?: string } | undefined;
            setInitiatorAttemptId(participants?.initiatorAttemptId || undefined);
          }
        })
        .catch(() => undefined);
    }, 8000);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [code, r]);

  if (authPending) return <AuthChecking />;
  if (loading) return <ResultDataLoading label="读取双人报告…" />;

  if (waitingPartner) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-6" style={{ background: "#0c0e11" }}>
        <div className="max-w-md text-center space-y-4">
          <Heart className="h-10 w-10 mx-auto text-[#a5a8ff]" />
          <h1 className="font-display text-2xl text-white">等待 TA 完成测评</h1>
          <p className="text-sm text-white/65 leading-relaxed">
            你的部分已经就绪。双人报告会在 TA 用关系码{" "}
            <span className="font-mono text-[#c2c4ff]">{code}</span> 完成 ROS 60 题后自动解锁。
          </p>
          <Link to="/ros/invite/$code" params={{ code }}>
            <Button className="rounded-full mt-2">查看邀请页</Button>
          </Link>
          <div>
            <Link to="/" className="text-xs text-white/45 hover:text-white/70">
              返回首页
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (error || !r) {
    return (
      <ApiErrorPanel
        title="双人报告加载失败"
        message={error ?? "尚未解锁"}
        backTo={{ to: "/", label: "返回首页" }}
      />
    );
  }

  return <RosCoupleResultView result={r} initiatorAttemptId={initiatorAttemptId} />;
}
