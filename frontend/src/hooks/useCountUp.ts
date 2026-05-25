import { useEffect, useRef, useState } from "react";

/** Animate a number from 0 → target over `durationMs`. */
export function useCountUp(target: number, durationMs = 1200, enabled = true) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const raf = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs, enabled]);

  return value;
}
