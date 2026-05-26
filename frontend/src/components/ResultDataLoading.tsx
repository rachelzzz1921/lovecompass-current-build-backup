/** Shown while result data loads (not auth). Distinct from AuthChecking. */
export function ResultDataLoading({ label = "读取你的画像…" }: { label?: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      {label}
    </main>
  );
}
