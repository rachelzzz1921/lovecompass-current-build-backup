import { ArrowRight, ChevronDown } from "lucide-react";
import type { ExampleSuiteTab } from "@/data/exampleCharacters";
import { EXAMPLE_SUITE_JOURNEY, nextExampleSuite } from "@/components/example/exampleReadingFlow";

export function ExampleSuiteHandoff({
  current,
  characterName,
  rosPartner,
  onNext,
}: {
  current: ExampleSuiteTab;
  characterName: string;
  rosPartner?: string;
  onNext: (tab: ExampleSuiteTab) => void;
}) {
  const next = nextExampleSuite(current);
  if (!next) return null;

  const nextMeta = EXAMPLE_SUITE_JOURNEY.find((s) => s.id === next);
  const copy =
    next === "ros"
      ? `第一套（SELF）读完后，继续看第二套题 ROS：${characterName}${rosPartner ? ` 与 ${rosPartner}` : ""} 的关系推演。`
      : `第二套读完后，最后看第三套题 MATE：${characterName} 在择偶市场里的坐标。`;

  return (
    <div className="relative mt-8 mb-4 px-4 sm:px-0">
      <div className="flex flex-col items-center gap-2 py-6">
        <ChevronDown className="h-5 w-5 text-[oklch(0.68_0.18_285/0.55)] animate-bounce" aria-hidden />
        <div className="w-full max-w-3xl mx-auto rounded-2xl border border-[oklch(0.68_0.18_285/0.35)] bg-gradient-to-br from-[oklch(0.50_0.20_285/0.12)] to-[oklch(0.55_0.16_200/0.06)] p-5 sm:p-6">
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">// NEXT CHAPTER</div>
          <p className="text-sm text-foreground/75 mt-2 leading-relaxed">{copy}</p>
          <button
            type="button"
            onClick={() => onNext(next)}
            className="mt-4 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            继续阅读 · {nextMeta?.suiteLabel} {nextMeta?.title}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
