import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminUserRow } from "@/lib/adminApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function formatTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof adminApi.userDetail>> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({ q: query.trim() || undefined, limit: 100 });
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetail(userId: string) {
    setSelectedId(userId);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await adminApi.userDetail(userId);
      setDetail(res);
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">用户管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">共 {total} 位用户</p>
      </div>

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-2 pt-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="邮箱或昵称"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void load()}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            搜索
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>测试</TableHead>
                <TableHead>聊天</TableHead>
                <TableHead>注册</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => void openDetail(row.id)}
                >
                  <TableCell>
                    <div className="font-medium">{row.display_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{row.email ?? row.id.slice(0, 8)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.role === "admin" ? "default" : "secondary"}>{row.role ?? "user"}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{row.attempt_count ?? 0}</TableCell>
                  <TableCell className="tabular-nums">{row.chat_session_count ?? 0}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatTime(row.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>用户详情</SheetTitle>
          </SheetHeader>
          {detailLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">加载中…</p>
          ) : detail ? (
            <div className="mt-6 space-y-6">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">邮箱：</span>
                  {detail.user.email ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">昵称：</span>
                  {detail.user.display_name ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">ID：</span>
                  <span className="font-mono text-xs">{detail.user.id}</span>
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">测试记录</h3>
                <div className="space-y-2">
                  {(detail.attempts as Array<Record<string, string | number | null>>).length === 0 ? (
                    <p className="text-xs text-muted-foreground">暂无</p>
                  ) : (
                    (detail.attempts as Array<Record<string, string | number | null>>).map((a) => (
                      <div key={String(a.id)} className="rounded-lg border border-border/60 p-3 text-xs">
                        <div className="font-medium">{a.suite_name ?? a.suite_slug}</div>
                        <div className="mt-1 text-muted-foreground">
                          {a.archetype_code ?? "—"} · {a.status} · {formatTime(a.completed_at as string | undefined)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">兑换记录</h3>
                <div className="space-y-2">
                  {(detail.redemptions as Array<Record<string, string>>).length === 0 ? (
                    <p className="text-xs text-muted-foreground">暂无</p>
                  ) : (
                    (detail.redemptions as Array<Record<string, string>>).map((r) => (
                      <div key={r.id} className="flex justify-between text-xs">
                        <span className="font-mono">{r.code}</span>
                        <span className="text-muted-foreground">{formatTime(r.redeemed_at)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
