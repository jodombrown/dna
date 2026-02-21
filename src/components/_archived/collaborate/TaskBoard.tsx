import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { TaskColumn } from './TaskColumn';
import { CreateTaskDialog } from './CreateTaskDialog';
import { useUpdateTask } from '@/hooks/useCollaborate';
import type { Task, TaskStatus } from '@/types/collaborate';

interface TaskBoardProps {
  spaceId: string;
  tasks: Task[];
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'open', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export function TaskBoard({ spaceId, tasks }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createInColumn, setCreateInColumn] = useState<TaskStatus>('open');
  const updateTask = useUpdateTask();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTasksByStatus = (status: TaskStatus) => 
    tasks.filter(task => task.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = COLUMNS.find(col => col.id === overId);
    if (targetColumn) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetColumn.id) {
        updateTask.mutate({
          id: taskId,
          updates: { status: targetColumn.id },
        });
      }
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setCreateInColumn(status);
    setShowCreateTask(true);
  };

  return (
    <div className="overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 min-w-max pb-4">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <TaskColumn
                key={column.id}
                id={column.id}
                title={column.title}
                count={columnTasks.length}
                onAddTask={() => handleAddTask(column.id)}
              >
                <SortableContext
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[200px]">
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </SortableContext>
              </TaskColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        spaceId={spaceId}
        defaultStatus={createInColumn}
      />
    </div>
  );
}
