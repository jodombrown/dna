import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Crown } from 'lucide-react';
import type { SpaceMember, SpaceRole } from '@/types/collaborate';

interface MemberListProps {
  members: SpaceMember[];
  roles: SpaceRole[];
  onInvite: () => void;
}

export function MemberList({ members, roles, onInvite }: MemberListProps) {
  const getRoleInfo = (roleId?: string) => 
    roles.find(r => r.id === roleId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-foreground">Team Members</h2>
        <Button onClick={onInvite} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {members.map((member) => {
          const roleInfo = getRoleInfo(member.role_id);
          return (
            <Card key={member.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.user?.avatar_url || ''} />
                    <AvatarFallback>
                      {member.user?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{member.user?.full_name}</p>
                      {roleInfo?.is_lead && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    {member.user?.username && (
                      <p className="text-sm text-muted-foreground">@{member.user.username}</p>
                    )}
                    {roleInfo && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {roleInfo.title}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No members yet. Invite your first team member!</p>
          <Button onClick={onInvite} className="mt-4 bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      )}
    </div>
  );
}
