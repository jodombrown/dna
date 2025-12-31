/**
 * StoryAuthorCard - Reusable author component for stories
 *
 * Displays author info with clickable avatar/name linking to profile,
 * plus a "Connect" button for non-connected users.
 *
 * Used in: Story cards, story detail pages, author attribution
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserPlus, Check, Clock, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { connectionService } from '@/services/connectionService';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { ConnectionRequestModal } from '@/components/connect/ConnectionRequestModal';

export interface StoryAuthor {
  id: string;
  username?: string;
  full_name: string;
  avatar_url?: string | null;
  headline?: string | null;
  story_count?: number;
}

interface StoryAuthorCardProps {
  author: StoryAuthor;
  /** Display variant */
  variant?: 'default' | 'compact' | 'inline';
  /** Show story count */
  showStoryCount?: boolean;
  /** Additional class name */
  className?: string;
  /** Timestamp to display */
  timestamp?: string;
  /** Whether to show connection button */
  showConnectButton?: boolean;
}

export function StoryAuthorCard({
  author,
  variant = 'default',
  showStoryCount = false,
  className,
  timestamp,
  showConnectButton = true,
}: StoryAuthorCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  const { data: connectionStatus, isLoading: isLoadingStatus } = useConnectionStatus(author.id);

  const isOwnProfile = user?.id === author.id;
  const showConnect = showConnectButton && !isOwnProfile && connectionStatus === 'none';
  const isPending = connectionStatus === 'pending_sent';
  const isConnected = connectionStatus === 'accepted';

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DN';
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const profilePath = author.username ? `/dna/${author.username}` : `/dna/profile/${author.id}`;
    navigate(profilePath);
  };

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleSendRequest = async (message: string) => {
    setIsSending(true);
    try {
      await connectionService.sendConnectionRequest(author.id, message);
      queryClient.invalidateQueries({ queryKey: ['connection-status', author.id] });
      toast({
        title: 'Connection request sent',
        description: `Request sent to ${author.full_name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send connection request',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  // Compact variant - just avatar and name, click navigates
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-2", className)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar
                className="h-7 w-7 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={handleProfileClick}
              >
                <AvatarImage src={author.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(author.full_name)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>View {author.full_name}'s profile</p>
            </TooltipContent>
          </Tooltip>

          <span
            className="text-sm font-medium truncate cursor-pointer hover:text-primary hover:underline transition-colors"
            onClick={handleProfileClick}
          >
            {author.full_name}
          </span>

          {/* Compact connect icon button */}
          {showConnect && !isLoadingStatus && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1 hover:bg-primary/10"
                  onClick={handleConnectClick}
                >
                  <UserPlus className="h-3.5 w-3.5 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Connect with {author.full_name}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {isPending && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Clock className="h-3.5 w-3.5 text-muted-foreground ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Connection request pending</p>
              </TooltipContent>
            </Tooltip>
          )}

          {isConnected && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Check className="h-3.5 w-3.5 text-green-600 ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Connected</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <ConnectionRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSend={handleSendRequest}
          targetUser={{
            full_name: author.full_name,
            headline: author.headline || undefined,
          }}
        />
      </TooltipProvider>
    );
  }

  // Inline variant - minimal, for use within text
  if (variant === 'inline') {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors",
          className
        )}
        onClick={handleProfileClick}
      >
        <Avatar className="h-5 w-5">
          <AvatarImage src={author.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
            {getInitials(author.full_name)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium hover:underline">{author.full_name}</span>
      </span>
    );
  }

  // Default variant - full author card
  return (
    <>
      <div className={cn(
        "flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50",
        "hover:bg-muted/50 transition-colors",
        className
      )}>
        <Avatar
          className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          onClick={handleProfileClick}
        >
          <AvatarImage src={author.avatar_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(author.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4
                className="font-semibold text-sm cursor-pointer hover:text-primary hover:underline transition-colors truncate"
                onClick={handleProfileClick}
              >
                {author.full_name}
              </h4>
              {author.headline && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {author.headline}
                </p>
              )}
              {timestamp && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {timestamp}
                </p>
              )}
            </div>

            {/* Connection button area */}
            <div className="flex-shrink-0">
              {isLoadingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : showConnect ? (
                <Button
                  size="sm"
                  onClick={handleConnectClick}
                  className="h-8 text-xs bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Connect
                </Button>
              ) : isPending ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="h-8 text-xs"
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" />
                  Pending
                </Button>
              ) : isConnected ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                  className="h-8 text-xs text-green-600 border-green-600/50"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Connected
                </Button>
              ) : null}
            </div>
          </div>

          {/* Story count */}
          {showStoryCount && author.story_count !== undefined && author.story_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <FileText className="h-3 w-3" />
              <span>{author.story_count} {author.story_count === 1 ? 'story' : 'stories'}</span>
            </div>
          )}
        </div>
      </div>

      <ConnectionRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendRequest}
        targetUser={{
          full_name: author.full_name,
          headline: author.headline || undefined,
        }}
      />
    </>
  );
}

/**
 * Compact connect button for story cards (hover state)
 */
export function StoryConnectButton({
  authorId,
  authorName,
  authorHeadline,
  className,
}: {
  authorId: string;
  authorName: string;
  authorHeadline?: string;
  className?: string;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: connectionStatus, isLoading } = useConnectionStatus(authorId);

  const isOwnProfile = user?.id === authorId;
  const showConnect = !isOwnProfile && connectionStatus === 'none';

  const handleSendRequest = async (message: string) => {
    try {
      await connectionService.sendConnectionRequest(authorId, message);
      queryClient.invalidateQueries({ queryKey: ['connection-status', authorId] });
      toast({
        title: 'Connection request sent',
        description: `Request sent to ${authorName}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send connection request',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (isLoading || !showConnect) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 hover:bg-primary/10", className)}
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4 text-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connect with {authorName}</p>
        </TooltipContent>
      </Tooltip>

      <ConnectionRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendRequest}
        targetUser={{
          full_name: authorName,
          headline: authorHeadline,
        }}
      />
    </TooltipProvider>
  );
}
