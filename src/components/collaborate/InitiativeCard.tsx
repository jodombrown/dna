import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Initiative } from '@/types/collaborate';
import { cn } from '@/lib/utils';

interface InitiativeCardProps {
  initiative: Initiative;
}

export function InitiativeCard({ initiative }: InitiativeCardProps) {
  const statusColors: Record<string, string> = {
    active: 'border-green-500 bg-green-50 text-green-700',
    paused: 'border-yellow-500 bg-yellow-50 text-yellow-700',
    completed: 'border-blue-500 bg-blue-50 text-blue-700',
    cancelled: 'border-gray-500 bg-gray-50 text-gray-700',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">{initiative.title}</CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={cn('text-xs', statusColors[initiative.status] || statusColors.active)}
          >
            {initiative.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {initiative.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {initiative.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {initiative.impact_area && (
            <span className="bg-muted px-2 py-0.5 rounded">{initiative.impact_area}</span>
          )}
          {initiative.target_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(initiative.target_date), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
