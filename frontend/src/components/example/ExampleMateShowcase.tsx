import { Link } from "@tanstack/react-router";
import type { MateResult } from "@/data/mateTypes";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";
import { MateFooterMarquee } from "@/components/mate/MateV4Sections";
import { MateResultContent } from "@/components/mate/MateResultContent";
import { MateResultShell } from "@/components/mate/MateResultShell";

export function ExampleMateShowcase({
  result,
  exampleSubject,
}: {
  result: MateResult;
  exampleSubject: ExampleSubject;
}) {
  return (
    <MateResultShell showHeader={false}>
      <MateResultContent result={result} compact />
      <MateFooterMarquee result={result} />
      <Link
        to="/chat"
        className="flex items-center justify-center gap-2 h-11 rounded-2xl text-sm w-full chip chip-rose !py-2.5"
      >
        带着 {exampleSubject.name} 的档案问 AI 分析师 →
      </Link>
    </MateResultShell>
  );
}
