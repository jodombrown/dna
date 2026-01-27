import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Globe, PenSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FeedQuickAccess() {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate('/dna/network/feed')}
        >
          <Users className="h-6 w-6 text-primary" />
          <div className="text-center">
            <div className="font-semibold">Network Feed</div>
            <div className="text-xs text-muted-foreground">
              Updates from connections
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate('/dna/discover/feed')}
        >
          <Globe className="h-6 w-6 text-primary" />
          <div className="text-center">
            <div className="font-semibold">Discover Feed</div>
            <div className="text-xs text-muted-foreground">
              Explore community posts
            </div>
          </div>
        </Button>

        <Button
          className="flex flex-col items-center gap-2 h-auto py-4 bg-primary hover:bg-primary/90"
          onClick={() => navigate('/dna/network/feed')}
        >
          <PenSquare className="h-6 w-6" />
          <div className="text-center">
            <div className="font-semibold">Create Post</div>
            <div className="text-xs opacity-90">
              Share with your network
            </div>
          </div>
        </Button>
      </div>
    </Card>
  );
}
