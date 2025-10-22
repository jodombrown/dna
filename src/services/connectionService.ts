import { supabase } from '@/integrations/supabase/client';
import { ConnectionStatus, Connection, ConnectionRequest, ConnectionProfile } from '@/types/connections';

export const connectionService = {
  async sendConnectionRequest(receiverId: string, message?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check for existing connection
    const { data: existing } = await supabase
      .from('connections')
      .select('id, status')
      .or(`and(requester_id.eq.${user.id},recipient_id.eq.${receiverId}),and(requester_id.eq.${receiverId},recipient_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'pending') {
        throw new Error('Connection request already pending');
      } else if (existing.status === 'accepted') {
        throw new Error('Already connected');
      } else if (existing.status === 'declined') {
        throw new Error('Previous connection request was declined');
      }
    }

    const { data, error } = await supabase
      .from('connections')
      .insert({
        requester_id: user.id,
        recipient_id: receiverId,
        status: 'pending',
        message: message?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Connection request error:', error);
      if (error.code === '23505') {
        throw new Error('Connection request already exists');
      } else if (error.code === '42501') {
        throw new Error('Permission denied. Please ensure you are logged in.');
      } else if (error.code === '23503') {
        throw new Error('User not found');
      }
      throw new Error(error.message || 'Failed to send connection request');
    }
    
    return data;
  },

  async acceptConnectionRequest(connectionId: string) {
    const { data, error } = await supabase
      .from('connections')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', connectionId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async rejectConnectionRequest(connectionId: string) {
    const { data, error } = await supabase
      .from('connections')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', connectionId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPendingRequests(): Promise<ConnectionRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase.rpc('get_connection_requests', {
      user_id: user.id,
    });

    if (error) throw error;
    
    // Map the RPC response to match ConnectionRequest interface
    return (data || []).map((item: any) => ({
      connection_id: item.connection_id,
      id: item.requester_id,
      requester_id: item.requester_id,
      username: item.username,
      full_name: item.full_name,
      avatar_url: item.avatar_url,
      headline: item.headline,
      location: item.location,
      professional_role: item.heritage_status, // Map heritage_status if needed
      message: item.message,
      created_at: item.created_at,
    })) as ConnectionRequest[];
  },

  async getConnections(searchQuery?: string): Promise<ConnectionProfile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase.rpc('get_user_connections', {
      user_id: user.id,
      search_query: searchQuery || null,
      limit_count: 50,
      offset_count: 0,
    });

    if (error) throw error;
    return (data || []) as ConnectionProfile[];
  },

  async getConnectionStatus(userId: string): Promise<ConnectionStatus> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'none';

    const { data, error } = await supabase.rpc('get_connection_status', {
      user1_id: user.id,
      user2_id: userId,
    });

    if (error) {
      console.error('Error getting connection status:', error);
      return 'none';
    }

    return (data as ConnectionStatus) || 'none';
  },
};
