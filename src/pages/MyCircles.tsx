import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Building, Heart, MessageCircle, UserPlus } from 'lucide-react';

const MyCircles = () => {
  const { user } = useAuth();

  // Mock data - would be fetched from follows/connections tables
  const followedPeople = [
    { id: '1', name: 'Sarah Johnson', role: 'Tech Entrepreneur', avatar: '', location: 'Lagos, Nigeria' },
    { id: '2', name: 'Michael Chen', role: 'Investment Analyst', avatar: '', location: 'Toronto, Canada' }
  ];

  const followedCommunities = [
    { id: '1', name: 'African Tech Leaders', description: 'Building the future of technology in Africa', members: 2547, image: '' },
    { id: '2', name: 'Diaspora Investors', description: 'Investing back home', members: 1832, image: '' }
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

          {/* Communities I Follow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-dna-copper" />
                Communities I Follow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {followedCommunities.map((community) => (
                <div key={community.id} className="p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={community.image} />
                      <AvatarFallback className="bg-dna-copper text-white">
                        {community.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{community.name}</p>
                      <p className="text-sm text-gray-600 mb-2">{community.description}</p>
                      <p className="text-xs text-gray-500">{community.members} members</p>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Discover Communities
              </Button>
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