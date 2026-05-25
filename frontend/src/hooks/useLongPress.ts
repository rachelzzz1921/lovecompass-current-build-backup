import { useCallback, useRef } from "react";

type LongPressOptions = {
  delayMs?: number;
  onLongPress: () => void;
  onClick?: () => void;
};

/** Distinguish tap vs long-press on pointer devices. */
export function useLongPress({ delayMs = 550, onLongPress, onClick }: LongPressOptions) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const longFired = useRef(false);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      longFired.current = false;
      clear();
      timer.current = setTimeout(() => {
        longFired.current = true;
        onLongPress();
      }, delayMs);
    },
    [clear, delayMs, onLongPress],
  );

  const onPointerUp = useCallback(() => {
    clear();
  }, [clear]);

  const onPointerLeave = useCallback(() => {
    clear();
  }, [clear]);

  const onClickHandler = useCallback(
    (e: React.MouseEvent) => {
      if (longFired.current) {
        e.preventDefault();
        longFired.current = false;
        return;
      }
      onClick?.();
    },
    [onClick],
  );

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel: onPointerLeave,
    onClick: onClickHandler,
  };
}
