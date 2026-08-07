import { useEffect, useRef, useState } from 'react';
import type { LocationProvider, LocationOption } from '@/lib/location/provider';

export function useLocationSearch(
  provider: LocationProvider,
  q: string,
  delay = 250,
  opts?: Record<string, unknown>
) {
  const [results, setResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debRef = useRef<number | null>(null);
  const lastQ = useRef<string>('');
  // The debounce timer only guards against overlapping *scheduling* — once
  // provider.search is actually in flight, nothing stops a second, faster
  // query from resolving before it. Without sequencing, a slower response
  // for an abandoned query could overwrite the correct, newer results.
  const latestRequestId = useRef(0);

  useEffect(() => {
    if (debRef.current) window.clearTimeout(debRef.current);
    if (!q?.trim()) { setResults([]); return; }

    debRef.current = window.setTimeout(async () => {
      if (q === lastQ.current) return;
      lastQ.current = q;
      const requestId = ++latestRequestId.current;
      setLoading(true);
      try {
        const res = await provider.search(q, opts);
        if (requestId === latestRequestId.current) setResults(res);
      } catch {
        if (requestId === latestRequestId.current) setResults([]);
      } finally {
        if (requestId === latestRequestId.current) setLoading(false);
      }
    }, delay);

    return () => { if (debRef.current) window.clearTimeout(debRef.current); };
  }, [provider, q, delay, opts]);

  return { results, loading };
}
