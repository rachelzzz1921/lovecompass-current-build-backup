import type { ExampleSuiteTab } from "@/data/exampleCharacters";
import { EXAMPLE_SUITE_JOURNEY } from "@/components/example/exampleReadingFlow";
import { ResultReadingThreshold } from "@/components/reading/ResultReadingThreshold";

export function ExampleResultThreshold({
  tab,
  characterName,
  surface = "light",
}: {
  tab: ExampleSuiteTab;
  characterName: string;
  /** 与下方结果页背景一致：SELF 浅色 / ROS·MATE 深色 */
  surface?: "light" | "dark";
}) {
  const step = EXAMPLE_SUITE_JOURNEY.find((s) => s.id === tab)!;

  return (
    <ResultReadingThreshold
      productId={tab}
      headline={`示范 · ${characterName}`}
      chipLabel={`${step.suiteLabel} · ${step.title}`}
      productTitle={step.productTitle}
      productSubtitle={step.subtitle}
      surface={surface}
    />
  );
}
