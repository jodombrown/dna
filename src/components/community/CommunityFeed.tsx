import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  MessageSquare, 
  Heart, 
  Share2, 
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getCommunityPosts, createCommunityPost, CommunityPost } from '@/services/communityService';
import { formatDistanceToNow } from 'date-fns';

interface CommunityFeedProps {
  communityId: string;
  isLoggedIn?: boolean;
  isMember?: boolean;
  className?: string;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ 
  communityId, 
  isLoggedIn = false,
  isMember = false,
  className = "" 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'update' | 'event' | 'announcement'>('update');

  // Fetch community posts
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['communityPosts', communityId],
    queryFn: () => getCommunityPosts(communityId),
    enabled: isMember && !!communityId
  });

  const createPostMutation = useMutation({
    mutationFn: createCommunityPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts', communityId] });
      setPostContent('');
      setIsPostDialogOpen(false);
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreatePost = () => {
    if (!postContent.trim()) return;

    createPostMutation.mutate({
      community_id: communityId,
      content: postContent,
      post_type: postType
    });
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'announcement':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    const colors = {
      update: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      announcement: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || colors.update;
  };

  if (!isMember) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Members Only</h3>
          <p className="text-gray-500 mb-4">
            Join this community to see posts and participate in discussions.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Community Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-dna-emerald" />
            Community Feed
          </CardTitle>
          {isMember && (
            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Community Post</DialogTitle>
                  <DialogDescription>
                    Share something with the community
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Post Type Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    {(['update', 'event', 'announcement'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={postType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPostType(type)}
                        className="flex items-center gap-1 capitalize"
                      >
                        {getPostTypeIcon(type)}
                        {type}
                      </Button>
                    ))}
                  </div>

                  {/* Post Content */}
                  <Textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={`What would you like to share${postType === 'event' ? ' about this event' : postType === 'announcement' ? ' as an announcement' : ''}?`}
                    className="min-h-[100px]"
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreatePost} 
                    disabled={!postContent.trim() || createPostMutation.isPending}
                    className="bg-dna-emerald hover:bg-dna-forest text-white"
                  >
                    {createPostMutation.isPending ? 'Posting...' : 'Post'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-4">
              Be the first to share something with this community!
            </p>
            {isMember && (
              <Button 
                onClick={() => setIsPostDialogOpen(true)}
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post: CommunityPost) => (
              <div key={post.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                {/* Post Header */}
                <div className="flex items-start space-x-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
                    <AvatarFallback className="bg-dna-mint text-dna-forest">
                      {post.author?.full_name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-dna-forest">
                        {post.author?.full_name || 'Community Member'}
                      </h4>
                      <Badge variant="secondary" className={`text-xs ${getPostTypeBadge(post.post_type)}`}>
                        {getPostTypeIcon(post.post_type)}
                        <span className="ml-1 capitalize">{post.post_type}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="ml-13">
                  {post.title && (
                    <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                  )}
                  <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>

                  {/* Event Details */}
                  {post.event_date && (
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.event_date).toLocaleDateString()}
                      </div>
                      {post.event_location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {post.event_location}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-dna-emerald">
                      <Heart className="h-4 w-4 mr-1" />
                      Like
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-dna-emerald">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Comment
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-dna-emerald">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* View More */}
            {posts.length >= 10 && (
              <div className="text-center pt-4">
                <Button variant="outline" className="text-dna-emerald border-dna-emerald hover:bg-dna-emerald hover:text-white">
                  Load More Posts
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityFeed;