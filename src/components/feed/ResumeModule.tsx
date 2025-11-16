import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLastViewState } from '@/hooks/useLastViewState';
import { useAnalytics } from '@/hooks/useADAAnalytics';
import { ArrowRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const VIEW_STATE_LABELS: Record<string, { title: string; route: string; description: string }> = {
  CONNECT_MODE: {
    title: 'Connect',
    route: '/dna/connect',
    description: 'Continue building your network'
  },
  CONVENE_MODE: {
    title: 'Convene',
    route: '/dna/convene',
    description: 'Explore events and gatherings'
  },
  COLLABORATE_MODE: {
    title: 'Collaborate',
    route: '/dna/collaborate',
    description: 'Work on projects and spaces'
  },
  CONTRIBUTE_MODE: {
    title: 'Contribute',
    route: '/dna/contribute',
    description: 'Offer your help and resources'
  },
  CONVEY_MODE: {
    title: 'Convey',
    route: '/dna/convey',
    description: 'Share your story and insights'
  },
  MESSAGES_MODE: {
    title: 'Messages',
    route: '/dna/messages',
    description: 'Pick up your conversations'
  },
};

export function ResumeModule() {
  const navigate = useNavigate();
  const { lastState, isLoading } = useLastViewState();
  const { trackResumeClick } = useAnalytics();

  if (isLoading || !lastState) {
    return null;
  }

  const viewInfo = VIEW_STATE_LABELS[lastState.last_view_state];
  if (!viewInfo) return null;

  const timeAgo = formatDistanceToNow(new Date(lastState.last_visited_at), { addSuffix: true });

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Resume Your Work
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Last active {timeAgo}
          </p>
          <p className="font-medium mt-1">
            You were exploring <span className="text-primary">{viewInfo.title}</span>
          </p>
        </div>
        <Button
          onClick={() => {
            trackResumeClick(lastState.last_view_state, viewInfo.route, lastState.context);
            navigate(viewInfo.route);
          }}
          variant="default"
          size="sm"
          className="w-full"
        >
          {viewInfo.description}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
