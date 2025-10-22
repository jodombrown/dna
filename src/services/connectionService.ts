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
      .single();

    if (existing) {
      throw new Error('Connection already exists');
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

    if (error) throw error;
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
    return (data || []) as ConnectionRequest[];
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
