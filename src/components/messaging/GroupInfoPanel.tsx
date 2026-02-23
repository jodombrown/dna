import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BellOff,
  Crown,
  LogOut,
  MoreVertical,
  Shield,
  UserMinus,
  UserPlus,
  Users,
  Flag,
} from 'lucide-react';
import { messagingPrdService } from '@/services/messagingPrdService';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Conversation, ConversationParticipant } from '@/types/messagingPRD';
import { ParticipantRole } from '@/types/messagingPRD';

interface GroupInfoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation;
  onAddMembers?: () => void;
  onLeaveGroup?: () => void;
}

export function GroupInfoPanel({
  open,
  onOpenChange,
  conversation,
  onAddMembers,
  onLeaveGroup,
}: GroupInfoPanelProps) {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const queryClient = useQueryClient();
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['group-participants', conversation.id],
    queryFn: () => messagingPrdService.getParticipants(conversation.id),
    enabled: open,
  });

  const currentUserRole = participants.find(
    (p) => p.userId === user?.id
  )?.role;

  const isOwner = currentUserRole === ParticipantRole.OWNER;
  const isAdmin = currentUserRole === ParticipantRole.ADMIN;
  const canManageMembers = isOwner || isAdmin;

  const promoteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await messagingPrdService.changeParticipantRole(
        conversation.id,
        userId,
        ParticipantRole.ADMIN
      );
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['group-participants', conversation.id] });
      const member = participants.find((p) => p.userId === userId);
      toast.success(`${member?.nickname || 'Member'} promoted to admin`);
    },
    onError: () => {
      toast.error('Failed to promote member');
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      await messagingPrdService.removeParticipant(conversation.id, userId);
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['group-participants', conversation.id] });
      const member = participants.find((p) => p.userId === userId);
      messagingPrdService.sendSystemMessage(conversation.id, {
        type: 'participant_removed',
        content: `${member?.nickname || 'A member'} was removed from the group`,
        senderId: user?.id,
      });
      toast.success('Member removed');
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });

  const handleLeaveGroup = async () => {
    try {
      if (!user?.id) return;
      await messagingPrdService.removeParticipant(conversation.id, user.id);
      await messagingPrdService.sendSystemMessage(conversation.id, {
        type: 'participant_left',
        content: `${user.user_metadata?.full_name || 'Someone'} left the group`,
        senderId: user.id,
      });
      toast.success('You left the group');
      onLeaveGroup?.();
      onOpenChange(false);
    } catch {
      toast.error('Failed to leave group');
    }
  };

  const canRemove = (targetRole: ParticipantRole) => {
    if (isOwner) return true;
    if (isAdmin && targetRole === ParticipantRole.MEMBER) return true;
    return false;
  };

  const content = (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-center space-y-2">
        <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{conversation.title || 'Group'}</h3>
        <p className="text-sm text-muted-foreground">
          Created {format(conversation.createdAt, 'MMM d, yyyy')}
        </p>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          Members ({participants.length})
        </h4>
        {canManageMembers && (
          <Button variant="outline" size="sm" onClick={onAddMembers}>
            <UserPlus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-1">
          {participants.map((participant) => (
            <ParticipantRow
              key={participant.userId}
              participant={participant}
              isCurrentUser={participant.userId === user?.id}
              canManage={
                canManageMembers &&
                participant.userId !== user?.id &&
                canRemove(participant.role)
              }
              canPromote={isOwner && participant.role === ParticipantRole.MEMBER}
              onPromote={() => promoteMutation.mutate(participant.userId)}
              onRemove={() => removeMutation.mutate(participant.userId)}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            toast.info('Notifications muted');
          }}
        >
          <BellOff className="h-4 w-4 mr-2" />
          Mute Notifications
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => setLeaveConfirmOpen(true)}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave Group
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={() => toast.info('Report submitted')}
        >
          <Flag className="h-4 w-4 mr-2" />
          Report Group
        </Button>
      </div>

      <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave group?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave &ldquo;{conversation.title}&rdquo;? You
              won&apos;t receive new messages from this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroup}>
              Leave Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Group Info</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Group Info</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}

function ParticipantRow({
  participant,
  isCurrentUser,
  canManage,
  canPromote,
  onPromote,
  onRemove,
}: {
  participant: ConversationParticipant;
  isCurrentUser: boolean;
  canManage: boolean;
  canPromote: boolean;
  onPromote: () => void;
  onRemove: () => void;
}) {
  const roleIcon =
    participant.role === ParticipantRole.OWNER ? (
      <Crown className="h-3 w-3 text-amber-500" />
    ) : participant.role === ParticipantRole.ADMIN ? (
      <Shield className="h-3 w-3 text-blue-500" />
    ) : null;

  const roleLabel =
    participant.role === ParticipantRole.OWNER
      ? 'Owner'
      : participant.role === ParticipantRole.ADMIN
        ? 'Admin'
        : null;

  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="text-sm">
          {participant.nickname?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">
            {participant.nickname || 'Member'}
            {isCurrentUser && ' (You)'}
          </span>
          {roleIcon}
        </div>
        {roleLabel && (
          <span className="text-xs text-muted-foreground">{roleLabel}</span>
        )}
      </div>

      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canPromote && (
              <DropdownMenuItem onClick={onPromote}>
                <Shield className="h-4 w-4 mr-2" />
                Promote to Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onRemove}
              className="text-destructive focus:text-destructive"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Remove from Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
