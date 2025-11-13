import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ConversationList } from '@/components/messages/ConversationList';
import { NewMessageDialog } from '@/components/messages/NewMessageDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageCirclePlus } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();

      const channel = supabase
        .channel('conversations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages_new' }, () => {
          loadConversations();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_user_conversations', {
        p_user_id: user.id,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Messages</CardTitle>
          <Button onClick={() => setShowNewMessage(true)} size="sm">
            <MessageCirclePlus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ConversationList conversations={conversations} currentUserId={user.id} />
          )}
        </CardContent>
      </Card>

      <NewMessageDialog isOpen={showNewMessage} onClose={() => setShowNewMessage(false)} />
    </div>
  );
}
