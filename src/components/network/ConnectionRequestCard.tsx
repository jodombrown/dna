import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Loader2, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useMutualConnections } from '@/hooks/useMutualConnections';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionRequestCardProps {
  request: {
    id: string;
    sender?: {
      id?: string;
      full_name?: string;
      avatar_url?: string;
      professional_role?: string;
      location?: string;
    };
    message?: string;
    created_at?: string;
  };
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
}

const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({
  request,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutualConnections, mutualCount, isLoading: mutualLoading } = useMutualConnections(user?.id, request.sender?.id);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  const timeAgo = request.created_at
    ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true })
    : '';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={request.sender?.avatar_url || ''} />
            <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white">
              {getInitials(request.sender?.full_name || '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {request.sender?.full_name}
                </h3>
                {request.sender?.professional_role && (
                  <p className="text-sm text-muted-foreground">{request.sender.professional_role}</p>
                )}
              </div>
              {timeAgo && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {timeAgo}
                </div>
              )}
            </div>
            {request.sender?.location && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {request.sender.location}
              </Badge>
            )}
            {mutualConnections && mutualConnections.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-dna-copper" />
                <span>
                  {mutualConnections.length} mutual connection{mutualConnections.length !== 1 ? 's' : ''}
                  {mutualConnections.length <= 3 && (
                    <span className="ml-1">
                      ({mutualConnections.map(c => c.full_name).join(', ')})
                    </span>
                  )}
                </span>
              </div>
            )}
            {request.message && (
              <div className="mt-3 p-3 bg-muted rounded-md border-l-4 border-[hsl(30,65%,55%)]">
                <p className="text-sm italic text-foreground">"{request.message}"</p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => onAccept(request.id)}
                disabled={isAccepting || isDeclining}
                className="bg-[hsl(151,75%,50%)] text-white hover:bg-[hsl(151,75%,40%)]"
              >
                {isAccepting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline(request.id)}
                disabled={isAccepting || isDeclining}
              >
                {isDeclining ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Decline
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(`/dna/profile/${request.sender?.id}`)}
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionRequestCard;
