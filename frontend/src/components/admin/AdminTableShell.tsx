import type { ReactNode } from "react";

/** Wide admin table wrapper — horizontal scroll + min column widths. */
export function AdminTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">{children}</div>
    </div>
  );
}
