import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Handshake, 
  Heart, 
  TrendingUp, 
  MapPin, 
  Building,
  Plus,
  MessageSquare,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar - Profile & Mission Navigation */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Snapshot */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-4">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-dna-emerald text-white text-lg">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-dna-forest">
                  {user?.user_metadata?.full_name || 'DNA Member'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">Welcome to your dashboard</p>
                <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location not set
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mission Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">DNA Pillars</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start text-dna-emerald hover:bg-dna-emerald/10">
                <Users className="h-4 w-4 mr-3" />
                Connect
              </Button>
              <Button variant="ghost" className="w-full justify-start text-dna-copper hover:bg-dna-copper/10">
                <Handshake className="h-4 w-4 mr-3" />
                Collaborate
              </Button>
              <Button variant="ghost" className="w-full justify-start text-dna-forest hover:bg-dna-forest/10">
                <Heart className="h-4 w-4 mr-3" />
                Contribute
              </Button>
            </CardContent>
          </Card>

          {/* My Communities Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Communities
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 text-center py-4">
                Join communities to connect with like-minded professionals
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Browse Communities
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center Feed - Main Content */}
        <div className="lg:col-span-6 space-y-4">
          {/* Post Composer */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-dna-emerald text-white">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full text-left justify-start text-gray-500 hover:bg-gray-50"
                  >
                    What's on your mind about Africa's future?
                  </Button>
                  <div className="flex space-x-4 mt-3">
                    <Badge variant="secondary" className="bg-dna-emerald/10 text-dna-emerald cursor-pointer hover:bg-dna-emerald/20">
                      <Users className="h-3 w-3 mr-1" />
                      Connect
                    </Badge>
                    <Badge variant="secondary" className="bg-dna-copper/10 text-dna-copper cursor-pointer hover:bg-dna-copper/20">
                      <Handshake className="h-3 w-3 mr-1" />
                      Collaborate
                    </Badge>
                    <Badge variant="secondary" className="bg-dna-forest/10 text-dna-forest cursor-pointer hover:bg-dna-forest/20">
                      <Heart className="h-3 w-3 mr-1" />
                      Contribute
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Posts Feed */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-dna-copper text-white">AK</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">Amina Kone</h4>
                    <Badge variant="secondary" className="bg-dna-copper/10 text-dna-copper">
                      <Handshake className="h-3 w-3 mr-1" />
                      Collaborate
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Tech Entrepreneur • Abidjan, Ivory Coast</p>
                  <p className="text-gray-800 mb-3">
                    Excited to announce our new fintech initiative connecting African diaspora with investment opportunities across the continent. Looking for partners in Lagos, Nairobi, and Accra! 🚀
                  </p>
                  <div className="flex items-center space-x-4 text-gray-500">
                    <Button variant="ghost" size="sm" className="hover:text-dna-emerald">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      12
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-dna-forest">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      5
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-dna-copper">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-dna-forest text-white">KM</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">Kwame Mensah</h4>
                    <Badge variant="secondary" className="bg-dna-forest/10 text-dna-forest">
                      <Heart className="h-3 w-3 mr-1" />
                      Contribute
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Social Impact Leader • London, UK</p>
                  <p className="text-gray-800 mb-3">
                    Just launched our scholarship program for brilliant African students. Already funded 50 scholarships this year! Every contribution makes a difference. 🎓✨
                  </p>
                  <div className="flex items-center space-x-4 text-gray-500">
                    <Button variant="ghost" size="sm" className="hover:text-dna-emerald">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      24
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-dna-forest">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      8
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:text-dna-copper">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Trending & Suggestions */}
        <div className="lg:col-span-3 space-y-4">
          {/* Trending Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-dna-emerald" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <p className="text-sm font-medium">#AfricaTech2024</p>
                <p className="text-xs text-gray-500">142 posts</p>
              </div>
              <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <p className="text-sm font-medium">#DiasporaInvestment</p>
                <p className="text-xs text-gray-500">89 posts</p>
              </div>
              <div className="hover:bg-gray-50 p-2 rounded cursor-pointer">
                <p className="text-sm font-medium">#YouthEmpowerment</p>
                <p className="text-xs text-gray-500">67 posts</p>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Connections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">People You May Know</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-dna-emerald text-white">EN</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Esther Nkomo</h4>
                  <p className="text-xs text-gray-500">Healthcare Innovation</p>
                  <Button size="sm" variant="outline" className="mt-1">
                    Connect
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-dna-copper text-white">OA</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Omar Ahmed</h4>
                  <p className="text-xs text-gray-500">Sustainable Agriculture</p>
                  <Button size="sm" variant="outline" className="mt-1">
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="border-l-4 border-dna-emerald pl-3">
                <p className="text-sm font-medium">AfriTech Conference 2024</p>
                <p className="text-xs text-gray-500">Join 500+ tech leaders</p>
              </div>
              <div className="border-l-4 border-dna-copper pl-3">
                <p className="text-sm font-medium">Diaspora Investment Fund</p>
                <p className="text-xs text-gray-500">Seed funding available</p>
              </div>
              <div className="border-l-4 border-dna-forest pl-3">
                <p className="text-sm font-medium">Education Initiative</p>
                <p className="text-xs text-gray-500">Volunteers needed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;