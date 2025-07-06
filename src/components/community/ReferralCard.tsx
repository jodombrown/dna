import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, TrendingUp, Share2 } from 'lucide-react';
import { useReferrals } from '@/hooks/useReferrals';
import { useToast } from '@/hooks/use-toast';

const ReferralCard = () => {
  const [email, setEmail] = useState('');
  const { referrals, stats, loading, createReferral, getReferralLink } = useReferrals();
  const { toast } = useToast();

  const handleCreateReferral = async () => {
    if (!email) return;
    
    const code = await createReferral(email);
    if (code) {
      setEmail('');
    }
  };

  const copyReferralLink = async (code: string) => {
    const link = getReferralLink(code);
    await navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "Referral link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Referrals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-dna-emerald" />
          Invite Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-semibold text-dna-forest">{stats.total_referrals}</div>
              <div className="text-xs text-muted-foreground">Invited</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-dna-emerald">{stats.converted_referrals}</div>
              <div className="text-xs text-muted-foreground">Joined</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-dna-copper">{stats.conversion_rate.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Rate</div>
            </div>
          </div>
        )}

        {/* Create new referral */}
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Enter friend's email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-sm"
          />
          <Button 
            onClick={handleCreateReferral}
            disabled={!email}
            className="w-full"
            size="sm"
          >
            Generate Invite Link
          </Button>
        </div>

        {/* Existing referrals */}
        {referrals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Your Referrals</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {referrals.slice(0, 3).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex-1 truncate">
                    <div className="font-medium">{referral.referred_email}</div>
                    <div className="text-muted-foreground">
                      {referral.converted_at ? 'Joined' : 'Pending'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {referral.converted_at ? (
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyReferralLink(referral.referral_code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralCard;
