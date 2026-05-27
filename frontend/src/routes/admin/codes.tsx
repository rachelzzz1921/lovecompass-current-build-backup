import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, Plus, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type RedemptionCodeRow } from "@/lib/adminApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/codes")({
  component: AdminCodesPage,
});

const SUITE_OPTIONS = [
  { slug: "s02_ros_female", label: "ROS 关系 · 女" },
  { slug: "s02_ros_male", label: "ROS 关系 · 男" },
  { slug: "s03_mate_female", label: "MATE 择偶 · 女" },
  { slug: "s03_mate_male", label: "MATE 择偶 · 男" },
  { slug: "s01_self_female", label: "SELF · 女（免费）" },
  { slug: "s01_self_male", label: "SELF · 男（免费）" },
];

function AdminCodesPage() {
  const [codes, setCodes] = useState<RedemptionCodeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [suiteSlug, setSuiteSlug] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [suites, setSuites] = useState<Array<{ slug: string; name: string }>>([]);
  const [universal, setUniversal] = useState<Awaited<ReturnType<typeof adminApi.universalRedemption>> | null>(null);
  const [universalLoading, setUniversalLoading] = useState(false);

  useEffect(() => {
    void adminApi.suites().then((r) => setSuites(r.suites)).catch(() => undefined);
    void loadUniversal();
  }, []);

  async function loadUniversal() {
    try {
      const res = await adminApi.universalRedemption();
      setUniversal(res);
    } catch {
      setUniversal(null);
    }
  }

  async function ensureUniversal() {
    setUniversalLoading(true);
    try {
      const res = await adminApi.ensureUniversalShadows();
      toast.success(res.allOk ? "万能码 shadow 已全部就绪" : "部分套件 provisioning 失败，请查看详情");
      void loadUniversal();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setUniversalLoading(false);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listCodes({
        suiteSlug: suiteSlug === "all" ? undefined : suiteSlug,
        q: query.trim() || undefined,
        activeOnly,
        limit: 100,
      });
      setCodes(res.codes);
      setTotal(res.total);
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [suiteSlug, query, activeOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleActive(row: RedemptionCodeRow) {
    try {
      await adminApi.patchCode(row.id, { isActive: !row.is_active });
      toast.success(row.is_active ? "已停用" : "已启用");
      void load();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">兑换码管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">共 {total} 条 · 生成、启停与查询</p>
        </div>
        <CreateCodesDialog suites={suites.length ? suites : SUITE_OPTIONS.map((s) => ({ slug: s.slug, name: s.label }))} onCreated={load} />
        <CreateCustomCodeDialog suites={suites.length ? suites : SUITE_OPTIONS.map((s) => ({ slug: s.slug, name: s.label }))} onCreated={load} />
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            万能兑换码
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            环境变量 <code className="rounded bg-muted px-1">LOVECOMPASS_UNIVERSAL_CODE</code> 配置的码，用户输入后可解锁任意付费套题（不限次数）。
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm">
              {universal?.configuredCode ?? "未配置"}
            </span>
            {universal?.configuredCode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(universal.configuredCode!);
                  toast.success("已复制万能码");
                }}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                复制
              </Button>
            ) : null}
            <Button size="sm" onClick={() => void ensureUniversal()} disabled={universalLoading}>
              <KeyRound className={`mr-1.5 h-3.5 w-3.5 ${universalLoading ? "animate-spin" : ""}`} />
              {universal?.allProvisioned ? "重新校验 shadow" : "初始化全部 shadow 码"}
            </Button>
          </div>
          {universal ? (
            <p className="text-xs text-muted-foreground">
              Shadow 记录：{universal.suites.filter((s) => s.provisioned).length}/{universal.suites.length} 个套件已就绪
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="space-y-1.5">
            <Label className="text-xs">套件</Label>
            <Select value={suiteSlug} onValueChange={setSuiteSlug}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部套件</SelectItem>
                {(suites.length ? suites : SUITE_OPTIONS.map((s) => ({ slug: s.slug, name: s.label }))).map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.name ?? s.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">搜索码</Label>
            <Input
              className="w-[200px]"
              placeholder="LOVE-XXXX"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void load()}
            />
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <Switch checked={activeOnly} onCheckedChange={setActiveOnly} id="active-only" />
            <Label htmlFor="active-only" className="text-xs">
              仅有效
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>兑换码</TableHead>
                <TableHead>套件</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>使用</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    {loading ? "加载中…" : "暂无数据"}
                  </TableCell>
                </TableRow>
              ) : (
                codes.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{row.code}</span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            void navigator.clipboard.writeText(row.code);
                            toast.success("已复制");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground">{row.batch_name}</div>
                    </TableCell>
                    <TableCell className="text-xs">{row.suite_name ?? row.suite_slug}</TableCell>
                    <TableCell className="text-xs">{row.code_kind}</TableCell>
                    <TableCell className="tabular-nums text-xs">
                      {row.used_count ?? 0}/{row.max_uses ?? "∞"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.is_active && row.status === "active" ? "default" : "secondary"}>
                        {row.is_active ? row.status : "disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => void toggleActive(row)}>
                        {row.is_active ? "停用" : "启用"}
                      </Button>
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
  );
}

function CreateCodesDialog({
  onCreated,
  suites,
}: {
  onCreated: () => void;
  suites: Array<{ slug: string; name: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suiteSlug, setSuiteSlug] = useState("s02_ros_female");
  const [batchName, setBatchName] = useState("");
  const [kind, setKind] = useState("single_use");
  const [count, setCount] = useState("10");
  const [prefix, setPrefix] = useState("LOVE");
  const [note, setNote] = useState("");
  const [createdCodes, setCreatedCodes] = useState<string[]>([]);

  async function submit() {
    if (!batchName.trim()) {
      toast.error("请填写批次名称");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminApi.createCodes({
        suiteSlug,
        batchName: batchName.trim(),
        kind,
        count: Math.min(500, Math.max(1, parseInt(count, 10) || 1)),
        prefix: prefix.trim() || "LOVE",
        note: note.trim() || undefined,
      });
      setCreatedCodes(res.codes.map((c) => c.code));
      toast.success(`已生成 ${res.codes.length} 个兑换码`);
      onCreated();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setOpen(false);
    setCreatedCodes([]);
    setBatchName("");
    setNote("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : resetAndClose())}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          批量生成
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>批量生成兑换码</DialogTitle>
        </DialogHeader>
        {createdCodes.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">已生成 {createdCodes.length} 个码，可复制分发：</p>
            <textarea
              readOnly
              className="h-40 w-full rounded-md border border-input bg-muted/30 p-2 font-mono text-xs"
              value={createdCodes.join("\n")}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                void navigator.clipboard.writeText(createdCodes.join("\n"));
                toast.success("已全部复制");
              }}
            >
              复制全部
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>测试套件</Label>
              <Select value={suiteSlug} onValueChange={setSuiteSlug}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {suites.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {s.name ?? s.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>批次名称</Label>
              <Input placeholder="小红书首批" value={batchName} onChange={(e) => setBatchName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>类型</Label>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_use">一客一码</SelectItem>
                    <SelectItem value="common">通用码</SelectItem>
                    <SelectItem value="gift">礼品码</SelectItem>
                    <SelectItem value="admin_grant">运营发放</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>数量</Label>
                <Input type="number" min={1} max={500} value={count} onChange={(e) => setCount(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>前缀</Label>
              <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>备注（可选）</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        )}
        <DialogFooter>
          {createdCodes.length > 0 ? (
            <Button onClick={resetAndClose}>完成</Button>
          ) : (
            <Button onClick={() => void submit()} disabled={submitting}>
              {submitting ? "生成中…" : "生成"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateCustomCodeDialog({
  onCreated,
  suites,
}: {
  onCreated: () => void;
  suites: Array<{ slug: string; name: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suiteSlug, setSuiteSlug] = useState(suites[0]?.slug ?? "s02_ros_female");
  const [batchName, setBatchName] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [kind, setKind] = useState("common");
  const [maxUses, setMaxUses] = useState("999999");

  async function submit() {
    if (!batchName.trim() || !customCode.trim()) {
      toast.error("请填写批次名称和兑换码");
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createCodes({
        suiteSlug,
        batchName: batchName.trim(),
        kind,
        count: 1,
        customCode: customCode.trim().toUpperCase(),
        maxUses: parseInt(maxUses, 10) || undefined,
      });
      toast.success("自定义兑换码已创建");
      setOpen(false);
      setBatchName("");
      setCustomCode("");
      onCreated();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <KeyRound className="mr-1.5 h-4 w-4" />
          指定码
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>创建指定兑换码</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>测试套件</Label>
            <Select value={suiteSlug} onValueChange={setSuiteSlug}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {suites.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.name ?? s.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>兑换码（自定义字符串）</Label>
            <Input
              className="font-mono uppercase"
              placeholder="MIRROR-VIP-2026"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>批次名称</Label>
            <Input placeholder="内测 VIP" value={batchName} onChange={(e) => setBatchName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>类型</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">通用码</SelectItem>
                  <SelectItem value="single_use">一客一码</SelectItem>
                  <SelectItem value="gift">礼品码</SelectItem>
                  <SelectItem value="admin_grant">运营发放</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>最大次数</Label>
              <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => void submit()} disabled={submitting}>
            {submitting ? "创建中…" : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
