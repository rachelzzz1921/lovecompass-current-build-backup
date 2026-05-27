/** Registration-order user code, e.g. MR-000042 */
export function AdminUserCode({
  code,
  className = "",
}: {
  code?: string | null;
  className?: string;
}) {
  if (!code) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={`inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 font-mono text-xs tracking-wide text-foreground/90 ${className}`}
      title={`用户编号 ${code}`}
    >
      {code}
    </span>
  );
}
