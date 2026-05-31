import { Link } from "@tanstack/react-router";
import { Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { CoupleReportUnavailableNotice } from "@/components/CoupleReportUnavailableNotice";
import {
  coupleReportEligible,
  showCoupleReportUpgradeNotice,
} from "@/lib/coupleReport";
import type { SuiteTier } from "@/lib/suiteTier";

type Props = {
  relationCode: string;
  coupleUnlocked: boolean;
  suiteSlug?: string | null;
  suiteTier?: SuiteTier | null;
  compact?: boolean;
};

export function RosCoupleInvitePanel({
  relationCode,
  coupleUnlocked,
  suiteSlug,
  suiteTier = null,
  compact = false,
}: Props) {
  const canCouple = coupleReportEligible("ros", suiteSlug, suiteTier, relationCode);
  const showLiteNotice = showCoupleReportUpgradeNotice(suiteSlug, suiteTier);

  if (showLiteNotice) {
    return <CoupleReportUnavailableNotice productId="ros" />;
  }

  if (!canCouple || !relationCode.trim()) {
    return null;
  }

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/ros/invite/${relationCode}`
      : `/ros/invite/${relationCode}`;

  const copy = (text: string, msg: string) =>
    void navigator.clipboard
      .writeText(text)
      .then(() => toast.success(msg))
      .catch(() => toast.error("复制失败"));

  return (
    <section
      className={`rounded-2xl p-5 scroll-mt-32 ${compact ? "" : "space-y-0"}`}
      style={{ border: "1.5px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}
      id="ros-couple-invite"
    >
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40">双人合测 · 关系码</div>
      <div
        className="font-mono text-xl tracking-[0.25em] text-white mt-2 px-3 py-1.5 inline-block rounded-full"
        style={{ background: "rgba(99,102,241,0.12)" }}
      >
        {relationCode}
      </div>
      <p className="text-xs text-white/55 mt-3 leading-relaxed">
        把关系码或邀请链接发给 TA。对方免费作答后，双人报告自动解锁——两份视角，才能看见真正的你们。
      </p>
      {coupleUnlocked ? (
        <Link
          to="/result/ros/couple/$code"
          params={{ code: relationCode }}
          className="inline-block mt-3 text-sm text-[#c2c4ff] underline"
        >
          双人报告已解锁，点击查看 →
        </Link>
      ) : (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={() => copy(relationCode, "关系码已复制")}
            className="h-10 rounded-lg text-sm text-white/80 hover:text-white transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Copy className="h-3.5 w-3.5 inline mr-1.5" />
            复制关系码
          </button>
          <button
            type="button"
            onClick={() => copy(inviteUrl, "邀请链接已复制")}
            className="h-10 rounded-lg text-sm text-white font-medium transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <Link2 className="h-3.5 w-3.5 inline mr-1.5" />
            复制邀请链接
          </button>
        </div>
      )}
    </section>
  );
}
