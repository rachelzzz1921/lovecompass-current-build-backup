/**
 * Declarative product flow steps — ROS multi-step is modeled as extra steps, not a fork.
 */

import { PRODUCT_FLOW_SPECS, type ProductId } from "@/lib/productRegistry";

export type FlowStepId = "auth" | "redeem" | "rosStage" | "entry" | "run" | "analyze" | "result";

export type FlowStep = {
  id: FlowStepId;
  /** Skip when condition met (evaluated by engine) */
  skipWhen?: "liteFree" | "hasRedeemableAccess" | "rosPartnerCode";
  route?: string;
};

export type ProductFlowGraph = {
  productId: ProductId;
  entryPath: string;
  redeemLanding: "tests-entry" | "ros-start";
  steps: readonly FlowStep[];
};

const BASE_STEPS: readonly FlowStep[] = [
  { id: "auth" },
  { id: "redeem", skipWhen: "liteFree" },
  { id: "entry", route: "/tests/$id" },
  { id: "run", route: "/tests/$id/run" },
  { id: "analyze", route: "/analyzing" },
  { id: "result" },
] as const;

const ROS_STEPS: readonly FlowStep[] = [
  { id: "auth" },
  { id: "redeem", skipWhen: "rosPartnerCode" },
  { id: "rosStage", route: "/ros/start" },
  { id: "run", route: "/tests/$id/run" },
  { id: "analyze", route: "/analyzing" },
  { id: "result" },
] as const;

function buildGraph(productId: ProductId): ProductFlowGraph {
  const spec = PRODUCT_FLOW_SPECS[productId];
  return {
    productId,
    entryPath: spec.entryPath,
    redeemLanding: spec.redeemLanding,
    steps: productId === "ros" ? ROS_STEPS : BASE_STEPS,
  };
}

let flowGraphCache: Record<ProductId, ProductFlowGraph> | null = null;

function ensureFlowGraphs(): Record<ProductId, ProductFlowGraph> {
  if (!flowGraphCache) {
    flowGraphCache = {
      self: buildGraph("self"),
      ros: buildGraph("ros"),
      mate: buildGraph("mate"),
    };
  }
  return flowGraphCache;
}

export const PRODUCT_FLOW_GRAPHS: Record<ProductId, ProductFlowGraph> = new Proxy(
  {} as Record<ProductId, ProductFlowGraph>,
  {
    get(_target, prop) {
      return ensureFlowGraphs()[prop as ProductId];
    },
    ownKeys() {
      return Object.keys(ensureFlowGraphs());
    },
    getOwnPropertyDescriptor(_target, prop) {
      const graphs = ensureFlowGraphs();
      if (prop in graphs) {
        return { configurable: true, enumerable: true, value: graphs[prop as ProductId] };
      }
      return undefined;
    },
  },
);

export function flowGraphFor(productId: ProductId): ProductFlowGraph {
  return ensureFlowGraphs()[productId];
}

export function entryStepFor(productId: ProductId): FlowStep {
  const graph = flowGraphFor(productId);
  if (productId === "ros") {
    return graph.steps.find((s) => s.id === "rosStage") ?? graph.steps[0];
  }
  return graph.steps.find((s) => s.id === "entry") ?? graph.steps[0];
}

export function redeemStepRoute(productId: ProductId): "/access" {
  return "/access";
}
