import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { CreateTaskDialog } from './CreateTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SpaceTasksProps {
  spaceId: string;
  canEdit: boolean;
}

export function SpaceTasks({ spaceId, canEdit }: SpaceTasksProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['space-tasks', spaceId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('space_tasks')
        .select(`
          *,
          assignee:profiles!assignee_id (
            full_name,
            avatar_url
          )
        `)
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabaseClient
        .from('space_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-tasks', spaceId] });
      toast.success('Task deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete task');
    },
  });

  const filteredTasks = tasks?.filter((task) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return task.status === 'open' || task.status === 'in_progress';
    return task.status === statusFilter;
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {!filteredTasks || filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground mb-4">
              {statusFilter === 'all' ? 'No tasks yet' : `No ${statusFilter} tasks`}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge variant="outline" className="capitalize">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar_url || undefined} />
                            <AvatarFallback>{task.assignee.full_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span>{task.assignee.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}

                      {task.due_date && (
                        <span className="text-muted-foreground">
                          Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTask(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask.mutate(task.id)}
                        disabled={deleteTask.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTaskDialog
        spaceId={spaceId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditTaskDialog
        spaceId={spaceId}
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />
    </div>
  );
}
