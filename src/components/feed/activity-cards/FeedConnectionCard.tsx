/**
 * Feed Connection Card - Apple News Style
 * Displays connection activity in the feed
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus,
  MoreHorizontal,
  User,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FeedConnectionCardProps {
  activity: Activity;
}

export const FeedConnectionCard: React.FC<FeedConnectionCardProps> = ({ activity }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/dna/${activity.actor_username}`);
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'DN';
  };

  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: false });

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
            {/* Source badge */}
            <Badge 
              variant="secondary" 
              className="w-fit mb-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              New Connection
            </Badge>

            {/* Headline: Name */}
            <h3 className="font-semibold text-base text-foreground leading-tight mb-1 line-clamp-2">
              {activity.actor_full_name}
            </h3>

            {/* Subheadline: Connection message */}
            <p className="text-sm text-muted-foreground leading-snug line-clamp-2 mb-2">
              Is now connected with you
            </p>

            {/* Personal message if exists */}
            {activity.metadata?.message && (
              <p className="text-xs text-muted-foreground/80 italic line-clamp-2 mb-2">
                "{activity.metadata.message}"
              </p>
            )}

            {/* Metadata footer */}
            <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Right column: Square avatar + overflow menu */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Square avatar with rounded corners */}
            <Avatar className="h-20 w-20 rounded-xl">
              <AvatarImage
                src={activity.actor_avatar_url}
                alt={activity.actor_full_name}
                className="object-cover"
                loading="lazy"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold rounded-xl">
                {getInitials(activity.actor_full_name || '')}
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
};
