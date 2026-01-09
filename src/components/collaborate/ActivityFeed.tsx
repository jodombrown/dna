import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { SpaceActivity } from '@/types/collaborate';
import { 
  UserPlus, 
  Target, 
  CheckSquare, 
  MessageSquare,
  Edit,
  Trash,
  Activity
} from 'lucide-react';

interface ActivityFeedProps {
  activities: SpaceActivity[];
}

const actionIcons: Record<string, typeof Activity> = {
  member_joined: UserPlus,
  initiative_created: Target,
  task_created: CheckSquare,
  task_completed: CheckSquare,
  comment_added: MessageSquare,
  task_updated: Edit,
  initiative_updated: Edit,
  task_deleted: Trash,
};

const actionLabels: Record<string, string> = {
  member_joined: 'joined the space',
  initiative_created: 'created an initiative',
  task_created: 'created a task',
  task_completed: 'completed a task',
  comment_added: 'added a comment',
  task_updated: 'updated a task',
  initiative_updated: 'updated an initiative',
  task_deleted: 'deleted a task',
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/50 rounded-lg">
        <Activity className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = actionIcons[activity.action_type] || Activity;
        const label = actionLabels[activity.action_type] || activity.action_type;

        return (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
            <Avatar className="w-8 h-8">
              <AvatarImage src={activity.user?.avatar_url || ''} />
              <AvatarFallback>
                {activity.user?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user?.full_name}</span>
                {' '}
                <span className="text-muted-foreground">{label}</span>
              </p>
              {activity.metadata && (activity.metadata as { title?: string }).title && (
                <p className="text-sm text-muted-foreground truncate">
                  "{(activity.metadata as { title: string }).title}"
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        );
      })}
    </div>
  );
}
