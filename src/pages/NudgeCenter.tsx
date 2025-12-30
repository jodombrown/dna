import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Clock, CheckCircle2, Archive } from 'lucide-react';
import { useDiaNudges, DiaNudge } from '@/hooks/useDiaNudges';
import NudgeCard from '@/components/dia/NudgeCard';
import { SpaceHealthNudgeCard, isSpaceHealthNudge } from '@/components/collaboration/SpaceHealthNudgeCard';
import { ArchiveSpaceDialog } from '@/components/collaboration/ArchiveSpaceDialog';
import { useArchiveSpace } from '@/hooks/useSpaceHealth';
import { useNavigate } from 'react-router-dom';

const NudgeCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sent');
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveSpaceData, setArchiveSpaceData] = useState<{ id: string; name: string } | null>(null);

  const { nudges, loading, acceptNudge, dismissNudge, snoozeNudge } = useDiaNudges(
    activeTab === 'sent' ? 'sent' : 'all'
  );
  const archiveSpace = useArchiveSpace();

  const handleAccept = async (nudgeId: string) => {
    const nudge = nudges.find(n => n.id === nudgeId);
    const success = await acceptNudge(nudgeId);

    if (success && nudge?.action_url) {
      navigate(nudge.action_url);
    }
    return success;
  };

  const handleArchiveFromNudge = (spaceId: string) => {
    const nudge = nudges.find(n =>
      n.payload?.space_id === spaceId && isSpaceHealthNudge(n)
    );
    if (nudge?.payload) {
      setArchiveSpaceData({
        id: nudge.payload.space_id,
        name: nudge.payload.space_name,
      });
      setArchiveDialogOpen(true);
    }
  };

  const handleArchiveConfirm = async (summary?: string, notifyMembers?: boolean) => {
    if (!archiveSpaceData) return;
    await archiveSpace.mutateAsync({
      spaceId: archiveSpaceData.id,
      summary,
      notifyMembers,
    });
    setArchiveDialogOpen(false);
    setArchiveSpaceData(null);
  };

  const sentNudges = nudges.filter(n => n.status === 'sent');
  const acceptedNudges = nudges.filter(n => n.status === 'accepted');
  const dismissedNudges = nudges.filter(n => n.status === 'dismissed');
  const snoozedNudges = nudges.filter(n => n.status === 'snoozed');

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const renderNudgeList = (nudgeList: DiaNudge[], emptyMessage: string) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading nudges...</div>
        </div>
      );
    }

    if (nudgeList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {nudgeList.map((nudge) => (
          <div key={nudge.id} className="relative">
            {/* Render space health nudges with special card */}
            {isSpaceHealthNudge(nudge) ? (
              <SpaceHealthNudgeCard
                nudge={nudge}
                onAccept={handleAccept}
                onDismiss={dismissNudge}
                onSnooze={snoozeNudge}
                onArchive={handleArchiveFromNudge}
              />
            ) : (
              <>
                {nudge.priority && (
                  <Badge
                    variant={getPriorityColor(nudge.priority)}
                    className="absolute -top-2 -right-2 z-10"
                  >
                    {nudge.priority}
                  </Badge>
                )}
                <NudgeCard
                  nudge={nudge}
                  onAccept={handleAccept}
                  onDismiss={dismissNudge}
                  onSnooze={snoozeNudge}
                />
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Nudge Center</h1>
        <p className="text-muted-foreground">
          Your personalized suggestions to help you stay connected and engaged
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Nudges</span>
            <Badge variant="outline" className="ml-2">
              {sentNudges.length} pending
            </Badge>
          </CardTitle>
          <CardDescription>
            DIA analyzes your activity and suggests actions to help you get the most from DNA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Pending</span>
                {sentNudges.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {sentNudges.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="snoozed" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Snoozed</span>
                {snoozedNudges.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {snoozedNudges.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="accepted" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Done</span>
              </TabsTrigger>
              <TabsTrigger value="dismissed" className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                <span className="hidden sm:inline">Archived</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sent">
              {renderNudgeList(sentNudges, "No pending nudges. You're all caught up!")}
            </TabsContent>

            <TabsContent value="snoozed">
              {renderNudgeList(snoozedNudges, "No snoozed nudges")}
            </TabsContent>

            <TabsContent value="accepted">
              {renderNudgeList(acceptedNudges, "No completed actions yet")}
            </TabsContent>

            <TabsContent value="dismissed">
              {renderNudgeList(dismissedNudges, "No archived nudges")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">About DIA Nudges</h3>
        <p className="text-sm text-muted-foreground">
          DIA (Diaspora Intelligence Agent) is your AI companion that learns from your
          activity patterns to provide timely, personalized suggestions. Nudges are designed to help
          you maintain connections, discover opportunities, and stay engaged with the DNA community.
        </p>
      </div>

      {/* Archive Space Dialog */}
      <ArchiveSpaceDialog
        isOpen={archiveDialogOpen}
        onClose={() => {
          setArchiveDialogOpen(false);
          setArchiveSpaceData(null);
        }}
        spaceName={archiveSpaceData?.name || ''}
        onConfirm={handleArchiveConfirm}
        isLoading={archiveSpace.isPending}
      />
    </div>
  );
};

export default NudgeCenter;
