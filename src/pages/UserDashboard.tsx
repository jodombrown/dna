
import React from 'react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  Users, 
  MessageCircle, 
  Calendar,
  Heart,
  TrendingUp,
  LogOut
} from 'lucide-react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

const UserDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const quickActions = [
    {
      title: 'Edit Profile',
      description: 'Complete and update your professional profile',
      icon: User,
      action: () => navigate('/profile/my?edit=1'),
      color: 'bg-dna-emerald'
    },
    {
      title: 'Connect',
      description: 'Find and network with diaspora professionals',
      icon: Users,
      action: () => navigate('/connect'),
      color: 'bg-dna-copper'
    },
    {
      title: 'Messages',
      description: 'Chat with your professional network',
      icon: MessageCircle,
      action: () => navigate('/messages'),
      color: 'bg-dna-gold'
    },
    {
      title: 'Events',
      description: 'Discover community events and workshops',
      icon: Calendar,
      action: () => navigate('/connect?tab=events'),
      color: 'bg-dna-forest'
    }
  ];

  const profileCompletion = profile ? 
    Math.round(((profile.full_name ? 1 : 0) + 
               (profile.bio ? 1 : 0) + 
               (profile.profession ? 1 : 0) + 
               (profile.location ? 1 : 0) + 
               (profile.linkedin_url ? 1 : 0)) / 5 * 100) : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'DNA Member'}!
                </h1>
                <p className="text-gray-600 mt-1">
                  Ready to connect, collaborate, and contribute to Africa's future?
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Profile Completion Alert */}
          {profileCompletion < 80 && (
            <Card className="mb-6 border-l-4 border-l-dna-copper">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-dna-forest">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600">
                      Your profile is {profileCompletion}% complete. Finish it to unlock full networking potential.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/profile/my?edit=1')}
                    className="bg-dna-copper hover:bg-dna-gold"
                  >
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Profile Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-gray-900">--</div>
                  <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Views this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-gray-900">--</div>
                  <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Professional network</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Impact Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-2xl font-bold text-gray-900">--</div>
                  <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Community contributions</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to DNA!</h3>
                <p className="text-gray-600 mb-4">
                  Start connecting with the diaspora community to see your activity here.
                </p>
                <Button 
                  onClick={() => navigate('/connect')}
                  className="bg-dna-emerald hover:bg-dna-forest"
                >
                  Start Networking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserDashboard;
