import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { CharacterReveal, MatchType } from "@/data/mockResult";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/self-result/SectionDivider";
import { CharacterContent } from "@/components/self-result/CharacterContent";
import { RedChamberRevealOverlay } from "@/components/self-result/RedChamberRevealOverlay";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";
import { subjectPronoun } from "@/lib/exampleSubjectCopy";

type Props = {
  character: CharacterReveal;
  matches: MatchType[];
  onRevealedChange?: (revealed: boolean) => void;
  exampleSubject?: ExampleSubject;
};

export function SelfActTwoReveal({ character, matches, onRevealedChange, exampleSubject }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [overlay, setOverlay] = useState(false);

  const openReveal = () => setOverlay(true);
  const closeReveal = () => {
    setOverlay(false);
    if (!revealed) {
      setRevealed(true);
      onRevealedChange?.(true);
    }
  };

  const pronoun = exampleSubject ? subjectPronoun(exampleSubject) : "你";
  const name = exampleSubject?.name ?? pronoun;

  return (
    <>
      <SectionDivider
        variant="chapter"
        hint="下方进入第二幕：用红楼梦的语言，重新命名同一份画像"
      >
        <span>· 数据已经说完了 ·</span>
        <br />
        <span className="text-foreground/80">现在，换一种语言</span>
      </SectionDivider>

      <section id="act-ii" className="scroll-mt-32 min-h-[min(52vh,520px)]">
        <div className="relative rounded-3xl overflow-hidden border border-[oklch(0.68_0.18_285/0.38)] bg-gradient-to-br from-[oklch(0.50_0.20_285/0.14)] via-[oklch(0.20_0.022_270/0.72)] to-[oklch(0.55_0.16_200/0.10)] shadow-[0_28px_90px_-32px_oklch(0.50_0.20_285/0.55)]">
          <div className="absolute inset-0 ring-grid opacity-[0.14] pointer-events-none" />
          <div
            className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-[oklch(0.68_0.18_285/0.22)] blur-3xl pointer-events-none"
            aria-hidden
          />
          <div
            className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-[oklch(0.82_0.14_200/0.12)] blur-3xl pointer-events-none"
            aria-hidden
          />

          <div className="relative px-6 py-8 md:px-10 md:py-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 pb-6 border-b border-[oklch(0.68_0.18_285/0.22)]">
              <div>
                <span className="chip chip-violet font-mono mb-3">ACT II · 文学镜像</span>
                <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-tight">红楼揭晓</h2>
                <p className="text-[13px] text-foreground/60 mt-2 max-w-md leading-relaxed">
                  与上方三 Tab 分开阅读 —— 这里是谱系对照，不是重复特质分析。
                </p>
              </div>
              <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground/80 shrink-0">
                // RED CHAMBER REVEAL
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/20 backdrop-blur-sm p-6 md:p-7 relative overflow-hidden">
              {!revealed ? (
                <div className="relative text-center py-6 md:py-8">
                  <p className="text-[13px] text-foreground/70 leading-[1.85] mb-8 max-w-md mx-auto">
                    {exampleSubject
                      ? `根据 ${name} 的完整画像，系统已匹配 ${pronoun} 在红楼梦世界里最接近的人格原型。`
                      : "根据你的完整画像，系统已匹配你在红楼梦世界里最接近的人格原型。"}
                  </p>
                  <div className="flex justify-center gap-4 mb-10">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-16 h-20 md:w-[4.5rem] md:h-[5.5rem] rounded-xl border border-[oklch(0.68_0.18_285/0.35)] bg-[oklch(0.50_0.20_285/0.08)] flex items-center justify-center text-2xl blur-[6px] select-none"
                        aria-hidden
                      >
                        ?
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={openReveal}
                    className="rounded-full h-11 px-7 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-90 shadow-lg shadow-[oklch(0.50_0.20_285/0.35)]"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />{" "}
                    {exampleSubject ? `揭晓 ${name} 的红楼人格` : "揭晓我的红楼人格"}
                  </Button>
                </div>
              ) : (
                <CharacterContent character={character} matches={matches} exampleSubject={exampleSubject} />
              )}
            </div>
          </div>
        </div>
      </section>

      <RedChamberRevealOverlay open={overlay} character={character} onClose={closeReveal} />
    </>
  );
}
