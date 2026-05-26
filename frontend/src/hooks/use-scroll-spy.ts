import { useEffect, useState } from "react";

/** 悬浮章节导航占用的高度 — scrollToSection 与 scroll-mt 对齐 */
export const RESULT_FLOATING_NAV_OFFSET = 108;

/** @deprecated use RESULT_FLOATING_NAV_OFFSET */
export const EXAMPLE_FLOATING_NAV_OFFSET = RESULT_FLOATING_NAV_OFFSET;

/** 根据视口内可见区块更新当前锚点 id */
export function useScrollSpy(sectionIds: string[], rootMargin = "-20% 0px -55% 0px"): string {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (!sectionIds.length) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin, threshold: [0, 0.15, 0.35, 0.55] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootMargin, sectionIds.join("|")]);

  return activeId;
}

export function scrollToSection(sectionId: string, offset = 0) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function useScrollPast(threshold: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const update = () => setPast(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);
  return past;
}
