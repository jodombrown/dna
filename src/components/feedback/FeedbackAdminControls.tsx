import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
import {
  MoreVertical,
  Pin,
  PinOff,
  Sparkles,
  Trash2,
  CircleDot,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Flag,
  Loader2,
} from 'lucide-react';
import { feedbackService } from '@/services/feedbackService';
import type {
  FeedbackMessage,
  AdminStatus,
  AdminCategory,
  AdminPriority,
} from '@/types/feedback';
import {
  ADMIN_STATUS_LABELS,
  ADMIN_PRIORITY_LABELS,
} from '@/types/feedback';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface FeedbackAdminControlsProps {
  message: FeedbackMessage;
  channelId: string;
}

const STATUS_OPTIONS: { value: AdminStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'open', label: 'Open', icon: <CircleDot className="h-4 w-4 text-blue-500" /> },
  { value: 'in_progress', label: 'In Progress', icon: <Clock className="h-4 w-4 text-yellow-500" /> },
  { value: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
  { value: 'wont_fix', label: "Won't Fix", icon: <XCircle className="h-4 w-4 text-gray-500" /> },
];

const CATEGORY_OPTIONS: { value: AdminCategory; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'ux_issue', label: 'UX Issue' },
  { value: 'question', label: 'Question' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS: { value: AdminPriority; label: string; icon: React.ReactNode }[] = [
  { value: 'low', label: 'Low', icon: <Flag className="h-4 w-4 text-slate-400" /> },
  { value: 'medium', label: 'Medium', icon: <Flag className="h-4 w-4 text-blue-500" /> },
  { value: 'high', label: 'High', icon: <Flag className="h-4 w-4 text-orange-500" /> },
  { value: 'critical', label: 'Critical', icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
];

export function FeedbackAdminControls({ message, channelId }: FeedbackAdminControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const invalidateMessages = () => {
    queryClient.invalidateQueries({ queryKey: ['feedback-messages', channelId] });
  };

  const handleStatusChange = async (status: AdminStatus) => {
    setIsLoading(true);
    try {
      const success = await feedbackService.updateMessageStatus(message.id, status);
      if (success) {
        toast.success(`Status updated to ${ADMIN_STATUS_LABELS[status]}`);
        invalidateMessages();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async (category: AdminCategory) => {
    setIsLoading(true);
    try {
      const success = await feedbackService.updateMessageCategory(message.id, category);
      if (success) {
        toast.success('Category updated');
        invalidateMessages();
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      toast.error('Failed to update category');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (priority: AdminPriority) => {
    setIsLoading(true);
    try {
      const success = await feedbackService.updateMessagePriority(message.id, priority);
      if (success) {
        toast.success(`Priority set to ${ADMIN_PRIORITY_LABELS[priority]}`);
        invalidateMessages();
      } else {
        throw new Error('Failed to update priority');
      }
    } catch (error) {
      toast.error('Failed to update priority');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = async () => {
    setIsLoading(true);
    try {
      const success = await feedbackService.pinMessage(message.id, !message.is_pinned);
      if (success) {
        toast.success(message.is_pinned ? 'Message unpinned' : 'Message pinned');
        invalidateMessages();
      } else {
        throw new Error('Failed to toggle pin');
      }
    } catch (error) {
      toast.error('Failed to toggle pin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHighlight = async () => {
    setIsLoading(true);
    try {
      const success = await feedbackService.highlightMessage(message.id, !message.is_highlighted);
      if (success) {
        toast.success(message.is_highlighted ? 'Highlight removed' : 'Message highlighted');
        invalidateMessages();
      } else {
        throw new Error('Failed to toggle highlight');
      }
    } catch (error) {
      toast.error('Failed to toggle highlight');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const success = await feedbackService.deleteMessage(message.id);
      if (success) {
        toast.success('Message deleted');
        invalidateMessages();
        setShowDeleteDialog(false);
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Status */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CircleDot className="h-4 w-4 mr-2" />
              Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {STATUS_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={message.admin_status === option.value ? 'bg-accent' : ''}
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Category */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Flag className="h-4 w-4 mr-2" />
              Category
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {CATEGORY_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleCategoryChange(option.value)}
                  className={message.admin_category === option.value ? 'bg-accent' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* Priority */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Priority
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {PRIORITY_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handlePriorityChange(option.value)}
                  className={message.admin_priority === option.value ? 'bg-accent' : ''}
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Pin */}
          <DropdownMenuItem onClick={handleTogglePin}>
            {message.is_pinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Pin to Top
              </>
            )}
          </DropdownMenuItem>

          {/* Highlight */}
          <DropdownMenuItem onClick={handleToggleHighlight}>
            <Sparkles className="h-4 w-4 mr-2" />
            {message.is_highlighted ? 'Remove Highlight' : 'Highlight'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete */}
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback? This action will soft-delete the
              message and it will no longer be visible to users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
