import { Link } from "@tanstack/react-router";
import type { RosCoupleResult } from "@/data/rosTypes";

export function RosCoupleBond({ result }: { result: RosCoupleResult }) {
  const bond = result.bond ?? result.collision;
  const bothUnlocked = bond?.self_unlocked && bond?.partner_unlocked;
  const partial = bond?.self_unlocked || bond?.partner_unlocked;

  if (!bothUnlocked && !partial) {
    return (
      <section>
        <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">BOND · 底层人格碰撞</div>
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm text-white/65 leading-relaxed">
            做完套一「自我关系模式」，可以解锁你们依恋类型的碰撞解读——看见感知差距的深层原因。
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            去做套一 SELF →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">BOND · 底层人格碰撞</div>
      <div
        className="rounded-2xl p-5 space-y-5"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="text-center">
            <div className="text-xs text-white/45 mb-1">你</div>
            <div className="text-sm text-white font-medium">{bond?.you_type ?? "—"}</div>
          </div>
          <div className="text-2xl text-white/30">×</div>
          <div className="text-center">
            <div className="text-xs text-white/45 mb-1">对方</div>
            <div className="text-sm text-white font-medium">{bond?.ta_type ?? "—"}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="font-display text-2xl text-white">{bond?.name}</div>
          <div className="text-xs font-mono text-white/40 mt-1">{bond?.combo}</div>
        </div>

        <p className="text-sm text-white/75 leading-relaxed">{bond?.body}</p>

        {bond?.gap_reason ? (
          <div>
            <div className="text-[10px] font-mono text-white/35 tracking-widest mb-1">为什么你们会有感知差距</div>
            <p className="text-sm text-white/70 leading-relaxed">{bond.gap_reason}</p>
          </div>
        ) : null}

        {(bond?.advice_you || bond?.advice_ta) ? (
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div className="text-[10px] font-mono text-white/35 tracking-widest">打破这个模式</div>
            {bond.advice_you ? (
              <p className="text-sm text-white/80">
                <span className="text-[#a5a8ff]">对你：</span>
                {bond.advice_you}
              </p>
            ) : null}
            {bond.advice_ta ? (
              <p className="text-sm text-white/80">
                <span className="text-[#f0a5d0]">对方：</span>
                {bond.advice_ta}
              </p>
            ) : null}
          </div>
        ) : null}

        {partial && !bothUnlocked ? (
          <p className="text-xs text-white/45 pt-2">
            对方完成套一后，碰撞解读会更完整。
          </p>
        ) : null}
      </div>
    </section>
  );
}
