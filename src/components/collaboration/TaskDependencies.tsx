import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, AlertCircle } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { toast } from 'sonner';

interface TaskDependenciesProps {
  taskId: string;
  spaceId: string;
  canEdit: boolean;
}

interface Task {
  id: string;
  title: string;
  status: string;
}

interface Dependency {
  depends_on_task_id: string;
  blocker?: Task;
}

export function TaskDependencies({ taskId, spaceId, canEdit }: TaskDependenciesProps) {
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Fetch all tasks in the space (excluding current task)
  const { data: availableTasks = [] } = useQuery({
    queryKey: ['space-tasks-for-deps', spaceId, taskId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('space_tasks')
        .select('id, title, status')
        .eq('space_id', spaceId)
        .neq('id', taskId)
        .order('title');

      if (error) throw error;
      return data as Task[];
    },
  });

  // Fetch current dependencies
  const { data: dependencies = [] } = useQuery({
    queryKey: ['task-dependencies', taskId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('space_task_dependencies')
        .select(`
          depends_on_task_id,
          blocker:space_tasks!space_task_dependencies_depends_on_task_id_fkey(id, title, status)
        `)
        .eq('task_id', taskId);

      if (error) throw error;
      return data as Dependency[];
    },
  });

  const addDependencyMutation = useMutation({
    mutationFn: async (dependsOnTaskId: string) => {
      const { error } = await supabaseClient
        .from('space_task_dependencies')
        .insert({
          task_id: taskId,
          depends_on_task_id: dependsOnTaskId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', taskId] });
      setSelectedTaskId('');
      toast.success('Dependency added');
    },
    onError: (error) => {
      toast.error('Failed to add dependency');
    },
  });

  const removeDependencyMutation = useMutation({
    mutationFn: async (dependsOnTaskId: string) => {
      const { error } = await supabaseClient
        .from('space_task_dependencies')
        .delete()
        .eq('task_id', taskId)
        .eq('depends_on_task_id', dependsOnTaskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', taskId] });
      toast.success('Dependency removed');
    },
    onError: (error) => {
      toast.error('Failed to remove dependency');
    },
  });

  const handleAddDependency = () => {
    if (selectedTaskId) {
      addDependencyMutation.mutate(selectedTaskId);
    }
  };

  // Filter available tasks to exclude already added dependencies
  const filteredTasks = availableTasks.filter(
    (task) => !dependencies.some((dep) => dep.depends_on_task_id === task.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">Blocked by</h4>
        {dependencies.length > 0 && (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {dependencies.length}
          </Badge>
        )}
      </div>

      {/* Current dependencies */}
      {dependencies.length > 0 && (
        <div className="space-y-2">
          {dependencies.map((dep) => (
            <div
              key={dep.depends_on_task_id}
              className="flex items-center gap-2 p-2 bg-muted rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{dep.blocker?.title || 'Unknown task'}</p>
                <Badge
                  variant={dep.blocker?.status === 'done' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {dep.blocker?.status || 'unknown'}
                </Badge>
              </div>
              {canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeDependencyMutation.mutate(dep.depends_on_task_id)}
                  disabled={removeDependencyMutation.isPending}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new dependency */}
      {canEdit && filteredTasks.length > 0 && (
        <div className="flex gap-2">
          <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a blocker..." />
            </SelectTrigger>
            <SelectContent>
              {filteredTasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  <div className="flex items-center gap-2">
                    <span>{task.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {task.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={handleAddDependency}
            disabled={!selectedTaskId || addDependencyMutation.isPending}
          >
            Add
          </Button>
        </div>
      )}

      {dependencies.length === 0 && !canEdit && (
        <p className="text-sm text-muted-foreground">No blockers</p>
      )}
    </div>
  );
}
