import type { NavigateOptions } from "@tanstack/react-router";
import type { ProductSet } from "@/lib/resultRoutes";
import { beginPendingAttemptSubmit } from "@/lib/pendingAttemptSubmit";
import { lovecompassApi, type AnswerDraft } from "@/lib/lovecompassApi";
import { getRequiredAccessToken } from "@/lib/supabaseSession";

export type AnalyzingHandoffInput = {
  productSet: ProductSet;
  suiteSlug: string;
  redemptionEventId: string | null;
  partnerRelationCode?: string | null;
  answers: AnswerDraft[];
};

/** Start submit on analyzing page — no duplicate animation on the test run screen. */
export function createSubmitPromise(input: AnalyzingHandoffInput): Promise<{
  attemptId: string;
  status?: string;
  next?: string;
  productSet?: string;
  relationCode?: string;
}> {
  return (async () => {
    await getRequiredAccessToken();
    return lovecompassApi.submitAttempt({
      suiteSlug: input.suiteSlug,
      redemptionEventId: input.redemptionEventId,
      partnerRelationCode: input.partnerRelationCode ?? null,
      answers: input.answers,
    });
  })();
}

export function beginAnalyzingHandoff(
  input: AnalyzingHandoffInput,
  nav: (opts: NavigateOptions) => void | Promise<void>,
  routeId?: string,
): void {
  const submitPromise = createSubmitPromise(input);
  beginPendingAttemptSubmit({
    promise: submitPromise,
    productSet: input.productSet,
    suiteSlug: input.suiteSlug,
    routeId: routeId ?? input.suiteSlug,
    partnerRelationCode: input.partnerRelationCode ?? null,
  });
  void nav({
    to: "/analyzing",
    search: { productSet: input.productSet, pending: true },
  });
}
