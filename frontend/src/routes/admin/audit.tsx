import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminAuditLogRow } from "@/lib/adminApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AdminEmailCell } from "@/components/admin/AdminEmailCell";
import { AdminPageHeader } from "@/components/admin/AdminStatCard";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/admin/audit")({
  component: AdminAuditPage,
});

function formatTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
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
  ensure_universal_shadow_codes: "初始化万能码",
  patch_analyst: "更新顾问",
  admin_password_unlock: "密码解锁后台",
};

function actionLabel(action: string) {
  return ACTION_LABELS[action] ?? action;
}

function AdminAuditPage() {
  const [logs, setLogs] = useState<AdminAuditLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [actionTypes, setActionTypes] = useState<Array<{ action: string; count: number }>>([]);
  const [action, setAction] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminAuditLogRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listAuditLogs({
        action: action === "all" ? undefined : action,
        q: query.trim() || undefined,
        limit: 100,
      });
      setLogs(res.logs);
      setTotal(res.total);
      setActionTypes(res.actionTypes);
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [action, query]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="操作审计"
        description={`共 ${total} 条后台写操作记录 · 所有兑换码/用户/题库/顾问变更均在此追溯`}
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        }
      />

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="space-y-1.5 min-w-[200px]">
            <Label className="text-xs">操作类型</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {actionTypes.map((t) => (
                  <SelectItem key={t.action} value={t.action}>
                    {actionLabel(t.action)} ({t.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1 min-w-[200px] space-y-1.5">
            <Label className="text-xs">搜索</Label>
            <Search className="absolute left-2.5 bottom-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="操作、表名、目标 ID、管理员邮箱"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void load()}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            查询
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <AdminTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">时间</TableHead>
                  <TableHead className="w-[140px]">操作</TableHead>
                  <TableHead className="min-w-[180px]">管理员</TableHead>
                  <TableHead className="w-[120px]">目标表</TableHead>
                  <TableHead className="min-w-[160px]">目标 ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      {loading ? "加载中…" : "暂无审计记录"}
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelected(row)}
                    >
                      <TableCell className="text-xs whitespace-nowrap">{formatTime(row.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {actionLabel(row.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AdminEmailCell email={row.admin_email} fallback={row.admin_user_id?.slice(0, 8)} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.target_table ?? "—"}</TableCell>
                      <TableCell className="font-mono text-[11px] break-all">{row.target_id ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTableShell>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selected ? actionLabel(selected.action) : "审计详情"}</SheetTitle>
          </SheetHeader>
          {selected ? (
            <div className="mt-6 space-y-4 text-sm">
              <p>
                <span className="text-muted-foreground">时间：</span>
                {formatTime(selected.created_at)}
              </p>
              <p>
                <span className="text-muted-foreground">管理员：</span>
                <AdminEmailCell email={selected.admin_email} className="inline text-sm" />
              </p>
              <p>
                <span className="text-muted-foreground">目标：</span>
                {selected.target_table ?? "—"} / {selected.target_id ?? "—"}
              </p>
              {selected.before_payload && Object.keys(selected.before_payload).length > 0 ? (
                <div>
                  <p className="mb-1 text-muted-foreground">变更前</p>
                  <pre className="max-h-48 overflow-auto rounded-md bg-muted/40 p-3 text-[11px]">
                    {JSON.stringify(selected.before_payload, null, 2)}
                  </pre>
                </div>
              ) : null}
              {selected.after_payload && Object.keys(selected.after_payload).length > 0 ? (
                <div>
                  <p className="mb-1 text-muted-foreground">变更后</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted/40 p-3 text-[11px]">
                    {JSON.stringify(selected.after_payload, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
