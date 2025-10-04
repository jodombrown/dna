import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OpportunityCard from './OpportunityCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { FilterState } from './OpportunityFilters';

interface OpportunityListProps {
  searchQuery?: string;
  filters: FilterState;
}

const OpportunityList: React.FC<OpportunityListProps> = ({ searchQuery = '', filters }) => {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', searchQuery, filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from('opportunities')
        .select(`
          *,
          organization:organizations(id, name, logo_url),
          skills(*),
          causes(*)
        `)
        .eq('status', 'active');

      // Search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Type filter
      if (filters.type.length > 0) {
        query = query.in('type', filters.type);
      }

      // Skills filter (simplified - requires junction table for proper implementation)
      // Causes filter
      if (filters.causes.length > 0) {
        query = query.in('cause_id', filters.causes);
      }

      // Sort
      if (filters.sort === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-80 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {searchQuery ? 'No opportunities found matching your search.' : 'No opportunities available yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ))}
    </div>
  );
};

export default OpportunityList;
