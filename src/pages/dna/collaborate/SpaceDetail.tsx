import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FeedLayout } from '@/components/layout/FeedLayout';
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
import { supabaseClient } from '@/lib/supabaseHelpers';
import { Loader2, Settings, ExternalLink, ArrowLeft, Users, BarChart } from 'lucide-react';
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

  if (isLoading || membershipLoading) {
    return (
      <FeedLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </FeedLayout>
    );
  }

  if (!space) {
    return (
      <FeedLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">Space not found</p>
            </CardContent>
          </Card>
        </div>
      </FeedLayout>
    );
  }

  const isMember = !!membership;
  const isLead = membership?.role === 'lead';

  return (
    <FeedLayout>
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
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{space.name}</h1>
              {space.tagline && (
                <p className="text-xl text-muted-foreground mt-2">{space.tagline}</p>
              )}
            </div>
            <Badge variant={space.status === 'active' ? 'default' : 'secondary'} className="text-sm shrink-0">
              {space.status}
            </Badge>
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
          <div className="flex gap-3">
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

        {/* Tabbed Content */}
        {isMember && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              {isLead && <TabsTrigger value="insights">Insights</TabsTrigger>}
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
              <Card>
                <CardHeader>
                  <CardTitle>Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpaceUpdates spaceId={space.id} canEdit={isLead} />
                </CardContent>
              </Card>
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
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </FeedLayout>
  );
}
