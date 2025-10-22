import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ConnectionCardProps {
  connection: {
    id: string;
    full_name: string;
    avatar_url?: string;
    professional_role?: string;
    headline?: string;
    location?: string;
  };
  onMessage?: (userId: string) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection, onMessage }) => {
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
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: connection.id,
      });

      if (error) throw error;
      
      navigate(`/dna/messages/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      });
    }
  };

  return (
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
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dna/profile/${connection.id}`)}
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionCard;
