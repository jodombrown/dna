import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface WaitlistUser {
  id: string;
  email: string;
  full_name: string;
  status: string;
  created_at: string;
}

export const useInviteSystem = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateInviteCode = async (email: string): Promise<string> => {
    const code = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    
    const { error } = await supabase
      .from('invites')
      .insert({
        email,
        code,
        created_by: user?.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });

    if (error) throw error;
    return code;
  };

  const inviteFromWaitlist = async (waitlistUserIds: string[]) => {
    setLoading(true);
    try {
      // Get waitlist users
      const { data: waitlistUsers, error: fetchError } = await supabase
        .from('waitlist_signups')
        .select('*')
        .in('id', waitlistUserIds)
        .eq('status', 'pending');

      if (fetchError) throw fetchError;

      const invitePromises = waitlistUsers.map(async (waitlistUser: WaitlistUser) => {
        // Generate invite code
        const inviteCode = await generateInviteCode(waitlistUser.email);
        
        // Update waitlist status
        await supabase
          .from('waitlist_signups')
          .update({ status: 'invited' })
          .eq('id', waitlistUser.id);

        // Create invite link
        const inviteLink = `${window.location.origin}/invite?ref=${inviteCode}`;
        
        return {
          email: waitlistUser.email,
          name: waitlistUser.full_name,
          inviteLink,
          code: inviteCode
        };
      });

      const invites = await Promise.all(invitePromises);

      toast({
        title: "Invites Generated",
        description: `Successfully created ${invites.length} invites`,
      });

      return invites;
    } catch (error) {
      console.error('Error creating invites:', error);
      toast({
        title: "Error",
        description: "Failed to create invites",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const sendBulkInvites = async (emails: string[]) => {
    setLoading(true);
    try {
      const invitePromises = emails.map(async (email) => {
        const inviteCode = await generateInviteCode(email);
        const inviteLink = `${window.location.origin}/invite?ref=${inviteCode}`;
        
        return {
          email,
          inviteLink,
          code: inviteCode
        };
      });

      const invites = await Promise.all(invitePromises);

      toast({
        title: "Bulk Invites Created",
        description: `Generated ${invites.length} invite links`,
      });

      return invites;
    } catch (error) {
      console.error('Error creating bulk invites:', error);
      toast({
        title: "Error",
        description: "Failed to create bulk invites",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getInviteStats = async () => {
    try {
      const { data: invites, error } = await supabase
        .from('invites')
        .select('used_at, created_at');

      if (error) throw error;

      const total = invites.length;
      const used = invites.filter(invite => invite.used_at).length;
      const pending = total - used;
      const conversionRate = total > 0 ? (used / total) * 100 : 0;

      return {
        total,
        used,
        pending,
        conversionRate: Math.round(conversionRate)
      };
    } catch (error) {
      console.error('Error fetching invite stats:', error);
      return {
        total: 0,
        used: 0,
        pending: 0,
        conversionRate: 0
      };
    }
  };

  return {
    loading,
    inviteFromWaitlist,
    sendBulkInvites,
    getInviteStats,
    generateInviteCode
  };
};