import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnifiedHeader from '@/components/UnifiedHeader';
import { Activity, TrendingUp, Target, Zap } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const PILLAR_COLORS: Record<string, string> = {
  DASHBOARD_HOME: '#8B5CF6',
  CONNECT_MODE: '#3B82F6',
  CONVENE_MODE: '#A855F7',
  COLLABORATE_MODE: '#10B981',
  CONTRIBUTE_MODE: '#F97316',
  CONVEY_MODE: '#EC4899',
  MESSAGES_MODE: '#6366F1',
};

export default function ADAInsights() {
  const [dateRange] = useState({ start: 30, end: 0 }); // Last 30 days

  // View state distribution
  const { data: viewStateData } = useQuery({
    queryKey: ['ada-view-states', dateRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange.start);
      
      const { data, error } = await supabase.rpc('get_view_state_distribution', {
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        name: item.view_state?.replace('_MODE', '').replace('_', ' ') || 'Unknown',
        value: parseInt(item.count),
        color: PILLAR_COLORS[item.view_state] || '#94A3B8',
      }));
    },
  });

  // Top cross-5C transitions
  const { data: transitionsData } = useQuery({
    queryKey: ['ada-transitions', dateRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange.start);
      
      const { data, error } = await supabase.rpc('get_top_cross_transitions', {
        p_limit: 10,
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        from: item.from_pillar?.charAt(0).toUpperCase() + item.from_pillar?.slice(1) || 'Unknown',
        to: item.to_pillar?.charAt(0).toUpperCase() + item.to_pillar?.slice(1) || 'Unknown',
        count: parseInt(item.count),
        transition: `${item.from_pillar} → ${item.to_pillar}`,
      }));
    },
  });

  // Engine loop metrics
  const { data: loopMetrics } = useQuery({
    queryKey: ['ada-loop-metrics', dateRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange.start);
      
      const { data, error } = await supabase.rpc('get_engine_loop_metrics', {
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      });

      if (error) throw error;
      return data;
    },
  });

  // Top entities by type
  const { data: topEvents } = useQuery({
    queryKey: ['ada-top-events', dateRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange.start);
      
      const { data, error } = await supabase.rpc('get_top_transition_entities', {
        p_entity_type: 'event',
        p_limit: 5,
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: topSpaces } = useQuery({
    queryKey: ['ada-top-spaces', dateRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange.start);
      
      const { data, error } = await supabase.rpc('get_top_transition_entities', {
        p_entity_type: 'space',
        p_limit: 5,
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      <div className="container mx-auto pt-20 pb-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            ADA Engine Insights
          </h1>
          <p className="text-muted-foreground mt-2">
            Measure how users move across the 5Cs and engage with the mobilization engine
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transitions">Transitions</TabsTrigger>
            <TabsTrigger value="entities">Top Entities</TabsTrigger>
            <TabsTrigger value="loops">Engine Loops</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* View State Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    View State Distribution
                  </CardTitle>
                  <CardDescription>
                    How users spend time across different sections (last 30 days)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewStateData && viewStateData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={viewStateData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {viewStateData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">No data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Engine Health Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Engine Health
                  </CardTitle>
                  <CardDescription>
                    Key engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loopMetrics && typeof loopMetrics === 'object' && (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-sm font-medium">Total Active Users</span>
                        <span className="text-2xl font-bold">{(loopMetrics as any).total_users || 0}</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Event → Space Join</span>
                            <span className="font-semibold">{(loopMetrics as any).event_to_space?.percentage || 0}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(loopMetrics as any).event_to_space?.percentage || 0}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Space → Need Posted</span>
                            <span className="font-semibold">{(loopMetrics as any).space_to_need?.percentage || 0}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(loopMetrics as any).space_to_need?.percentage || 0}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Need Engagement</span>
                            <span className="font-semibold">{(loopMetrics as any).need_to_contribution?.percentage || 0}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(loopMetrics as any).need_to_contribution?.percentage || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transitions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Cross-5C Transitions</CardTitle>
                <CardDescription>
                  Most common journeys users take across the 5 pillars
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transitionsData && transitionsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={transitionsData.slice(0, 10)}>
                      <XAxis dataKey="transition" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8B5CF6" name="Transitions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No transition data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entities" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Top Events Driving Transitions
                  </CardTitle>
                  <CardDescription>
                    Events that led to the most cross-pillar activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topEvents && topEvents.length > 0 ? (
                    <div className="space-y-3">
                      {topEvents.map((event: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center pb-2 border-b last:border-0">
                          <span className="text-sm font-medium truncate">Event ID: {event.entity_id?.slice(0, 8)}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold">{event.transition_count}</div>
                            <div className="text-xs text-muted-foreground">→ {event.to_pillar}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-6">No event data</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Top Spaces Driving Transitions
                  </CardTitle>
                  <CardDescription>
                    Spaces that generated the most engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {topSpaces && topSpaces.length > 0 ? (
                    <div className="space-y-3">
                      {topSpaces.map((space: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center pb-2 border-b last:border-0">
                          <span className="text-sm font-medium truncate">Space ID: {space.entity_id?.slice(0, 8)}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold">{space.transition_count}</div>
                            <div className="text-xs text-muted-foreground">→ {space.to_pillar}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-6">No space data</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loops" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Engine Loop Completion</CardTitle>
                <CardDescription>
                  Percentage of users completing key mobilization journeys
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loopMetrics && typeof loopMetrics === 'object' ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Event → Space</div>
                        <div className="text-3xl font-bold text-primary">
                          {(loopMetrics as any).event_to_space?.percentage || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {(loopMetrics as any).event_to_space?.count || 0} users
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Space → Need</div>
                        <div className="text-3xl font-bold text-primary">
                          {(loopMetrics as any).space_to_need?.percentage || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {(loopMetrics as any).space_to_need?.count || 0} users
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Need Engagement</div>
                        <div className="text-3xl font-bold text-primary">
                          {(loopMetrics as any).need_to_contribution?.percentage || 0}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {(loopMetrics as any).need_to_contribution?.count || 0} users
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Analysis Period</h4>
                      <p className="text-sm text-muted-foreground">
                        Based on {(loopMetrics as any).total_users || 0} active users in the last 30 days
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">Loading metrics...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
