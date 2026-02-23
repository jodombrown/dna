/**
 * useTasks — Task CRUD hooks for COLLABORATE spaces.
 *
 * Provides:
 * - useSpaceTasks: Fetch tasks for a space with optional status filter
 * - useTaskMutations: Create, update, delete, and move tasks
 * - useTaskStats: Aggregate stats for space dashboard
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  space_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  created_by: string;
  due_date: string | null;
  completed_at: string | null;
  parent_task_id: string | null;
  sort_order: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  assignee?: {
    full_name: string;
    avatar_url: string | null;
    username?: string;
  } | null;
  creator?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export interface CreateTaskInput {
  space_id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string;
  due_date?: string;
  parent_task_id?: string;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  tags?: string[];
  sort_order?: number;
}

const TASK_QUERY_KEY = 'space-tasks-board';

/**
 * Fetch tasks for a space, optionally filtered by status.
 */
export function useSpaceTasks(spaceId: string, statusFilter?: TaskStatus | 'all') {
  return useQuery({
    queryKey: [TASK_QUERY_KEY, spaceId, statusFilter],
    queryFn: async () => {
      let query = supabaseClient
        .from('space_tasks')
        .select(`
          *,
          assignee:profiles!assignee_id (
            full_name,
            avatar_url,
            username
          ),
          creator:profiles!created_by (
            full_name,
            avatar_url
          )
        `)
        .eq('space_id', spaceId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Task[];
    },
    enabled: !!spaceId,
  });
}

/**
 * Mutations for task CRUD operations.
 */
export function useTaskMutations(spaceId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: [TASK_QUERY_KEY, spaceId] });
    queryClient.invalidateQueries({ queryKey: ['space-tasks', spaceId] });
  };

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabaseClient
        .from('space_tasks')
        .insert({
          space_id: input.space_id,
          title: input.title,
          description: input.description || null,
          status: input.status || 'todo',
          priority: input.priority || 'medium',
          assigned_to: input.assigned_to || null,
          created_by: user.id,
          due_date: input.due_date || null,
          parent_task_id: input.parent_task_id || null,
          tags: input.tags || [],
        } as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      invalidateTasks();
      toast.success('Task created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create task');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: UpdateTaskInput }) => {
      // If moving to 'done', set completed_at
      const finalUpdates = { ...updates } as Record<string, unknown>;
      if (updates.status === 'done' && !updates.completed_at) {
        finalUpdates.completed_at = new Date().toISOString();
      }
      // If moving away from 'done', clear completed_at
      if (updates.status && updates.status !== 'done') {
        finalUpdates.completed_at = null;
      }

      const { data, error } = await supabaseClient
        .from('space_tasks')
        .update(finalUpdates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      invalidateTasks();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update task');
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
      invalidateTasks();
      toast.success('Task deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete task');
    },
  });

  const moveTask = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) => {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'done') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { data, error } = await supabaseClient
        .from('space_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      invalidateTasks();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to move task');
    },
  });

  return {
    createTask: createTask.mutateAsync,
    isCreating: createTask.isPending,
    updateTask: updateTask.mutateAsync,
    isUpdating: updateTask.isPending,
    deleteTask: deleteTask.mutateAsync,
    isDeleting: deleteTask.isPending,
    moveTask: moveTask.mutateAsync,
    isMoving: moveTask.isPending,
  };
}

/**
 * Aggregate task stats for a space.
 */
export function useTaskStats(spaceId: string) {
  return useQuery({
    queryKey: ['task-stats', spaceId],
    queryFn: async () => {
      const { data: tasks, error } = await supabaseClient
        .from('space_tasks')
        .select('id, status, due_date')
        .eq('space_id', spaceId);

      if (error) throw error;

      const total = tasks?.length || 0;
      const done = tasks?.filter((t) => t.status === 'done').length || 0;
      const now = new Date();
      const overdue = tasks?.filter(
        (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < now
      ).length || 0;

      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const dueThisWeek = tasks?.filter(
        (t) =>
          t.status !== 'done' &&
          t.due_date &&
          new Date(t.due_date) >= now &&
          new Date(t.due_date) <= weekFromNow
      ).length || 0;

      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        total,
        done,
        overdue,
        dueThisWeek,
        completionRate,
      };
    },
    enabled: !!spaceId,
  });
}
