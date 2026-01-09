import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@/types/collaborate';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    task.status !== 'done';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-shadow',
        (isDragging || isSortableDragging) && 'opacity-50 shadow-lg',
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-1">{task.title}</p>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {task.priority && (
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', priorityColors[task.priority])}
                  >
                    {task.priority}
                  </Badge>
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
              
              {task.assignee && (
                <Avatar className="w-6 h-6">
                  <AvatarImage src={task.assignee.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
