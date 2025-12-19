import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DiscoveryCard } from "@/components/discover/DiscoveryCard";
import { DiscoveryFilters } from "@/components/discover/DiscoveryFilters";
import { Search, Filter, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDebounce } from "@/hooks/useDebounce";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("match");
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
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

  const { data: members, isLoading, refetch } = useQuery({
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
    <div className="min-h-screen bg-[hsl(30,10%,98%)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[hsl(30,10%,10%)] mb-2">
            Discover Your Network
          </h1>
          <p className="text-[hsl(30,10%,60%)]">
            Find diaspora professionals and continental partners
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(30,10%,60%)]" />
            <Input
              placeholder="Search by name, headline, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[hsl(30,10%,80%)]"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 border-[hsl(30,10%,80%)]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="recent">Recently Joined</SelectItem>
              <SelectItem value="completion">Profile Completion</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" className="border-[hsl(30,10%,80%)]">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <DiscoveryFilters filters={filters} onFilterChange={setFilters} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar (Desktop) */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <DiscoveryFilters filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Results */}
          <div className="flex-1">
            <p className="text-sm text-[hsl(30,10%,60%)] mb-4">
              {members?.length || 0} members found
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(151,75%,50%)]" />
              </div>
            ) : members && members.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member: any) => (
                    <DiscoveryCard key={member.id} profile={member} />
                  ))}
                </div>

                {members.length === 20 && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={handleLoadMore}
                      variant="outline"
                      className="border-[hsl(151,75%,50%)] text-[hsl(151,75%,30%)] hover:bg-[hsl(151,75%,50%)]/10"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-[hsl(30,10%,60%)] mb-4">
                  No members found matching your criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({
                    focusAreas: [],
                    regionalExpertise: [],
                    industries: [],
                    countryOfOrigin: '',
                    locationCountry: ''
                  })}
                  className="border-[hsl(30,10%,80%)]"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
