import { useEffect, useRef, useState } from 'react';
import type { LocationProvider, LocationOption } from '@/lib/location/provider';

export function useLocationSearch(
  provider: LocationProvider,
  q: string,
  delay = 250,
  opts?: any
) {
  const [results, setResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debRef = useRef<number | null>(null);
  const lastQ = useRef<string>('');

  useEffect(() => {
    if (debRef.current) window.clearTimeout(debRef.current);
    if (!q?.trim()) { setResults([]); return; }

    debRef.current = window.setTimeout(async () => {
      if (q === lastQ.current) return;
      lastQ.current = q;
      setLoading(true);
      try { setResults(await provider.search(q, opts)); }
      catch { setResults([]); }
      finally { setLoading(false); }
    }, delay);

    return () => { if (debRef.current) window.clearTimeout(debRef.current); };
  }, [provider, q, delay, opts]);

  return { results, loading };
}
