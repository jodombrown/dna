import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    queryKey: ['mutual-connections', profileUserId, currentUserId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_mutual_connections', {
        p_user1_id: currentUserId,
        p_user2_id: profileUserId,
      });

      if (error) throw error;
      return data as Array<{
        id: string;
        full_name: string;
        username: string;
        avatar_url: string;
        headline: string;
      }>;
    },
    enabled: !!profileUserId && !!currentUserId && profileUserId !== currentUserId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!mutualConnections || mutualConnections.length === 0) {
    return null;
  }

  const displayedConnections = mutualConnections.slice(0, 3);
  const remainingCount = mutualConnections.length - 3;

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Mutual Connections ({mutualConnections.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {displayedConnections.map((connection) => (
              <Tooltip key={connection.id}>
                <TooltipTrigger asChild>
                  <Avatar
                    className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-[hsl(151,75%,50%)] transition-all"
                    onClick={() => navigate(`/dna/profile/${connection.id}`)}
                  >
                    <AvatarImage src={connection.avatar_url || ''} />
                    <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white text-xs">
                      {getInitials(connection.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{connection.full_name}</p>
                  {connection.headline && (
                    <p className="text-xs text-muted-foreground">{connection.headline}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
          {remainingCount > 0 && (
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              +{remainingCount}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MutualConnections;
