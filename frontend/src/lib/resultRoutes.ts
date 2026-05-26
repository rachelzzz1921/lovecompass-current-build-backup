import type { Product } from "@/data/products";
import { PRODUCTS } from "@/data/products";
import { resolveProductId, type MateGender, type RosGender, type SelfGender } from "@/lib/suiteSlugs";

export type ProductId = "self" | "ros" | "mate";
export type ProductSet = "SELF" | "ROS" | "MATE";

export type ResultRoute =
  | { to: "/result/$attemptId"; params: { attemptId: string } }
  | { to: "/result/ros/$id"; params: { id: string } }
  | { to: "/result/mate/$id"; params: { id: string } }
  | { to: "/result/ros/couple/$code"; params: { code: string } }
  | { to: "/analyzing"; search: { attemptId?: string; productSet?: ProductSet; pending?: boolean } };

export function productSetFromSlug(slug: string | null | undefined): ProductSet {
  const id = resolveProductId(slug ?? "");
  if (id === "ros") return "ROS";
  if (id === "mate") return "MATE";
  return "SELF";
}

export function findProductByRouteId(routeId: string): Product {
  const productId = resolveProductId(routeId);
  return PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];
}

/** Canonical `/tests/$id` param — always `self` | `ros` | `mate`, never raw suite slug. */
export function testEntryRouteId(routeOrSuiteId: string): ProductId {
  return resolveProductId(routeOrSuiteId);
}

export function inferGenderFromSuiteSlug(
  slug: string,
): SelfGender | RosGender | MateGender | null {
  const lower = slug.toLowerCase();
  if (lower.includes("female")) return "female";
  if (lower.includes("male")) return "male";
  return null;
}

export function resultRouteForProductSet(productSet: string, attemptId: string): ResultRoute {
  if (productSet === "ROS") {
    return { to: "/result/ros/$id", params: { id: attemptId } };
  }
  if (productSet === "MATE") {
    return { to: "/result/mate/$id", params: { id: attemptId } };
  }
  return { to: "/result/$attemptId", params: { attemptId } };
}

export function resultRouteForProductId(productId: ProductId, attemptId: string): ResultRoute {
  if (productId === "ros") return { to: "/result/ros/$id", params: { id: attemptId } };
  if (productId === "mate") return { to: "/result/mate/$id", params: { id: attemptId } };
  return { to: "/result/$attemptId", params: { attemptId } };
}

export function resultRouteFromSuiteSlug(
  suiteSlug: string | null | undefined,
  attemptId: string,
): ResultRoute {
  return resultRouteForProductId(resolveProductId(suiteSlug ?? ""), attemptId);
}

export function detectProductSetFromAttempt(attempt: Record<string, unknown>): ProductSet {
  const payload = (attempt.result_payload ?? {}) as Record<string, unknown>;
  const raw = payload.productSet ?? payload.product_set;
  if (raw === "ROS" || raw === "MATE" || raw === "SELF") return raw;
  const slug = String(attempt.test_id ?? attempt.suite_slug ?? payload.suiteSlug ?? "");
  if (slug.includes("ros") || slug.includes("s02")) return "ROS";
  if (slug.includes("mate") || slug.includes("s03")) return "MATE";
  if (slug.includes("self") || slug.includes("s01")) return "SELF";
  if (payload.model === "MATE_V3" || payload.model === "MATE_V4") return "MATE";
  if (payload.model === "ROS_V3") return "ROS";
  return productSetFromSlug(slug);
}

/** If not SELF, returns dedicated result route; otherwise null (stay on generic SELF page). */
export function dedicatedResultRouteFromAttempt(
  attemptId: string,
  attempt: Record<string, unknown>,
): ResultRoute | null {
  const productSet = detectProductSetFromAttempt(attempt);
  if (productSet === "SELF") return null;
  return resultRouteForProductSet(productSet, attemptId);
}

export function parseBackendNextPath(next: string | null | undefined): ResultRoute | null {
  if (!next) return null;
  const path = next.startsWith("http") ? new URL(next).pathname + new URL(next).search : next;

  const mateCoupleMatch = path.match(/\/result\/mate\/couple\/([^/?]+)/);
  if (mateCoupleMatch) {
    return { to: "/result/mate/couple/$code", params: { code: mateCoupleMatch[1] } };
  }

  const coupleMatch = path.match(/\/result\/ros\/couple\/([^/?]+)/);
  if (coupleMatch) {
    return { to: "/result/ros/couple/$code", params: { code: coupleMatch[1] } };
  }

  const mateMatch = path.match(/\/result\/mate\/([^/?]+)/);
  if (mateMatch) return { to: "/result/mate/$id", params: { id: mateMatch[1] } };

  const rosMatch = path.match(/\/result\/ros\/([^/?]+)/);
  if (rosMatch) return { to: "/result/ros/$id", params: { id: rosMatch[1] } };

  const analyzingMatch = path.match(/\/analyzing(?:\?(.+))?/);
  if (analyzingMatch) {
    const qs = analyzingMatch[1] ?? "";
    const params = new URLSearchParams(qs);
    const attemptId = params.get("attemptId");
    const productSet = params.get("productSet");
    if (attemptId) {
      return {
        to: "/analyzing",
        search: {
          attemptId,
          ...(productSet === "ROS" || productSet === "MATE" || productSet === "SELF"
            ? { productSet }
            : {}),
        },
      };
    }
  }

  const selfMatch = path.match(/\/result\/([^/?]+)/);
  if (selfMatch && selfMatch[1] !== "ros" && selfMatch[1] !== "mate" && selfMatch[1] !== "self") {
    return { to: "/result/$attemptId", params: { attemptId: selfMatch[1] } };
  }

  return null;
}

/** Prefer dedicated ROS/MATE routes; never send non-SELF attempts to generic result page. */
export function safeResultRouteFromAttempt(
  attemptId: string,
  attempt: Record<string, unknown>,
): ResultRoute {
  const dedicated = dedicatedResultRouteFromAttempt(attemptId, attempt);
  if (dedicated) return dedicated;
  return { to: "/result/$attemptId", params: { attemptId } };
}

export type SubmitAttemptResponse = {
  attemptId: string;
  status?: "completed" | "in_progress";
  next?: string;
  productSet?: string;
  relationCode?: string;
};

/** After analyzing animation — never loop back to `/analyzing`; resolve to the real result route. */
export function resolvePostAnalyzingRoute(options: {
  next?: string | null;
  attemptId?: string | null;
  productSet?: ProductSet | null;
}): ResultRoute | null {
  const { next, attemptId, productSet } = options;
  const parsed = parseBackendNextPath(next ?? undefined);

  if (parsed?.to === "/analyzing") {
    const aid = attemptId ?? parsed.search?.attemptId;
    const ps =
      productSet ??
      (parsed.search?.productSet === "ROS" ||
      parsed.search?.productSet === "MATE" ||
      parsed.search?.productSet === "SELF"
        ? parsed.search.productSet
        : null);
    if (aid && ps) return resultRouteForProductSet(ps, aid);
    if (aid) return { to: "/result/$attemptId", params: { attemptId: aid } };
    return null;
  }

  return parsed;
}

export function routeAfterAttemptSubmit(
  res: SubmitAttemptResponse,
  options?: { partnerRelationCode?: string | null; productSet?: ProductSet },
): ResultRoute {
  if (options?.partnerRelationCode) {
    if (options.productSet === "MATE") {
      return { to: "/result/mate/couple/$code", params: { code: options.partnerRelationCode } };
    }
    return { to: "/result/ros/couple/$code", params: { code: options.partnerRelationCode } };
  }
  const fromNext = parseBackendNextPath(res.next);
  if (fromNext) return fromNext;
  const productSet =
    options?.productSet ??
    (res.productSet === "ROS" || res.productSet === "MATE" || res.productSet === "SELF"
      ? res.productSet
      : undefined);
  return {
    to: "/analyzing",
    search: { attemptId: res.attemptId, ...(productSet ? { productSet } : {}) },
  };
}
