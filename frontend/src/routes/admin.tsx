import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Ticket, Users, Bot, ArrowLeft } from "lucide-react";
import { AdminGate, useRequireAdmin } from "@/lib/requireAdmin";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [{ title: "管理后台 · MIRROR" }],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "概览", icon: LayoutDashboard, exact: true },
  { to: "/admin/codes", label: "兑换码", icon: Ticket },
  { to: "/admin/users", label: "用户", icon: Users },
  { to: "/admin/analysts", label: "AI 顾问", icon: Bot },
] as const;

function AdminLayout() {
  return (
    <AdminGate>
      <AdminShell />
    </AdminGate>
  );
}

function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { adminUser } = useRequireAdmin();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-56 shrink-0 border-r border-border/60 p-4 md:block">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">MIRROR Admin</p>
            <p className="mt-1 truncate text-sm text-foreground/80">{adminUser?.email ?? "管理员"}</p>
          </div>
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon: Icon, ...rest }) => {
              const exact = "exact" in rest && rest.exact;
              const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/"
            className="mt-8 flex items-center gap-2 px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回用户端
          </Link>
        </aside>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
