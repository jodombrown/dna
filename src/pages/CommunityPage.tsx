import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users, MapPin, Calendar, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CommunityPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Fetch community data
  const { data: community, isLoading, error } = useQuery({
    queryKey: ['community', id],
    queryFn: async () => {
      if (!id) throw new Error('Community ID required');
      
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch recent posts from this community (placeholder - would need community_posts table)
  const { data: recentPosts } = useQuery({
    queryKey: ['communityPosts', id],
    queryFn: async () => {
      // Placeholder - in real app would fetch posts tagged with this community
      return [];
    },
    enabled: !!id
  });

  const handleJoinCommunity = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Community joining functionality will be available soon!",
    });
  };

  const handleFollowCommunity = () => {
    toast({
      title: "Feature Coming Soon", 
      description: "Community following functionality will be available soon!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-dna-emerald" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Community Not Found</h2>
              <p className="text-gray-600">The community you're looking for doesn't exist or isn't active.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper p-8 md:p-12 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-white/20 shadow-lg">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={community.image_url || community.cover_image_url} alt={community.name} className="object-cover" />
                  <AvatarFallback className="bg-white/20 text-white text-3xl font-bold rounded-none">
                    {community.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{community.name}</h1>
              {community.category && (
                <Badge className="bg-white/20 text-white border-white/30 mb-3">
                  {community.category}
                </Badge>
              )}
              <p className="text-xl text-white/90 mb-4">{community.description}</p>
              
              <div className="flex flex-wrap gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{community.member_count || 0} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleJoinCommunity}
                className="bg-dna-gold hover:bg-dna-copper text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Join Community
              </Button>
              <Button
                onClick={handleFollowCommunity}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Follow Updates
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">About This Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {community.purpose_goals && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Purpose & Goals</h4>
                    <p className="text-gray-700 leading-relaxed">{community.purpose_goals}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed">{community.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPosts && recentPosts.length > 0 ? (
                  <div className="space-y-4">
                    {recentPosts.map((post: any) => (
                      <div key={post.id} className="border-l-4 border-dna-emerald pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {post.pillar}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-800">{post.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activity yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Be the first to share something with this community!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {community.tags && community.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {community.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-dna-mint text-dna-forest">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Members</span>
                  <span className="font-medium">{community.member_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posts</span>
                  <span className="font-medium">{recentPosts?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={community.is_active ? "default" : "secondary"}>
                    {community.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {community.is_featured && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Featured</span>
                    <Badge className="bg-dna-gold text-white">Featured</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Discover more communities</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Browse All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommunityPage;