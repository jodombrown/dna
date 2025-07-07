import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Trophy, Gift, Award, TrendingUp } from 'lucide-react';

interface ReferralData {
  id: string;
  referrer_id: string;
  referred_email: string;
  referral_code: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
  referrer?: {
    full_name: string;
    email: string;
  };
}

interface TopReferrer {
  user_id: string;
  user_name: string;
  user_email: string;
  total_referrals: number;
  converted_referrals: number;
  conversion_rate: number;
}

export function ReferralAnalyticsModule() {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReferrer, setSelectedReferrer] = useState<string | null>(null);
  const [rewardAmount, setRewardAmount] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      // Fetch all referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;
      setReferrals(referralsData as any || []);

      // Calculate top referrers
      const referrerStats = new Map();
      referralsData?.forEach((referral) => {
        const referrerId = referral.referrer_id;
        if (!referrerStats.has(referrerId)) {
          referrerStats.set(referrerId, {
            user_id: referrerId,
            user_name: 'User',
            user_email: 'user@example.com',
            total_referrals: 0,
            converted_referrals: 0,
          });
        }
        
        const stats = referrerStats.get(referrerId);
        stats.total_referrals += 1;
        if (referral.converted_at) {
          stats.converted_referrals += 1;
        }
      });

      const topReferrersData = Array.from(referrerStats.values())
        .map((stats) => ({
          ...stats,
          conversion_rate: stats.total_referrals > 0 
            ? (stats.converted_referrals / stats.total_referrals) * 100 
            : 0,
        }))
        .sort((a, b) => b.total_referrals - a.total_referrals)
        .slice(0, 10);

      setTopReferrers(topReferrersData);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setManualReward = async () => {
    if (!selectedReferrer || !rewardAmount) {
      toast({
        title: "Error",
        description: "Please select a referrer and enter reward amount",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, you would create a rewards/credits system
      // For now, we'll just log this action
      await supabase.from('admin_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'set_referral_reward',
        resource_type: 'referral',
        resource_id: selectedReferrer,
        details: {
          reward_amount: parseFloat(rewardAmount),
          reward_type: 'manual',
        },
      });

      toast({
        title: "Success",
        description: `Reward of $${rewardAmount} set for referrer`,
      });

      setSelectedReferrer(null);
      setRewardAmount('');
    } catch (error) {
      console.error('Error setting reward:', error);
      toast({
        title: "Error",
        description: "Failed to set reward",
        variant: "destructive",
      });
    }
  };

  const totalReferrals = referrals.length;
  const convertedReferrals = referrals.filter(r => r.converted_at).length;
  const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">Loading referral analytics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <p className="text-xs text-muted-foreground">All time referrals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertedReferrals}</div>
            <p className="text-xs text-muted-foreground">Successful conversions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Referrer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topReferrers.length > 0 ? topReferrers[0].total_referrals : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {topReferrers.length > 0 ? topReferrers[0].user_name : 'No referrers yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Performing Referrers
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Set Reward
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Manual Referral Reward</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="referrer">Select Referrer</Label>
                    <select
                      id="referrer"
                      className="w-full p-2 border rounded-md"
                      value={selectedReferrer || ''}
                      onChange={(e) => setSelectedReferrer(e.target.value)}
                    >
                      <option value="">Choose a referrer...</option>
                      {topReferrers.map((referrer) => (
                        <option key={referrer.user_id} value={referrer.user_id}>
                          {referrer.user_name} ({referrer.total_referrals} referrals)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Reward Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                    />
                  </div>
                  <Button onClick={setManualReward} className="w-full">
                    Set Reward
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Referrals</TableHead>
                <TableHead>Converted</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topReferrers.map((referrer, index) => (
                <TableRow key={referrer.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                      {index === 1 && <Award className="h-4 w-4 text-gray-400" />}
                      {index === 2 && <Award className="h-4 w-4 text-amber-600" />}
                      #{index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{referrer.user_name}</TableCell>
                  <TableCell>{referrer.user_email}</TableCell>
                  <TableCell>{referrer.total_referrals}</TableCell>
                  <TableCell>{referrer.converted_referrals}</TableCell>
                  <TableCell>{referrer.conversion_rate.toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge 
                      variant={referrer.conversion_rate > 50 ? "default" : "secondary"}
                      className={
                        referrer.conversion_rate > 70 ? "bg-green-100 text-green-800" :
                        referrer.conversion_rate > 50 ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {referrer.conversion_rate > 70 ? "Excellent" :
                       referrer.conversion_rate > 50 ? "Good" :
                       referrer.conversion_rate > 20 ? "Average" : "Needs Help"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {topReferrers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No referral data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred Email</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.slice(0, 10).map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{referral.referrer?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{referral.referrer?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{referral.referred_email}</TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {referral.referral_code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={referral.converted_at ? "default" : "secondary"}
                      className={referral.converted_at ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {referral.converted_at ? "Converted" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(referral.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {referrals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No referrals found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}