import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { REBUILD_FLAGS } from '@/lib/rebuildFlags';

interface ProfileSpacesSectionProps {
  userId: string;
  limit?: number;
}

export const ProfileSpacesSection: React.FC<ProfileSpacesSectionProps> = (props) => {
  // STUBBED: Phase 2 teardown. Restore in Phase 3 rebuild.
  if (REBUILD_FLAGS.collaborateContributeRebuild) return null;
  return <ProfileSpacesSectionImpl {...props} />;
};

const ProfileSpacesSectionImpl: React.FC<ProfileSpacesSectionProps> = ({ userId, limit = 5 }) => {
  const navigate = useNavigate();

  const { data: spaces, isLoading } = useQuery({
    queryKey: ['profile-spaces', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('space_members')
        .select(`
          role,
          joined_at,
          spaces (
            id,
            name,
            slug,
            description,
            visibility
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Spaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading spaces...</div>
        </CardContent>
      </Card>
    );
  }

  if (!spaces || spaces.length === 0) {
    return null; // Hide section if user has no spaces
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Spaces
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {spaces.map((membership: any) => {
            const space = membership.spaces;
            if (!space) return null;

            return (
              <div
                key={space.id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                onClick={() => navigate(`/dna/collaborate/spaces/${space.slug}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{space.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {membership.role}
                    </Badge>
                  </div>
                  {space.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {space.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
              </div>
            );
          })}

          {spaces.length === limit && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => navigate('/dna/collaborate/spaces')}
            >
              View all spaces
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
