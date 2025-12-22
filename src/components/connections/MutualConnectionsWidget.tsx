/**
 * DNA | CONNECT - Mutual Connections Widget
 *
 * Displays mutual connections between users in three variants:
 * - inline: Text-only link with count (for connection cards)
 * - compact: Avatar stack with count (for profile headers)
 * - full: Card with list preview (for profile sidebars)
 *
 * Implements the CONNECT principle for relationship visibility.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMutualConnections, MutualConnection } from '@/hooks/useMutualConnections';
import { cn } from '@/lib/utils';

interface MutualConnectionsWidgetProps {
  userId: string;
  currentUserId: string;
  variant?: 'inline' | 'compact' | 'full';
  className?: string;
}

/**
 * MutualConnectionsWidget - Display mutual connections between users
 *
 * Shows shared connections with avatars and names.
 * Useful for building trust and discovering common ground.
 */
export const MutualConnectionsWidget: React.FC<MutualConnectionsWidgetProps> = ({
  userId,
  currentUserId,
  variant = 'compact',
  className,
}) => {
  const navigate = useNavigate();
  const {
    mutualConnections,
    mutualCount,
    isLoading,
    hasMutualConnections,
  } = useMutualConnections(currentUserId, userId);

  const getInitials = (name: string) => {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || '?'
    );
  };

  // Loading state
  if (isLoading) {
    if (variant === 'inline') {
      return <Skeleton className="h-4 w-24" />;
    }
    if (variant === 'compact') {
      return <Skeleton className="h-6 w-32" />;
    }
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if no mutual connections
  if (!hasMutualConnections) {
    return null;
  }

  // Inline variant - just text with count
  if (variant === 'inline') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              'text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 transition-colors',
              className
            )}
          >
            <Users className="h-3 w-3" />
            {mutualCount} mutual connection{mutualCount !== 1 ? 's' : ''}
          </button>
        </DialogTrigger>
        <MutualConnectionsDialog
          connections={mutualConnections}
          count={mutualCount}
        />
      </Dialog>
    );
  }

  // Compact variant - avatar stack with count
  if (variant === 'compact') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-2 hover:opacity-80 transition-opacity',
              className
            )}
          >
            {/* Avatar stack */}
            <TooltipProvider>
              <div className="flex -space-x-2">
                {mutualConnections.slice(0, 3).map((connection, index) => (
                  <Tooltip key={connection.user_id}>
                    <TooltipTrigger asChild>
                      <Avatar
                        className="h-6 w-6 border-2 border-background"
                        style={{ zIndex: 3 - index }}
                      >
                        <AvatarImage
                          src={connection.avatar_url || undefined}
                          alt={connection.full_name}
                        />
                        <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                          {getInitials(connection.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{connection.full_name}</p>
                      {connection.headline && (
                        <p className="text-xs text-muted-foreground">
                          {connection.headline}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {mutualCount > 3 && (
                  <div
                    className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium"
                    style={{ zIndex: 0 }}
                  >
                    +{mutualCount - 3}
                  </div>
                )}
              </div>
            </TooltipProvider>
            <span className="text-sm text-muted-foreground">
              {mutualCount} mutual
            </span>
          </button>
        </DialogTrigger>
        <MutualConnectionsDialog
          connections={mutualConnections}
          count={mutualCount}
        />
      </Dialog>
    );
  }

  // Full variant - card with list preview
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="w-4 h-4" />
          {mutualCount} Mutual Connection{mutualCount !== 1 ? 's' : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mutualConnections.slice(0, 3).map((connection) => (
            <div
              key={connection.user_id}
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
              onClick={() => navigate(`/dna/${connection.username}`)}
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage
                  src={connection.avatar_url || undefined}
                  alt={connection.full_name}
                />
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
        </div>

        {mutualCount > 3 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full mt-2">
                View all {mutualCount} mutual connections
              </Button>
            </DialogTrigger>
            <MutualConnectionsDialog
              connections={mutualConnections}
              count={mutualCount}
            />
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

// Dialog component for full list
function MutualConnectionsDialog({
  connections,
  count,
}: {
  connections: MutualConnection[];
  count: number;
}) {
  const navigate = useNavigate();

  return (
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {count} Mutual Connection{count !== 1 ? 's' : ''}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {connections.map((connection) => (
          <div
            key={connection.user_id}
            onClick={() => navigate(`/dna/${connection.username}`)}
            className="flex items-center gap-3 hover:bg-muted rounded-lg p-3 cursor-pointer transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={connection.avatar_url || undefined}
                alt={connection.full_name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {connection.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{connection.full_name}</p>
              {connection.headline && (
                <p className="text-sm text-muted-foreground truncate">
                  {connection.headline}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </DialogContent>
  );
}
