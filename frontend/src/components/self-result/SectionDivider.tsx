export function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-10">
      <div className="flex-1 border-t border-dashed border-border/50" />
      <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground text-center leading-relaxed max-w-[220px]">
        {children}
      </div>
      <div className="flex-1 border-t border-dashed border-border/50" />
    </div>
  );
}
