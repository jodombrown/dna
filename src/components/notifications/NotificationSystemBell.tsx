/**
 * DNA | NotificationSystemBell
 *
 * Bell icon with badge count for the navigation bar.
 * Clicking opens the NotificationSystemCenter dropdown.
 * Uses the new notification system with Five C's badge counts.
 */

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useNotificationBadgeCounts } from '@/hooks/useNotificationSystem';
import { NotificationSystemCenter } from './NotificationSystemCenter';

export function NotificationSystemBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalUnread } = useNotificationBadgeCounts();

  const hasUnread = totalUnread > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={cn('h-5 w-5', hasUnread && 'text-primary')} />
          {hasUnread && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="end" sideOffset={8}>
        <NotificationSystemCenter
          onClose={() => setIsOpen(false)}
          variant="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
