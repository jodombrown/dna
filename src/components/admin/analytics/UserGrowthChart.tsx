import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, UserPlus, Link } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface UserGrowthData {
  date: string;
  total_signups: number;
  referral_signups: number;
  direct_signups: number;
}

interface GrowthMetrics {
  total_users: number;
  this_week: number;
  last_week: number;
  total_referrals: number;
  referral_rate: number;
}

const UserGrowthChart = () => {
  const [growthData, setGrowthData] = useState<UserGrowthData[]>([]);
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserGrowthData();
  }, []);

  const fetchUserGrowthData = async () => {
    try {
      setLoading(true);
      
      // Fetch daily signups for last 90 days
      const { data: dailySignups, error: signupsError } = await supabase
        .from('profiles')
        .select('created_at, referrer_id')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      if (signupsError) throw signupsError;

      // Process data into daily buckets
      const dailyData: { [key: string]: { total: number; referral: number } } = {};
      
      dailySignups?.forEach(profile => {
        const date = new Date(profile.created_at).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { total: 0, referral: 0 };
        }
        dailyData[date].total++;
        if (profile.referrer_id) {
          dailyData[date].referral++;
        }
      });

      // Convert to chart format
      const chartData: UserGrowthData[] = Object.entries(dailyData).map(([date, data]) => ({
        date,
        total_signups: data.total,
        referral_signups: data.referral,
        direct_signups: data.total - data.referral,
      }));

      setGrowthData(chartData);

      // Calculate metrics
      const totalUsers = dailySignups?.length || 0;
      const totalReferrals = dailySignups?.filter(p => p.referrer_id).length || 0;
      const thisWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const lastWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      
      const thisWeek = dailySignups?.filter(p => new Date(p.created_at) >= thisWeekStart).length || 0;
      const lastWeek = dailySignups?.filter(p => {
        const date = new Date(p.created_at);
        return date >= lastWeekStart && date < thisWeekStart;
      }).length || 0;

      setMetrics({
        total_users: totalUsers,
        this_week: thisWeek,
        last_week: lastWeek,
        total_referrals: totalReferrals,
        referral_rate: totalUsers > 0 ? (totalReferrals / totalUsers) * 100 : 0,
      });

    } catch (error) {
      console.error('Error fetching user growth data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader label="Loading user growth analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-dna-forest" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.total_users}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-dna-emerald" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.this_week}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
                {metrics.last_week > 0 && (
                  <Badge variant={metrics.this_week >= metrics.last_week ? "default" : "secondary"}>
                    {metrics.this_week >= metrics.last_week ? '+' : ''}
                    {((metrics.this_week - metrics.last_week) / metrics.last_week * 100).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Link className="h-6 w-6 text-dna-copper" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.total_referrals}</p>
                <p className="text-sm text-muted-foreground">Referral Signups</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-dna-gold" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.referral_rate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Referral Rate</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Growth Chart */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">User Signups Over Time (Last 90 Days)</h3>
        <div className="h-64 sm:h-80 overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%" minWidth={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: string) => [value, name.replace('_', ' ')]}
              />
              <Line 
                type="monotone" 
                dataKey="total_signups" 
                stroke="hsl(var(--dna-forest))" 
                strokeWidth={2}
                name="Total Signups"
              />
              <Line 
                type="monotone" 
                dataKey="referral_signups" 
                stroke="hsl(var(--dna-copper))" 
                strokeWidth={2}
                name="Referral Signups"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Referral vs Direct Comparison */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Signup Sources Comparison</h3>
        <div className="h-64 sm:h-80 overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%" minWidth={300}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any, name: string) => [value, name.replace('_', ' ')]}
              />
              <Bar dataKey="direct_signups" stackId="a" fill="hsl(var(--dna-emerald))" name="Direct Signups" />
              <Bar dataKey="referral_signups" stackId="a" fill="hsl(var(--dna-copper))" name="Referral Signups" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default UserGrowthChart;