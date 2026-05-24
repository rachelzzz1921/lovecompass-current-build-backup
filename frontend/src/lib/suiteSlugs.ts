/** Backend `test_suites.slug` values (Supabase). */
export const SELF_SUITE_SLUGS = {
  female: "s01_self_female",
  male: "s01_self_male",
} as const;

export const ROS_SUITE_SLUGS = {
  female: "s02_ros_female",
  male: "s02_ros_male",
} as const;

export type SelfGender = keyof typeof SELF_SUITE_SLUGS;
export type RosGender = keyof typeof ROS_SUITE_SLUGS;

const SELF_GENDER_STORAGE_KEY = "lovecompass:self_gender";
const ROS_GENDER_STORAGE_KEY = "lovecompass:ros_gender";

export function getStoredSelfGender(): SelfGender | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(SELF_GENDER_STORAGE_KEY);
  return value === "male" || value === "female" ? value : null;
}

export function setStoredSelfGender(gender: SelfGender) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SELF_GENDER_STORAGE_KEY, gender);
  sessionStorage.setItem("suite:self", SELF_SUITE_SLUGS[gender]);
}

export function getStoredRosGender(): RosGender | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(ROS_GENDER_STORAGE_KEY);
  return value === "male" || value === "female" ? value : null;
}

export function setStoredRosGender(gender: RosGender) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ROS_GENDER_STORAGE_KEY, gender);
  sessionStorage.setItem("suite:ros", ROS_SUITE_SLUGS[gender]);
}

/** Map backend suite slug or route id to frontend product id. */
export function resolveProductId(routeOrSuiteId: string): "self" | "ros" | "mate" {
  if (routeOrSuiteId === "self" || routeOrSuiteId.includes("self")) return "self";
  if (routeOrSuiteId === "ros" || routeOrSuiteId.includes("ros")) return "ros";
  if (routeOrSuiteId === "mate" || routeOrSuiteId.includes("mate")) return "mate";
  return "self";
}

/** Map frontend product/route ids to API suite slugs. */
export function resolveSuiteSlug(options: {
  productId: string;
  routeId: string;
  sessionSuiteSlug?: string | null;
}): string {
  const { productId, routeId, sessionSuiteSlug } = options;
  if (routeId.includes("_")) return routeId;
  if (sessionSuiteSlug && sessionSuiteSlug.includes("_")) return sessionSuiteSlug;
  if (productId === "self") {
    const gender = getStoredSelfGender();
    if (gender) return SELF_SUITE_SLUGS[gender];
    return SELF_SUITE_SLUGS.female;
  }
  if (productId === "ros") {
    const gender = getStoredRosGender();
    if (gender) return ROS_SUITE_SLUGS[gender];
    return ROS_SUITE_SLUGS.female;
  }
  return sessionSuiteSlug || routeId;
}
