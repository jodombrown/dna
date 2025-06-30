
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar,
  Activity,
  Ban,
  Shield,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedUserCardProps {
  user: any;
  onViewProfile: (userId: string) => void;
  onSuspendUser: (userId: string) => void;
  onMakeAdmin: (userId: string) => void;
  isLoading: boolean;
}

const EnhancedUserCard: React.FC<EnhancedUserCardProps> = ({
  user,
  onViewProfile,
  onSuspendUser,
  onMakeAdmin,
  isLoading
}) => {
  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
              <AvatarFallback>
                {(user.full_name || user.email)?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{user.full_name || 'Unknown User'}</h3>
                {user.is_admin && (
                  <Badge className="bg-dna-emerald text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(true)}
                {user.is_public && (
                  <Badge variant="outline">Public Profile</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
          </div>

          {user.profession && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user.profession}</span>
            </div>
          )}

          {user.bio && (
            <p className="text-sm text-gray-700 line-clamp-2">{user.bio}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span>{user.posts_count || 0} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Last active: {formatDistanceToNow(new Date(user.updated_at || user.created_at))} ago</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(user.id)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Profile
            </Button>
            
            <div className="flex gap-2">
              {!user.is_admin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMakeAdmin(user.id)}
                  disabled={isLoading}
                  className="text-dna-emerald hover:text-dna-emerald"
                >
                  <Shield className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSuspendUser(user.id)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Ban className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedUserCard;
