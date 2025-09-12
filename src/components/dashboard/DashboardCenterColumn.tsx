import React from 'react';
import { Profile } from '@/services/profilesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, MessageSquare, UserPlus, TrendingUp, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardCenterColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

const DashboardCenterColumn: React.FC<DashboardCenterColumnProps> = ({
  profile,
  isOwnProfile
}) => {
  const handleAction = (action: string) => {
    switch(action) {
      case 'discover':
        window.location.href = '/app/search';
        break;
      case 'network':
        window.location.href = '/app/connect';
        break;
      case 'messages':
        window.location.href = '/app/messages';
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">
            {isOwnProfile 
              ? `Welcome back, ${profile.full_name?.split(' ')[0] || 'Member'}!` 
              : `${profile.full_name || profile.username}'s Profile`
            }
          </h2>
          <p className="text-muted-foreground">
            {isOwnProfile 
              ? 'Build meaningful connections across the African diaspora professional network' 
              : 'Connect with diaspora professionals and expand your network'
            }
          </p>
        </CardContent>
      </Card>

      {/* Connection Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAction('discover')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Discover People</h3>
              <p className="text-sm text-muted-foreground">Find diaspora professionals</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAction('network')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">My Network</h3>
              <p className="text-sm text-muted-foreground">Manage your connections</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAction('messages')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Messages</h3>
              <p className="text-sm text-muted-foreground">Connect with your network</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAction('discover')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Grow Network</h3>
              <p className="text-sm text-muted-foreground">Get connection suggestions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills & Expertise */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Completion CTA */}
      {isOwnProfile && (!profile.bio || !profile.skills?.length) && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-900">Complete Your Profile</h3>
            </div>
            <p className="text-orange-700 text-sm mb-4">
              Complete your profile to get better connection recommendations and increase your visibility in the network.
            </p>
            <Link to="/settings/profile">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-orange-200 text-orange-700 hover:bg-orange-100"
              >
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Network Stats */}
      {isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Network Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Profile Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Messages Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardCenterColumn;