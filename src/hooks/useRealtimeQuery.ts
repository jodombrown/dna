import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeContext } from '@/contexts/RealtimeContext';

export interface RealtimeQueryOptions {
  table: string;
  select?: string;
  filter?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

export interface RealtimeQueryResult<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRealtimeQuery = <T = any>(
  queryKey: string,
  options: RealtimeQueryOptions
): RealtimeQueryResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getOrCreateChannel, removeChannel } = useRealtimeContext();
  const subscriptionRef = useRef<boolean>(false);

  const {
    table,
    select = '*',
    filter,
    orderBy,
    limit,
    enabled = true,
    refetchOnWindowFocus = true
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table as any).select(select);

      if (filter) {
        // Parse and apply filters
        const filterParts = filter.split(',').map(f => f.trim());
        filterParts.forEach(filterPart => {
          const [column, operator, value] = filterPart.split(/[=.]+/);
          if (operator === 'eq') {
            query = query.eq(column, value);
          } else if (operator === 'neq') {
            query = query.neq(column, value);
          } else if (operator === 'gt') {
            query = query.gt(column, value);
          } else if (operator === 'gte') {
            query = query.gte(column, value);
          } else if (operator === 'lt') {
            query = query.lt(column, value);
          } else if (operator === 'lte') {
            query = query.lte(column, value);
          } else if (operator === 'like') {
            query = query.like(column, value);
          } else if (operator === 'ilike') {
            query = query.ilike(column, value);
          }
        });
      }

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData((result as T[]) || []);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [table, select, filter, orderBy, limit, enabled]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!enabled || subscriptionRef.current) return;

    const channelName = `realtime-query-${queryKey}`;
    const channel = getOrCreateChannel(channelName);

    // Subscribe to all changes for this table
    channel
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter && { filter })
        },
        (payload) => {
          console.log(`Realtime update for ${table}:`, payload);
          
          if (payload.eventType === 'INSERT') {
            const newRecord = payload.new as T;
            setData(current => {
              // Check if record already exists to prevent duplicates
              if (current.some((item: any) => item.id === (newRecord as any).id)) {
                return current;
              }
              
              // Add new record based on sort order
              if (orderBy?.ascending === false) {
                return [newRecord, ...current];
              } else {
                return [...current, newRecord];
              }
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedRecord = payload.new as T;
            setData(current =>
              current.map(item =>
                (item as any).id === (updatedRecord as any).id ? updatedRecord : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedRecord = payload.old as T;
            setData(current =>
              current.filter(item => (item as any).id !== (deletedRecord as any).id)
            );
          }
        }
      )
      .subscribe();

    subscriptionRef.current = true;

    return () => {
      removeChannel(channelName);
      subscriptionRef.current = false;
    };
  }, [enabled, queryKey, table, filter, orderBy, getOrCreateChannel, removeChannel]);

  // Initial fetch and setup realtime
  useEffect(() => {
    fetchData();
    const cleanup = setupRealtimeSubscription();
    
    return cleanup;
  }, [fetchData, setupRealtimeSubscription]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, refetchOnWindowFocus]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};