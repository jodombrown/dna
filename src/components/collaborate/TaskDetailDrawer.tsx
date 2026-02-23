/**
 * TaskDetailDrawer — Full task editing panel.
 *
 * Desktop: Side panel (Sheet)
 * Mobile: Bottom sheet (Drawer)
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar as CalendarIcon,
  Circle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Ban,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useTaskMutations, type Task, type TaskStatus, type TaskPriority, type UpdateTaskInput } from '@/hooks/useTasks';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  spaceId: string;
  canEdit: boolean;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'todo', label: 'To Do', icon: <Circle className="h-3.5 w-3.5" />, color: 'text-slate-500' },
  { value: 'in_progress', label: 'In Progress', icon: <Clock className="h-3.5 w-3.5" />, color: 'text-blue-500' },
  { value: 'review', label: 'Review', icon: <AlertCircle className="h-3.5 w-3.5" />, color: 'text-amber-500' },
  { value: 'done', label: 'Done', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-green-500' },
  { value: 'blocked', label: 'Blocked', icon: <Ban className="h-3.5 w-3.5" />, color: 'text-red-500' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-slate-400' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-400' },
  { value: 'high', label: 'High', color: 'bg-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

export function TaskDetailDrawer({
  open,
  onOpenChange,
  task,
  spaceId,
  canEdit,
}: TaskDetailDrawerProps) {
  const { isMobile } = useMobile();
  const { updateTask, isUpdating, deleteTask, isDeleting } = useTaskMutations(spaceId);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('todo');
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editAssignee, setEditAssignee] = useState<string | null>(null);
  const [editDueDate, setEditDueDate] = useState('');

  // Load task data into form when task changes
  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditStatus(task.status);
      setEditPriority(task.priority);
      setEditAssignee(task.assigned_to);
      setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    }
  }, [task]);

  // Fetch space members for assignee picker
  const { data: members = [] } = useQuery({
    queryKey: ['space-members-picker', spaceId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('space_members')
        .select(`
          user_id,
          profiles:profiles!user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('space_id', spaceId);

      if (error) return [];
      return (data || []).map((m: Record<string, unknown>) => ({
        user_id: m.user_id as string,
        full_name: ((m.profiles as Record<string, unknown>)?.full_name as string) || 'Unknown',
        avatar_url: ((m.profiles as Record<string, unknown>)?.avatar_url as string) || null,
      }));
    },
    enabled: open && !!spaceId,
  });

  const handleSave = async () => {
    if (!task) return;

    const updates: UpdateTaskInput = {};
    if (editTitle !== task.title) updates.title = editTitle;
    if (editDescription !== (task.description || '')) updates.description = editDescription || null;
    if (editStatus !== task.status) updates.status = editStatus;
    if (editPriority !== task.priority) updates.priority = editPriority;
    if (editAssignee !== task.assigned_to) updates.assigned_to = editAssignee;
    const dueDateValue = editDueDate ? new Date(editDueDate).toISOString() : null;
    const taskDueDate = task.due_date ? task.due_date.split('T')[0] : '';
    if (editDueDate !== taskDueDate) updates.due_date = dueDateValue;

    if (Object.keys(updates).length === 0) {
      onOpenChange(false);
      return;
    }

    await updateTask({ taskId: task.id, updates });
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    await deleteTask(task.id);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
  };

  const content = task ? (
    <div className="flex flex-col gap-4 p-4">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Title</label>
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          disabled={!canEdit}
          className="text-base font-semibold"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Description</label>
        <Textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Add a description..."
          disabled={!canEdit}
          rows={3}
        />
      </div>

      <Separator />

      {/* Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select
            value={editStatus}
            onValueChange={(v) => setEditStatus(v as TaskStatus)}
            disabled={!canEdit}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className={cn('flex items-center gap-1.5', opt.color)}>
                    {opt.icon} {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Priority</label>
          <Select
            value={editPriority}
            onValueChange={(v) => setEditPriority(v as TaskPriority)}
            disabled={!canEdit}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-1.5">
                    <span className={cn('w-2 h-2 rounded-full', opt.color)} />
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assignee */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Assignee</label>
        <Select
          value={editAssignee || 'unassigned'}
          onValueChange={(v) => setEditAssignee(v === 'unassigned' ? null : v)}
          disabled={!canEdit}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.user_id} value={member.user_id}>
                <span className="flex items-center gap-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {member.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {member.full_name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Due Date */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Due Date</label>
        <Input
          type="date"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
          disabled={!canEdit}
          className="h-9"
        />
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Tags</label>
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <Separator />
      <div className="text-xs text-muted-foreground space-y-1">
        {task.creator && (
          <p>Created by {task.creator.full_name}</p>
        )}
        <p>Created {format(new Date(task.created_at), 'MMM d, yyyy')}</p>
        {task.completed_at && (
          <p>Completed {format(new Date(task.completed_at), 'MMM d, yyyy')}</p>
        )}
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={isUpdating || !editTitle.trim()} className="flex-1">
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{task.title}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ) : null;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>{task?.title || 'Task Details'}</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[460px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Task Details</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
