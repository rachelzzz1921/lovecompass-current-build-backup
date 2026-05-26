import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  coupleReportAccessRoute,
  coupleReportUnavailableCopy,
  coupleReportUpgradeBullets,
  coupleReportUpgradeRoute,
  type CoupleProductId,
} from "@/lib/coupleReport";
import { tierMeta } from "@/lib/suiteTier";
import { productTheme } from "@/lib/productTheme";

type Props = {
  productId: CoupleProductId;
  /** dark = ROS 结果页；light = MATE 章节 / 邀请页 */
  surface?: "dark" | "light";
  className?: string;
};

export function CoupleReportUnavailableNotice({
  productId,
  surface = "dark",
  className = "",
}: Props) {
  const theme = productTheme(productId);
  const upgrade = coupleReportUpgradeRoute(productId);
  const access = coupleReportAccessRoute(productId);
  const copy = coupleReportUnavailableCopy(productId);
  const bullets = coupleReportUpgradeBullets(productId);
  const lite = tierMeta(productId, "lite");
  const full = tierMeta(productId, "full");

  const bulletList = (
    <ul className={`space-y-2 mt-3 ${surface === "dark" ? "text-white/55" : "text-foreground/65"}`}>
      {bullets.map((item) => (
        <li key={item.title} className="flex gap-2 text-xs leading-relaxed">
          <Sparkles className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${surface === "dark" ? "text-[#a5a8ff]" : theme.iconColor}`} />
          <span>
            <span className={surface === "dark" ? "text-white/75 font-medium" : "text-foreground/85 font-medium"}>
              {item.title}
            </span>
            <span className={surface === "dark" ? "text-white/50" : "text-muted-foreground"}> · {item.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );

  const tierCompare = (
    <div className={`grid grid-cols-2 gap-2 mt-4 text-center ${surface === "dark" ? "" : "text-sm"}`}>
      <div
        className={`rounded-xl px-3 py-2.5 ${surface === "dark" ? "border border-white/10 bg-white/[0.03]" : "border border-border/50 bg-secondary/20"}`}
      >
        <div className={`text-[10px] font-mono ${surface === "dark" ? "text-white/40" : "text-muted-foreground"}`}>
          当前 · 快速版
        </div>
        <div className={`text-sm mt-0.5 ${surface === "dark" ? "text-white/70" : "text-foreground/80"}`}>
          {lite.questions} 题 · 单边
        </div>
      </div>
      <div
        className={`rounded-xl px-3 py-2.5 ${surface === "dark" ? "border border-[#6366f1]/35 bg-[#6366f1]/10" : "border border-border/60 bg-secondary/25"}`}
      >
        <div className={`text-[10px] font-mono ${surface === "dark" ? "text-[#c2c4ff]" : theme.iconColor}`}>完整版</div>
        <div className={`text-sm mt-0.5 ${surface === "dark" ? "text-white/90" : "text-foreground"}`}>
          {full.questions} 题 · 可合测
        </div>
      </div>
    </div>
  );

  const actions = (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      <Link
        to={upgrade.to}
        search={upgrade.search}
        className={`inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground`}
      >
        升级完整版 <ArrowRight className="ml-1.5 h-4 w-4" />
      </Link>
      <Link
        to={access.to}
        search={access.search}
        className={`inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm ${
          surface === "dark"
            ? "text-white/80 border border-white/15 hover:bg-white/[0.04]"
            : "text-foreground/80 border border-border/60 hover:bg-secondary/30"
        }`}
      >
        兑换码解锁完整版
      </Link>
    </div>
  );

  if (surface === "light") {
    return (
      <section className={className}>
        <p className="text-[10px] font-mono tracking-[0.25em] text-muted-foreground mb-2">双人报告 · 需完整版</p>
        <p className="text-sm text-foreground/75 leading-relaxed">{copy}</p>
        {tierCompare}
        {bulletList}
        {actions}
      </section>
    );
  }

  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ border: "1.5px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}
    >
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40">双人报告 · 需完整版</div>
      <p className="text-xs text-white/55 mt-3 leading-relaxed">{copy}</p>
      {tierCompare}
      {bulletList}
      {actions}
    </div>
  );
}
