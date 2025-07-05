import React, { useState } from 'react';
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
import PostComposer from './PostComposer';
import PostCard from './PostCard';
import FeedFilters from './FeedFilters';
import { usePosts } from '@/hooks/usePosts';

const AppLayout = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'connect' | 'collaborate' | 'contribute'>('all');
  
  // Use the posts hook with filter
  const pillarFilter = activeFilter === 'all' ? undefined : activeFilter;
  const { posts, loading, refreshPosts } = usePosts(pillarFilter);

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
          <PostComposer onPostCreated={refreshPosts} />

          {/* Feed Filters */}
          <FeedFilters 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse">
                      <div className="flex space-x-3">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <div className="text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeFilter === 'all' ? 'No posts yet' : `No ${activeFilter} posts yet`}
                  </h3>
                  <p className="text-sm">
                    {activeFilter === 'all' 
                      ? 'Be the first to share something with the DNA community!' 
                      : `Be the first to post about ${activeFilter}!`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
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