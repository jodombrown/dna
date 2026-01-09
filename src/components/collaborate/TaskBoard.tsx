import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { SpaceTask } from '@/types/collaborate';
import { cn } from '@/lib/utils';

interface TaskBoardProps {
  spaceId: string;
  tasks: SpaceTask[];
}

const columns = [
  { id: 'open', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

export function TaskBoard({ spaceId, tasks }: TaskBoardProps) {
  const getTasksByStatus = (status: string) => 
    tasks.filter(t => t.status === status);

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        return (
          <div key={column.id} className="space-y-3">
            <div className={cn('p-3 rounded-lg', column.color)}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 min-h-[200px]">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {columnTasks.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  No tasks
                </div>
              )}
            </div>

            {column.id === 'open' && (
              <Button variant="ghost" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task }: { task: SpaceTask }) {
  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    task.status !== 'done';

  return (
    <Card className="hover:shadow-sm transition-shadow cursor-pointer">
      <CardContent className="p-3">
        <p className="text-sm font-medium mb-2">{task.title}</p>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          {task.assignee && (
            <Avatar className="w-6 h-6">
              <AvatarImage src={task.assignee.avatar_url || ''} />
              <AvatarFallback className="text-xs">
                {task.assignee.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          )}
          {task.due_date && (
            <span className={cn(
              'flex items-center gap-1 text-xs',
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}>
              <Calendar className="w-3 h-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
