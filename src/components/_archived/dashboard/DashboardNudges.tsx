import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDiaNudges } from '@/hooks/useDiaNudges';
import NudgeCard from '@/components/dia/NudgeCard';
import { SpaceHealthNudgeCard, isSpaceHealthNudge } from '@/components/collaboration/SpaceHealthNudgeCard';

const DashboardNudges: React.FC = () => {
  const navigate = useNavigate();
  const { nudges, loading, acceptNudge, dismissNudge, snoozeNudge } = useDiaNudges('sent');

  const handleAccept = async (nudgeId: string) => {
    const nudge = nudges.find(n => n.id === nudgeId);
    const success = await acceptNudge(nudgeId);

    if (success && nudge?.action_url) {
      navigate(nudge.action_url);
    }
    return success;
  };

  const handleArchiveFromNudge = (spaceId: string) => {
    // Navigate to the space where user can archive from there
    const nudge = nudges.find(n =>
      n.payload?.space_id === spaceId && isSpaceHealthNudge(n)
    );
    if (nudge?.payload?.space_slug) {
      navigate(`/dna/collaborate/spaces/${nudge.payload.space_slug}`);
    }
  };

  if (loading) return null;
  if (nudges.length === 0) return null;

  const topNudges = nudges.slice(0, 3);

  return (
    <Card className="mb-6 border-dna-copper/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-dna-copper" />
            <CardTitle className="text-lg text-foreground">DIA Suggestions</CardTitle>
          </div>
          <Badge variant="outline" className="bg-dna-copper/10 text-dna-copper border-dna-copper/30">
            {nudges.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {topNudges.map((nudge) =>
          isSpaceHealthNudge(nudge) ? (
            <SpaceHealthNudgeCard
              key={nudge.id}
              nudge={nudge}
              onAccept={handleAccept}
              onDismiss={dismissNudge}
              onSnooze={snoozeNudge}
              onArchive={handleArchiveFromNudge}
            />
          ) : (
            <NudgeCard
              key={nudge.id}
              nudge={nudge}
              onAccept={handleAccept}
              onDismiss={dismissNudge}
              onSnooze={snoozeNudge}
            />
          )
        )}

        {nudges.length > 3 && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-dna-copper"
              onClick={() => navigate('/dna/nudges')}
            >
              <ChevronRight className="w-4 h-4 mr-1" />
              View all {nudges.length} nudges
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardNudges;