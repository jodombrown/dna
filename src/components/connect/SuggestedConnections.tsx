import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Briefcase, ArrowRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SuggestedConnectionsProps {
  userId: string;
  limit?: number;
}

export const SuggestedConnections: React.FC<SuggestedConnectionsProps> = ({ 
  userId, 
  limit = 5 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggested-connections', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('discover_members', {
        p_current_user_id: userId,
        p_focus_areas: null,
        p_regional_expertise: null,
        p_industries: null,
        p_country_of_origin: null,
        p_location_country: null,
        p_search_query: null,
        p_sort_by: 'match',
        p_limit: limit,
        p_offset: 0
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const handleConnect = async (recipientId: string, recipientName: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: userId,
          recipient_id: recipientId,
          status: 'pending',
          message: `Hi ${recipientName}, I'd like to connect with you on DNA!`
        });

      if (error) throw error;

      toast({
        title: 'Connection request sent',
        description: `Your request to ${recipientName} has been sent.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send connection request',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-2" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hassuggestions = suggestions && suggestions.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Suggested Connections</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dna/connect/discover')}
            className="text-dna-copper hover:text-dna-copper/80"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hassuggestions ? (
          <div className="text-center py-8">
            <div className="mb-4 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">No suggestions yet</p>
              <p className="text-sm">Complete your profile to get personalized connection suggestions</p>
            </div>
            <Button onClick={() => navigate('/dna/connect/discover')} variant="outline">
              Discover Members
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.slice(0, limit).map((member: any) => (
              <div
                key={member.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-dna-copper/20">
                  <AvatarImage src={member.avatar_url} alt={member.full_name} />
                  <AvatarFallback className="bg-dna-copper/10 text-dna-copper">
                    {member.full_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate mb-0.5">
                    {member.full_name}
                  </h4>
                  {member.headline && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {member.headline}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {member.focus_areas?.slice(0, 2).map((area: string) => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {member.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {member.location}
                      </span>
                    )}
                    {member.profession && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {member.profession}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleConnect(member.id, member.full_name)}
                    className="text-xs h-7"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/dna/${member.username}`)}
                    className="text-xs h-7"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
