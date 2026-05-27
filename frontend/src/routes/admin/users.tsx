import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Shield, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminUserRow } from "@/lib/adminApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AdminEmailCell } from "@/components/admin/AdminEmailCell";
import { AdminUserCode } from "@/components/admin/AdminUserCode";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

  async function patchUser(userId: string, data: { role?: string; status?: string }) {
    try {
      await adminApi.patchUser(userId, data);
      toast.success("已更新");
      void load();
      if (selectedId === userId) void openDetail(userId);
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    }
  }

  async function deleteUser(userId: string, hard: boolean) {
    try {
      await adminApi.deleteUser(userId, hard);
      toast.success(hard ? "已永久删除" : "已停用账号");
      setSelectedId(null);
      void load();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">用户管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {total} 位用户 · 编号按注册时间顺序（MR-000001 起）
          </p>
        </div>
        <InviteUserDialog onDone={load} />
      </div>

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-center gap-2 pt-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="邮箱、昵称或编号 MR-000042"
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
          <AdminTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">编号</TableHead>
                  <TableHead className="min-w-[220px] w-[30%]">邮箱</TableHead>
                  <TableHead className="w-[120px]">昵称</TableHead>
                  <TableHead className="w-[90px]">角色</TableHead>
                  <TableHead className="w-[80px]">状态</TableHead>
                  <TableHead className="w-[70px]">测试</TableHead>
                  <TableHead className="w-[70px]">聊天</TableHead>
                  <TableHead className="w-[130px]">注册时间</TableHead>
                  <TableHead className="w-[120px] text-right">快捷</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/40">
                    <TableCell>
                      <AdminUserCode code={row.user_code} />
                    </TableCell>
                    <TableCell className="align-top py-3" onClick={() => void openDetail(row.id)}>
                      <AdminEmailCell email={row.email} fallback={row.id} />
                    </TableCell>
                    <TableCell className="text-sm">{row.display_name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={row.role === "admin" ? "default" : "secondary"}>{row.role ?? "user"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.status === "active" ? "outline" : "destructive"}>
                        {row.status ?? "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{row.attempt_count ?? 0}</TableCell>
                    <TableCell className="tabular-nums">{row.chat_session_count ?? 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(row.created_at)}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {row.role !== "admin" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="设为管理员"
                          onClick={() => void patchUser(row.id, { role: "admin" })}
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="取消管理员"
                          onClick={() => void patchUser(row.id, { role: "user" })}
                        >
                          降级
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => void openDetail(row.id)}>
                        详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableShell>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>用户详情</SheetTitle>
          </SheetHeader>
          {detailLoading ? (
            <p className="mt-6 text-sm text-muted-foreground">加载中…</p>
          ) : detail ? (
            <div className="mt-6 space-y-6">
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminUserCode code={(detail.user as AdminUserRow).user_code} />
                  <span className="text-muted-foreground text-xs">
                    注册 {formatTime(detail.user.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">邮箱：</span>
                  <AdminEmailCell email={detail.user.email} className="text-sm" />
                </div>
                <p>
                  <span className="text-muted-foreground">昵称：</span>
                  {detail.user.display_name ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">角色 / 状态：</span>
                  {detail.user.role} · {detail.user.status ?? "active"}
                </p>
                <p>
                  <span className="text-muted-foreground">ID：</span>
                  <span className="font-mono text-xs break-all">{detail.user.id}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {detail.user.role !== "admin" ? (
                  <Button size="sm" variant="outline" onClick={() => void patchUser(detail.user.id, { role: "admin" })}>
                    <Shield className="mr-1.5 h-3.5 w-3.5" />
                    设为管理员
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => void patchUser(detail.user.id, { role: "user" })}>
                    取消管理员
                  </Button>
                )}
                {detail.user.status !== "suspended" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void patchUser(detail.user.id, { status: "suspended" })}
                  >
                    停用账号
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => void patchUser(detail.user.id, { status: "active" })}>
                    恢复账号
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      永久删除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>永久删除用户？</AlertDialogTitle>
                      <AlertDialogDescription>
                        将删除 Auth 账号及关联数据，不可恢复。若仅需禁止登录，请使用「停用账号」。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void deleteUser(detail.user.id, true)}>
                        确认删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                      <div key={r.id} className="flex justify-between gap-2 text-xs">
                        <span className="font-mono break-all">{r.code}</span>
                        <span className="shrink-0 text-muted-foreground">{formatTime(r.redeemed_at)}</span>
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

function InviteUserDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("user");
  const [result, setResult] = useState<{ message: string; tempPassword?: string | null } | null>(null);

  async function submit() {
    if (!email.trim()) {
      toast.error("请填写邮箱");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminApi.inviteUser({
        email: email.trim(),
        password: password.trim() || undefined,
        displayName: displayName.trim() || undefined,
        role,
      });
      if (res.promoted) {
        setResult({ message: `已将已有账号 ${res.user.email} 提升为管理员` });
      } else {
        setResult({
          message: `已创建账号 ${res.user.email}${res.user.role === "admin" ? "（管理员）" : ""}`,
          tempPassword: res.temporaryPassword,
        });
      }
      toast.success("操作成功");
      onDone();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    setOpen(false);
    setEmail("");
    setPassword("");
    setDisplayName("");
    setRole("user");
    setResult(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-1.5 h-4 w-4" />
          添加账号
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>添加用户 / 管理员</DialogTitle>
        </DialogHeader>
        {result ? (
          <div className="space-y-2 text-sm">
            <p>{result.message}</p>
            {result.tempPassword ? (
              <p className="rounded-md bg-muted/50 p-2 font-mono text-xs">临时密码：{result.tempPassword}</p>
            ) : !password ? (
              <p className="text-muted-foreground text-xs">未设置密码时，用户需通过「忘记密码」自行设置。</p>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>邮箱</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>初始密码（可选）</Label>
              <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 8 位，留空则邮件重置" />
            </div>
            <div className="space-y-1.5">
              <Label>昵称（可选）</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>角色</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">普通用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              若邮箱已存在且选择管理员，将直接提升权限，不会重复创建。
            </p>
          </div>
        )}
        <DialogFooter>
          {result ? (
            <Button onClick={close}>完成</Button>
          ) : (
            <Button onClick={() => void submit()} disabled={submitting}>
              {submitting ? "提交中…" : "创建"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
