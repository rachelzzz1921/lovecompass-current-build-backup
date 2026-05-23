import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

export function CountUp({
  to,
  duration = 1.4,
  className,
  suffix = "",
}: { to: number; duration?: number; className?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setV(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {v}
      {suffix}
    </span>
  );
}
