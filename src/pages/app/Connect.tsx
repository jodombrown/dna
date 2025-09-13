import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profilesService } from '@/services/profilesService';
import ConnectSearchFilters from '@/components/connect/ConnectSearchFilters';
import ProfessionalCard from '@/components/connect/ProfessionalCard';
import ConnectHeader from '@/components/connect/ConnectHeader';
import ConnectStats from '@/components/connect/ConnectStats';
import { SmartRecommendations } from '@/components/connect/SmartRecommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectFilters {
  location: string;
  profession: string;
  skills: string[];
  searchQuery: string;
}

const Connect: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ConnectFilters>({
    location: '',
    profession: '',
    skills: [],
    searchQuery: ''
  });

  const { data: professionals, isLoading, error } = useQuery({
    queryKey: ['professionals', filters],
    queryFn: () => profilesService.getPublicProfiles({
      location: filters.location || undefined,
      profession: filters.profession || undefined,
      skills: filters.skills.length > 0 ? filters.skills : undefined,
      limit: 50
    })
  });

  const filteredProfessionals = professionals?.filter(professional => {
    if (!filters.searchQuery) return true;
    const searchLower = filters.searchQuery.toLowerCase();
    return (
      professional.full_name?.toLowerCase().includes(searchLower) ||
      professional.headline?.toLowerCase().includes(searchLower) ||
      professional.bio?.toLowerCase().includes(searchLower) ||
      professional.skills?.some(skill => 
        skill.toLowerCase().includes(searchLower)
      )
    );
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <ConnectHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Section */}
        <ConnectStats totalCount={filteredProfessionals.length} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ConnectSearchFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
            
            {/* Smart Recommendations */}
            {user && (
              <SmartRecommendations
                onConnect={(professionalId) => console.log('Connect with:', professionalId)}
                onMessage={(professionalId, professionalName) => console.log('Message:', professionalName)}
              />
            )}
          </div>
          
          {/* Results Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-4/5"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-destructive mb-2">Connection Error</h3>
                  <p className="text-sm text-muted-foreground">
                    Unable to load professionals. Please try again.
                  </p>
                </CardContent>
              </Card>
            ) : filteredProfessionals.length === 0 ? (
              <Card className="border-dna-emerald/20 bg-dna-emerald/5">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-dna-emerald" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No Professionals Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search filters to discover more diaspora professionals.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>Tips:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Broaden your location search</li>
                      <li>• Try different skill combinations</li>
                      <li>• Clear some filters to see more results</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {filteredProfessionals.length} Professional{filteredProfessionals.length !== 1 ? 's' : ''} Found
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    Showing diaspora professionals worldwide
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProfessionals.map((professional) => (
                    <ProfessionalCard 
                      key={professional.id} 
                      professional={professional as any}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
