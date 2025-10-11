import React, { useState } from 'react';
import { Profile } from '@/services/profilesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Plus, ArrowRight } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useLiveEvents } from '@/hooks/useLiveEvents';
import { ConnectionRecommendationsWidget } from '@/components/connect/ConnectionRecommendationsWidget';
import { ProfileCompletionWidget } from '@/components/connect/ProfileCompletionWidget';
import { EventRecommendationsWidget } from '@/components/convene/EventRecommendationsWidget';
import { ConnectionRequestModal } from '@/components/connect/ConnectionRequestModal';
import { useToast } from '@/components/ui/use-toast';

interface DashboardRightColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

const DashboardRightColumn: React.FC<DashboardRightColumnProps> = ({
  profile,
  isOwnProfile
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Fetch suggested users (people not yet connected)
  const { data: suggestedUsers = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['suggested-connections', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, headline, avatar_url, verified')
        .neq('id', profile.id)
        .not('onboarding_completed_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching suggestions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Fetch upcoming events
  const { events: upcomingEvents = [], loading: eventsLoading } = useLiveEvents(3);

  const handleConnectClick = (user: any) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSendRequest = async (note: string) => {
    if (!selectedUser || !profile?.id) return;
    
    try {
      const { error } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: profile.id,
          receiver_id: selectedUser.id,
          status: 'pending',
          message: note || null,
        });

      if (error) throw error;

      toast({
        title: 'Connection request sent!',
        description: "You'll be notified when they respond.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['suggested-connections'] });
      
    } catch (error: any) {
      toast({
        title: 'Failed to send request',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Profile Completion Widget */}
      {isOwnProfile && <ProfileCompletionWidget />}
      
      {/* Events Widget */}
      {isOwnProfile && <EventRecommendationsWidget />}
      
      {/* Connection Recommendations Widget */}
      {isOwnProfile && <ConnectionRecommendationsWidget />}

      {/* Upcoming Events */}
      <Card className="transition-all duration-150 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-dna-forest flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-dna-copper" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {eventsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dna-copper mx-auto"></div>
            </div>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event: any) => (
                <div key={event.id} className="p-3 rounded-lg border border-dna-emerald/20 hover:bg-dna-emerald/5 transition-colors cursor-pointer">
                  <h4 className="font-medium text-sm text-dna-forest mb-1">{event.title}</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {event.date_time && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.date_time).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                    {event.location && (
                      <div className="text-xs">{event.location}</div>
                    )}
                    {event.attendee_count !== undefined && (
                      <div className="text-xs text-dna-copper">
                        {event.attendee_count} attending
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-dna-copper hover:bg-dna-emerald/10"
                onClick={() => navigate('/events')}
              >
                View all events
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                No upcoming events
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dna/events')}
              >
                Explore Events
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DNA News / Updates */}
      <Card className="transition-all duration-150 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-dna-forest">DNA Updates</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 text-sm">
            <div className="pb-3 border-b border-border">
              <div className="font-medium text-dna-forest mb-1">Platform Launch</div>
              <p className="text-xs text-muted-foreground">
                Welcome to the DNA Community! Connect with diaspora professionals worldwide.
              </p>
            </div>
            <div className="pb-3 border-b border-border">
              <div className="font-medium text-dna-forest mb-1">New Features</div>
              <p className="text-xs text-muted-foreground">
                Explore collaboration spaces and contribution opportunities.
              </p>
            </div>
            <div>
              <div className="font-medium text-dna-forest mb-1">Community Growth</div>
              <p className="text-xs text-muted-foreground">
                Join a growing network of African diaspora changemakers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Request Modal */}
      <ConnectionRequestModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onSend={handleSendRequest}
        targetUser={selectedUser}
      />
    </div>
  );
};

export default DashboardRightColumn;
