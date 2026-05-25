/**
 * DEV-ONLY · 随机填答按钮（见 lib/dev/devRandomFill.ts）
 */
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { isDevRandomFillEnabled } from "@/lib/dev/devRandomFill";

type Props = {
  disabled?: boolean;
  onClick: () => void;
};

export function DevRandomFillButton({ disabled, onClick }: Props) {
  if (!isDevRandomFillEnabled()) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      data-testid="dev-random-fill"
      className="fixed bottom-24 right-4 z-30 rounded-full border-dashed border-amber-500/50 bg-amber-500/10 text-amber-200/90 text-[11px] font-mono tracking-wide shadow-lg hover:bg-amber-500/20 md:bottom-6"
      title="开发测试：随机填答并提交（上线前删除）"
    >
      <Dices className="mr-1.5 h-3.5 w-3.5" />
      DEV · 随机填答
    </Button>
  );
}
