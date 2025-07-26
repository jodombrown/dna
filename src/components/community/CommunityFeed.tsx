import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCommunityPosts, CommunityPost } from '@/services/communityPostsService';
import CreatePostDialog from './CreatePostDialog';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const CommunityFeed = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCommunityPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load community posts');
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setCreatePostOpen(true);
  };

  const handlePostCreated = () => {
    loadPosts(); // Refresh posts after creating a new one
  };

  const handleEngagement = (action: string, postId: string) => {
    // For now, just show a toast - this can be expanded with real functionality
    toast({
      title: "Feature Coming Soon",
      description: `${action} functionality will be available soon!`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load posts</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadPosts} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>
                {profile?.display_name?.charAt(0) || profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-gray-500"
              onClick={handleCreatePost}
            >
              Share an update with the community...
            </Button>
            <Button 
              size="sm" 
              className="bg-dna-emerald hover:bg-dna-forest text-white"
              onClick={handleCreatePost}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
            <Button 
              onClick={handleCreatePost}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Create Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.author?.avatar_url} />
                      <AvatarFallback>
                        {post.author?.display_name?.charAt(0) || post.author?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">
                          {post.author?.display_name || post.author?.full_name || 'Unknown User'}
                        </p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {post.post_type}
                        </Badge>
                        {post.is_pinned && (
                          <Badge variant="outline" className="text-xs">
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{post.community?.name || 'Unknown Community'}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  {post.community?.category && (
                    <Badge variant="outline" className="text-xs">
                      {post.community.category}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {post.title && (
                    <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  )}
                  
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>
                  
                  {post.media_url && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={post.media_url} 
                        alt="Post media" 
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {post.event_date && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-900">Event Details:</p>
                      <p className="text-sm text-gray-600">
                        {new Date(post.event_date).toLocaleDateString()} at {new Date(post.event_date).toLocaleTimeString()}
                      </p>
                      {post.event_location && (
                        <p className="text-sm text-gray-600">Location: {post.event_location}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-red-500"
                        onClick={() => handleEngagement('Like', post.id)}
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        Like
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-blue-500"
                        onClick={() => handleEngagement('Comment', post.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Comment
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-green-500"
                        onClick={() => handleEngagement('Share', post.id)}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default CommunityFeed;