// 浮动樱花花瓣（首页装饰）
export function Petals({ count = 14 }: { count?: number }) {
  const items = Array.from({ length: count }).map((_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map((i) => {
        const left = (i * 73) % 100;
        const delay = (i * 1.7) % 18;
        const dur = 14 + ((i * 3) % 10);
        const size = 8 + ((i * 5) % 10);
        return (
          <span
            key={i}
            className="animate-petal absolute"
            style={{ left: `${left}%`, animationDelay: `-${delay}s`, animationDuration: `${dur}s`, fontSize: `${size}px`, opacity: 0.7 }}
          >
            🌸
          </span>
        );
      })}
    </div>
  );
}
