
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';

interface MessageNotificationsProps {
  className?: string;
}

const MessageNotifications: React.FC<MessageNotificationsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { messages } = useMessages();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const unread = messages.filter(msg => 
      !msg.is_read && msg.recipient_id === user.id
    ).length;
    
    setUnreadCount(unread);
  }, [messages, user]);

  if (!user || unreadCount === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-5 h-5 text-gray-600" />
      <Badge 
        variant="secondary" 
        className="absolute -top-2 -right-2 bg-dna-copper text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full"
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
    </div>
  );
};

export default MessageNotifications;
