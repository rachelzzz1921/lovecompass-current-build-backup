/** Shared search params for `/chat` — keeps analyst binding consistent across routes. */
export const DEFAULT_CHAT_ANALYST_ID = "mirror" as const;

export type ChatRouteSearch = {
  analystId?: string;
  attemptId?: string;
};

export function chatRouteSearch(attemptId?: string | null): ChatRouteSearch {
  const search: ChatRouteSearch = { analystId: DEFAULT_CHAT_ANALYST_ID };
  if (attemptId) search.attemptId = attemptId;
  return search;
}
