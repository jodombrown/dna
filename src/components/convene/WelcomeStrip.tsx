import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Users, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';

interface StatsData {
  eventsCount: number;
  groupsCount: number;
}

export const WelcomeStrip = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const composer = useUniversalComposer();

  const { data: profile } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, first_name')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery<StatsData>({
    queryKey: ['convene-stats', user?.id],
    queryFn: async (): Promise<StatsData> => {
      if (!user) return { eventsCount: 0, groupsCount: 0 };
      
      const now = new Date().toISOString();
      
      try {
        const hostingRes = await supabase
          .from('events')
          .select('id', { count: 'exact' })
          .eq('organizer_id', user.id)
          .eq('is_cancelled', false)
          .gte('start_time', now);

        const attendingRes = await supabase
          .from('event_attendees')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        const groupsRes = await supabase
          .from('group_members')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        const eventsCount = (hostingRes.count || 0) + (attendingRes.count || 0);
        const groupsCount = groupsRes.count || 0;

        return { eventsCount, groupsCount };
      } catch (error) {
        return { eventsCount: 0, groupsCount: 0 };
      }
    },
    enabled: !!user,
  });

  const firstName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'there';

  return (
    <>
      <Card className="p-6 border-dna-emerald/20 bg-gradient-to-r from-background to-dna-emerald/5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Welcome back, {firstName}
            </h2>
            <p className="text-muted-foreground">
              {stats?.eventsCount === 0 && stats?.groupsCount === 0 ? (
                "You haven't joined any events or communities yet. Start by exploring what's happening."
              ) : (
                <>
                  You're part of <span className="font-semibold text-foreground">{stats?.eventsCount || 0}</span> {stats?.eventsCount === 1 ? 'event' : 'events'} 
                  {' '}and <span className="font-semibold text-foreground">{stats?.groupsCount || 0}</span> {stats?.groupsCount === 1 ? 'community' : 'communities'} this month.
                </>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => composer.open('event')}
              className="bg-dna-emerald hover:bg-dna-forest"
            >
              <Plus className="mr-2 h-4 w-4" />
              Host an Event
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dna/convene/events')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Browse Events
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dna/convene/groups')}
            >
              <Users className="mr-2 h-4 w-4" />
              Browse Groups
            </Button>
          </div>
        </div>
      </Card>
      <UniversalComposer
        isOpen={composer.isOpen}
        mode={composer.mode}
        context={composer.context}
        isSubmitting={composer.isSubmitting}
        onClose={composer.close}
        onModeChange={composer.switchMode}
        successData={composer.successData}
        onSubmit={composer.submit}
        onDismissSuccess={composer.dismissSuccess}
      />
    </>
  );
};
