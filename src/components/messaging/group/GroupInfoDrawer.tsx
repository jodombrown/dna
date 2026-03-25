/**
 * GroupInfoDrawer - View/edit group info, manage members
 * 
 * vaul Drawer on mobile, Sheet on desktop.
 * Owner/admin can edit name, add/remove members.
 * All members can leave.
 */

import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Crown, LogOut, UserMinus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { useNavigate } from 'react-router-dom';
import { groupMessageService } from '@/services/groupMessageService';
import { toast } from 'sonner';
import type { GroupConversation, ConversationParticipant } from '@/types/groupMessaging';

interface GroupInfoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  conversation?: GroupConversation;
  participants: ConversationParticipant[];
}

export function GroupInfoDrawer({
  open,
  onOpenChange,
  conversationId,
  conversation,
  participants,
}: GroupInfoDrawerProps) {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const navigate = useNavigate();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const isCreator = conversation?.created_by === user?.id;

  const handleLeaveGroup = async () => {
    if (!user) return;
    try {
      await groupMessageService.removeParticipant(conversationId, user.id);
      await groupMessageService.sendSystemMessage(
        conversationId,
        `${user.user_metadata?.full_name || 'Someone'} left the group`
      );
      toast.success('You left the group');
      onOpenChange(false);
      navigate('/dna/messages');
    } catch {
      toast.error('Failed to leave group');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const member = participants.find(p => p.user_id === userId);
      await groupMessageService.removeParticipant(conversationId, userId);
      await groupMessageService.sendSystemMessage(
        conversationId,
        `${member?.full_name || 'A member'} was removed from the group`
      );
      toast.success('Member removed');
      setRemovingUserId(null);
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Group info */}
      <div className="flex flex-col items-center py-6 px-4">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarImage src={conversation?.avatar_url || ''} />
          <AvatarFallback className="bg-primary/10 text-primary">
            <Users className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold">{conversation?.title || 'Group Chat'}</h3>
        {conversation?.description && (
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {conversation.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {participants.length} members
        </p>
      </div>

      <Separator />

      {/* Members list */}
      <div className="px-4 py-3">
        <h4 className="text-sm font-medium mb-2">Members</h4>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-4 space-y-1">
          {participants.map((p) => (
            <div
              key={p.user_id}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={p.avatar_url || ''} />
                <AvatarFallback className="text-xs">
                  {(p.full_name || '?').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.full_name}</p>
                {p.username && (
                  <p className="text-xs text-muted-foreground">@{p.username}</p>
                )}
              </div>
              {conversation?.created_by === p.user_id && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Crown className="h-3 w-3" />
                  Creator
                </Badge>
              )}
              {isCreator && p.user_id !== user?.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setRemovingUserId(p.user_id)}
                >
                  <UserMinus className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      {/* Leave group */}
      {!isCreator && (
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowLeaveConfirm(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Leave Group
          </Button>
        </div>
      )}

      {/* Leave confirmation */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this group?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer receive messages from this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroup} className="bg-destructive text-destructive-foreground">
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove member confirmation */}
      <AlertDialog open={!!removingUserId} onOpenChange={() => setRemovingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              This person will be removed from the group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingUserId && handleRemoveMember(removingUserId)}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
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
      <SheetContent className="w-[380px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Group Info</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
