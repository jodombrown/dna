
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { useContactRequests } from '@/hooks/useContactRequests';
import { useAuth } from '@/contexts/CleanAuthContext';

interface MessagingNotificationsProps {
  className?: string;
}

const MessagingNotifications: React.FC<MessagingNotificationsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { conversations } = useConversations();
  const { getPendingRequestsCount } = useContactRequests();

  if (!user) return null;

  const unreadMessagesCount = conversations.reduce((total, conv) => {
    return total + (conv.unread_count || 0);
  }, 0);

  const pendingRequestsCount = getPendingRequestsCount();
  const totalNotifications = unreadMessagesCount + pendingRequestsCount;

  if (totalNotifications === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <MessageSquare className="w-5 h-5 text-gray-600" />
      <Badge 
        variant="secondary" 
        className="absolute -top-2 -right-2 bg-dna-copper text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full"
      >
        {totalNotifications > 99 ? '99+' : totalNotifications}
      </Badge>
    </div>
  );
};

export default MessagingNotifications;
