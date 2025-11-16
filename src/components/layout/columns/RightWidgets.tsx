import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Calendar } from 'lucide-react';

interface RightWidgetsProps {
  variant?: 'default' | 'connect' | 'convene' | 'convey';
}

/**
 * RightWidgets - Adaptive right column widgets
 * Changes based on the current mode (connect, convene, etc.)
 */
export function RightWidgets({ variant = 'default' }: RightWidgetsProps) {
  return (
    <div className="space-y-4 sticky top-4">
      {/* Trending / Suggested Content */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">
            {variant === 'connect' && 'Suggested Connections'}
            {variant === 'convene' && 'Upcoming Events'}
            {variant === 'convey' && 'Trending Stories'}
            {variant === 'default' && 'Trending'}
          </h3>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Widget content based on {variant} mode</p>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Quick Actions</h3>
        </div>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Calendar className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </Card>
    </div>
  );
}
