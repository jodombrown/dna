import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OpportunityCard from './OpportunityCard';
import { Skeleton } from '@/components/ui/skeleton';

interface OpportunityListProps {
  searchQuery?: string;
}

const OpportunityList: React.FC<OpportunityListProps> = ({ searchQuery = '' }) => {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          organization:organizations(id, name, logo_url),
          skills(*),
          causes(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
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
