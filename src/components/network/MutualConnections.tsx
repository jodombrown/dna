import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MutualConnection } from '@/types/connections';

interface MutualConnectionsProps {
  profileUserId: string;
  currentUserId: string;
}

const MutualConnections: React.FC<MutualConnectionsProps> = ({
  profileUserId,
  currentUserId,
}) => {
  const navigate = useNavigate();

  const { data: mutualConnections, isLoading } = useQuery({
    queryKey: ['mutual-connections', currentUserId, profileUserId],
    queryFn: async () => {
      if (!currentUserId || !profileUserId || currentUserId === profileUserId) {
        return [];
      }

      const { data, error } = await supabase.rpc('get_mutual_connections', {
        user1_id: currentUserId,
        user2_id: profileUserId,
      });

      if (error) throw error;
      return (data || []) as MutualConnection[];
    },
    enabled: !!currentUserId && !!profileUserId && currentUserId !== profileUserId,
  });

  if (isLoading || !mutualConnections || mutualConnections.length === 0) {
    return null;
  }

  const displayedConnections = mutualConnections.slice(0, 3);
  const remainingCount = Math.max(0, mutualConnections.length - 3);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {mutualConnections.length} mutual {mutualConnections.length === 1 ? 'connection' : 'connections'}
      </span>
      <TooltipProvider>
        <div className="flex -space-x-2">
          {displayedConnections.map((connection) => (
            <Tooltip key={connection.id}>
              <TooltipTrigger asChild>
                <Avatar
                  className="h-8 w-8 border-2 border-background cursor-pointer hover:z-10 transition-all"
                  onClick={() => navigate(`/dna/${connection.username}`)}
                >
                  <AvatarImage src={connection.avatar_url || ''} />
                  <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white text-xs">
                    {getInitials(connection.full_name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="text-sm font-semibold">{connection.full_name}</p>
                  {connection.headline && (
                    <p className="text-xs text-muted-foreground">{connection.headline}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          {remainingCount > 0 && (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border-2 border-background">
              <span className="text-xs font-medium text-muted-foreground">
                +{remainingCount}
              </span>
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MutualConnections;
