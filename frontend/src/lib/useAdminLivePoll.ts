import { useCallback, useEffect, useRef, useState } from "react";

export function useAdminLivePoll<T>(
  fetcher: () => Promise<T>,
  intervalMs = 15_000,
  enabled = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const next = await fetcherRef.current();
      setData(next);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh(false);
    const timer = window.setInterval(() => void refresh(true), intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, refresh]);

  return { data, error, loading, lastUpdated, refresh: () => refresh(false) };
}
