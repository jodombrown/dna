import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, AlertCircle, Paperclip, Calendar } from 'lucide-react';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, isPast } from 'date-fns';
import { TaskAttachments } from '@/components/collaboration/TaskAttachments';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'done';
  assignee_id: string | null;
  due_date: string | null;
  created_by: string;
  assignee?: {
    full_name: string;
    avatar_url: string | null;
  };
  attachment_count?: number;
  dependency_count?: number;
}

interface SpaceMember {
  user_id: string;
  role: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

export default function SpaceBoard() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Fetch space
  const { data: space } = useQuery({
    queryKey: ['space', slug],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('spaces')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch members
  const { data: members = [] } = useQuery({
    queryKey: ['space-members', space?.id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('space_members')
        .select('user_id, role, profile:profiles!user_id(full_name, avatar_url)')
        .eq('space_id', space!.id);

      if (error) throw error;
      return data as SpaceMember[];
    },
    enabled: !!space?.id,
  });

  const currentUserRole = members.find(m => m.user_id === user?.id)?.role;
  const isLead = currentUserRole === 'lead';

  // Fetch tasks with counts
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['space-tasks', space?.id],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('space_tasks')
        .select(`
          *,
          assignee:profiles!assignee_id(full_name, avatar_url),
          attachments:space_attachments(count),
          blockers:space_task_dependencies!task_id(count)
        `)
        .eq('space_id', space!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(task => ({
        ...task,
        attachment_count: task.attachments?.[0]?.count || 0,
        dependency_count: task.blockers?.[0]?.count || 0,
      })) as Task[];
    },
    enabled: !!space?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
      const { error } = await supabaseClient
        .from('space_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Auto-create update if moved to done
      if (newStatus === 'done') {
        const task = tasks.find(t => t.id === taskId);
        if (task && space) {
          await supabaseClient.from('space_updates').insert({
            space_id: space.id,
            created_by: user!.id,
            type: 'auto_task_event',
            content: `Task "${task.title}" was marked as done`,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-tasks', space?.id] });
      toast.success('Task updated');
    },
    onError: () => {
      toast.error('Failed to update task');
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check permissions
    const canMove = isLead || task.created_by === user?.id || task.assignee_id === user?.id;
    if (!canMove) {
      toast.error('You don\'t have permission to move this task');
      return;
    }

    const newStatus = over.id as string;
    if (task.status !== newStatus) {
      updateStatusMutation.mutate({ taskId, newStatus });
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (assigneeFilter === 'all') return true;
    if (assigneeFilter === 'me') return task.assignee_id === user?.id;
    return task.assignee_id === assigneeFilter;
  });

  const columns = [
    { id: 'open', title: 'To Do', status: 'open' as const },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
    { id: 'done', title: 'Done', status: 'done' as const },
  ];

  const renderTask = (task: Task) => {
    const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done';

    return (
      <Card
        key={task.id}
        id={task.id}
        className="p-3 cursor-move hover:shadow-md transition-shadow"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm flex-1">{task.title}</h4>
            {task.dependency_count > 0 && (
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {task.dependency_count}
              </Badge>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {task.assignee && (
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.assignee.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{task.assignee.full_name}</span>
              </div>
            )}

            {task.due_date && (
              <Badge variant={isOverdue ? 'destructive' : 'outline'} className="text-xs gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), 'MMM d')}
              </Badge>
            )}

            {task.attachment_count > 0 && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Paperclip className="h-3 w-3" />
                {task.attachment_count}
              </Badge>
            )}
          </div>

          {space && (
            <div className="pt-2 border-t">
              <TaskAttachments
                taskId={task.id}
                spaceId={space.id}
                isLead={isLead}
              />
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (!space) {
    return <div>Loading...</div>;
  }

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Task Board - {space?.name}</h1>
            </div>

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tasks</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.profile.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {columns.map((column) => (
                <div key={column.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${column.color}`} />
                    <h2 className="font-semibold text-lg">
                      {column.title} ({filteredTasks.filter(t => t.status === column.id).length})
                    </h2>
                  </div>

                  <div className="space-y-3 min-h-[200px]">
                    {filteredTasks
                      .filter(task => task.status === column.id)
                      .map(renderTask)
                    }
                  </div>
                </div>
              ))}
            </div>
          </DndContext>
        </div>
      }
      rightColumn={<RightWidgets />}
    />
  );
}
