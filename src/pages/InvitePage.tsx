import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

const InvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string>('');
  const [validReferral, setValidReferral] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkReferral = async () => {
      const ref = searchParams.get('ref');
      if (!ref) {
        setValidReferral(false);
        setLoading(false);
        return;
      }

      try {
        // Check if referral code exists and get referrer info
        const { data, error } = await supabase
          .from('referrals')
          .select(`
            referral_code,
            converted_at,
            profiles!referrals_referrer_id_fkey(display_name, full_name)
          `)
          .eq('referral_code', ref)
          .single();

        if (error || !data) {
          setValidReferral(false);
        } else if (data.converted_at) {
          // Referral already used
          setValidReferral(false);
          toast({
            title: "Invite already used",
            description: "This invite link has already been used.",
            variant: "destructive",
          });
        } else {
          setValidReferral(true);
          setReferralCode(ref);
          const profile = data.profiles as any;
          setReferrerName(profile?.display_name || profile?.full_name || 'A community member');
        }
      } catch (error) {
        console.error('Error checking referral:', error);
        setValidReferral(false);
      } finally {
        setLoading(false);
      }
    };

    checkReferral();
  }, [searchParams, toast]);

  const handleJoinWithReferral = () => {
    // Store referral code in localStorage to use during signup
    if (referralCode) {
      localStorage.setItem('dna_referral_code', referralCode);
    }
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-16">
        {validReferral ? (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-dna-emerald" />
              </div>
              <h1 className="text-3xl font-bold text-dna-forest">
                You're Invited to DNA!
              </h1>
              <p className="text-lg text-muted-foreground">
                <span className="font-semibold text-dna-forest">{referrerName}</span> has invited you to join the Diaspora Network of Africa
              </p>
            </div>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-dna-emerald" />
                  Welcome to the DNA Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-dna-emerald/5 rounded-lg">
                    <div className="w-8 h-8 bg-dna-emerald/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-4 h-4 text-dna-emerald" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">Connect</h3>
                    <p className="text-xs text-muted-foreground">Build meaningful professional relationships</p>
                  </div>
                  <div className="text-center p-4 bg-dna-forest/5 rounded-lg">
                    <div className="w-8 h-8 bg-dna-forest/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="w-4 h-4 text-dna-forest" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">Collaborate</h3>
                    <p className="text-xs text-muted-foreground">Work together on impactful projects</p>
                  </div>
                  <div className="text-center p-4 bg-dna-copper/5 rounded-lg">
                    <div className="w-8 h-8 bg-dna-copper/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-4 h-4 text-dna-copper" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">Contribute</h3>
                    <p className="text-xs text-muted-foreground">Make a difference across Africa</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">What you'll get:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Early access to the DNA platform</li>
                    <li>• Connect with diaspora professionals globally</li>
                    <li>• Discover and contribute to African impact projects</li>
                    <li>• Access exclusive events and opportunities</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleJoinWithReferral} className="flex-1">
                    Accept Invitation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Badge variant="secondary" className="bg-dna-emerald/10 text-dna-emerald">
                Beta Access • Limited Time
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Invalid Invitation</h1>
              <p className="text-lg text-muted-foreground">
                This invitation link is invalid or has already been used.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <p className="text-muted-foreground">
                  DNA is currently in beta with invite-only access. 
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate('/contact')}>
                    Request Access
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitePage;