import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Check, Eye, Flame, MessageCircle, Swords, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Behavior } from "@/data/mockResult";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SCENE_ICONS = [Eye, Swords, Flame];
const SCENE_TINTS = ["oklch(0.82 0.14 200)", "oklch(0.82 0.14 75)", "oklch(0.72 0.18 360)"];

export function BehaviorCarousel({
  behaviors,
  attemptId,
  exampleMode = false,
}: {
  behaviors: Behavior[];
  attemptId?: string;
  exampleMode?: boolean;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [index, setIndex] = useState(0);
  const [feedbackScene, setFeedbackScene] = useState<Behavior | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = (i: number) => emblaApi?.scrollTo(i);

  const onResonate = (scene: string, yes: boolean) => {
    if (attemptId) {
      void lovecompassApi
        .submitSceneFeedback(attemptId, { scene, resonated: yes })
        .catch(() => undefined);
    }
    if (yes) {
      toast.success("收到，这确实是你的模式", { description: scene });
    } else {
      setFeedbackScene(behaviors.find((b) => b.scene === scene) ?? null);
    }
  };

  return (
    <div>
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {behaviors.map((b, i) => {
            const Icon = SCENE_ICONS[i] ?? Eye;
            const tint = SCENE_TINTS[i] ?? SCENE_TINTS[0];
            return (
              <div key={b.scene} className="min-w-0 shrink-0 grow-0 basis-full px-0.5">
                <motion.div
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: index === i ? 1 : 0.6 }}
                  className="p-5 rounded-xl bg-secondary/40 border border-border/40 min-h-[280px] flex flex-col"
                >
                  <div
                    className="h-20 rounded-lg mb-4 border border-border/30 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in oklab, ${tint} 12%, transparent), transparent)`,
                    }}
                  >
                    <Icon className="h-8 w-8 opacity-60" style={{ color: tint }} />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
                    0{i + 1} · {b.scene}
                  </span>
                  <div className="text-[15px] font-medium text-foreground mt-2">{b.title}</div>
                  <div className="text-[13px] text-foreground/70 mt-2 leading-[1.75] flex-1">{b.body}</div>
                  {!exampleMode ? (
                    <>
                      <div className="mt-4 pt-4 border-t border-border/30 text-center font-mono text-[10px] tracking-[0.2em] text-muted-foreground/80">
                        「太像我了」← 这正是 MIRROR 想做到的事
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onResonate(b.scene, true)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[12px] border border-[oklch(0.78_0.15_165/0.35)] bg-[oklch(0.50_0.18_165/0.12)] text-foreground/85 hover:bg-[oklch(0.50_0.18_165/0.18)] transition"
                        >
                          <Check className="h-3.5 w-3.5" /> 完全是我
                        </button>
                        <button
                          type="button"
                          onClick={() => onResonate(b.scene, false)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[12px] border border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground transition"
                        >
                          <X className="h-3.5 w-3.5" /> 不太准
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-border/30 text-center text-[11px] text-muted-foreground leading-relaxed">
                      示范场景 · 推演文案
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {behaviors.map((b, i) => (
          <button
            key={b.scene}
            type="button"
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              index === i ? "w-6 bg-[oklch(0.82_0.14_200)]" : "w-1.5 bg-border/80"
            }`}
            aria-label={`场景 ${i + 1}`}
          />
        ))}
      </div>

      <Dialog open={Boolean(feedbackScene)} onOpenChange={(open) => !open && setFeedbackScene(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>这个场景不太像你？</DialogTitle>
            <DialogDescription>
              没关系——体系给的是模式，不是判决书。你可以用一句话告诉 AI 顾问，你真实会怎么做。
            </DialogDescription>
          </DialogHeader>
          {feedbackScene ? (
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-3">
              「{feedbackScene.title}」：{feedbackScene.body}
            </p>
          ) : null}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => setFeedbackScene(null)}>
              先不用
            </Button>
            {attemptId && feedbackScene ? (
              <Button type="button" asChild>
                <Link
                  to="/chat"
                  search={chatRouteSearch(
                    attemptId,
                    undefined,
                    `关于「${feedbackScene.scene}」这个场景，测试描述不太准。我真实的情况是：`,
                  )}
                >
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  跟 AI 补充我的做法
                </Link>
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
