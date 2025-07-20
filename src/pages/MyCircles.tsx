import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Building, Heart, MessageCircle, UserPlus, Plus } from 'lucide-react';
import { searchCommunities } from '@/services/communityService';
import { useNavigate } from 'react-router-dom';
import CommunityCreationDialog from '@/components/community/CommunityCreationDialog';

const MyCircles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user's communities
  const { data: userCommunities = [], isLoading: communitiesLoading } = useQuery({
    queryKey: ['userCommunities'],
    queryFn: () => searchCommunities(''),
    select: (data) => data.filter(community => community.is_member)
  });

  // Mock data for people and causes - would be fetched from actual tables
  const followedPeople = [
    { id: '1', name: 'Sarah Johnson', role: 'Tech Entrepreneur', avatar: '', location: 'Lagos, Nigeria' },
    { id: '2', name: 'Michael Chen', role: 'Investment Analyst', avatar: '', location: 'Toronto, Canada' }
  ];

  const myCauses = [
    'Education Access', 'Youth Empowerment', 'Tech Innovation', 'Climate Action'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Circles</h1>
          <p className="text-gray-600 mt-2">Your network of people, communities, and causes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* People I Follow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-dna-emerald" />
                People I Follow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {followedPeople.map((person) => (
                <div key={person.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback className="bg-dna-mint text-dna-forest">
                      {person.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{person.name}</p>
                    <p className="text-sm text-gray-500 truncate">{person.role}</p>
                    <p className="text-xs text-gray-400">{person.location}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Find More People
              </Button>
            </CardContent>
          </Card>

          {/* My Communities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-dna-copper" />
                  My Communities
                </CardTitle>
                <CommunityCreationDialog 
                  trigger={
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {communitiesLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Loading your communities...</p>
                </div>
              ) : userCommunities.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">No communities yet</p>
                  <p className="text-sm text-gray-400 mb-4">Join communities to connect with like-minded professionals</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/connect?tab=communities')}
                    className="text-dna-emerald border-dna-emerald hover:bg-dna-emerald hover:text-white"
                  >
                    Discover Communities
                  </Button>
                </div>
              ) : (
                <>
                  {userCommunities.map((community) => (
                    <div 
                      key={community.id} 
                      className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/community/${community.id}`)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={community.image_url} />
                          <AvatarFallback className="bg-dna-copper text-white">
                            {community.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{community.name}</p>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{community.description}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">{community.member_count || 0} members</p>
                            <Badge variant="secondary" className="text-xs">
                              {community.user_role || 'member'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/connect?tab=communities')}
                  >
                    Discover More Communities
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Causes I Care About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-dna-forest" />
                Causes I Care About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {myCauses.map((cause) => (
                  <Badge key={cause} variant="secondary" className="bg-dna-forest/10 text-dna-forest">
                    {cause}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                Explore More Causes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyCircles;