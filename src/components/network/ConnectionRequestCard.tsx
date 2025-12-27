/**
 * Connection Request Card - Apple News Style
 * Displays incoming connection requests with Accept/Decline actions
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  Users,
  MoreHorizontal,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useMutualConnections } from '@/hooks/useMutualConnections';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConnectionRequestCardProps {
  request: {
    id: string;
    sender?: {
      id?: string;
      username?: string;
      full_name?: string;
      avatar_url?: string;
      professional_role?: string;
      headline?: string;
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
  const { mutualCount, hasMutualConnections } = useMutualConnections(user?.id, request.sender?.id);

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  };

  const timeAgo = request.created_at
    ? formatDistanceToNow(new Date(request.created_at), { addSuffix: false })
    : '';

  const handleViewProfile = () => {
    navigate(`/dna/${request.sender?.username || request.sender?.id}`);
  };

  // Build metadata string
  const getMetadataString = (): string => {
    const parts: string[] = [];
    if (timeAgo) parts.push(timeAgo);
    if (request.sender?.location) parts.push(request.sender.location);
    if (hasMutualConnections) parts.push(`${mutualCount} mutual${mutualCount !== 1 ? 's' : ''}`);
    return parts.join(' · ');
  };

  const metadata = getMetadataString();

  return (
    <Card 
      className="bg-card/60 backdrop-blur-sm border-border/30 overflow-hidden cursor-pointer hover:bg-card/80 transition-colors"
      onClick={handleViewProfile}
    >
      <div className="p-4">
        {/* Apple News style: Two columns - Text left, Image right */}
        <div className="flex gap-3">
          {/* Left column: Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Source badge - role or "New Request" */}
            <Badge 
              variant="secondary" 
              className="w-fit mb-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary border-0"
            >
              {request.sender?.professional_role || 'New Request'}
            </Badge>

            {/* Headline: Name */}
            <h3 className="font-semibold text-base text-foreground leading-tight mb-1 line-clamp-2">
              {request.sender?.full_name}
            </h3>

            {/* Subheadline: Headline */}
            <p className="text-sm text-muted-foreground leading-snug line-clamp-2 mb-2">
              {request.sender?.headline || 'Wants to connect with you'}
            </p>

            {/* Message preview if exists */}
            {request.message && (
              <p className="text-xs text-muted-foreground/80 italic line-clamp-2 mb-2">
                "{request.message}"
              </p>
            )}

            {/* Metadata footer */}
            <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">{metadata || 'Just now'}</span>
            </div>

            {/* Action buttons - Accept/Decline */}
            <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                onClick={() => onAccept(request.id)}
                disabled={isAccepting || isDeclining}
                className="h-8 px-3 bg-primary hover:bg-primary/90"
              >
                {isAccepting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Accept
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline(request.id)}
                disabled={isAccepting || isDeclining}
                className="h-8 px-3"
              >
                {isDeclining ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    Decline
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right column: Square avatar + overflow menu */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Square avatar with rounded corners */}
            <Avatar className="h-20 w-20 rounded-xl">
              <AvatarImage
                src={request.sender?.avatar_url || ''}
                alt={request.sender?.full_name}
                className="object-cover"
                loading="lazy"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold rounded-xl">
                {getInitials(request.sender?.full_name || '')}
              </AvatarFallback>
            </Avatar>

            {/* Overflow menu */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="p-1 rounded-full hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewProfile(); }}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                {hasMutualConnections && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      {mutualCount} mutual connection{mutualCount !== 1 ? 's' : ''}
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConnectionRequestCard;
