import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CoreTrait } from "@/data/mockResult";

type Props = {
  trait: CoreTrait | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TraitEvidenceSheet({ trait, open, onOpenChange }: Props) {
  const rows = trait?.evidence?.filter((e) => e.question_short || e.chosen_label) ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-left font-display text-lg">答题依据</SheetTitle>
          <SheetDescription className="text-left">
            {trait?.title ?? "这一特质来自你的真实作答，不是泛化描述。"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3 overflow-y-auto pb-4">
          {rows.length ? (
            rows.map((row) => (
              <div key={row.question_id} className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{row.question_id}</div>
                <div className="text-[14px] text-foreground/90 mt-2 leading-relaxed">{row.question_short}</div>
                <div className="mt-3 text-[13px] text-[oklch(0.82_0.14_200)]">
                  你的选择：{row.chosen_label || "（已记录）"}
                </div>
              </div>
            ))
          ) : (
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              特质文案已结合你的答题模式生成。完整题目明细将在下一次测评完成后自动关联。
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
