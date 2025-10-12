import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ConversationThread from './ConversationThread';
import { useMobile } from '@/hooks/useMobile';

interface MessageOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  recipientId?: string; // For starting new conversation
}

/**
 * MessageOverlay - Slide-out messaging panel
 * 
 * Can be triggered from anywhere in the app for quick messaging.
 * Slides in from right (desktop) or full-screen (mobile).
 * 
 * Features:
 * - Semi-transparent backdrop
 * - Click backdrop to close
 * - Escape key to close
 * - Maintains conversation state when view changes
 */
const MessageOverlay: React.FC<MessageOverlayProps> = ({
  isOpen,
  onClose,
  conversationId,
  recipientId,
}) => {
  const { isMobile } = useMobile();

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
        <Card className="h-full border-0 rounded-none flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-card">
            <h2 className="font-semibold text-lg">Message</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Conversation Thread */}
          <div className="flex-1 overflow-hidden">
            {conversationId ? (
              <ConversationThread
                conversationId={conversationId}
                onClose={onClose}
                isOverlay
              />
            ) : recipientId ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Starting conversation with user {recipientId}...</p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No conversation selected</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default MessageOverlay;
