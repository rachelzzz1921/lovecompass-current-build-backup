export function RosSectionDivider({ hint }: { hint: string }) {
  return (
    <div className="py-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>
      <div className="text-center space-y-1.5">
        <div className="text-white/30 text-sm animate-bounce">↓</div>
        <p className="text-xs text-white/50 leading-relaxed px-4">{hint}</p>
      </div>
    </div>
  );
}
