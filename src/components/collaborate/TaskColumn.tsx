import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/types/collaborate';
import type { ReactNode } from 'react';

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  count: number;
  onAddTask: () => void;
  children: ReactNode;
}

const columnColors: Record<TaskStatus, string> = {
  open: 'bg-gray-100',
  in_progress: 'bg-blue-100',
  done: 'bg-green-100',
};

export function TaskColumn({ id, title, count, onAddTask, children }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        'w-72 flex flex-col rounded-lg transition-colors',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className={cn('p-3 rounded-t-lg', columnColors[id])}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-2 bg-muted/30 rounded-b-lg min-h-[200px]">
        {children}
        
        {count === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            No tasks
          </div>
        )}
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full mt-2"
        onClick={onAddTask}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Task
      </Button>
    </div>
  );
}
