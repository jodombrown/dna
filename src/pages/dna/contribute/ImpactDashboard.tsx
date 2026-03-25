import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { contributeApplicationService } from '@/services/contributeApplicationService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AcknowledgmentCard } from '@/components/contribute/AcknowledgmentCard';
import { ArrowLeft, TrendingUp, Users, Clock, Brain, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

function ImpactScoreRing({ score }: { score: number }) {
  const maxScore = 1000;
  const pct = Math.min((score / maxScore) * 100, 100);
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="90" cy="90" r={r} fill="none"
          stroke="#4A8D77" strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          className="transition-all duration-1000 ease-out"
        />
        <text x="90" y="85" textAnchor="middle" className="fill-foreground text-3xl font-bold" fontSize="32">{score}</text>
        <text x="90" y="108" textAnchor="middle" className="fill-muted-foreground" fontSize="12">Impact Score</text>
      </svg>
    </div>
  );
}

function ImpactCategoryGrid({ stats }: { stats: { skills: number; time: number; knowledge: number; connections: number } }) {
  const categories = [
    { label: 'Skills Given', count: stats.skills, icon: Zap, color: '#B87333' },
    { label: 'Time Contributed', count: stats.time, icon: Clock, color: '#B87333' },
    { label: 'Knowledge Shared', count: stats.knowledge, icon: Brain, color: '#B87333' },
    { label: 'Connections Made', count: stats.connections, icon: Users, color: '#B87333' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map(cat => {
        const Icon = cat.icon;
        return (
          <Card key={cat.label} className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4" style={{ color: cat.color }} />
              <span className="text-xs text-muted-foreground">{cat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{cat.count}</p>
          </Card>
        );
      })}
    </div>
  );
}

export default function ImpactDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: score } = useQuery({
    queryKey: ['impact-score', user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc('calculate_impact_score', { target_user_id: user!.id });
      return (data as number) || 0;
    },
    enabled: !!user,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['contribution-history', user?.id],
    queryFn: () => contributeApplicationService.getProfileContributionHistory(user!.id, 'all'),
    enabled: !!user,
  });

  const { data: acks = [] } = useQuery({
    queryKey: ['profile-acks', user?.id],
    queryFn: () => contributeApplicationService.getProfileAcknowledgments(user!.id),
    enabled: !!user,
  });

  // Build chart data from history
  const chartData = (() => {
    const months: Record<string, { given: number; received: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      months[key] = { given: 0, received: 0 };
    }
    history.forEach(h => {
      if (!h.completed_at) return;
      const key = new Date(h.completed_at).toLocaleDateString('en-US', { month: 'short' });
      if (months[key]) {
        if (h.contributor_id === user?.id) months[key].given++;
        else months[key].received++;
      }
    });
    return Object.entries(months).map(([month, data]) => ({ month, ...data }));
  })();

  const categoryStats = {
    skills: history.filter(h => h.contributor_id === user?.id).length,
    time: 0,
    knowledge: 0,
    connections: 0,
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-bottom-nav md:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dna/contribute')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Contribute
        </Button>

        <h1 className="text-2xl font-bold text-foreground">Your Impact</h1>

        <ImpactScoreRing score={score || 0} />
        <ImpactCategoryGrid stats={categoryStats} />

        {/* Bar Chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Contribution Activity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="given" fill="#4A8D77" name="Given" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" fill="#B87333" name="Received" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contribution History */}
        <Card>
          <CardHeader><CardTitle className="text-base">Contribution History</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-3 w-full max-w-xs">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="given">Given</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
              </TabsList>
              {['all', 'given', 'received'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  {history.filter(h => tab === 'all' || (tab === 'given' ? h.contributor_id === user?.id : h.poster_id === user?.id)).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No contributions yet</p>
                  ) : (
                    <div className="space-y-3 mt-3">
                      {history.filter(h => tab === 'all' || (tab === 'given' ? h.contributor_id === user?.id : h.poster_id === user?.id)).map(h => (
                        <div key={h.id} className="p-3 border border-border rounded-lg">
                          <p className="text-sm font-medium">{h.opportunity_title}</p>
                          <p className="text-xs text-muted-foreground">
                            {h.contributor_id === user?.id ? `For ${h.poster_name}` : `By ${h.contributor_name}`}
                            {h.completed_at && ` -- ${new Date(h.completed_at).toLocaleDateString()}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Acknowledgments */}
        {acks.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Acknowledgments Received</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {acks.map(ack => <AcknowledgmentCard key={ack.id} acknowledgment={ack} />)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
