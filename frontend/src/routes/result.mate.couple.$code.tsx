import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MateCoupleResult } from "@/data/mateCoupleTypes";
import { MateCoupleResultView } from "@/components/mate/MateCoupleResultView";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { mapApiMateCouplePayload } from "@/lib/mapMateCoupleResult";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";

export const Route = createFileRoute("/result/mate/couple/$code")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "婚恋适配双人报告 · MIRROR" },
      { name: "description", content: "MATE 双人婚恋适配 · P1-P6 模块拆解与红娘建议。" },
    ],
  }),
  component: MateCouplePage,
});

function MateCouplePage() {
  const { code } = useParams({ from: "/result/mate/couple/$code" });
  const { pending: authPending } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitingPartner, setWaitingPartner] = useState(false);
  const [result, setResult] = useState<MateCoupleResult | null>(null);

  useEffect(() => {
    if (authPending) return;
    let cancelled = false;
    setLoading(true);
    lovecompassApi
      .getMateCoupleReport(code)
      .then((res) => {
        if (cancelled) return;
        setResult(mapApiMateCouplePayload(res.couple));
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

  if (authPending || loading) return <AuthChecking />;

  if (waitingPartner) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-6" style={{ background: "#100a0d" }}>
        <div className="max-w-md text-center space-y-4">
          <Heart className="h-10 w-10 mx-auto text-[#fb7185]" />
          <h1 className="font-display text-2xl text-white">等待 TA 完成测评</h1>
          <p className="text-sm text-white/65 leading-relaxed">
            你的部分已经就绪。双人报告会在 TA 用关系码{" "}
            <span className="font-mono text-[#f9a8d4]">{code}</span> 完成 MATE 测评后自动解锁。
          </p>
          <Link to="/mate/invite/$code" params={{ code }}>
            <Button className="rounded-full mt-2">查看邀请页</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <ApiErrorPanel title="双人报告加载失败" message={error ?? "未找到结果"} backTo={{ to: "/", label: "返回首页" }} />
    );
  }

  return <MateCoupleResultView result={result} />;
}
