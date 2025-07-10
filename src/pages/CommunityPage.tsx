import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Users, Calendar, Plus, MessageSquare, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getCommunityWithMembership, 
  getCommunityPosts, 
  getCommunityEvents,
  createCommunityPost,
  createCommunityEvent,
  requestToJoinCommunity 
} from '@/services/communityService';

const CommunityPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [postContent, setPostContent] = useState('');
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  // Fetch community data with membership status
  const { data: community, isLoading, error, refetch: refetchCommunity } = useQuery({
    queryKey: ['community', id],
    queryFn: () => getCommunityWithMembership(id!),
    enabled: !!id
  });

  // Fetch community posts
  const { data: recentPosts = [], refetch: refetchPosts } = useQuery({
    queryKey: ['communityPosts', id],
    queryFn: () => getCommunityPosts(id!),
    enabled: !!id && community?.is_member
  });

  // Fetch community events
  const { data: communityEvents = [] } = useQuery({
    queryKey: ['communityEvents', id],
    queryFn: () => getCommunityEvents(id!),
    enabled: !!id && community?.is_member
  });

  const handleJoinCommunity = async () => {
    if (!id) return;
    
    try {
      await requestToJoinCommunity(id);
      toast({
        title: "Join Request Sent",
        description: "Your request to join this community has been sent for approval.",
      });
      refetchCommunity();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() || !id) return;

    try {
      await createCommunityPost({
        community_id: id,
        content: postContent,
        post_type: 'update'
      });
      
      setPostContent('');
      setIsPostDialogOpen(false);
      refetchPosts();
      
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
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
              {community?.is_member ? (
                <div className="flex gap-2">
                  <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Create Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Community Post</DialogTitle>
                        <DialogDescription>
                          Share an update with the community
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="What's happening in the community?"
                        className="min-h-[100px]"
                      />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreatePost} disabled={!postContent.trim()}>
                          Post
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              ) : community?.user_membership?.status === 'pending' ? (
                <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                  Request Pending
                </Button>
              ) : (
                <Button
                  onClick={handleJoinCommunity}
                  className="bg-dna-copper hover:bg-dna-forest text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request to Join
                </Button>
              )}
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
            {community?.is_member && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentPosts && recentPosts.length > 0 ? (
                    <div className="space-y-4">
                      {recentPosts.map((post) => (
                        <div key={post.id} className="border-l-4 border-dna-emerald pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
                                <AvatarFallback className="text-xs">
                                  {post.author?.full_name?.charAt(0) || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{post.author?.full_name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {post.post_type}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {post.title && (
                            <h4 className="font-medium mb-1">{post.title}</h4>
                          )}
                          <p className="text-gray-800">{post.content}</p>
                          {post.event_date && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                              <CalendarIcon className="w-4 h-4" />
                              {new Date(post.event_date).toLocaleDateString()}
                              {post.event_location && (
                                <>
                                  <MapPin className="w-4 h-4 ml-2" />
                                  {post.event_location}
                                </>
                              )}
                            </div>
                          )}
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
            )}

            {/* Upcoming Events */}
            {community?.is_member && communityEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {communityEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {event.is_virtual ? 'Virtual' : 'In-Person'}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(event.event_date).toLocaleDateString()}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendee_count || 0} attending
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
                      <Badge key={tag} variant="secondary" className="bg-dna-light-green text-dna-forest">
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
                    <Badge className="bg-dna-copper text-white">Featured</Badge>
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