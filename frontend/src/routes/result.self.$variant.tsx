import { createFileRoute } from "@tanstack/react-router";
import { MOCK_SELF_RESULT } from "@/data/mockResult";
import { SelfResultView } from "@/components/SelfResultView";

export const Route = createFileRoute("/result/self/$variant")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "你的关系画像 · MIRROR" },
      { name: "description", content: "MIRROR 为你生成的自我关系模式画像。" },
    ],
  }),
  component: SelfResultDemoPage,
});

function SelfResultDemoPage() {
  return <SelfResultView result={MOCK_SELF_RESULT} />;
}
