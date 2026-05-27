import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { adminApi, type AdminLiveMonitor } from "@/lib/adminApi";
import { useAdminLivePoll } from "@/lib/useAdminLivePoll";
import { AdminStatCard, AdminPageHeader } from "@/components/admin/AdminStatCard";
import { AdminEmailCell } from "@/components/admin/AdminEmailCell";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/monitor")({
  component: AdminMonitorPage,
});

function formatTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? "unknown";
  const variant =
    s === "completed" ? "default" : s === "in_progress" ? "secondary" : s === "waiting_partner" ? "outline" : "secondary";
  return <Badge variant={variant}>{s}</Badge>;
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return <AdminStatCard label={label} value={value} />;
}

function AdminMonitorPage() {
  const { data, error, loading, lastUpdated, refresh } = useAdminLivePoll(
    () => adminApi.liveMonitor(30),
    15_000,
  );

  if (loading && !data) return <p className="text-sm text-muted-foreground">连接实时数据…</p>;
  if (error && !data) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return null;

  return <MonitorView data={data} error={error} lastUpdated={lastUpdated} onRefresh={refresh} />;
}

function MonitorView({
  data,
  error,
  lastUpdated,
  onRefresh,
}: {
  data: AdminLiveMonitor;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
}) {
  const s = data.stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AdminPageHeader
          title="实时监控"
          description={`每 15 秒自动刷新${lastUpdated ? ` · 上次 ${formatTime(lastUpdated.toISOString())}` : ""}`}
        />
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          立即刷新
        </Button>
      </div>
      {error ? <p className="text-xs text-amber-600">刷新异常：{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="注册用户" value={s.users ?? 0} />
        <StatTile label="进行中测评" value={s.in_progress_attempts ?? 0} />
        <StatTile label="累计完成" value={s.completed_attempts ?? 0} />
        <StatTile label="聊天会话" value={s.chat_sessions ?? 0} />
        <StatTile label="ROS 双人·已完成" value={s.ros_couples_completed ?? 0} />
        <StatTile label="ROS 双人·等待 TA" value={s.ros_couples_waiting ?? 0} />
        <StatTile label="MATE 双人·已完成" value={s.mate_couples_completed ?? 0} />
        <StatTile label="MATE 双人·等待 TA" value={s.mate_couples_waiting ?? 0} />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">最近测评记录</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">时间</TableHead>
                <TableHead className="min-w-[200px] w-[28%]">用户</TableHead>
                <TableHead>套件</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>关系码</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentAttempts.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatTime(row.completed_at ?? row.created_at)}
                  </TableCell>
                  <TableCell className="align-top py-2">
                    <AdminEmailCell email={row.email} fallback={row.user_id?.slice(0, 8)} />
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{row.suite_name ?? "—"}</div>
                    <div className="text-muted-foreground">{row.suite_slug}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="font-mono text-[10px]">{row.relation_code ?? row.partner_relation_code ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </AdminTableShell>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <CoupleSessionTable title="ROS 双人关系码" rows={data.rosCoupleSessions} />
        <CoupleSessionTable title="MATE 双人关系码" rows={data.mateCoupleSessions} />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">最近兑换</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>套件</TableHead>
                <TableHead>兑换码</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentRedemptions.map((row, i) => (
                <TableRow key={`${row.code}-${i}`}>
                  <TableCell className="text-xs">{formatTime(row.redeemed_at)}</TableCell>
                  <TableCell className="align-top">
                    <AdminEmailCell email={row.email} />
                  </TableCell>
                  <TableCell className="text-xs">{row.suite_slug}</TableCell>
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function CoupleSessionTable({
  title,
  rows,
}: {
  title: string;
  rows: AdminLiveMonitor["rosCoupleSessions"];
}) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>关系码</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="min-w-[160px]">发起人</TableHead>
              <TableHead className="min-w-[160px]">伴侣</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  暂无记录
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.code}</TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="align-top py-2">
                    <AdminEmailCell email={row.initiator_email} />
                  </TableCell>
                  <TableCell className="align-top py-2">
                    <AdminEmailCell email={row.partner_email} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
