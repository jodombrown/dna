import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DiscoveryCard } from "@/components/discover/DiscoveryCard";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Profile } from '@/services/profilesService';

interface DashboardDiscoverColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export default function DashboardDiscoverColumn({ profile, isOwnProfile }: DashboardDiscoverColumnProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [page, setPage] = useState(0);
  const [filters] = useState({
    focusAreas: [] as string[],
    regionalExpertise: [] as string[],
    industries: [] as string[],
    countryOfOrigin: '',
    locationCountry: ''
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return user;
    }
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ['discover', filters, debouncedSearch, sortBy, page],
    queryFn: async () => {
      if (!currentUser) return [];

      const { data, error } = await supabase.rpc('discover_members', {
        p_current_user_id: currentUser.id,
        p_focus_areas: filters.focusAreas.length > 0 ? filters.focusAreas : null,
        p_regional_expertise: filters.regionalExpertise.length > 0 ? filters.regionalExpertise : null,
        p_industries: filters.industries.length > 0 ? filters.industries : null,
        p_country_of_origin: filters.countryOfOrigin || null,
        p_location_country: filters.locationCountry || null,
        p_search_query: debouncedSearch || null,
        p_sort_by: sortBy,
        p_limit: 20,
        p_offset: page * 20
      });

      if (error) throw error;
      return data;
    },
    enabled: !!currentUser
  });

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Discover Your Network
        </h2>
        <p className="text-sm text-muted-foreground">
          Find diaspora professionals and continental partners
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, headline, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="match">Best Match</SelectItem>
            <SelectItem value="recent">Recently Joined</SelectItem>
            <SelectItem value="completion">Profile Completion</SelectItem>
            <SelectItem value="alphabetical">A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {members?.length || 0} members found
      </p>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : members && members.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {members.map((member: any) => (
              <DiscoveryCard key={member.id} profile={member} />
            ))}
          </div>

          {members.length === 20 && (
            <div className="flex justify-center">
              <Button 
                onClick={handleLoadMore}
                variant="outline"
              >
                Load More
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No members found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
