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
        // Parse and apply filters more robustly
        try {
          const filterParts = filter.split(',').map(f => f.trim()).filter(f => f.length > 0);
          filterParts.forEach(filterPart => {
            // Handle different filter formats more carefully
            if (filterPart.includes('=eq.')) {
              const [column, value] = filterPart.split('=eq.');
              if (column && value !== undefined) {
                query = query.eq(column, value);
              }
            } else if (filterPart.includes('=neq.')) {
              const [column, value] = filterPart.split('=neq.');
              if (column && value !== undefined) {
                query = query.neq(column, value);
              }
            } else if (filterPart.includes('=is.null')) {
              const column = filterPart.replace('=is.null', '');
              if (column) {
                query = query.is(column, null);
              }
            } else if (filterPart.includes('=gt.')) {
              const [column, value] = filterPart.split('=gt.');
              if (column && value !== undefined) {
                query = query.gt(column, value);
              }
            } else if (filterPart.includes('=gte.')) {
              const [column, value] = filterPart.split('=gte.');
              if (column && value !== undefined) {
                query = query.gte(column, value);
              }
            } else if (filterPart.includes('=lt.')) {
              const [column, value] = filterPart.split('=lt.');
              if (column && value !== undefined) {
                query = query.lt(column, value);
              }
            } else if (filterPart.includes('=lte.')) {
              const [column, value] = filterPart.split('=lte.');
              if (column && value !== undefined) {
                query = query.lte(column, value);
              }
            }
          });
        } catch (filterError) {
          console.error(`Error parsing filter "${filter}":`, filterError);
        }
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
    
    try {
      const channel = getOrCreateChannel(channelName);

      // Check if already subscribed to prevent multiple subscriptions
      const existingSubscription = (channel as any)._subscriptions?.find(
        (sub: any) => sub.type === 'postgres_changes'
      );
      
      if (existingSubscription) {
        console.log(`Channel ${channelName} already has subscription, skipping`);
        subscriptionRef.current = true;
        return;
      }

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
        .subscribe((status) => {
          console.log(`Subscription status for ${channelName}:`, status);
        });

      subscriptionRef.current = true;

      return () => {
        console.log(`Cleaning up subscription for ${channelName}`);
        removeChannel(channelName);
        subscriptionRef.current = false;
      };
    } catch (error) {
      console.error(`Error setting up subscription for ${channelName}:`, error);
      return () => {};
    }
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