import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EventSocialProofProps {
  eventId: string;
  compact?: boolean;
}

export const EventSocialProof = ({ eventId, compact = false }: EventSocialProofProps) => {
  const { user } = useAuth();

  const { data: socialProof } = useQuery({
    queryKey: ['event-social-proof', eventId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get user's connections
      const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      const connectionIds = connections?.map(c => 
        c.requester_id === user.id ? c.recipient_id : c.requester_id
      ) || [];

      if (connectionIds.length === 0) return { friendsAttending: [], count: 0 };

      // Get attendees who are connections
      const { data: attendees } = await supabase
        .from('event_attendees')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'going')
        .in('user_id', connectionIds);

      if (!attendees || attendees.length === 0) return { friendsAttending: [], count: 0 };

      // Fetch profiles for those attendees
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', attendees.map(a => a.user_id));

      return {
        friendsAttending: profiles || [],
        count: profiles?.length || 0
      };
    },
    enabled: !!user && !!eventId,
  });

  if (!socialProof || socialProof.count === 0) return null;

  if (compact) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {socialProof.count} friend{socialProof.count !== 1 ? 's' : ''} attending
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex -space-x-2">
        {socialProof.friendsAttending.slice(0, 3).map((friend: any) => (
          <Avatar key={friend.id} className="h-6 w-6 border-2 border-background">
            <AvatarImage src={friend.avatar_url} alt={friend.full_name} />
            <AvatarFallback className="text-xs">{friend.full_name?.[0]}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="text-muted-foreground">
        {socialProof.friendsAttending[0]?.full_name}
        {socialProof.count > 1 && ` and ${socialProof.count - 1} other${socialProof.count > 2 ? 's' : ''}`}
        {' '}you know {socialProof.count === 1 ? 'is' : 'are'} attending
      </span>
    </div>
  );
};
