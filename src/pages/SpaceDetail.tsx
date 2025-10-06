import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, CheckSquare, Target } from 'lucide-react';
import { SpaceOverview } from '@/components/collaboration/SpaceOverview';
import { SpaceTasks } from '@/components/collaboration/SpaceTasks';
import { SpaceMilestones } from '@/components/collaboration/SpaceMilestones';
import { SpaceMembers } from '@/components/collaboration/SpaceMembers';

export default function SpaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: space, isLoading } = useQuery({
    queryKey: ['space', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_spaces')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Fetch creator separately
      const { data: creator } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('id', data.created_by)
        .single();
      
      return {
        ...data,
        creator: creator || { id: data.created_by, full_name: 'Unknown', username: 'unknown', avatar_url: null }
      };
    },
  });

  const { data: membership } = useQuery({
    queryKey: ['space-membership', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('collaboration_memberships')
        .select('*')
        .eq('space_id', id)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle();

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading space...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Space not found</p>
      </div>
    );
  }

  const isMember = !!membership;
  const isOwnerOrAdmin = membership?.role === 'owner' || membership?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dna/spaces')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Spaces
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{space.title}</h1>
          {space.description && (
            <p className="text-muted-foreground">{space.description}</p>
          )}
        </div>

        {!isMember ? (
          <div className="bg-muted/50 rounded-lg p-6 text-center mb-8">
            <p className="mb-4">You need to be a member to view this space's content</p>
            <Button>Request to Join</Button>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckSquare className="mr-2 h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="milestones">
                <Target className="mr-2 h-4 w-4" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="mr-2 h-4 w-4" />
                Members
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <SpaceOverview spaceId={id!} />
            </TabsContent>

            <TabsContent value="tasks">
              <SpaceTasks spaceId={id!} canEdit={isMember} />
            </TabsContent>

            <TabsContent value="milestones">
              <SpaceMilestones spaceId={id!} canEdit={isOwnerOrAdmin} />
            </TabsContent>

            <TabsContent value="members">
              <SpaceMembers spaceId={id!} canManage={isOwnerOrAdmin} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
