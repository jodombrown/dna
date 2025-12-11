import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EmptyInboxProps {
  type: 'no-conversations' | 'no-selection';
}

export const EmptyInbox: React.FC<EmptyInboxProps> = ({ type }) => {
  const navigate = useNavigate();

  if (type === 'no-conversations') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          Start connecting with people in the diaspora network. Your conversations will appear here.
        </p>
        <Button onClick={() => navigate('/dna/connect/discover')}>
          Discover People
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
        <MessageCircle className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        Choose a conversation from the list to start messaging.
      </p>
    </div>
  );
};
