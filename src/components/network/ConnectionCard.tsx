import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProfileViewTracker } from '@/components/analytics/ProfileViewTracker';
import { messageService } from '@/services/messageService';
import { ConnectionActionsMenu } from '@/components/connections/ConnectionActionsMenu';

interface ConnectionCardProps {
  connection: {
    id: string;
    full_name: string;
    avatar_url?: string;
    professional_role?: string;
    headline?: string;
    location?: string;
    username?: string;
  };
  connectionId?: string; // The ID of the connection record (for removal)
  onMessage?: (userId: string) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, connectionId, onMessage }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  const handleMessage = async () => {
    if (!user) return;
    
    try {
      const conversation = await messageService.getOrCreateConversation(connection.id);
      navigate(`/dna/connect/messages/${conversation.id}`);
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start conversation',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Track connection card view */}
      <ProfileViewTracker profileId={connection.id} viewType="connection_card" />
      
      <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={connection.avatar_url || ''} />
            <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white">
              {getInitials(connection.full_name || '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {connection.full_name}
            </h3>
            {connection.professional_role && (
              <p className="text-sm text-muted-foreground truncate">{connection.professional_role}</p>
            )}
            {connection.headline && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{connection.headline}</p>
            )}
            {connection.location && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {connection.location}
              </Badge>
            )}
            <div className="flex gap-2 mt-3 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dna/${connection.username || `profile/${connection.id}`}`)}
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessage}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              
              {/* Connection Actions Menu */}
              {connectionId && (
                <ConnectionActionsMenu
                  connectionId={connectionId}
                  userId={connection.id}
                  userName={connection.full_name}
                  onMessage={handleMessage}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default ConnectionCard;
