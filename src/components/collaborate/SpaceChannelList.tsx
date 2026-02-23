import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Hash, Plus, Loader2 } from 'lucide-react';
import { messagingPrdService } from '@/services/messagingPrdService';
import { useCreateConversation } from '@/hooks/useMessagingPrd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/messagingPRD';

interface SpaceChannelListProps {
  spaceId: string;
  canManage: boolean;
  activeChannelId?: string | null;
  onSelectChannel?: (channelId: string) => void;
}

export function SpaceChannelList({
  spaceId,
  canManage,
  activeChannelId,
  onSelectChannel,
}: SpaceChannelListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createSpaceChannel, isCreating } = useCreateConversation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['space-channels', spaceId],
    queryFn: () => messagingPrdService.getSpaceChannels(spaceId),
    enabled: !!spaceId,
  });

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast.error('Channel name is required');
      return;
    }

    const formattedName = newChannelName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    try {
      await createSpaceChannel({ spaceId, title: formattedName });
      queryClient.invalidateQueries({ queryKey: ['space-channels', spaceId] });
      toast.success(`Channel #${formattedName} created`);
      setCreateDialogOpen(false);
      setNewChannelName('');
      setNewChannelDescription('');
    } catch {
      toast.error('Failed to create channel');
    }
  };

  const handleSelectChannel = (channelId: string) => {
    if (onSelectChannel) {
      onSelectChannel(channelId);
    } else {
      navigate(`/dna/messages?thread=${channelId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Channels
        </h4>
        {canManage && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-[300px]">
        <div className="space-y-0.5 px-1">
          {channels.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              No channels yet
            </p>
          ) : (
            channels.map((channel) => (
              <ChannelRow
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={() => handleSelectChannel(channel.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Channel Name</label>
              <Input
                placeholder="e.g. planning"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                maxLength={50}
              />
              {newChannelName && (
                <p className="text-xs text-muted-foreground">
                  Will be created as: #{newChannelName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                placeholder="What is this channel about?"
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={isCreating || !newChannelName.trim()}
            >
              {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChannelRow({
  channel,
  isActive,
  onClick,
}: {
  channel: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground font-medium'
          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      )}
    >
      <Hash className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="truncate">{channel.title || 'general'}</span>
      {channel.messageCount > 0 && (
        <Badge
          variant="secondary"
          className="ml-auto text-[10px] px-1.5 py-0 h-4"
        >
          {channel.messageCount > 99 ? '99+' : channel.messageCount}
        </Badge>
      )}
    </button>
  );
}
