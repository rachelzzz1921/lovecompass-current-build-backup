import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminChatAnalytics } from "@/lib/adminApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AdminEmailCell } from "@/components/admin/AdminEmailCell";
import { AdminPageHeader, AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/chat")({
  component: AdminChatPage,
});

function formatTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function AdminChatPage() {
  const [data, setData] = useState<AdminChatAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.chatAnalytics(40);
      setData(res);
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const s = data?.summary;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="AI 聊天分析"
        description="顾问会话量、消息数与最近对话 — 不含消息正文（隐私）"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              刷新
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/analysts">顾问配置</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AdminStatCard label="累计会话" value={s?.total_sessions ?? "—"} />
        <AdminStatCard label="今日新会话" value={s?.sessions_today ?? "—"} tone="good" />
        <AdminStatCard label="累计消息" value={s?.total_messages ?? "—"} />
        <AdminStatCard label="今日消息" value={s?.messages_today ?? "—"} tone="good" />
        <AdminStatCard label="聊过天的用户" value={s?.unique_chat_users ?? "—"} tone="muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">各顾问会话分布</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AdminTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>顾问</TableHead>
                    <TableHead className="text-right">会话</TableHead>
                    <TableHead className="text-right">消息</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.byAnalyst ?? []).map((row) => (
                    <TableRow key={row.slug}>
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.slug}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.session_count}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.message_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminTableShell>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">最近会话</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AdminTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead className="min-w-[160px]">用户</TableHead>
                    <TableHead>顾问</TableHead>
                    <TableHead className="text-right">消息</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.recentSessions ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        {loading ? "加载中…" : "暂无会话"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    (data?.recentSessions ?? []).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatTime(row.updated_at ?? row.created_at)}</TableCell>
                        <TableCell className="align-top py-2">
                          <AdminEmailCell email={row.user_email} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{row.analyst_name ?? row.analyst_slug}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-xs">{row.message_count ?? 0}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </AdminTableShell>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
