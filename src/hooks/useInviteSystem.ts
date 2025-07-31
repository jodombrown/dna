import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

interface Invite {
  id: string;
  email: string;
  role?: string;
  code: string;
  created_at: string;
  expires_at?: string;
  used_at?: string;
  created_by?: string;
}

interface InviteFormData {
  email: string;
  role?: string;
}

export const useInviteSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { canSendInvite, getInviteLimit, isAdmin } = useRoleBasedAccess();
  
  const [sentInvites, setSentInvites] = useState<Invite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate a random invite code
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Load invites
  const loadInvites = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load sent invites
      const { data: sent, error: sentError } = await supabase
        .from('invites')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;
      setSentInvites(sent || []);

      // Load received invites
      const { data: received, error: receivedError } = await supabase
        .from('invites')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;
      setReceivedInvites(received || []);

    } catch (error) {
      console.error('Error loading invites:', error);
      toast({
        title: "Error loading invites",
        description: "Failed to load your invitations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (email: string, role?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to send invites",
        variant: "destructive"
      });
      return false;
    }

    // Check invite limits for non-admin users
    if (!canSendInvite(sentInvites.length)) {
      const limit = getInviteLimit();
      toast({
        title: "Invite limit reached",
        description: `You can only send ${limit} invites. Contact an administrator for more invitations.`,
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      const inviteCode = generateInviteCode();
      
      const { data, error } = await supabase
        .from('invites')
        .insert({
          email: email.trim().toLowerCase(),
          role: role || 'user',
          code: inviteCode,
          created_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single();

      if (error) throw error;

      // Add to sent invites
      setSentInvites(prev => [data, ...prev]);

      toast({
        title: "Invite sent successfully",
        description: `Invitation sent to ${email}`,
      });

      // TODO: Send email notification
      
      return true;
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast({
        title: "Failed to send invite",
        description: error.message || "An error occurred while sending the invitation",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (inviteCode: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to accept invites",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      // Mark invite as used
      const { error } = await supabase
        .from('invites')
        .update({ 
          used_at: new Date().toISOString() 
        })
        .eq('code', inviteCode)
        .eq('email', user.email)
        .is('used_at', null);

      if (error) throw error;

      toast({
        title: "Invite accepted",
        description: "Welcome to the platform!",
      });

      await loadInvites();
      return true;
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      toast({
        title: "Failed to accept invite",
        description: error.message || "An error occurred while accepting the invitation",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshInvites = () => {
    loadInvites();
  };

  useEffect(() => {
    loadInvites();
  }, [user]);

  const inviteLimit = getInviteLimit();
  const remainingInvites = isAdmin ? null : Math.max(0, 5 - sentInvites.length);

  return {
    sentInvites,
    receivedInvites,
    sendInvite,
    acceptInvite,
    loading,
    refreshInvites,
    inviteLimit,
    remainingInvites,
    canSendMoreInvites: canSendInvite(sentInvites.length)
  };
};