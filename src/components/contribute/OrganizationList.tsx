import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import OrganizationCard from './OrganizationCard';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationListProps {
  searchQuery?: string;
}

const OrganizationList: React.FC<OrganizationListProps> = ({ searchQuery = '' }) => {
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {searchQuery ? 'No organizations found matching your search.' : 'No organizations registered yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <OrganizationCard key={org.id} organization={org} />
      ))}
    </div>
  );
};

export default OrganizationList;
