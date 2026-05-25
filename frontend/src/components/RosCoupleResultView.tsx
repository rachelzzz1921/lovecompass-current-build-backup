import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { RosCoupleResult } from "@/data/rosTypes";
import { RosCoupleOverview } from "@/components/ros-couple-result/RosCoupleOverview";
import { RosCoupleCompare } from "@/components/ros-couple-result/RosCoupleCompare";
import { RosCoupleBond } from "@/components/ros-couple-result/RosCoupleBond";
import { RosCoupleHeartbeat } from "@/components/ros-couple-result/RosCoupleHeartbeat";
import { RosCoupleNext } from "@/components/ros-couple-result/RosCoupleNext";
import { RosSectionDivider } from "@/components/ros-couple-result/RosSectionDivider";
import { RosCoupleShareDialog } from "@/components/ros-couple-result/RosCoupleShareDialog";

export type RosCoupleResultViewProps = {
  result: RosCoupleResult;
  initiatorAttemptId?: string;
};

export function RosCoupleResultView({ result, initiatorAttemptId }: RosCoupleResultViewProps) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <main className="relative min-h-screen" style={{ background: "#0c0e11" }}>
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-5 pt-5 pb-3"
        style={{ background: "linear-gradient(180deg,#0c0e11 70%, transparent)" }}
      >
        <Link to="/" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">返回</span>
        </Link>
        <span
          className="chip font-mono text-[10px] tracking-[0.25em]"
          style={{ background: "rgba(99,102,241,0.12)", color: "#a5a8ff", border: "1px solid rgba(99,102,241,0.3)" }}
        >
          SET · 02 / ROS · 双人
        </span>
      </header>

      <div className="max-w-[480px] mx-auto px-5 pb-24 space-y-2">
        <RosCoupleOverview result={result} />

        <RosSectionDivider hint="数字背后，你们各自感受到了什么" />

        <RosCoupleCompare result={result} initiatorAttemptId={initiatorAttemptId} />

        <RosSectionDivider hint="这些差距，有更深层的原因" />

        <RosCoupleBond result={result} />

        <RosSectionDivider hint="把它们叠在一起，看看你们独特的样子" />

        <RosCoupleHeartbeat result={result} />

        <RosSectionDivider hint="看见了，然后呢" />

        <RosCoupleNext
          result={result}
          initiatorAttemptId={initiatorAttemptId}
          onShare={() => setShareOpen(true)}
        />
      </div>

      <RosCoupleShareDialog result={result} open={shareOpen} onOpenChange={setShareOpen} />
    </main>
  );
}
