import React, { createContext, useContext, useState, ReactNode } from 'react';
import MessageOverlay from '@/components/messaging/MessageOverlay';
import { messagingService } from '@/services/messagingService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MessageContextType {
  openMessageOverlay: (recipientId: string) => void;
  closeMessageOverlay: () => void;
  isOverlayOpen: boolean;
  currentRecipientId?: string;
  currentConversationId?: string;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

/**
 * MessageProvider - Global messaging context
 * 
 * Enables messaging from anywhere in the app by managing the overlay state.
 * Automatically creates or finds conversations when messaging users.
 * 
 * Usage:
 * ```tsx
 * const { openMessageOverlay } = useMessage();
 * <Button onClick={() => openMessageOverlay(userId)}>Message</Button>
 * ```
 */
export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentRecipientId, setCurrentRecipientId] = useState<string | undefined>();
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();

  const openMessageOverlay = async (recipientId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to send messages',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get or create conversation with this user
      const conversation = await messagingService.getOrCreateConversation(recipientId);
      
      setCurrentRecipientId(recipientId);
      setCurrentConversationId(conversation.id);
      setIsOverlayOpen(true);
    } catch (error: any) {
      console.error('Failed to open conversation:', error);
      
      // Handle connection requirement error
      if (error?.message?.includes('must be connected')) {
        toast({
          title: 'Connection Required',
          description: 'You must be connected to message this member. Send them a connection request first.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to start conversation',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    }
  };

  const closeMessageOverlay = () => {
    setIsOverlayOpen(false);
    // Keep IDs for a moment to allow smooth close animation
    setTimeout(() => {
      setCurrentRecipientId(undefined);
      setCurrentConversationId(undefined);
    }, 300);
  };

  return (
    <MessageContext.Provider
      value={{
        openMessageOverlay,
        closeMessageOverlay,
        isOverlayOpen,
        currentRecipientId,
        currentConversationId,
      }}
    >
      {children}
      
      {/* Global Message Overlay */}
      {isOverlayOpen && (
        <MessageOverlay
          isOpen={isOverlayOpen}
          onClose={closeMessageOverlay}
          conversationId={currentConversationId}
          recipientId={currentRecipientId}
        />
      )}
    </MessageContext.Provider>
  );
};
