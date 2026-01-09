import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, CheckCircle2 } from 'lucide-react';
import type { Initiative, InitiativeStatus } from '@/types/collaborate';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface InitiativeCardProps {
  initiative: Initiative;
}

const STATUS_STYLES: Record<InitiativeStatus, string> = {
  planning: 'bg-muted text-muted-foreground',
  active: 'bg-primary/10 text-primary',
  completed: 'bg-green-500/10 text-green-700 dark:text-green-400',
  abandoned: 'bg-destructive/10 text-destructive',
};

export function InitiativeCard({ initiative }: InitiativeCardProps) {
  const completedTasks = initiative.completed_task_count || 0;
  const totalTasks = initiative.task_count || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">{initiative.title}</CardTitle>
          </div>
          <Badge className={cn('text-xs', STATUS_STYLES[initiative.status])}>
            {initiative.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {initiative.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {initiative.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {completedTasks} / {totalTasks} tasks
            </span>
            {initiative.target_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(initiative.target_date), 'MMM d')}
              </span>
            )}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {initiative.milestones && initiative.milestones.length > 0 && (
          <div className="flex gap-1 mt-3">
            {initiative.milestones.slice(0, 4).map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  'w-2 h-2 rounded-full',
                  milestone.status === 'completed' ? 'bg-green-500' :
                  milestone.status === 'missed' ? 'bg-destructive' : 'bg-muted-foreground/30'
                )}
                title={milestone.title}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
