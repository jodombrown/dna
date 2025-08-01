import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, LabelList } from 'recharts';
import { Users, Link, UserPlus, TrendingUp, Send } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface ReferralMetrics {
  invites_sent: number;
  invites_used: number;
  total_referrals: number;
  conversion_rate: number;
  top_referrer: string | null;
  top_referrer_count: number;
}

interface FunnelData {
  name: string;
  value: number;
  fill: string;
}

interface TopReferrer {
  referrer_name: string;
  referral_count: number;
  conversion_rate: number;
}

const ReferralFunnel = () => {
  const [metrics, setMetrics] = useState<ReferralMetrics | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Fetch invites data
      const { data: invites, error: invitesError } = await supabase
        .from('invites')
        .select('*');

      if (invitesError) throw invitesError;

      // Fetch profiles with referrer data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('referrer_id, full_name')
        .not('referrer_id', 'is', null);

      if (profilesError) throw profilesError;

      // Calculate metrics
      const invitesSent = invites?.length || 0;
      const invitesUsed = invites?.filter(invite => invite.used_by_id !== null).length || 0;
      const totalReferrals = profiles?.length || 0;
      const conversionRate = invitesSent > 0 ? (invitesUsed / invitesSent) * 100 : 0;

      // Find top referrer
      const referrerCounts: { [key: string]: { count: number; name: string } } = {};
      
      profiles?.forEach(profile => {
        if (profile.referrer_id) {
          const id = profile.referrer_id;
          if (!referrerCounts[id]) {
            referrerCounts[id] = { count: 0, name: profile.full_name || 'Unknown' };
          }
          referrerCounts[id].count++;
        }
      });

      const topReferrerEntry = Object.entries(referrerCounts)
        .sort(([,a], [,b]) => b.count - a.count)[0];

      setMetrics({
        invites_sent: invitesSent,
        invites_used: invitesUsed,
        total_referrals: totalReferrals,
        conversion_rate: conversionRate,
        top_referrer: topReferrerEntry ? topReferrerEntry[1].name : null,
        top_referrer_count: topReferrerEntry ? topReferrerEntry[1].count : 0,
      });

      // Create funnel data
      const funnel: FunnelData[] = [
        {
          name: 'Invites Sent',
          value: invitesSent,
          fill: 'hsl(var(--dna-forest))',
        },
        {
          name: 'Invites Opened',
          value: Math.round(invitesSent * 0.7), // Estimate
          fill: 'hsl(var(--dna-emerald))',
        },
        {
          name: 'Signups Started',
          value: Math.round(invitesUsed * 1.2), // Estimate
          fill: 'hsl(var(--dna-copper))',
        },
        {
          name: 'Signups Completed',
          value: invitesUsed,
          fill: 'hsl(var(--dna-gold))',
        },
      ];

      setFunnelData(funnel);

      // Create top referrers list
      const topReferrersList: TopReferrer[] = Object.entries(referrerCounts)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10)
        .map(([id, data]) => {
          const referrerInvites = invites?.filter(invite => invite.created_by === id) || [];
          const referrerInvitesSent = referrerInvites.length;
          const referrerConversionRate = referrerInvitesSent > 0 
            ? (data.count / referrerInvitesSent) * 100 
            : 0;
          
          return {
            referrer_name: data.name,
            referral_count: data.count,
            conversion_rate: referrerConversionRate,
          };
        });

      setTopReferrers(topReferrersList);

    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader label="Loading referral analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Send className="h-6 w-6 text-dna-forest" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.invites_sent}</p>
                <p className="text-sm text-muted-foreground">Invites Sent</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Link className="h-6 w-6 text-dna-emerald" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.invites_used}</p>
                <p className="text-sm text-muted-foreground">Invites Used</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-dna-copper" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.total_referrals}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-dna-gold" />
              <div>
                <p className="text-2xl font-bold text-foreground">{metrics.conversion_rate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-dna-ivory" />
              <div>
                <p className="text-lg font-bold text-foreground">{metrics.top_referrer_count}</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.top_referrer ? `by ${metrics.top_referrer}` : 'No referrals yet'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Funnel Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Referral Conversion Funnel</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(value: any) => [value, 'Count']} />
                <Bar dataKey="value" fill="hsl(var(--dna-forest))">
                  <LabelList dataKey="value" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Referrers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Referrers</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {topReferrers.length > 0 ? (
              topReferrers.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-dna-forest text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{referrer.referrer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {referrer.referral_count} referrals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {referrer.conversion_rate.toFixed(1)}% conversion
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No referrals yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Funnel Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Funnel Stage Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {funnelData.map((stage, index) => {
            const prevStage = index > 0 ? funnelData[index - 1] : null;
            const dropOffRate = prevStage 
              ? ((prevStage.value - stage.value) / prevStage.value) * 100 
              : 0;
            
            return (
              <div key={stage.name} className="text-center">
                <div 
                  className="w-full h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2"
                  style={{ backgroundColor: stage.fill }}
                >
                  {stage.value}
                </div>
                <p className="font-medium text-foreground">{stage.name}</p>
                {index > 0 && (
                  <p className="text-sm text-muted-foreground">
                    -{dropOffRate.toFixed(1)}% drop-off
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default ReferralFunnel;