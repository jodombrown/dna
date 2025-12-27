import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Calendar, Users, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MyContributionsWidgetProps {
  userId: string;
}

export const MyContributionsWidget: React.FC<MyContributionsWidgetProps> = ({ userId }) => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['contribution-stats', userId],
    queryFn: async () => {
      // Fetch contribution-related stats using direct queries
      const { count: paymentsCount } = await supabase
        .from('contribution_cards')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId);

      const { count: spacesCount } = await supabase
        .from('collaboration_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'approved');

      const { count: eventsCount } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'going');

      return {
        totalPayments: paymentsCount || 0,
        activeSpaces: spacesCount || 0,
        eventsAttended: eventsCount || 0,
      };
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="h-8 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasContributions = stats && (
    stats.totalPayments > 0 || 
    stats.activeSpaces > 0 || 
    stats.eventsAttended > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>My Contributions</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dna/contribute')}
            className="text-dna-copper hover:text-dna-copper/80"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasContributions ? (
          <div className="text-center py-8">
            <div className="mb-4 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">Start making an impact</p>
              <p className="text-sm">Support projects, join initiatives, and contribute to the community</p>
            </div>
            <Button onClick={() => navigate('/dna/contribute')} variant="outline">
              Find Opportunities
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/dna/contribute')}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-dna-copper/10 rounded-lg">
                  <Gift className="h-5 w-5 text-dna-copper" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                  <p className="text-xs text-muted-foreground">Financial Contributions</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/dna/convene/groups')}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-dna-forest/10 rounded-lg">
                  <Users className="h-5 w-5 text-dna-forest" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeSpaces}</p>
                  <p className="text-xs text-muted-foreground">Active Projects</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/dna/convene/events')}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-dna-emerald/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-dna-emerald" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.eventsAttended}</p>
                  <p className="text-xs text-muted-foreground">Events Attended</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
