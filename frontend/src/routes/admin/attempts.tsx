import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminAttemptRow } from "@/lib/adminApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/attempts")({
  component: AdminAttemptsPage,
});

function formatTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function AdminAttemptsPage() {
  const [rows, setRows] = useState<AdminAttemptRow[]>([]);
  const [total, setTotal] = useState(0);
  const [suiteSlug, setSuiteSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listAttempts({
        suiteSlug: suiteSlug.trim() || undefined,
        limit: 100,
      });
      setRows(res.attempts);
      setTotal(res.total);
      setError(null);
    } catch (err) {
      setError(formatApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [suiteSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">测评记录</h1>
        <p className="mt-1 text-sm text-muted-foreground">共 {total} 条 · 按完成/创建时间倒序</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="按 suite slug 筛选，如 s03_mate_female"
          value={suiteSlug}
          onChange={(e) => setSuiteSlug(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={() => void load()}>
          查询
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">加载中…</p> : null}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">记录列表</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>套件</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>指数</TableHead>
                <TableHead>attemptId</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatTime(row.completed_at ?? row.created_at)}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate text-xs">{row.email ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    <div>{row.suite_name}</div>
                    <div className="text-muted-foreground">{row.suite_slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={row.status === "completed" ? "default" : "secondary"}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-xs">{row.ros_index ?? "—"}</TableCell>
                  <TableCell className="font-mono text-[10px] max-w-[120px] truncate">{row.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
