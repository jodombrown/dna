import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { ChatThread } from './inbox/ChatThread';
import { useMobile } from '@/hooks/useMobile';
import { messageService } from '@/services/messageService';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  recipientId?: string;
}

/**
 * MessageOverlay - Slide-out messaging panel
 * 
 * Can be triggered from anywhere in the app for quick messaging.
 * Slides in from right (desktop) or full-screen (mobile).
 * Uses the enhanced ChatThread component for consistency.
 */
const MessageOverlay: React.FC<MessageOverlayProps> = ({
  isOpen,
  onClose,
  conversationId,
  recipientId,
}) => {
  const { isMobile } = useMobile();

  // Fetch conversation details to get other user info
  const { data: conversation, isLoading, error } = useQuery({
    queryKey: ['conversation-details', conversationId],
    queryFn: () => messageService.getConversationDetails(conversationId!),
    enabled: !!conversationId && isOpen,
    staleTime: 30000,
    retry: 2,
  });

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Build otherUser object for ChatThread
  const otherUser = conversation ? {
    id: conversation.other_user_id || '',
    username: conversation.other_user_username || 'user',
    full_name: conversation.other_user_full_name || 'Unknown User',
    avatar_url: conversation.other_user_avatar_url || '',
  } : null;

  // Fallback header component for loading/error states
  const FallbackHeader = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <h2 className="font-semibold">{title}</h2>
      <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
        <X className="h-5 w-5" />
      </Button>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Overlay Panel */}
      <div
        className={`fixed z-50 bg-background shadow-2xl animate-slide-in-right ${
          isMobile
            ? 'inset-0'
            : 'top-0 right-0 h-full w-[450px]'
        }`}
      >
        <Card className="h-full border-0 rounded-none flex flex-col overflow-hidden">
          {isLoading ? (
            <>
              <FallbackHeader title="Loading..." />
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            </>
          ) : error ? (
            <>
              <FallbackHeader title="Error" />
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Failed to load conversation</p>
              </div>
            </>
          ) : conversationId && otherUser ? (
            <ChatThread
              conversationId={conversationId}
              otherUser={otherUser}
              isPinned={conversation?.is_pinned ?? false}
              isMuted={conversation?.is_muted ?? false}
              isArchived={conversation?.is_archived ?? false}
              onBack={onClose}
            />
          ) : recipientId ? (
            <>
              <FallbackHeader title="New Message" />
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Starting conversation...</p>
              </div>
            </>
          ) : (
            <>
              <FallbackHeader title="Messages" />
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No conversation selected</p>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default MessageOverlay;
