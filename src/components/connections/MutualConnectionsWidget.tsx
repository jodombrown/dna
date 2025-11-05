import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MutualConnection } from '@/types/connections';
import { useNavigate } from 'react-router-dom';

interface MutualConnectionsWidgetProps {
  userId: string;
  currentUserId: string;
}

/**
 * MutualConnectionsWidget - Display mutual connections between users
 * 
 * Shows up to 5 shared connections with avatars and names.
 * Useful for building trust and discovering common ground.
 */
export const MutualConnectionsWidget: React.FC<MutualConnectionsWidgetProps> = ({
  userId,
  currentUserId,
}) => {
  const navigate = useNavigate();

  const { data: mutualConnections, isLoading } = useQuery<MutualConnection[]>({
    queryKey: ['mutual-connections', currentUserId, userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_mutual_connections', {
        user1_id: currentUserId,
        user2_id: userId,
      });

      if (error) {
        console.error('Error fetching mutual connections:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!userId && !!currentUserId && userId !== currentUserId,
  });

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Mutual Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mutualConnections || mutualConnections.length === 0) {
    return null; // Don't show widget if no mutual connections
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          Mutual Connections
          <Badge variant="secondary" className="ml-auto">
            {mutualConnections.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mutualConnections.slice(0, 5).map((connection) => (
            <div
              key={connection.id}
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
              onClick={() => navigate(`/dna/${connection.username}`)}
            >
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={connection.avatar_url} alt={connection.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(connection.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {connection.full_name}
                </p>
                {connection.headline && (
                  <p className="text-xs text-muted-foreground truncate">
                    {connection.headline}
                  </p>
                )}
              </div>
            </div>
          ))}

          {mutualConnections.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{mutualConnections.length - 5} more
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
