import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GroupListItem } from '@/types/groups';
import { Users, Lock, Eye, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GroupCardProps {
  group: GroupListItem;
}

export function GroupCard({ group }: GroupCardProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPrivacyIcon = () => {
    switch (group.privacy) {
      case 'private':
        return <Lock className="h-3 w-3" />;
      case 'secret':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getPrivacyLabel = () => {
    switch (group.privacy) {
      case 'private':
        return 'Private';
      case 'secret':
        return 'Secret';
      default:
        return 'Public';
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/dna/convene/groups/${group.slug}`)}
    >
      {/* Cover Image */}
      {group.cover_image_url ? (
        <div className="h-32 overflow-hidden">
          <img
            src={group.cover_image_url}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-[hsl(151,75%,50%)] to-[hsl(151,75%,35%)]" />
      )}

      <div className="p-4">
        {/* Avatar & Name */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12 border-2 border-background -mt-8">
            <AvatarImage src={group.avatar_url} alt={group.name} />
            <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white">
              {getInitials(group.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg line-clamp-1">{group.name}</h3>
              {getPrivacyIcon() && (
                <Badge variant="outline" className="text-xs">
                  {getPrivacyIcon()}
                  <span className="ml-1">{getPrivacyLabel()}</span>
                </Badge>
              )}
            </div>
            {group.category && (
              <Badge variant="secondary" className="text-xs">
                {group.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {group.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{group.member_count} {group.member_count === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{group.post_count} {group.post_count === 1 ? 'post' : 'posts'}</span>
          </div>
        </div>

        {/* Action Button */}
        {group.is_member ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dna/convene/groups/${group.slug}`);
            }}
          >
            View Group
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full bg-[hsl(151,75%,50%)] hover:bg-[hsl(151,75%,40%)] text-white"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dna/convene/groups/${group.slug}`);
            }}
          >
            {group.join_policy === 'open' ? 'Join Group' : 'View Details'}
          </Button>
        )}
      </div>
    </Card>
  );
}
