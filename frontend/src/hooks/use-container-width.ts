import { useEffect, useState, type RefObject } from "react";

/** 监听容器宽度，用于图表等需要随容器缩放的组件。 */
export function useContainerWidth<T extends HTMLElement>(
  ref: RefObject<T | null>,
  maxWidth = 320,
): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const next = Math.floor(el.clientWidth);
      if (next > 0) setWidth(Math.min(maxWidth, next));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, maxWidth]);

  return width;
}
