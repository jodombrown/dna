import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SpaceHealthData, spaceHealthService } from '@/services/spaceHealthService';
import {
  Activity,
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle2,
  Clock,
  Lightbulb,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface SpaceHealthDetailsPanelProps {
  healthData: SpaceHealthData;
  spaceStatus: string;
  onArchive?: () => void;
  onReactivate?: () => void;
  onMarkComplete?: () => void;
  isLoading?: boolean;
}

export function SpaceHealthDetailsPanel({
  healthData,
  spaceStatus,
  onArchive,
  onReactivate,
  onMarkComplete,
  isLoading = false,
}: SpaceHealthDetailsPanelProps) {
  const { score, status, factors, suggestedActions } = healthData;
  const color = spaceHealthService.getHealthColor(status);
  const label = spaceHealthService.getHealthLabel(status);

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'stalling':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'at-risk':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'inactive':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle>Project Health</CardTitle>
          </div>
          <Badge
            variant={color === 'green' ? 'default' : color === 'red' ? 'destructive' : 'secondary'}
            className={
              color === 'yellow'
                ? 'bg-yellow-500 text-yellow-900'
                : color === 'orange'
                ? 'bg-orange-500 text-white'
                : ''
            }
          >
            {label}
          </Badge>
        </div>
        <CardDescription>
          Monitoring project activity and progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Health Score</span>
            <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Last Activity */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Last Activity
            </div>
            <div className="font-medium">
              {factors.daysSinceLastActivity === 0
                ? 'Today'
                : factors.daysSinceLastActivity === 1
                ? 'Yesterday'
                : `${factors.daysSinceLastActivity} days ago`}
            </div>
            {factors.lastActivityDate && (
              <div className="text-xs text-muted-foreground">
                {format(parseISO(factors.lastActivityDate), 'MMM d, yyyy')}
              </div>
            )}
          </div>

          {/* Member Engagement */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Members
            </div>
            <div className="font-medium">
              {factors.activeMembers} / {factors.totalMembers} active
            </div>
            <div className="text-xs text-muted-foreground">
              {Math.round(factors.memberEngagementRate)}% engagement
            </div>
          </div>
        </div>

        {/* Task Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Task Completion</span>
            <span className="font-medium">
              {factors.completedTasks} / {factors.totalTasks} tasks
            </span>
          </div>
          <Progress value={factors.taskCompletionRate} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(factors.taskCompletionRate)}% complete</span>
            {factors.overdueTasksCount > 0 && (
              <span className="text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {factors.overdueTasksCount} overdue
              </span>
            )}
          </div>
        </div>

        {/* Project Duration */}
        <div className="text-sm text-muted-foreground">
          <Clock className="h-4 w-4 inline mr-1" />
          Project running for {factors.daysActive} days
        </div>

        {/* Suggested Actions */}
        {suggestedActions.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Suggested Actions
            </div>
            <ul className="space-y-1">
              {suggestedActions.map((action, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">-</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {spaceStatus === 'completed' && onReactivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReactivate}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reactivate Project
            </Button>
          )}

          {spaceStatus !== 'completed' && (
            <>
              {status === 'complete' && onMarkComplete && (
                <Button
                  size="sm"
                  onClick={onMarkComplete}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}

              {(status === 'inactive' || status === 'at-risk') && onArchive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onArchive}
                  disabled={isLoading}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Project
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
