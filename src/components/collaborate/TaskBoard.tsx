/**
 * TaskBoard — Kanban-style task board for COLLABORATE spaces.
 *
 * Desktop: 4-column Kanban (todo, in_progress, review, done)
 * Mobile: List view with status filter tabs
 *
 * Supports drag-and-drop between columns on desktop.
 */

import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  GripVertical,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Circle,
  Ban,
  Loader2,
} from 'lucide-react';
import { useSpaceTasks, useTaskMutations, type Task, type TaskStatus } from '@/hooks/useTasks';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { format, isPast, isToday } from 'date-fns';

interface TaskBoardProps {
  spaceId: string;
  canEdit: boolean;
  onTaskClick?: (task: Task) => void;
}

const COLUMNS: { status: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'todo', label: 'To Do', icon: <Circle className="h-3.5 w-3.5" />, color: 'text-slate-500' },
  { status: 'in_progress', label: 'In Progress', icon: <Clock className="h-3.5 w-3.5" />, color: 'text-blue-500' },
  { status: 'review', label: 'Review', icon: <AlertCircle className="h-3.5 w-3.5" />, color: 'text-amber-500' },
  { status: 'done', label: 'Done', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-green-500' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-blue-400',
  high: 'bg-orange-400',
  urgent: 'bg-red-500',
};

export function TaskBoard({ spaceId, canEdit, onTaskClick }: TaskBoardProps) {
  const { isMobile } = useMobile();
  const { data: tasks = [], isLoading } = useSpaceTasks(spaceId);
  const { createTask, isCreating, moveTask } = useTaskMutations(spaceId);
  const [mobileFilter, setMobileFilter] = useState<TaskStatus | 'all'>('all');

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
      blocked: [],
    };
    for (const task of tasks) {
      const status = task.status as TaskStatus;
      if (grouped[status]) {
        grouped[status].push(task);
      } else {
        grouped.todo.push(task);
      }
    }
    return grouped;
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileTaskList
        tasks={tasks}
        tasksByStatus={tasksByStatus}
        filter={mobileFilter}
        onFilterChange={setMobileFilter}
        spaceId={spaceId}
        canEdit={canEdit}
        onTaskClick={onTaskClick}
        createTask={createTask}
        isCreating={isCreating}
      />
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.status}
          column={col}
          tasks={tasksByStatus[col.status] || []}
          spaceId={spaceId}
          canEdit={canEdit}
          onTaskClick={onTaskClick}
          onMoveTask={(taskId, newStatus) => moveTask({ taskId, newStatus })}
          createTask={createTask}
          isCreating={isCreating}
        />
      ))}
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  spaceId,
  canEdit,
  onTaskClick,
  onMoveTask,
  createTask,
  isCreating,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  spaceId: string;
  canEdit: boolean;
  onTaskClick?: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  createTask: (input: { space_id: string; title: string; status?: TaskStatus }) => Promise<Task>;
  isCreating: boolean;
}) {
  const [quickAddValue, setQuickAddValue] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState(false);

  const handleQuickAdd = async () => {
    if (!quickAddValue.trim()) return;
    await createTask({
      space_id: spaceId,
      title: quickAddValue.trim(),
      status: column.status,
    });
    setQuickAddValue('');
    setShowQuickAdd(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(true);
  };

  const handleDragLeave = () => {
    setDragOverColumn(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, column.status);
    }
  };

  return (
    <div
      className={cn(
        'flex-shrink-0 w-[260px] flex flex-col bg-muted/30 rounded-lg border',
        dragOverColumn && 'border-primary/50 bg-primary/5'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className={cn('flex items-center gap-1.5 text-sm font-medium', column.color)}>
          {column.icon}
          {column.label}
        </div>
        <Badge variant="secondary" className="text-xs px-1.5 h-5">
          {tasks.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 max-h-[500px]">
        <div className="p-2 space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </div>
      </ScrollArea>

      {canEdit && (
        <div className="p-2 border-t">
          {showQuickAdd ? (
            <div className="space-y-1.5">
              <Input
                placeholder="Task title..."
                value={quickAddValue}
                onChange={(e) => setQuickAddValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuickAdd();
                  if (e.key === 'Escape') setShowQuickAdd(false);
                }}
                autoFocus
                className="h-8 text-sm"
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={handleQuickAdd}
                  disabled={isCreating || !quickAddValue.trim()}
                  className="h-7 text-xs"
                >
                  {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowQuickAdd(false)}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground h-7 text-xs"
              onClick={() => setShowQuickAdd(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add task
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick?: () => void;
}) {
  const isOverdue =
    task.due_date && task.status !== 'done' && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
              PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
            )}
          />
          <p className="text-sm font-medium leading-tight line-clamp-2">
            {task.title}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assignee.avatar_url || undefined} />
                <AvatarFallback className="text-[9px]">
                  {task.assignee.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            ) : null}

            {task.tags && task.tags.length > 0 && (
              <Badge variant="outline" className="text-[10px] px-1 h-4">
                {task.tags[0]}
              </Badge>
            )}
          </div>

          {task.due_date && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-[10px]',
                isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'
              )}
            >
              <Calendar className="h-2.5 w-2.5" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MobileTaskList({
  tasks,
  tasksByStatus,
  filter,
  onFilterChange,
  spaceId,
  canEdit,
  onTaskClick,
  createTask,
  isCreating,
}: {
  tasks: Task[];
  tasksByStatus: Record<TaskStatus, Task[]>;
  filter: TaskStatus | 'all';
  onFilterChange: (f: TaskStatus | 'all') => void;
  spaceId: string;
  canEdit: boolean;
  onTaskClick?: (task: Task) => void;
  createTask: (input: { space_id: string; title: string; status?: TaskStatus }) => Promise<Task>;
  isCreating: boolean;
}) {
  const [quickAddValue, setQuickAddValue] = useState('');

  const filteredTasks = filter === 'all' ? tasks : tasksByStatus[filter] || [];

  const handleQuickAdd = async () => {
    if (!quickAddValue.trim()) return;
    await createTask({
      space_id: spaceId,
      title: quickAddValue.trim(),
      status: filter !== 'all' ? filter : 'todo',
    });
    setQuickAddValue('');
  };

  return (
    <div className="space-y-3">
      <Tabs value={filter} onValueChange={(v) => onFilterChange(v as TaskStatus | 'all')}>
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="all" className="text-xs">
            All ({tasks.length})
          </TabsTrigger>
          {COLUMNS.map((col) => (
            <TabsTrigger key={col.status} value={col.status} className="text-xs">
              {col.label} ({(tasksByStatus[col.status] || []).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {canEdit && (
        <div className="flex gap-2">
          <Input
            placeholder="Quick add task..."
            value={quickAddValue}
            onChange={(e) => setQuickAddValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQuickAdd();
            }}
            className="h-9"
          />
          <Button
            size="sm"
            onClick={handleQuickAdd}
            disabled={isCreating || !quickAddValue.trim()}
            className="h-9"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            {filter === 'all' ? 'No tasks yet' : `No ${filter.replace('_', ' ')} tasks`}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <MobileTaskRow key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
          ))}
        </div>
      )}
    </div>
  );
}

function MobileTaskRow({ task, onClick }: { task: Task; onClick?: () => void }) {
  const isOverdue =
    task.due_date && task.status !== 'done' && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  const statusConfig = COLUMNS.find((c) => c.status === task.status) || COLUMNS[0];

  return (
    <Card className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5', statusConfig.color)}>{statusConfig.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{task.title}</p>
            <div className="flex items-center gap-3 mt-1.5">
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={task.assignee.avatar_url || undefined} />
                    <AvatarFallback className="text-[8px]">
                      {task.assignee.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{task.assignee.full_name}</span>
                </div>
              )}
              {task.due_date && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs',
                    isOverdue ? 'text-red-500' : 'text-muted-foreground'
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.due_date), 'MMM d')}
                </span>
              )}
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
