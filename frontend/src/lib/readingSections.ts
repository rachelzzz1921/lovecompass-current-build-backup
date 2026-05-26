import type { ReadingSection } from "@/components/reading/FloatingSectionNav";
import {
  EXAMPLE_MATE_PRIMARY,
  EXAMPLE_ROS_COUPLE_SECTIONS,
  EXAMPLE_ROS_SECTIONS,
  EXAMPLE_SELF_SECTIONS,
} from "@/components/example/exampleReadingFlow";
import { MATE_NAV_SECTIONS } from "@/data/mateTypes";

export const SELF_RESULT_SECTIONS: ReadingSection[] = EXAMPLE_SELF_SECTIONS;

export const ROS_RESULT_SECTIONS: ReadingSection[] = EXAMPLE_ROS_SECTIONS;

export const ROS_COUPLE_RESULT_SECTIONS: ReadingSection[] = EXAMPLE_ROS_COUPLE_SECTIONS;

/** 完整 MATE 结果页：与 DOM id `mate-*` 对齐 */
export const MATE_RESULT_SECTIONS: ReadingSection[] = MATE_NAV_SECTIONS.map((item) => ({
  id: `mate-${item.id}`,
  label: item.label,
}));

/** 范例 MATE 精简路径 */
export const MATE_RESULT_PRIMARY_SECTIONS: ReadingSection[] = EXAMPLE_MATE_PRIMARY;
