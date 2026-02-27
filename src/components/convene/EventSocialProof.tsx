/**
 * DNA | CONVENE — Event Social Proof
 * Shows attendee avatars with connection priority: "Sarah, Marcus, and 12 others are going"
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { useMutualAttendees } from '@/hooks/useMutualAttendees';

interface AttendeeProfile {
  id: string;
  username: string | null;
  full_name: string;
  avatar_url: string | null;
}

interface EventSocialProofProps {
  eventId: string;
  attendees: AttendeeProfile[];
  totalCount: number;
}

export function EventSocialProof({ eventId, attendees, totalCount }: EventSocialProofProps) {
  const navigate = useNavigate();
  const { data: mutualAttendees = [] } = useMutualAttendees(eventId);

  if (totalCount === 0 && mutualAttendees.length === 0) return null;

  // Prioritize connections first, then fill with other attendees
  const connectionIds = new Set(mutualAttendees.map(m => m.user_id));
  const prioritized: AttendeeProfile[] = [
    ...mutualAttendees.map(m => ({
      id: m.user_id,
      username: null,
      full_name: m.full_name,
      avatar_url: m.avatar_url,
    })),
    ...attendees.filter(a => !connectionIds.has(a.id)),
  ].slice(0, 3);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const renderText = () => {
    const names = prioritized.map(p => p.full_name.split(' ')[0]);
    const remaining = totalCount - prioritized.length;

    if (mutualAttendees.length > 0) {
      const connectionNames = mutualAttendees.slice(0, 2).map(m => m.full_name.split(' ')[0]);
      if (mutualAttendees.length === 1 && remaining <= 0) {
        return <><span className="font-medium">{connectionNames[0]}</span> from your network is going</>;
      }
      if (remaining > 0) {
        return <><span className="font-medium">{connectionNames.join(', ')}</span> and <span className="font-medium">{remaining} other{remaining > 1 ? 's' : ''}</span> are going</>;
      }
      return <><span className="font-medium">{connectionNames.join(' and ')}</span> are going</>;
    }

    if (totalCount === 1 && names[0]) {
      return <><span className="font-medium">{names[0]}</span> is going</>;
    }
    if (totalCount <= 3) {
      return <><span className="font-medium">{names.join(', ')}</span> are going</>;
    }
    return <><span className="font-medium">{names.slice(0, 2).join(', ')}</span> and <span className="font-medium">{remaining} others</span> are going</>;
  };

  return (
    <div className="flex items-center gap-2 py-3">
      <div className="flex -space-x-2">
        {prioritized.map(p => (
          <Avatar
            key={p.id}
            className="h-7 w-7 border-2 border-background cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
            onClick={() => p.username && navigate(`/dna/${p.username}`)}
          >
            <AvatarImage src={p.avatar_url || undefined} alt={p.full_name} />
            <AvatarFallback className="text-[9px] bg-muted">{getInitials(p.full_name)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{renderText()}</span>
    </div>
  );
}
