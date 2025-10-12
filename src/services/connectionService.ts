import { supabase } from '@/integrations/supabase/client';

export const connectionService = {
  // Send a connection request
  async sendConnectionRequest(receiverId: string, message?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if request already exists
    const { data: existing } = await supabase
      .from('connection_requests')
      .select('id, status')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      throw new Error('Connection request already exists');
    }

    const { data, error } = await supabase
      .from('connection_requests')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        status: 'pending',
        message: message || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Accept a connection request
  async acceptConnectionRequest(requestId: string) {
    const { data: request, error: fetchError } = await supabase
      .from('connection_requests')
      .select('sender_id, receiver_id')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    // Update request status
    const { error: updateError } = await supabase
      .from('connection_requests')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Create connection
    const { error: connError } = await supabase
      .from('connections')
      .insert({
        a: request.sender_id,
        b: request.receiver_id,
        status: 'accepted',
      });

    if (connError) throw connError;
  },

  // Reject a connection request
  async rejectConnectionRequest(requestId: string) {
    const { error } = await supabase
      .from('connection_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
  },

  // Get pending connection requests (received)
  async getPendingRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('connection_requests')
      .select('*, sender:profiles!connection_requests_sender_id_fkey(id, full_name, avatar_url, professional_role, location)')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user's connections
  async getConnections() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .or(`a.eq.${user.id},b.eq.${user.id}`)
      .eq('status', 'accepted');

    if (error) throw error;
    
    // Fetch profiles for connected users
    const connectionIds = data.map(conn => 
      conn.a === user.id ? conn.b : conn.a
    );

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, professional_role, location, headline')
      .in('id', connectionIds);

    if (profileError) throw profileError;

    return profiles;
  },

  // Check connection status with a user
  async getConnectionStatus(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check for existing connection
    const { data: connection } = await supabase
      .from('connections')
      .select('*')
      .or(`and(a.eq.${user.id},b.eq.${userId}),and(a.eq.${userId},b.eq.${user.id})`)
      .single();

    if (connection) return { status: 'connected', connectionId: connection.id };

    // Check for pending request
    const { data: request } = await supabase
      .from('connection_requests')
      .select('id, status, sender_id')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
      .single();

    if (request) {
      if (request.sender_id === user.id) {
        return { status: 'pending_sent', requestId: request.id };
      } else {
        return { status: 'pending_received', requestId: request.id };
      }
    }

    return { status: 'none' };
  },
};
