import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminApi, type AdminAnalystRow } from "@/lib/adminApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/analysts")({
  component: AdminAnalystsPage,
});

function AdminAnalystsPage() {
  const [analysts, setAnalysts] = useState<AdminAnalystRow[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    personaPrompt: "",
    systemPrompt: "",
    modelName: "",
    isActive: true,
    isDefault: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadList() {
    setLoading(true);
    try {
      const res = await adminApi.listAnalysts();
      setAnalysts(res.analysts);
      if (!selectedSlug && res.analysts[0]) {
        setSelectedSlug(res.analysts[0].slug);
      }
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    void adminApi
      .analystDetail(selectedSlug)
      .then((res) => {
        const a = res.analyst;
        setForm({
          name: a.name ?? "",
          title: a.title ?? "",
          description: a.description ?? "",
          personaPrompt: a.persona_prompt ?? "",
          systemPrompt: a.system_prompt ?? "",
          modelName: a.model_name ?? "",
          isActive: a.is_active ?? true,
          isDefault: a.is_default ?? false,
        });
      })
      .catch((err) => toast.error(formatApiErrorMessage(err)));
  }, [selectedSlug]);

  async function save() {
    if (!selectedSlug) return;
    setSaving(true);
    try {
      await adminApi.patchAnalyst(selectedSlug, form);
      toast.success("已保存");
      void loadList();
    } catch (err) {
      toast.error(formatApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const selected = analysts.find((a) => a.slug === selectedSlug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI 顾问配置</h1>
        <p className="mt-1 text-sm text-muted-foreground">编辑 chat_analysts 人格与模型参数</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">顾问列表</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {loading ? (
              <p className="p-2 text-xs text-muted-foreground">加载中…</p>
            ) : (
              analysts.map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => setSelectedSlug(a.slug)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedSlug === a.slug ? "bg-primary/15 text-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.slug}</div>
                  <div className="mt-1 flex gap-1">
                    {a.is_default ? <Badge className="text-[10px]">默认</Badge> : null}
                    {!a.is_active ? <Badge variant="secondary" className="text-[10px]">停用</Badge> : null}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {selected ? (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">
                {selected.name} · {selected.slug}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>名称</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>副标题</Label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>简介</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>模型</Label>
                <Input
                  value={form.modelName}
                  onChange={(e) => setForm((f) => ({ ...f, modelName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>人格 Prompt</Label>
                <Textarea
                  className="min-h-[160px] font-mono text-xs"
                  value={form.personaPrompt}
                  onChange={(e) => setForm((f) => ({ ...f, personaPrompt: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>System Prompt</Label>
                <Textarea
                  className="min-h-[100px] font-mono text-xs"
                  value={form.systemPrompt}
                  onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
                />
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                    id="analyst-active"
                  />
                  <Label htmlFor="analyst-active">启用</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isDefault}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isDefault: v }))}
                    id="analyst-default"
                  />
                  <Label htmlFor="analyst-default">默认顾问</Label>
                </div>
              </div>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? "保存中…" : "保存更改"}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
