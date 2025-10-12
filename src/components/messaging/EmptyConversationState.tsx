import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmptyConversationStateProps {
  message?: string;
}

/**
 * EmptyConversationState - Placeholder when no conversation is selected
 */
const EmptyConversationState: React.FC<EmptyConversationStateProps> = ({
  message = 'Select a conversation to start chatting',
}) => {
  return (
    <Card className="h-full flex items-center justify-center border-dashed">
      <div className="text-center text-muted-foreground max-w-sm px-6">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">{message}</p>
        <p className="text-sm">
          Your messages will appear here when you select a conversation
        </p>
      </div>
    </Card>
  );
};

export default EmptyConversationState;
