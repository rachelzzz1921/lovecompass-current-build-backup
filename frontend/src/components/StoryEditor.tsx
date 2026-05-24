import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Sparkles, Flame, Snowflake, Heart, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { TimelinePoint, Milestone } from "@/data/rosTypes";

type Tone = Milestone["tone"];

const TONE_META: Record<Tone, { label: string; color: string; Icon: typeof Flame }> = {
  spark: { label: "心动", color: "oklch(0.78 0.16 30)", Icon: Flame },
  warm: { label: "温暖", color: "oklch(0.82 0.14 355)", Icon: Heart },
  cool: { label: "降温", color: "oklch(0.75 0.10 230)", Icon: Snowflake },
};

export function StoryEditor({
  open,
  initialTimeline,
  initialMilestones,
  onClose,
  onSave,
}: {
  open: boolean;
  initialTimeline: TimelinePoint[];
  initialMilestones: Milestone[];
  onClose: () => void;
  onSave: (t: TimelinePoint[], m: Milestone[]) => void;
}) {
  const [tab, setTab] = useState<"curve" | "stones">("curve");
  const [timeline, setTimeline] = useState<TimelinePoint[]>(initialTimeline);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);

  const addPoint = () =>
    setTimeline((t) => [...t, { label: `点 ${t.length + 1}`, value: 60, note: "" }]);
  const updatePoint = (i: number, patch: Partial<TimelinePoint>) =>
    setTimeline((t) => t.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const removePoint = (i: number) => setTimeline((t) => t.filter((_, idx) => idx !== i));

  const addStone = () =>
    setMilestones((m) => [...m, { when: "现在", title: "", tone: "warm" }]);
  const updateStone = (i: number, patch: Partial<Milestone>) =>
    setMilestones((m) => m.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const removeStone = (i: number) => setMilestones((m) => m.filter((_, idx) => idx !== i));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full md:max-w-xl bg-card border border-border/60 rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col"
            style={{
              background:
                "linear-gradient(180deg, oklch(0.16 0.020 270 / 0.98), oklch(0.13 0.018 270 / 0.98))",
            }}
          >
            {/* header */}
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-[oklch(0.82_0.14_200)]" />
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-muted-foreground font-mono">
                    EDIT · YOUR STORY
                  </div>
                  <div className="font-display text-base">编辑你们的故事线</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-foreground/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* tabs */}
            <div className="px-5 pt-3 flex gap-1">
              {[
                { id: "curve" as const, label: "情绪曲线" },
                { id: "stones" as const, label: "里程碑" },
              ].map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-3 py-1.5 text-[12px] rounded-full transition ${
                      active
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {tab === "curve" && (
                <>
                  {timeline.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3 bg-glass border border-border/40 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={p.label}
                          onChange={(e) => updatePoint(i, { label: e.target.value })}
                          placeholder="时间标签（如：三月前）"
                          className="h-8 text-xs flex-1"
                          maxLength={20}
                        />
                        <button
                          onClick={() => removePoint(i)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted-foreground w-10">
                          {p.value}
                        </span>
                        <Slider
                          value={[p.value]}
                          onValueChange={([v]) => updatePoint(i, { value: v })}
                          min={0}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                      </div>
                      <Input
                        value={p.note ?? ""}
                        onChange={(e) => updatePoint(i, { note: e.target.value })}
                        placeholder="备注（选填，如：一次旅行后）"
                        className="h-8 text-xs"
                        maxLength={40}
                      />
                    </div>
                  ))}
                  {timeline.length < 8 && (
                    <Button
                      variant="outline"
                      onClick={addPoint}
                      className="w-full h-9 border-dashed border-border/60 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> 添加节点
                    </Button>
                  )}
                </>
              )}

              {tab === "stones" && (
                <>
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3 bg-glass border border-border/40 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={m.when}
                          onChange={(e) => updateStone(i, { when: e.target.value })}
                          placeholder="时间（如：1–3 月）"
                          className="h-8 text-xs w-32"
                          maxLength={20}
                        />
                        <Input
                          value={m.title}
                          onChange={(e) => updateStone(i, { title: e.target.value })}
                          placeholder="发生了什么"
                          className="h-8 text-xs flex-1"
                          maxLength={60}
                        />
                        <button
                          onClick={() => removeStone(i)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        {(Object.keys(TONE_META) as Tone[]).map((tone) => {
                          const meta = TONE_META[tone];
                          const active = m.tone === tone;
                          const Icon = meta.Icon;
                          return (
                            <button
                              key={tone}
                              onClick={() => updateStone(i, { tone })}
                              className={`flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] border transition ${
                                active
                                  ? "border-transparent text-foreground"
                                  : "border-border/40 text-muted-foreground hover:text-foreground"
                              }`}
                              style={
                                active
                                  ? { background: `${meta.color.replace(")", " / 0.18)")}`, borderColor: meta.color }
                                  : undefined
                              }
                            >
                              <Icon className="h-3 w-3" style={{ color: meta.color }} />
                              {meta.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {milestones.length < 6 && (
                    <Button
                      variant="outline"
                      onClick={addStone}
                      className="w-full h-9 border-dashed border-border/60 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> 添加里程碑
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* footer */}
            <div className="px-5 py-4 border-t border-border/40 flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-10 border-border/60"
              >
                取消
              </Button>
              <Button
                onClick={() => {
                  onSave(timeline, milestones);
                  onClose();
                }}
                className="flex-1 h-10 bg-gradient-to-r from-[oklch(0.55_0.20_285)] to-[oklch(0.50_0.18_200)] text-white"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> 生成可视化
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
