import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { markPartnerRosAccess } from "@/lib/accessGate";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { getStoredRosGender, ROS_SUITE_SLUGS, setStoredRosGender } from "@/lib/suiteSlugs";

export const Route = createFileRoute("/ros/invite/$code")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "TA 邀请你做一份关系测评 · MIRROR" },
      { name: "description", content: "TA 已经做完了 ROS 关系测评，正在等你的视角。" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { code } = useParams({ from: "/ros/invite/$code" });
  const nav = useNavigate();
  const { pending: authPending } = useRequireAuth();

  const start = async () => {
    try {
      const normalized = code.trim().toUpperCase();
      await lovecompassApi.previewRelationCode(normalized);
      const gender = getStoredRosGender() || "female";
      setStoredRosGender(gender);
      markPartnerRosAccess(normalized, ROS_SUITE_SLUGS[gender]);
      void nav({ to: "/tests/$id/run", params: { id: ROS_SUITE_SLUGS[gender] } });
    } catch (e) {
      toast.error(formatApiErrorMessage(e));
    }
  };

  if (authPending) return <AuthChecking />;

  return (
    <main className="relative min-h-screen">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> 返回首页
        </Link>
        <span className="chip chip-cyan font-mono">INVITE · ROS</span>
      </header>

      <section className="relative z-10 max-w-2xl mx-auto px-6 md:px-12 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <span className="chip chip-violet font-mono inline-flex"><Sparkles className="h-3 w-3" /> TA 已完成测评</span>
          <h1 className="font-display text-3xl md:text-4xl mt-5 text-gradient-violet">
            TA 邀请你看看，<br />你们之间到底怎么样
          </h1>
          <p className="text-muted-foreground mt-5 text-sm leading-relaxed max-w-md mx-auto">
            等你做完，你们会同时解锁完整的双人报告——<span className="text-foreground/80">这一步，你也是免费的。</span>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-glass-strong rounded-2xl p-6 mt-10 space-y-5">
          <div className="text-center">
            <div className="text-[10px] tracking-[0.3em] text-muted-foreground font-mono mb-2">PARTNER CODE</div>
            <div className="font-mono text-2xl tracking-[0.3em] text-gradient-cyan">{code.toUpperCase()}</div>
          </div>
          <Button onClick={() => void start()}
            className="w-full h-12 bg-gradient-to-r from-[oklch(0.55_0.20_285)] to-[oklch(0.50_0.18_200)] text-white">
            开始我的 60 题 <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            开始前可在 <Link to="/ros/start" className="underline">ROS 开始页</Link> 选择男女版本
          </p>
        </motion.div>
      </section>
    </main>
  );
}
