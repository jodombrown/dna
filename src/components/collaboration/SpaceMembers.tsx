import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface SpaceMembersProps {
  spaceId: string;
  canManage: boolean;
}

export function SpaceMembers({ spaceId, canManage }: SpaceMembersProps) {
  const { data: members, isLoading } = useQuery({
    queryKey: ['space-members', spaceId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from('collaboration_memberships')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          status
        `)
        .eq('space_id', spaceId)
        .eq('status', 'approved')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      if (!data || data.length === 0) return [];
      
      const userIds = data.map(m => m.user_id);
      const { data: profiles } = await supabaseClient
        .from('profiles')
        .select('id, full_name, username, avatar_url, headline')
        .in('id', userIds);
      
      // Merge data
      return data.map(member => ({
        ...member,
        profile: profiles?.find(p => p.id === member.user_id) || {
          id: member.user_id,
          full_name: 'Unknown',
          username: 'unknown',
          avatar_url: null,
          headline: null,
        }
      }));
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Members
          </Button>
        </div>
      )}

      {!members || members.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No members yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.profile.avatar_url || undefined} />
                    <AvatarFallback>{member.profile.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{member.profile.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{member.profile.username}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
