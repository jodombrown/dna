import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageThread } from '@/components/messages/MessageThread';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    if (user && conversationId) {
      loadConversation();
      loadMessages();
      markAsRead();

      // Real-time subscription
      const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages_new',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as any]);
            markAsRead();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, conversationId]);

  const loadConversation = async () => {
    if (!user || !conversationId) return;

    try {
      const { data: participants, error } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            headline
          )
        `)
        .eq('conversation_id', conversationId)
        .neq('user_id', user.id);

      if (error) throw error;

      if (participants && participants.length > 0) {
        const otherUserData = (participants[0] as any).profiles;
        setOtherUser(otherUserData);
      }
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      });
      navigate('/dna/connect/messages');
    }
  };

  const loadMessages = async () => {
    if (!user || !conversationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        p_conversation_id: conversationId,
        p_user_id: user.id,
        p_limit: 100,
        p_before_timestamp: null,
      });

      if (error) throw error;
      setMessages((data || []).reverse());
    } catch (error: any) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!user || !conversationId) return;

    try {
      await supabase.rpc('mark_conversation_read', {
        p_conversation_id: conversationId,
        p_user_id: user.id,
      });
    } catch (error: any) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !conversationId) return;

    try {
      const { error } = await supabase.from('messages_new').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleBlock = async () => {
    if (!otherUser || !user) return;

    try {
      await supabase.rpc('block_user', {
        p_blocked_user_id: otherUser.id,
      });

      toast({
        title: 'User blocked',
        description: `You have blocked ${otherUser.full_name}`,
      });

      navigate('/dna/connect/messages');
    } catch (error: any) {
      console.error('Error blocking user:', error);
      toast({
        title: 'Error',
        description: 'Failed to block user',
        variant: 'destructive',
      });
    }
  };

  const handleReport = async () => {
    if (!conversationId || !user) return;

    try {
      await supabase.from('content_flags').insert({
        content_id: conversationId,
        content_type: 'conversation',
        flagged_by: user.id,
        reason: 'Inappropriate content',
      });

      toast({
        title: 'Conversation reported',
        description: 'Thank you for helping keep DNA safe',
      });
      setShowReportDialog(false);
    } catch (error: any) {
      console.error('Error reporting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to report conversation',
        variant: 'destructive',
      });
    }
  };

  if (!user || !conversationId) return null;

  if (loading || !otherUser) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dna/connect/messages')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Messages
        </Button>
      </div>

      <div className="h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-background">
        <MessageThread
          messages={messages}
          otherUser={otherUser}
          conversationId={conversationId}
          onSendMessage={handleSendMessage}
          onBlock={() => setShowBlockDialog(true)}
          onReport={() => setShowReportDialog(true)}
        />
      </div>

      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {otherUser.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your connection and prevent {otherUser.full_name} from messaging you
              or viewing your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} className="bg-destructive">
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This conversation will be flagged for review by our moderation team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReport}>Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
