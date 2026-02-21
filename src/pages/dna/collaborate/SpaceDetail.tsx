import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DetailViewLayout from '@/layouts/DetailViewLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSpaceBySlug } from '@/hooks/useSpaces';
import { useJoinSpace, useLeaveSpace } from '@/hooks/useSpaceMutations';
import { SpaceMembers } from '@/components/collaboration/SpaceMembers';
import { SpaceTasks } from '@/components/collaboration/SpaceTasks';
import { SpaceUpdates } from '@/components/collaboration/SpaceUpdates';
import { SpaceInsights } from '@/components/collaboration/SpaceInsights';
import { SpaceHealthBadge } from '@/components/collaboration/SpaceHealthBadge';
import { SpaceHealthDetailsPanel } from '@/components/collaboration/SpaceHealthDetailsPanel';
import { CompletionCelebration } from '@/components/collaboration/CompletionCelebration';
import { ArchiveSpaceDialog } from '@/components/collaboration/ArchiveSpaceDialog';
import SpaceNeedsSection from '@/components/contribute/SpaceNeedsSection';
import SpaceChannelCTA from '@/components/collaborate/SpaceChannelCTA';
import { useSpaceHealth, useArchiveSpace, useReactivateSpace, useMarkSpaceComplete } from '@/hooks/useSpaceHealth';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { Loader2, Settings, ExternalLink, ArrowLeft, Users, BarChart, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function SpaceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: space, isLoading } = useSpaceBySlug(slug || '');
  const joinSpace = useJoinSpace();
  const leaveSpace = useLeaveSpace();
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [membership, setMembership] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [showHealthDetails, setShowHealthDetails] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [hasSeenCelebration, setHasSeenCelebration] = useState(false);

  // Health monitoring hooks
  const isLead = membership?.role === 'lead';
  const { data: healthData, isLoading: healthLoading } = useSpaceHealth(space?.id, isLead);
  const archiveSpace = useArchiveSpace();
  const reactivateSpace = useReactivateSpace();
  const markSpaceComplete = useMarkSpaceComplete();

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
      setMembershipLoading(false);
    }
    loadUserData();
  }, []);

  useEffect(() => {
    async function loadMembership() {
      if (!space || !currentUserId) return;

      const { data } = await supabaseClient
        .from('space_members')
        .select('*')
        .eq('space_id', space.id)
        .eq('user_id', currentUserId)
        .single();

      setMembership(data);
    }

    async function loadCreator() {
      if (!space) return;

      const { data } = await supabaseClient
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('id', space.created_by)
        .single();

      setCreator(data);
    }

    loadMembership();
    loadCreator();
  }, [space, currentUserId]);

  // Check for completion celebration trigger
  useEffect(() => {
    if (
      healthData?.status === 'complete' &&
      membership?.role === 'lead' &&
      !hasSeenCelebration &&
      space?.status !== 'completed'
    ) {
      setShowCelebration(true);
      setHasSeenCelebration(true);
    }
  }, [healthData?.status, membership?.role, hasSeenCelebration, space?.status]);

  const handleJoin = async () => {
    if (!space || !currentUserId) return;
    
    await joinSpace.mutateAsync({ spaceId: space.id, userId: currentUserId });
    window.location.reload();
  };

  const handleLeave = async () => {
    if (!space || !currentUserId) return;

    if (window.confirm('Are you sure you want to leave this space?')) {
      try {
        await leaveSpace.mutateAsync({ spaceId: space.id, userId: currentUserId });
        navigate('/dna/collaborate/my-spaces');
      } catch (error: any) {
        // Error is handled by the mutation
      }
    }
  };

  const handleArchive = async (summary?: string, notifyMembers?: boolean) => {
    if (!space) return;
    await archiveSpace.mutateAsync({
      spaceId: space.id,
      summary,
      notifyMembers,
    });
    window.location.reload();
  };

  const handleReactivate = async () => {
    if (!space) return;
    await reactivateSpace.mutateAsync(space.id);
    window.location.reload();
  };

  const handleMarkComplete = async () => {
    if (!space) return;
    await markSpaceComplete.mutateAsync(space.id);
    window.location.reload();
  };

  const handleAddMoreTasks = () => {
    // Navigate to tasks tab
    const tabsList = document.querySelector('[value="tasks"]');
    if (tabsList) {
      (tabsList as HTMLElement).click();
    }
  };

  if (isLoading || membershipLoading) {
    return (
      <DetailViewLayout
        title="Loading..."
        backPath="/dna/collaborate/spaces"
        backLabel="Back to Spaces"
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DetailViewLayout>
    );
  }

  if (!space) {
    return (
      <DetailViewLayout
        title="Space Not Found"
        backPath="/dna/collaborate/spaces"
        backLabel="Back to Spaces"
      >
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">Space not found</p>
            </CardContent>
          </Card>
        </div>
      </DetailViewLayout>
    );
  }

  const isMember = !!membership;

  return (
    <DetailViewLayout
      title={space.name}
      backPath="/dna/collaborate/spaces"
      backLabel="Back to Spaces"
      breadcrumbs={[
        { label: 'Home', path: '/dna/feed' },
        { label: 'Collaborate', path: '/dna/collaborate/spaces' },
        { label: space.name }
      ]}
    >
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dna/collaborate/spaces')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Spaces
        </Button>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-4xl font-bold break-words">{space.name}</h1>
              {space.tagline && (
                <p className="text-xl text-muted-foreground mt-2">{space.tagline}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={space.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                {space.status}
              </Badge>
              {/* Health Badge for leads */}
              {isLead && healthData && (
                <SpaceHealthBadge
                  healthData={healthData}
                  showTooltip={true}
                  onClick={() => setShowHealthDetails(!showHealthDetails)}
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {space.space_type.replace('_', ' ')}
            </Badge>
            {space.visibility === 'invite_only' && (
              <Badge variant="outline">Invite Only</Badge>
            )}
            {space.region && (
              <Badge variant="outline">📍 {space.region}</Badge>
            )}
          </div>

          {/* Hosted By */}
          {creator && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Hosted by:</span>
              <Link to={`/profile/${creator.username}`} className="flex items-center gap-2 hover:underline">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={creator.avatar_url || undefined} />
                  <AvatarFallback>{creator.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{creator.full_name}</span>
              </Link>
            </div>
          )}

          {/* Primary Actions */}
          <div className="flex flex-wrap gap-3">
            {!isMember && currentUserId && (
              <Button onClick={handleJoin} disabled={joinSpace.isPending}>
                {joinSpace.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {space.visibility === 'invite_only' ? 'Request to Join' : 'Join Space'}
              </Button>
            )}
            {isMember && !isLead && (
              <Button variant="outline" onClick={handleLeave} disabled={leaveSpace.isPending}>
                {leaveSpace.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Leave Space
              </Button>
            )}
            {isLead && (
              <Button onClick={() => navigate(`/dna/collaborate/spaces/${slug}/settings`)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            )}
            <SpaceChannelCTA
              spaceId={space.id}
              spaceName={space.name}
              isMember={isMember}
              isArchived={(space.status as string) === 'archived' || space.status === 'completed'}
              isOwner={isLead}
            />
          </div>
        </div>

        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {space.description && (
              <p className="text-muted-foreground whitespace-pre-wrap">{space.description}</p>
            )}

            {space.external_link && (
              <div>
                <h4 className="font-semibold mb-2">External Link</h4>
                <a 
                  href={space.external_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {space.external_link}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {space.origin_event_id && (
              <div>
                <h4 className="font-semibold mb-2">Origin</h4>
                <Link 
                  to={`/dna/convene/events/${space.origin_event_id}`}
                  className="text-primary hover:underline"
                >
                  View Origin Event →
                </Link>
              </div>
            )}

            {space.origin_group_id && (
              <div>
                <h4 className="font-semibold mb-2">Origin Group</h4>
                <Link 
                  to={`/dna/convene/groups/${space.origin_group_id}`}
                  className="text-primary hover:underline"
                >
                  View Origin Group →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Focus Areas */}
        {space.focus_areas && space.focus_areas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Focus Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {space.focus_areas.map((area, idx) => (
                  <Badge key={idx} variant="outline">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Details Panel - for leads when expanded */}
        {isLead && showHealthDetails && healthData && (
          <SpaceHealthDetailsPanel
            healthData={healthData}
            spaceStatus={space.status}
            onArchive={() => setShowArchiveDialog(true)}
            onReactivate={handleReactivate}
            onMarkComplete={handleMarkComplete}
            isLoading={archiveSpace.isPending || reactivateSpace.isPending || markSpaceComplete.isPending}
          />
        )}

        {/* Tabbed Content */}
        {isMember && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 sm:grid sm:grid-cols-5">
              <TabsTrigger value="overview" className="flex-1 min-w-[70px] text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="tasks" className="flex-1 min-w-[70px] text-xs sm:text-sm">Tasks</TabsTrigger>
              <TabsTrigger value="updates" className="flex-1 min-w-[70px] text-xs sm:text-sm">Updates</TabsTrigger>
              <TabsTrigger value="contribute" className="flex-1 min-w-[70px] text-xs sm:text-sm">Contribute</TabsTrigger>
              {isLead && <TabsTrigger value="insights" className="flex-1 min-w-[70px] text-xs sm:text-sm">Insights</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SpaceMembers spaceId={space.id} canManage={isLead} />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={() => navigate(`/dna/collaborate/spaces/${slug}/board`)}>
                  View Kanban Board
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tasks</CardTitle>
                    <Button onClick={() => navigate(`/dna/collaborate/spaces/${slug}/board`)}>
                      Board View
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <SpaceTasks spaceId={space.id} canEdit={isLead} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="updates">
              <SpaceUpdates 
                spaceId={space.id} 
                canEdit={isLead || isMember}
                spaceName={space.name}
              />
            </TabsContent>

            <TabsContent value="contribute">
              <SpaceNeedsSection spaceId={space.id} isLead={isLead} />
            </TabsContent>

            {isLead && (
              <TabsContent value="insights">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5" />
                      Space Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SpaceInsights spaceId={space.id} isLead={isLead} />
                  </CardContent>
                </Card>

                {/* Health Section in Insights */}
                {healthData && (
                  <div className="mt-6">
                    <SpaceHealthDetailsPanel
                      healthData={healthData}
                      spaceStatus={space.status}
                      onArchive={() => setShowArchiveDialog(true)}
                      onReactivate={handleReactivate}
                      onMarkComplete={handleMarkComplete}
                      isLoading={archiveSpace.isPending || reactivateSpace.isPending || markSpaceComplete.isPending}
                    />
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        )}

        {/* Completion Celebration Dialog */}
        <CompletionCelebration
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          spaceName={space.name}
          onMarkComplete={handleMarkComplete}
          onAddMoreTasks={handleAddMoreTasks}
          onKeepOpen={() => setShowCelebration(false)}
          isLoading={markSpaceComplete.isPending}
        />

        {/* Archive Space Dialog */}
        <ArchiveSpaceDialog
          isOpen={showArchiveDialog}
          onClose={() => setShowArchiveDialog(false)}
          spaceName={space.name}
          onConfirm={handleArchive}
          isLoading={archiveSpace.isPending}
        />
      </div>
    </DetailViewLayout>
  );
}
