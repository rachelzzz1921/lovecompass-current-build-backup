import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminApi, type AdminStats } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatApiErrorMessage } from "@/lib/apiErrors";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function formatTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

function AdminDashboard() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void adminApi
      .stats()
      .then(setData)
      .catch((err) => setError(formatApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">加载概览…</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return null;

  const s = data.stats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">运营概览</h1>
        <p className="mt-1 text-sm text-muted-foreground">LoveCompass / MIRROR 后台数据快照</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="注册用户" value={s.users ?? 0} />
        <StatCard label="完成测试" value={s.completed_attempts ?? 0} />
        <StatCard label="兑换次数" value={s.redemption_events ?? 0} />
        <StatCard label="有效兑换码" value={s.active_codes ?? 0} />
        <StatCard label="AI 报告" value={s.ai_reports ?? 0} />
        <StatCard label="聊天会话" value={s.chat_sessions ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">各套件完成数</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>套件</TableHead>
                  <TableHead className="text-right">完成数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.attemptsBySuite.map((row) => (
                  <TableRow key={row.slug}>
                    <TableCell>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.slug}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.attempts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">最近兑换</CardTitle>
            <Link to="/admin/codes" className="text-xs text-primary hover:underline">
              管理兑换码
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>码</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentRedemptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      暂无兑换记录
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentRedemptions.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs">{formatTime(row.redeemed_at)}</TableCell>
                      <TableCell className="max-w-[120px] truncate text-xs">{row.email ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{row.code}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
