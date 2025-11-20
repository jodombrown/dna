import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CreateLeadSection() {
  const navigate = useNavigate();

  // Check if user has any activity
  const { data: userActivity } = useQuery({
    queryKey: ['user-activity-check'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check for upcoming events (hosting or attending)
      const { count: eventCount } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'going');

      const { count: hostingCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organizer_id', user.id)
        .gte('start_time', new Date().toISOString());

      // Check for group memberships
      const { count: groupCount } = await supabase
        .from('community_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      return {
        hasEvents: (eventCount || 0) > 0,
        isHosting: (hostingCount || 0) > 0,
        inGroups: (groupCount || 0) > 0,
        totalActivity: (eventCount || 0) + (hostingCount || 0) + (groupCount || 0)
      };
    }
  });

  // Only show if user has zero activity
  if (!userActivity || userActivity.totalActivity > 0) {
    return null;
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-dna-emerald/5 to-dna-forest/5 border-dna-emerald/20">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-dna-emerald/10 rounded-full p-4">
            <Lightbulb className="w-8 h-8 text-dna-emerald" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">
            See a Gap? Lead the Way
          </h3>
          <p className="text-muted-foreground text-lg">
            The most powerful convenings happen when someone decides to step up and create the space we need. 
            That someone could be you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card className="p-4 text-left border-border/50 hover:border-dna-emerald/30 transition-colors">
            <MapPin className="w-5 h-5 text-dna-emerald mb-2" />
            <h4 className="font-semibold mb-1">Host a Local Gathering</h4>
            <p className="text-sm text-muted-foreground mb-3">
              No events in your city? Be the first to bring your community together.
            </p>
          </Card>

          <Card className="p-4 text-left border-border/50 hover:border-dna-emerald/30 transition-colors">
            <Plus className="w-5 h-5 text-dna-emerald mb-2" />
            <h4 className="font-semibold mb-1">Start Something New</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Have expertise to share? Create a workshop or webinar for the network.
            </p>
          </Card>
        </div>

        <div className="flex gap-3 justify-center pt-4">
          <Button 
            onClick={() => navigate('/dna/convene/events/new')}
            size="lg"
            className="bg-dna-emerald hover:bg-dna-forest"
          >
            <Plus className="w-4 h-4 mr-2" />
            Host Your First Event
          </Button>
          <Button 
            onClick={() => navigate('/dna/convene/groups')}
            variant="outline"
            size="lg"
          >
            Browse Communities
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          "The work will not save us. The work is the love made public." - Toni Morrison
        </p>
      </div>
    </Card>
  );
}
