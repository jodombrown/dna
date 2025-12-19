import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Lock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CreateSpaceDialog } from '@/components/collaboration/CreateSpaceDialog';

interface CollaborationSpace {
  id: string;
  title: string;
  description: string | null;
  visibility: string;
  status: string;
  image_url: string | null;
  tags: string[] | null;
  created_at: string;
  created_by: string;
  creator: {
    full_name: string;
    avatar_url: string | null;
  };
  member_count?: number;
}

export default function CollaborationSpaces() {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: spaces, isLoading } = useQuery({
    queryKey: ['collaboration-spaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaboration_spaces')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      // Fetch creators separately
      const creatorIds = data.map(s => s.created_by);
      const { data: creators } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', creatorIds);
      
      // Merge data
      return data.map(space => ({
        ...space,
        creator: creators?.find(c => c.id === space.created_by) || {
          full_name: 'Unknown',
          avatar_url: null,
        }
      })) as CollaborationSpace[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading spaces...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Collaboration Spaces</h1>
            <p className="text-muted-foreground">
              Join or create project workspaces to collaborate with the diaspora network
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Space
          </Button>
        </div>

        {!spaces || spaces.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No collaboration spaces yet
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create the First Space
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <Card
                key={space.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/spaces/${space.id}`)}
              >
                {space.image_url && (
                  <div className="w-full h-40 overflow-hidden rounded-t-lg">
                    <img
                      src={space.image_url}
                      alt={space.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="line-clamp-1">{space.title}</CardTitle>
                    {space.visibility === 'private' ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {space.description || 'No description available'}
                  </p>
                </CardHeader>
                <CardContent>
                  {space.tags && space.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {space.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                      {space.tags.length > 3 && (
                        <Badge variant="outline">+{space.tags.length - 3}</Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={space.creator.avatar_url || undefined} />
                        <AvatarFallback>{(space.creator.full_name || 'DN')[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {space.creator.full_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{space.member_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateSpaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
