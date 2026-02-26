/**
 * DNA | CONVENE — Mutual Attendees Display
 * Shows "Amara and 2 others you know are going" on event cards.
 */

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMutualAttendees } from '@/hooks/useMutualAttendees';

interface MutualAttendeesLineProps {
  eventId: string;
}

export function MutualAttendeesLine({ eventId }: MutualAttendeesLineProps) {
  const { data: attendees = [] } = useMutualAttendees(eventId);

  if (attendees.length === 0) return null;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const renderNames = () => {
    if (attendees.length === 1) {
      return <><span className="font-medium">{attendees[0].full_name}</span> is going</>;
    }
    if (attendees.length === 2) {
      return <><span className="font-medium">{attendees[0].full_name.split(' ')[0]}</span> and <span className="font-medium">{attendees[1].full_name.split(' ')[0]}</span> are going</>;
    }
    const others = attendees.length - 2;
    return <><span className="font-medium">{attendees[0].full_name.split(' ')[0]}</span>, <span className="font-medium">{attendees[1].full_name.split(' ')[0]}</span>, and <span className="font-medium">{others} other{others > 1 ? 's' : ''}</span> you know are going</>;
  };

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <div className="flex -space-x-1.5">
        {attendees.slice(0, 2).map(a => (
          <Avatar key={a.user_id} className="h-5 w-5 border border-background">
            <AvatarImage src={a.avatar_url || undefined} alt={a.full_name} />
            <AvatarFallback className="text-[8px] bg-muted">{getInitials(a.full_name)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{renderNames()}</span>
    </div>
  );
}
