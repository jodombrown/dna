import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ThumbsUp, 
  Heart, 
  MessageCircle,
  Share2,
  Repeat,
  MoreHorizontal,
  Calendar,
  MapPin,
  Building,
  Users,
  TrendingUp,
  Bookmark,
  Send
} from 'lucide-react';
import { mockPosts, mockCurrentUser, MockPost } from '@/data/mockFeedData';
import UnifiedContentCreator from './UnifiedContentCreator';

const MockSocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<MockPost[]>(mockPosts);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: likedPosts.has(postId) ? post.likes - 1 : post.likes + 1,
            isLiked: !likedPosts.has(postId)
          }
        : post
    ));
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Building className="w-4 h-4 text-blue-600" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'initiative':
        return <Users className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'job':
        return 'Job Posting';
      case 'event':
        return 'Event';
      case 'initiative':
        return 'Initiative';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Content Creator */}
      <UnifiedContentCreator />

      {/* Feed Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{post.user.name}</h3>
                      {post.type !== 'text' && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {getPostTypeIcon(post.type)}
                          {getPostTypeLabel(post.type)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{post.user.title} at {post.user.company}</p>
                    <p className="text-xs text-gray-400">{post.timeAgo} • {post.user.location}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-sm text-gray-900 mb-3 leading-relaxed">{post.content}</p>
                
                {post.image && (
                  <div className="rounded-lg overflow-hidden mb-3">
                    <img 
                      src={post.image} 
                      alt="Post content"
                      className="w-full h-64 object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                )}

                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.hashtags.map((tag) => (
                      <span 
                        key={tag} 
                        className="text-xs text-dna-emerald hover:text-dna-forest cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {post.likes}
                  </span>
                  <span>{post.comments} comments</span>
                  <span>{post.reposts} reposts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👍❤️🎉</span>
                  <span>+{Math.floor(Math.random() * 10)} others</span>
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex items-center gap-2 text-xs ${
                      likedPosts.has(post.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                    }`}
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbsUp className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    Comment
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs text-gray-600">
                    <Repeat className="w-4 h-4" />
                    Repost
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs text-gray-600">
                    <Send className="w-4 h-4" />
                    Share
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-gray-600">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>

              {/* Comment Section Preview */}
              {post.comments > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={mockCurrentUser.avatar} />
                      <AvatarFallback className="text-xs">{mockCurrentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-gray-50 rounded-full px-4 py-2">
                      <p className="text-xs text-gray-500 cursor-pointer">Add a comment...</p>
                    </div>
                  </div>
                  
                  {/* Sample comment */}
                  <div className="mt-3 flex items-start gap-3">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-dna-mint text-dna-forest">
                        {mockPosts[0].user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-xs font-medium">{mockPosts[0].user.name}</p>
                        <p className="text-xs text-gray-700">This is amazing! Great work on the impact you're making.</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <button className="hover:text-gray-700">Like</button>
                        <button className="hover:text-gray-700">Reply</button>
                        <span>2h</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <Button variant="outline" className="bg-white">
          Load more posts
        </Button>
      </div>
    </div>
  );
};

export default MockSocialFeed;