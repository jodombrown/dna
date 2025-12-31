import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiaNudge } from '@/hooks/useDiaNudges';
import { SpaceHealthNudge } from '@/services/spaceHealthService';
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  PartyPopper,
  X,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SpaceHealthNudgeCardProps {
  nudge: DiaNudge;
  onAccept: (nudgeId: string) => Promise<boolean>;
  onDismiss: (nudgeId: string) => Promise<boolean>;
  onSnooze: (nudgeId: string, until: string) => Promise<boolean>;
  onArchive?: (spaceId: string) => void;
}

export function SpaceHealthNudgeCard({
  nudge,
  onAccept,
  onDismiss,
  onSnooze,
  onArchive,
}: SpaceHealthNudgeCardProps) {
  const navigate = useNavigate();
  const payload = nudge.payload as SpaceHealthNudge['payload'] | null;

  const getIcon = () => {
    switch (nudge.nudge_type) {
      case 'space_almost_complete':
        return <PartyPopper className="h-5 w-5 text-green-500" />;
      case 'space_stalling':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'space_at_risk':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'space_inactive_archive':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = () => {
    const priority = nudge.priority || 'medium';
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const handleViewSpace = async () => {
    await onAccept(nudge.id);
    if (payload?.space_slug) {
      navigate(`/dna/collaborate/spaces/${payload.space_slug}`);
    } else if (nudge.action_url) {
      navigate(nudge.action_url);
    }
  };

  const handleArchive = async () => {
    await onAccept(nudge.id);
    if (onArchive && payload?.space_id) {
      onArchive(payload.space_id);
    }
  };

  const handleSnooze7Days = () => {
    const until = new Date();
    until.setDate(until.getDate() + 7);
    onSnooze(nudge.id, until.toISOString());
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base">
              {payload?.space_name || 'Project Update'}
            </CardTitle>
          </div>
          {getPriorityBadge()}
        </div>
        <CardDescription className="mt-1">{nudge.message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Factors Summary */}
        {payload?.factors && (
          <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 rounded p-2">
            <div className="flex items-center justify-between">
              <span>Health Score:</span>
              <span className="font-medium">{payload.health_score}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Activity:</span>
              <span>{payload.factors.daysSinceLastActivity} days ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tasks:</span>
              <span>
                {payload.factors.completedTasks}/{payload.factors.totalTasks} done
              </span>
            </div>
            {payload.factors.overdueTasksCount > 0 && (
              <div className="flex items-center justify-between text-destructive">
                <span>Overdue:</span>
                <span>{payload.factors.overdueTasksCount} tasks</span>
              </div>
            )}
          </div>
        )}

        {/* Suggested Actions */}
        {payload?.suggested_actions && payload.suggested_actions.length > 0 && (
          <div className="text-xs space-y-1">
            <div className="font-medium">Suggestions:</div>
            <ul className="space-y-0.5 text-muted-foreground">
              {payload.suggested_actions.slice(0, 2).map((action, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-primary">-</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleViewSpace}>
            View Space
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>

          {nudge.nudge_type === 'space_inactive_archive' && onArchive && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleArchive}
              className="text-destructive hover:text-destructive"
            >
              <Archive className="mr-1 h-4 w-4" />
              Archive
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={handleSnooze7Days}>
            <Clock className="mr-1 h-4 w-4" />
            Snooze 7d
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDismiss(nudge.id)}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Check if a nudge is a space health nudge
 */
export function isSpaceHealthNudge(nudge: DiaNudge): boolean {
  return [
    'space_stalling',
    'space_at_risk',
    'space_almost_complete',
    'space_inactive_archive',
  ].includes(nudge.nudge_type);
}
