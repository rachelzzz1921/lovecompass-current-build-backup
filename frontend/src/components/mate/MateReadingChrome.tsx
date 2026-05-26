import type { ReactNode } from "react";
import type { MateNavId } from "@/data/mateTypes";
import { mateQuickJumpItems } from "@/lib/mateQuickJump";
import { mateLayout } from "@/lib/mateLayout";
import { scrollToSection, RESULT_FLOATING_NAV_OFFSET } from "@/hooks/use-scroll-spy";

export function MateDivider() {
  return <div className={mateLayout.divider} aria-hidden />;
}

export function MateChapterHead({
  index,
  title,
  lead,
}: {
  index: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="space-y-1.5">
      <div className={mateLayout.monoLabel}>{index}</div>
      <h2 className="font-display text-xl sm:text-[1.35rem] text-white leading-snug">{title}</h2>
      {lead ? <p className={mateLayout.caption}>{lead}</p> : null}
    </header>
  );
}

export function MateSubhead({ children }: { children: ReactNode }) {
  return <h3 className={`${mateLayout.monoLabel} mt-2`}>{children}</h3>;
}

/** 横向章节跳转 · 无方框容器 */
export function MateQuickJumpGrid() {
  const cards = mateQuickJumpItems();

  const jump = (id: MateNavId) => {
    scrollToSection(`mate-${id}`, RESULT_FLOATING_NAV_OFFSET);
  };

  return (
    <nav aria-label="章节导航" className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => jump(card.id)}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs text-white/65 border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:text-white/90 transition whitespace-nowrap"
        >
          {card.title}
        </button>
      ))}
    </nav>
  );
}

/** @deprecated 使用 MateChapterHead */
export function MateSectionLabel({ children }: { children: ReactNode }) {
  return <div className={`${mateLayout.monoLabel} mb-2`}>{children}</div>;
}
