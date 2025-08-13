import React from 'react';
import { Profile } from '@/services/profilesService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, Users, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';
interface DashboardCenterColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

const DashboardCenterColumn: React.FC<DashboardCenterColumnProps> = ({
  profile,
  isOwnProfile
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome/Setup Card for new users */}
      {isOwnProfile && (
        <Card className="border-dna-mint bg-gradient-to-r from-dna-mint/5 to-dna-emerald/5">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to DNA, {profile.full_name?.split(' ')[0] || 'Member'}! 🎉
              </h2>
              <p className="text-gray-600 mb-4">
                Your dashboard is ready. Start connecting, collaborating, and contributing to Africa's future.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/app/search">
                  <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Find People
                  </Button>
                </Link>
                
                <Link to="/app/connect">
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Conversations
                  </Button>
                </Link>
                
                <Link to="/app/admin">
                  <Button variant="outline" className="w-full">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Explore Communities
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* About Section */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
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
                  className="px-3 py-1 bg-dna-emerald/10 text-dna-emerald rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Feed Placeholder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          {isOwnProfile && (
            <RequireProfileScore min={50} featureName="Create Post" showToast showModal={false}>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Share Update
              </Button>
            </RequireProfileScore>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isOwnProfile ? "Share your first update" : "No recent activity"}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              {isOwnProfile 
                ? "Let the community know what you're working on, your latest achievements, or insights you'd like to share."
                : `${profile.full_name?.split(' ')[0] || 'This user'} hasn't shared any updates yet.`
              }
            </p>
            {isOwnProfile && (
              <RequireProfileScore min={50} featureName="Create Post" showToast showModal={false}>
                <Button className="mt-4" variant="default">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </RequireProfileScore>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action for incomplete profiles */}
      {isOwnProfile && (!profile.bio || !profile.skills?.length) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-amber-900 mb-2">
                Complete Your Profile
              </h3>
              <p className="text-amber-700 text-sm mb-4">
                A complete profile helps you connect with the right people and opportunities.
              </p>
              <Link to="/app/profile/edit">
                <Button variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardCenterColumn;