import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationList } from './NotificationList';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, notifications } = useNotifications(false);

  // Calculate actual unread from loaded notifications to ensure consistency
  const actualUnreadInList = notifications?.filter(n => !n.is_read).length ?? 0;
  // Use the higher of RPC count or list count - ensures we don't show 0 when there are unread
  const displayCount = Math.max(unreadCount ?? 0, actualUnreadInList);
  
  // Only show count when greater than 0
  const hasUnread = displayCount > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={cn('h-5 w-5', hasUnread && 'text-primary')} />
          {hasUnread && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
              {displayCount > 99 ? '99+' : displayCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <NotificationList onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
