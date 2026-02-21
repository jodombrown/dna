import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Bookmark, Briefcase } from 'lucide-react';
import { Profile } from '@/services/profilesService';

interface DashboardCenterOpportunitiesProps {
  profile: Profile;
}

const DashboardCenterOpportunities: React.FC<DashboardCenterOpportunitiesProps> = ({ profile }) => {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['feed-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          creator:profiles!opportunities_created_by_fkey(
            id,
            full_name,
            username,
            avatar_url,
            verified
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        return [];
      }
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dna-copper mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Loading opportunities...</p>
        </CardContent>
      </Card>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-lg text-dna-forest mb-2">No opportunities yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Check back soon for new contribution opportunities from the community
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {opportunities.map((opp: any) => (
        <Card key={opp.id} className="hover:shadow-md transition-shadow border-dna-emerald/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              {/* Creator Avatar */}
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={opp.creator?.avatar_url} />
                <AvatarFallback className="bg-dna-copper text-white">
                  {opp.creator?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-dna-forest hover:underline cursor-pointer text-base">
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">
                        {opp.creator?.full_name || 'DNA Member'}
                      </p>
                      {opp.creator?.verified && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-dna-emerald/10 text-dna-forest border-dna-emerald">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hover:bg-dna-emerald/10">
                    <Bookmark className="w-4 h-4 text-dna-copper" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {opp.description || 'No description available'}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                  {opp.type && (
                    <Badge variant="outline" className="text-xs capitalize border-dna-emerald/30 text-dna-forest">
                      {opp.type}
                    </Badge>
                  )}
                  {opp.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {opp.location}
                    </div>
                  )}
                  {opp.time_commitment_hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {opp.time_commitment_hours} hrs/month
                    </div>
                  )}
                  {opp.created_at && (
                    <span className="text-muted-foreground">
                      {new Date(opp.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-dna-copper hover:bg-dna-copper/90 text-white"
                  >
                    Apply Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-dna-emerald text-dna-forest hover:bg-dna-emerald/10"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCenterOpportunities;
