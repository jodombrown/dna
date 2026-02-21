import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TaskDependencies } from './TaskDependencies';
import { diaEventBus } from '@/services/dia/diaEventBus';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  status: string;
  due_date?: string;
}

interface EditTaskDialogProps {
  spaceId: string;
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ spaceId, task, open, onOpenChange }: EditTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [status, setStatus] = useState('open');
  const [dueDate, setDueDate] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setAssigneeId(task.assignee_id || '');
      setStatus(task.status);
      setDueDate(task.due_date || '');
    }
  }, [task]);

  const { data: members } = useQuery({
    queryKey: ['space-members', spaceId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('space_members')
        .select(`
          user_id,
          profile:profiles!user_id (
            id,
            full_name
          )
        `)
        .eq('space_id', spaceId);

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const updateTask = useMutation({
    mutationFn: async () => {
      if (!task) return;

      const { error } = await supabaseClient
        .from('space_tasks')
        .update({
          title,
          description: description || null,
          assignee_id: assigneeId || null,
          status,
          due_date: dueDate || null,
        })
        .eq('id', task.id);

      if (error) throw error;

      // If task was marked as done, create an auto-update
      if (status === 'done' && task.status !== 'done') {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await supabaseClient.from('space_updates').insert({
            space_id: spaceId,
            created_by: user.id,
            content: `Task "${title}" was marked as done.`,
            type: 'auto_task_event',
          });

          // DIA Sprint 4B: Emit task completed event for proactive nudges
          diaEventBus.emit({
            type: 'task_completed',
            taskId: task.id,
            completedById: user.id,
            spaceId,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-tasks', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['space-updates', spaceId] });
      toast.success('Task updated');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update task');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    updateTask.mutate();
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {members?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.profile?.full_name || 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Dependencies */}
            {task && (
              <>
                <Separator />
                <TaskDependencies
                  taskId={task.id}
                  spaceId={spaceId}
                  canEdit={true}
                />
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || updateTask.isPending}>
              {updateTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
