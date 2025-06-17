
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  updated_at: string;
}

export const useConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendConnectionRequest = async (recipientId: string, message?: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipientId,
          status: 'pending' as const,
          message: message || undefined
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setConnections(prev => [...prev, data as Connection]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send connection request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const respondToConnection = async (connectionId: string, status: 'accepted' | 'declined') => {
    if (!user) throw new Error('User must be authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId)
        .eq('recipient_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setConnections(prev => 
        prev.map(conn => conn.id === connectionId ? data as Connection : conn)
      );
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to connection');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getConnections = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setConnections((data || []) as Connection[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = (userId: string): string | null => {
    if (!user) return null;
    
    const connection = connections.find(
      conn => 
        (conn.requester_id === user.id && conn.recipient_id === userId) ||
        (conn.recipient_id === user.id && conn.requester_id === userId)
    );
    
    return connection?.status || null;
  };

  useEffect(() => {
    if (user) {
      getConnections();
    }
  }, [user]);

  return {
    connections,
    loading,
    error,
    sendConnectionRequest,
    respondToConnection,
    getConnections,
    checkConnectionStatus
  };
};
