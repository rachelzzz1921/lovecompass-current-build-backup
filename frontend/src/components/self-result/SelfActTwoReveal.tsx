import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { CharacterReveal, MatchType } from "@/data/mockResult";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/self-result/SectionDivider";
import { CharacterContent } from "@/components/self-result/CharacterContent";
import { RedChamberRevealOverlay } from "@/components/self-result/RedChamberRevealOverlay";

type Props = {
  character: CharacterReveal;
  matches: MatchType[];
  onRevealedChange?: (revealed: boolean) => void;
};

export function SelfActTwoReveal({ character, matches, onRevealedChange }: Props) {
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

  return (
    <>
      <SectionDivider>
        <span>· 数据已经说完了 ·</span>
        <br />
        <span className="text-foreground/70">现在，换一种语言</span>
      </SectionDivider>

      <section id="act-ii" className="scroll-mt-20">
        <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// ACT II</div>
        <h2 className="font-display text-xl mt-1 mb-6 text-foreground">红楼揭晓</h2>

        <div className="bg-glass rounded-2xl p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 ring-grid opacity-20 pointer-events-none" />

          {!revealed ? (
            <div className="relative text-center py-4">
              <p className="text-[13px] text-foreground/65 leading-[1.85] mb-6 max-w-md mx-auto">
                根据你的完整画像，系统已匹配你在红楼梦世界里最接近的人格原型。
              </p>
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-20 rounded-xl border border-border/40 bg-secondary/40 flex items-center justify-center text-2xl blur-[6px] select-none"
                    aria-hidden
                  >
                    ?
                  </div>
                ))}
              </div>
              <Button
                onClick={openReveal}
                className="rounded-full h-11 px-6 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="mr-2 h-4 w-4" /> 揭晓我的红楼人格
              </Button>
            </div>
          ) : (
            <CharacterContent character={character} matches={matches} />
          )}
        </div>
      </section>

      <RedChamberRevealOverlay open={overlay} character={character} onClose={closeReveal} />
    </>
  );
}
