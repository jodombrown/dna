import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SpaceHealthData, spaceHealthService } from '@/services/spaceHealthService';
import { Activity, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface SpaceHealthBadgeProps {
  healthData: SpaceHealthData;
  showScore?: boolean;
  showTooltip?: boolean;
  onClick?: () => void;
}

export function SpaceHealthBadge({
  healthData,
  showScore = false,
  showTooltip = true,
  onClick,
}: SpaceHealthBadgeProps) {
  const { status, score, factors } = healthData;
  const color = spaceHealthService.getHealthColor(status);
  const label = spaceHealthService.getHealthLabel(status);

  // Map color to badge variant and icon
  const getVariantAndIcon = () => {
    switch (color) {
      case 'green':
        return {
          variant: 'default' as const,
          className: 'bg-green-500 hover:bg-green-600',
          icon: <CheckCircle2 className="h-3 w-3" />,
        };
      case 'yellow':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-500 text-yellow-900 hover:bg-yellow-600',
          icon: <Clock className="h-3 w-3" />,
        };
      case 'orange':
        return {
          variant: 'secondary' as const,
          className: 'bg-orange-500 text-white hover:bg-orange-600',
          icon: <AlertTriangle className="h-3 w-3" />,
        };
      case 'red':
        return {
          variant: 'destructive' as const,
          className: '',
          icon: <XCircle className="h-3 w-3" />,
        };
      default:
        return {
          variant: 'outline' as const,
          className: '',
          icon: <Activity className="h-3 w-3" />,
        };
    }
  };

  const { variant, className, icon } = getVariantAndIcon();

  const badgeContent = (
    <Badge
      variant={variant}
      className={`${className} ${onClick ? 'cursor-pointer' : ''} flex items-center gap-1`}
      onClick={onClick}
    >
      {icon}
      {showScore ? `${score}` : label}
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">
              Health Score: {score}/100 - {label}
            </div>
            <div className="text-xs space-y-1">
              <div>Last activity: {factors.daysSinceLastActivity} days ago</div>
              <div>
                Tasks: {factors.completedTasks}/{factors.totalTasks} completed
                ({Math.round(factors.taskCompletionRate)}%)
              </div>
              {factors.overdueTasksCount > 0 && (
                <div className="text-destructive">
                  {factors.overdueTasksCount} overdue task
                  {factors.overdueTasksCount > 1 ? 's' : ''}
                </div>
              )}
              <div>
                Members: {factors.activeMembers}/{factors.totalMembers} active
              </div>
            </div>
            {onClick && (
              <div className="text-xs text-muted-foreground pt-1 border-t">
                Click for details
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
