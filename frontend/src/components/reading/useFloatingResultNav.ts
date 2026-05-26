import { useMemo } from "react";
import type { ReadingSection } from "@/components/reading/FloatingSectionNav";
import { useScrollPast, useScrollSpy } from "@/hooks/use-scroll-spy";

export function useFloatingResultNav(sections: ReadingSection[], scrollThreshold = 120) {
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const activeSectionId = useScrollSpy(sectionIds);
  const visible = useScrollPast(scrollThreshold);
  return { activeSectionId, visible };
}
