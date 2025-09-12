import React from 'react';
import { Profile } from '@/services/profilesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Search, MessageSquare, UserPlus, TrendingUp, MapPin, Globe, Briefcase } from 'lucide-react';
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

  const completionScore = profile.profile_completion_score || 0;

  return (
    <div className="space-y-6">
      {/* LinkedIn-style Welcome Header */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {isOwnProfile 
                  ? `Welcome back, ${profile.full_name?.split(' ')[0] || 'Professional'}!` 
                  : `${profile.full_name || profile.username}'s Profile`
                }
              </h2>
              <p className="text-muted-foreground mb-4">
                {isOwnProfile 
                  ? 'Connect with African diaspora professionals worldwide' 
                  : 'Professional in the African diaspora network'
                }
              </p>
              
              {/* Professional Identity Badges */}
              <div className="flex flex-wrap gap-2">
                {profile.country_of_origin && (
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="w-3 h-3" />
                    {profile.country_of_origin}
                  </Badge>
                )}
                {profile.profession && (
                  <Badge variant="outline" className="gap-1">
                    <Briefcase className="w-3 h-3" />
                    {profile.profession}
                  </Badge>
                )}
                {profile.location && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Profile Completion Circle */}
            {isOwnProfile && (
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeOpacity="0.1"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray={`${completionScore}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold">{completionScore}%</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Profile</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn-style Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/20" onClick={() => handleAction('discover')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Discover Professionals</h3>
              <p className="text-sm text-muted-foreground">Find diaspora talent</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/20" onClick={() => handleAction('network')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">My Network</h3>
              <p className="text-sm text-muted-foreground">Manage connections</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/20" onClick={() => handleAction('messages')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-muted-foreground">Connect privately</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/20" onClick={() => handleAction('discover')}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">People You May Know</h3>
              <p className="text-sm text-muted-foreground">Grow your network</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Summary */}
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

      {/* Diaspora Story */}
      {profile.diaspora_story && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">My Diaspora Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{profile.diaspora_story}</p>
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
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Completion CTA */}
      {isOwnProfile && completionScore < 80 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-amber-900">Strengthen Your Profile</h3>
            </div>
            <p className="text-amber-700 text-sm mb-4">
              Complete your profile to attract better connections and opportunities in the diaspora network.
            </p>
            <Link to="/app/profile/edit">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-amber-200 text-amber-700 hover:bg-amber-100"
              >
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Network Impact Stats */}
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
                <div className="text-2xl font-bold text-primary">{profile.connection_count || 0}</div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{profile.profile_views_count || 0}</div>
                <div className="text-sm text-muted-foreground">Profile Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Networking Goals */}
      {profile.networking_goals && profile.networking_goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Networking Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.networking_goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-muted-foreground">{goal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardCenterColumn;