import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Referral, ReferralStats } from '@/types/referralTypes';
import { useToast } from '@/hooks/use-toast';

export const useReferrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReferrals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const converted = data?.filter(r => r.converted_at).length || 0;
      const pending = total - converted;
      const conversion_rate = total > 0 ? (converted / total) * 100 : 0;

      setStats({
        total_referrals: total,
        converted_referrals: converted,
        pending_referrals: pending,
        conversion_rate
      });
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referrals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReferral = async (email: string) => {
    try {
      console.log('Creating referral for:', email);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user profile for referrer info
      console.log('Fetching user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, full_name, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }
      console.log('Profile data:', profile);

      // Generate referral code  
      console.log('Generating referral code...');
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_referral_code');

      if (codeError) {
        console.error('Code generation error:', codeError);
        throw codeError;
      }
      console.log('Generated code:', codeData);

      // Insert referral
      console.log('Inserting referral...');
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referred_email: email,
          referral_code: codeData
        });

      if (error) {
        console.error('Referral insert error:', error);
        throw error;
      }

      // Send invitation email
      const inviteLink = `${window.location.origin}/invite?ref=${codeData}`;
      const referrerName = profile.display_name || profile.full_name || 'A DNA community member';
      
      console.log('Sending invitation email...', {
        inviteLink,
        referrerName,
        email
      });

      try {
        const emailResponse = await supabase.functions.invoke('send-universal-email', {
          body: {
            formType: 'referral',
            userEmail: email,
            formData: {
              referrerName,
              referrerEmail: profile.email,
              referredEmail: email,
              referralCode: codeData,
              inviteLink
            }
          }
        });

        console.log('Email response:', emailResponse);

        if (emailResponse.error) {
          console.error('Email sending error:', emailResponse.error);
          throw emailResponse.error;
        }

        toast({
          title: "Invitation sent!",
          description: `Referral link sent to ${email}`,
        });
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast({
          title: "Referral created",
          description: "Link generated but email delivery failed. You can copy the link manually.",
          variant: "destructive",
        });
      }

      await fetchReferrals();
      return codeData;
    } catch (error) {
      console.error('Error creating referral:', error);
      toast({
        title: "Error",
        description: "Failed to create referral",
        variant: "destructive",
      });
      return null;
    }
  };

  const getReferralLink = (code: string) => {
    return `${window.location.origin}/invite?ref=${code}`;
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  return {
    referrals,
    stats,
    loading,
    createReferral,
    getReferralLink,
    refetch: fetchReferrals
  };
};