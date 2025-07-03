
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Crown, Users } from 'lucide-react';
import { useCommunities } from '@/hooks/useCommunities';
import { useAuth } from '@/contexts/CleanAuthContext';
import CommunityCard from '@/components/community/CommunityCard';
import CreateCommunityDialog from '@/components/community/CreateCommunityDialog';
import { useState } from 'react';

const MyCommunities = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { communities, loading, createCommunity, joinCommunity, leaveCommunity } = useCommunities();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filter communities where user is a member
  const myCommunities = communities.filter(community => community.is_member);
  const myCreatedCommunities = myCommunities.filter(community => community.created_by === user?.id);
  const myJoinedCommunities = myCommunities.filter(community => community.created_by !== user?.id);

  const handleViewDetails = (communityId: string) => {
    navigate(`/communities/${communityId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in Required</h3>
              <p className="text-gray-600 mb-6">Please sign in to view your communities.</p>
              <Button onClick={() => navigate('/functional-auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Communities</h1>
              <p className="text-gray-600 mt-2">
                Manage the communities you've created and joined
              </p>
            </div>
            
            <CreateCommunityDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onCreateCommunity={createCommunity}
              trigger={
                <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Button>
              }
            />
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-dna-mint rounded-lg">
                    <Crown className="w-5 h-5 text-dna-forest" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{myCreatedCommunities.length}</p>
                    <p className="text-sm text-gray-600">Created</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{myJoinedCommunities.length}</p>
                    <p className="text-sm text-gray-600">Joined</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{myCommunities.length}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dna-emerald"></div>
            <p className="mt-4 text-gray-600">Loading your communities...</p>
          </div>
        ) : myCommunities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first community or explore existing ones to join.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/communities')}
                >
                  Browse Communities
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Created Communities */}
            {myCreatedCommunities.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-dna-gold" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Communities I Created ({myCreatedCommunities.length})
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCreatedCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      onJoin={joinCommunity}
                      onLeave={leaveCommunity}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Joined Communities */}
            {myJoinedCommunities.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Communities I Joined ({myJoinedCommunities.length})
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myJoinedCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      onJoin={joinCommunity}
                      onLeave={leaveCommunity}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyCommunities;
