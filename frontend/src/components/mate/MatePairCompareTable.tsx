import type { MateCoupleCompareRow } from "@/data/mateCoupleTypes";

const BADGE_STYLE: Record<string, string> = {
  ok: "text-emerald-300/90 bg-emerald-950/40 border-emerald-900/40",
  warn: "text-amber-200/90 bg-amber-950/35 border-amber-900/35",
  alert: "text-rose-200/90 bg-rose-950/40 border-rose-900/40",
};

export function MatePairCompareTable({
  title,
  rows,
}: {
  title: string;
  rows: MateCoupleCompareRow[];
}) {
  if (!rows.length) return null;
  return (
    <section>
      <div className="text-[10px] font-mono tracking-[0.28em] text-white/45 mb-3">{title}</div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr] gap-0 text-[10px] uppercase tracking-wider text-white/35 px-3 py-2 bg-white/[0.03]">
          <span>议题</span>
          <span>你</span>
          <span>TA</span>
          <span>判断</span>
        </div>
        {rows.map((row) => (
          <div
            key={`${row.label}-${row.verdict}`}
            className="grid grid-cols-[1.1fr_1fr_1fr_1fr] gap-2 px-3 py-2.5 text-xs border-t border-white/[0.06] items-start"
          >
            <span className="text-white/75">{row.label}</span>
            <span className="text-white/85">{row.you || "—"}</span>
            <span className="text-white/85">{row.ta || "—"}</span>
            <span
              className={`inline-flex w-fit px-1.5 py-0.5 rounded border text-[10px] ${BADGE_STYLE[row.badge] ?? BADGE_STYLE.warn}`}
            >
              {row.verdict}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
