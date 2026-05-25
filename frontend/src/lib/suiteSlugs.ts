/**
 * 题库 slug 与性别偏好存储。
 * Slug 映射见 `productRegistry`；此处保留类型别名与薄封装以兼容现有 import。
 */
export {
  SELF_SUITE_SLUGS,
  ROS_SUITE_SLUGS,
  MATE_SUITE_SLUGS,
  type SuiteGender,
  getStoredGender,
  setStoredGender,
  inferProductId as resolveProductId,
  resolveActiveSuiteSlug as resolveSuiteSlug,
} from "@/lib/productRegistry";

import {
  getStoredGender,
  setStoredGender,
  SELF_SUITE_SLUGS,
  ROS_SUITE_SLUGS,
  MATE_SUITE_SLUGS,
  type SuiteGender,
} from "@/lib/productRegistry";

export type SelfGender = SuiteGender;
export type RosGender = SuiteGender;
export type MateGender = SuiteGender;

export function getStoredSelfGender(): SelfGender | null {
  return getStoredGender("self");
}

export function setStoredSelfGender(gender: SelfGender) {
  setStoredGender("self", gender);
}

export function getStoredRosGender(): RosGender | null {
  return getStoredGender("ros");
}

export function setStoredRosGender(gender: RosGender) {
  setStoredGender("ros", gender);
}

export function getStoredMateGender(): MateGender | null {
  return getStoredGender("mate");
}

export function setStoredMateGender(gender: MateGender) {
  setStoredGender("mate", gender);
}
