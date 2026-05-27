/** Admin tables: show full email without truncation. */
export function AdminEmailCell({
  email,
  fallback,
  className = "",
}: {
  email?: string | null;
  fallback?: string;
  className?: string;
}) {
  const text = email?.trim() || fallback || "—";
  return (
    <span className={`break-all text-xs leading-snug text-foreground/90 ${className}`} title={text}>
      {text}
    </span>
  );
}
