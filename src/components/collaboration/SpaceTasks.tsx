import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle2 } from 'lucide-react';

interface SpaceTasksProps {
  spaceId: string;
  canEdit: boolean;
}

export function SpaceTasks({ spaceId, canEdit }: SpaceTasksProps) {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['space-tasks', spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
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

  if (isLoading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      )}

      {!tasks || tasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground mb-4">No tasks yet</p>
            {canEdit && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {task.status === 'done' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      <h3 className="font-semibold">{task.title}</h3>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {task.status?.replace('-', ' ')}
                      </Badge>
                      {task.priority && (
                        <Badge variant="secondary">{task.priority}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
