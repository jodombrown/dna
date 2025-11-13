import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, ArrowRight, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActiveSpacesWidgetProps {
  userId: string;
  limit?: number;
}

export const ActiveSpacesWidget: React.FC<ActiveSpacesWidgetProps> = ({ 
  userId, 
  limit = 3 
}) => {
  const navigate = useNavigate();

  const { data: spaces, isLoading } = useQuery({
    queryKey: ['active-spaces', userId, limit],
    queryFn: async () => {
      // Fetch groups the user is a member of
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          groups (
            id,
            name,
            slug,
            description,
            avatar_url,
            member_count,
            privacy
          )
        `)
        .eq('user_id', userId)
        .eq('is_banned', false)
        .order('joined_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.map(d => (d as any).groups).filter(Boolean) || [];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Spaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasSpaces = spaces && spaces.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Spaces</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dna/convene/groups')}
            className="text-dna-copper hover:text-dna-copper/80"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasSpaces ? (
          <div className="text-center py-8">
            <div className="mb-4 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">No active spaces</p>
              <p className="text-sm">Join groups and collaboration spaces to get started</p>
            </div>
            <Button onClick={() => navigate('/dna/convene/groups')} variant="outline">
              Explore Spaces
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {spaces.map((space: any) => (
              <div
                key={space.id}
                onClick={() => navigate(`/dna/convene/groups/${space.slug}`)}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={space.avatar_url} alt={space.name} />
                  <AvatarFallback className="bg-dna-forest/10 text-dna-forest rounded-lg">
                    {space.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                    {space.name}
                  </h4>
                  {space.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {space.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{space.member_count} members</span>
                    {space.privacy === 'private' && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Private</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
