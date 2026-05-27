import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type AdminQuestionRow, type AdminQuestionStats } from "@/lib/adminApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

export const Route = createFileRoute("/admin/questions")({
  component: AdminQuestionsPage,
});

type TabKey = "active" | "retired";

function StatPill({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warn" | "muted" }) {
  const cls =
    tone === "warn"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : tone === "muted"
        ? "border-border/60 bg-muted/30 text-muted-foreground"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  return (
    <div className={`rounded-lg border px-3 py-2 ${cls}`}>
      <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function AdminQuestionsPage() {
  const [suites, setSuites] = useState<Array<{ slug: string; name: string; active_questions?: number }>>([]);
  const [suiteSlug, setSuiteSlug] = useState("");
  const [tab, setTab] = useState<TabKey>("active");
  const [questions, setQuestions] = useState<AdminQuestionRow[]>([]);
  const [stats, setStats] = useState<AdminQuestionStats | null>(null);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void adminApi
      .suites()
      .then((res) => {
        setSuites(res.suites);
        if (res.suites.length && !suiteSlug) setSuiteSlug(res.suites[0].slug);
      })
      .catch((err) => toast.error(formatApiErrorMessage(err)));
  }, [suiteSlug]);

  const loadStats = useCallback(async () => {
    if (!suiteSlug) return;
    try {
      const res = await adminApi.questionStats(suiteSlug);
      setStats(res.stats);
    } catch {
      setStats(null);
    }
  }, [suiteSlug]);

  const load = useCallback(async () => {
    if (!suiteSlug) return;
    setLoading(true);
    try {
      const [listRes] = await Promise.all([
        adminApi.listQuestions({
          suiteSlug,
          q: query.trim() || undefined,
          activeOnly: tab === "active",
          inactiveOnly: tab === "retired",
          limit: 200,
        }),
        loadStats(),
      ]);
      setQuestions(listRes.questions);
      setTotal(listRes.total);
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [suiteSlug, query, tab, loadStats]);

  useEffect(() => {
    void load();
  }, [load]);

  function openEdit(row: AdminQuestionRow) {
    setSelectedId(row.id);
    setEditText(row.question_text);
    setEditActive(row.is_active !== false);
  }

  async function saveEdit() {
    if (!selectedId || !editText.trim()) return;
    setSaving(true);
    try {
      await adminApi.patchQuestion(selectedId, {
        questionText: editText.trim(),
        isActive: editActive,
      });
      toast.success("题目已更新");
      setSelectedId(null);
      void load();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: AdminQuestionRow) {
    try {
      await adminApi.patchQuestion(row.id, { isActive: !row.is_active });
      toast.success(row.is_active ? "已移入淘汰区" : "已恢复上线");
      void load();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    }
  }

  async function deleteQuestion(row: AdminQuestionRow) {
    try {
      await adminApi.deleteQuestion(row.id);
      toast.success("已永久删除");
      void load();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    }
  }

  async function purgeRetired() {
    if (!suiteSlug) return;
    setPurging(true);
    try {
      const res = await adminApi.purgeInactiveQuestions(suiteSlug);
      toast.success(`已清理 ${res.deletedCount} 道淘汰题${res.blockedWithAnswers ? `，${res.blockedWithAnswers} 道因有作答保留` : ""}`);
      void load();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setPurging(false);
    }
  }

  const currentSuite = suites.find((s) => s.slug === suiteSlug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">题库管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {currentSuite?.name ?? "选择套件"} · 在线题与测试版遗留淘汰题分开管理
        </p>
      </div>

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatPill label="在线题目" value={stats.active_count} />
          <StatPill label="已淘汰" value={stats.inactive_count} tone={stats.inactive_count ? "warn" : "muted"} />
          <StatPill label="可安全删除" value={stats.deletable_inactive_count} tone="warn" />
          <StatPill label="套件预期题量" value={stats.total_questions ?? 0} tone="muted" />
        </div>
      ) : null}

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="space-y-1.5 min-w-[240px]">
            <Label className="text-xs">测试套件</Label>
            <Select value={suiteSlug} onValueChange={setSuiteSlug}>
              <SelectTrigger>
                <SelectValue placeholder="选择套件" />
              </SelectTrigger>
              <SelectContent>
                {suites.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground font-mono">{suiteSlug}</p>
          </div>
          <div className="relative flex-1 min-w-[200px] space-y-1.5">
            <Label className="text-xs">搜索题干 / 题号</Label>
            <Search className="absolute left-2.5 bottom-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="关键词"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void load()}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="active">在线题库 ({stats?.active_count ?? "—"})</TabsTrigger>
            <TabsTrigger value="retired">已淘汰 ({stats?.inactive_count ?? "—"})</TabsTrigger>
          </TabsList>
          {tab === "retired" && (stats?.deletable_inactive_count ?? 0) > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={purging}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  清空可删淘汰题 ({stats?.deletable_inactive_count})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>清空本套件淘汰题？</AlertDialogTitle>
                  <AlertDialogDescription>
                    将永久删除 {stats?.deletable_inactive_count} 道已下线且无用户作答的遗留题。有作答记录的题目会保留。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void purgeRetired()}>确认清空</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>

        <TabsContent value={tab} className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <AdminTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">序</TableHead>
                      <TableHead className="w-28">题号</TableHead>
                      <TableHead className="min-w-[360px]">题干</TableHead>
                      <TableHead className="w-20">维度</TableHead>
                      <TableHead className="w-24">状态</TableHead>
                      <TableHead className="w-[140px] text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          {loading
                            ? "加载中…"
                            : tab === "retired"
                              ? "暂无淘汰题 — 测试版优化掉的下线题会出现在这里"
                              : "暂无在线题目"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      questions.map((row) => (
                        <TableRow
                          key={row.id}
                          className={tab === "retired" ? "bg-muted/20 text-muted-foreground" : undefined}
                        >
                          <TableCell className="tabular-nums text-xs">{row.display_order}</TableCell>
                          <TableCell className="font-mono text-[11px]">{row.external_question_id}</TableCell>
                          <TableCell className={`text-sm leading-relaxed ${tab === "retired" ? "opacity-80" : ""}`}>
                            {row.question_text}
                          </TableCell>
                          <TableCell className="text-xs">{row.dimension_code}</TableCell>
                          <TableCell>
                            {tab === "active" ? (
                              <Badge>在线</Badge>
                            ) : row.answerRefCount ? (
                              <Badge variant="outline">有作答</Badge>
                            ) : (
                              <Badge variant="secondary">可删除</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            {tab === "active" ? (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                                  编辑
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => void toggleActive(row)}>
                                  淘汰
                                </Button>
                              </>
                            ) : (
                              <>
                                {row.canDelete ? (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-destructive">
                                        删除
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>删除淘汰题？</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          将永久删除「{row.external_question_id}」，不可恢复。
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>取消</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => void deleteQuestion(row)}>
                                          删除
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">有作答</span>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => void toggleActive(row)}>
                                  恢复
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </AdminTableShell>
            </CardContent>
          </Card>
          <p className="mt-2 text-xs text-muted-foreground">
            当前列表 {total} 题
            {tab === "retired" ? " · 淘汰区仅展示 is_active=false 的测试遗留题" : ""}
          </p>
        </TabsContent>
      </Tabs>

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>编辑在线题目</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Switch checked={editActive} onCheckedChange={setEditActive} id="edit-active" />
              <Label htmlFor="edit-active">题目上线</Label>
            </div>
            <div className="space-y-1.5">
              <Label>题干</Label>
              <Textarea
                className="min-h-[180px] text-sm leading-relaxed"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={() => void saveEdit()} disabled={saving}>
              {saving ? "保存中…" : "保存修改"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
