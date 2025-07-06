import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Globe, 
  Building, 
  MapPin,
  MessageSquare,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminUser } from '@/hooks/useAdminUsers';
import { UserStatusBadge } from './UserStatusBadge';

interface UserProfileModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}

export function UserProfileModal({ user, open, onClose }: UserProfileModalProps) {
  if (!user) return null;

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      relative: formatDistanceToNow(date, { addSuffix: true }),
      absolute: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const joinedDate = formatDate(user.created_at);
  const lastActivityDate = user.last_activity ? formatDate(user.last_activity) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <User className="h-5 w-5" />
            User Profile Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-dna-emerald to-dna-copper text-white text-lg">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.full_name || 'Unnamed User'}
                </h3>
                <UserStatusBadge status={user.status} />
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {user.is_public ? (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>Public Profile</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>Private Profile</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-sm text-gray-900" title={joinedDate.absolute}>
                    {joinedDate.relative}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Activity</p>
                  <p className="text-sm text-gray-900" title={lastActivityDate?.absolute}>
                    {lastActivityDate?.relative || 'No recent activity'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Status</p>
                  <div className="mt-1">
                    <UserStatusBadge status={user.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Onboarding</p>
                  <p className="text-sm text-gray-900">
                    {user.onboarding_completed_at ? (
                      <span className="text-green-600 font-medium">Completed</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">Pending</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Platform Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{user.post_count || 0}</p>
                  <p className="text-sm text-blue-800">Posts Created</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{user.community_count || 0}</p>
                  <p className="text-sm text-green-800">Communities</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-purple-800">Connections</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">0</p>
                  <p className="text-sm text-orange-800">Contributions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Profile Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {user.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Verified</p>
                  <p className="text-sm text-gray-900">
                    <Badge variant="outline" className="text-xs">
                      Pending Verification
                    </Badge>
                  </p>
                </div>
              </div>
              
              {/* Placeholder for future enhanced profile data */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 italic">
                  Additional profile information (bio, location, profession, etc.) will be displayed here when available.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}