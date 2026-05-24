import { DEFAULT_COUNSELOR_ID, resolveCounselorId } from "@/lib/counselors";

/** Shared search params for `/chat` — keeps analyst binding consistent across routes. */
export const DEFAULT_CHAT_ANALYST_ID = DEFAULT_COUNSELOR_ID;

export type ChatRouteSearch = {
  analystId?: string;
  attemptId?: string;
};

export function chatRouteSearch(attemptId?: string | null, analystId?: string | null): ChatRouteSearch {
  const search: ChatRouteSearch = { analystId: resolveCounselorId(analystId ?? DEFAULT_CHAT_ANALYST_ID) };
  if (attemptId) search.attemptId = attemptId;
  return search;
}
