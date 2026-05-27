import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { useAdminLivePoll } from "@/lib/useAdminLivePoll";
import { AdminEmailCell } from "@/components/admin/AdminEmailCell";
import { AdminPageHeader, AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const QUICK_LINKS = [
  { to: "/admin/monitor", label: "实时监控", desc: "测评 / 双人 / 兑换 15s 刷新" },
  { to: "/admin/users", label: "用户管理", desc: "MR 编号 · 提权 · 邀请" },
  { to: "/admin/codes", label: "兑换码", desc: "批量生成 · 万能码" },
  { to: "/admin/questions", label: "题库", desc: "在线题 / 淘汰题清理" },
  { to: "/admin/chat", label: "AI 聊天", desc: "会话与顾问分布" },
  { to: "/admin/audit", label: "操作审计", desc: "后台写操作追溯" },
] as const;

function formatTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

const ACTION_LABELS: Record<string, string> = {
  create_redemption_codes: "生成兑换码",
  patch_redemption_code: "更新兑换码",
  invite_user: "邀请用户",
  patch_user: "更新用户",
  delete_user_soft: "停用用户",
  delete_user_hard: "删除用户",
  promote_user_admin: "提升管理员",
  patch_question: "更新题目",
  delete_question: "删除题目",
  purge_inactive_questions: "清理淘汰题",
  ensure_universal_shadow_codes: "万能码 shadow",
  patch_analyst: "更新顾问",
  admin_password_unlock: "密码解锁后台",
};

function AdminDashboard() {
  const { data, error, loading, lastUpdated, refresh } = useAdminLivePoll(() => adminApi.stats(), 30_000);

  if (loading && !data) return <p className="text-sm text-muted-foreground">加载概览…</p>;
  if (error && !data) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return null;

  const s = data.stats;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="运营概览"
        description={`LoveCompass / MIRROR · 30 秒自动刷新${lastUpdated ? ` · ${formatTime(lastUpdated.toISOString())}` : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              刷新
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/monitor">实时监控</Link>
            </Button>
          </>
        }
      />

      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">用户与测评</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="注册用户" value={s.users ?? 0} />
          <AdminStatCard label="累计完成" value={s.completed_attempts ?? 0} />
          <AdminStatCard label="今日完成" value={data.todayCompletedAttempts ?? 0} tone="good" />
          <AdminStatCard label="进行中" value={data.inProgressAttempts ?? 0} tone="warn" />
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">兑换与双人</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="兑换次数" value={s.redemption_events ?? 0} />
          <AdminStatCard label="有效兑换码" value={s.active_codes ?? 0} />
          <AdminStatCard
            label="ROS 双人"
            value={s.ros_couples_completed ?? 0}
            hint={`等待 TA：${s.ros_couples_waiting ?? 0}`}
          />
          <AdminStatCard
            label="MATE 双人"
            value={s.mate_couples_completed ?? 0}
            hint={`等待 TA：${s.mate_couples_waiting ?? 0}`}
          />
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">AI 与聊天</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="AI 报告" value={s.ai_reports ?? 0} />
          <AdminStatCard label="聊天会话" value={s.chat_sessions ?? 0} />
          <AdminStatCard label="今日新会话" value={s.chat_sessions_today ?? 0} tone="good" />
          <AdminStatCard label="今日消息" value={s.chat_messages_today ?? 0} tone="muted" />
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">快捷入口</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block rounded-lg border border-border/60 bg-card/30 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">各套件完成数</CardTitle>
            <Link to="/admin/attempts" className="text-xs text-primary hover:underline">
              全部记录
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <AdminTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>套件</TableHead>
                    <TableHead className="text-right">完成</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.attemptsBySuite.map((row) => (
                    <TableRow key={row.slug}>
                      <TableCell>
                        <div className="font-medium text-sm">{row.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{row.slug}</div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.attempts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminTableShell>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">最近兑换</CardTitle>
              <Link to="/admin/codes" className="text-xs text-primary hover:underline">
                管理
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <AdminTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>时间</TableHead>
                      <TableHead className="min-w-[140px]">用户</TableHead>
                      <TableHead>码</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentRedemptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground text-sm">
                          暂无
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.recentRedemptions.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-xs whitespace-nowrap">{formatTime(row.redeemed_at)}</TableCell>
                          <TableCell className="align-top py-2">
                            <AdminEmailCell email={row.email} />
                          </TableCell>
                          <TableCell className="font-mono text-xs">{row.code}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </AdminTableShell>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">最近后台操作</CardTitle>
              <Link to="/admin/audit" className="text-xs text-primary hover:underline">
                全部审计
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <AdminTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>时间</TableHead>
                      <TableHead>操作</TableHead>
                      <TableHead>管理员</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.recentAuditLogs ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-muted-foreground text-sm">
                          暂无
                        </TableCell>
                      </TableRow>
                    ) : (
                      (data.recentAuditLogs ?? []).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-xs whitespace-nowrap">{formatTime(row.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal text-[11px]">
                              {ACTION_LABELS[row.action] ?? row.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <AdminEmailCell email={row.admin_email} />
                          </TableCell>
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
    </div>
  );
}
