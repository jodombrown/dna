
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ThumbsUp, 
  Heart, 
  Flame, 
  Lightbulb, 
  HandHeart, 
  MessageCircle,
  Share,
  MoreHorizontal,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import EnhancedPostCreator from './EnhancedPostCreator';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useAuth } from '@/contexts/AuthContext';

const REACTION_ICONS: Record<string, { icon: React.ReactNode; emoji: string }> = {
  'like': { icon: <ThumbsUp className="w-4 h-4" />, emoji: '👍' },
  'love': { icon: <Heart className="w-4 h-4" />, emoji: '❤️' },
  'celebrate': { icon: <Flame className="w-4 h-4" />, emoji: '🎉' },
  'support': { icon: <HandHeart className="w-4 h-4" />, emoji: '🙌' },
  'insightful': { icon: <Lightbulb className="w-4 h-4" />, emoji: '💡' }
};

const SocialFeed: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading, userReactions, reactToPost, sharePost } = useSocialPosts();

  const renderContent = (content: string) => {
    return content.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <Badge key={index} variant="secondary" className="inline-block mx-1 bg-dna-mint text-dna-forest">
            {word}
          </Badge>
        );
      }
      return word;
    });
  };

  const renderPostTypeIcon = (postType: string) => {
    switch (postType) {
      case 'event_share':
        return <Calendar className="w-4 h-4 text-dna-copper" />;
      case 'community_share':
        return <Users className="w-4 h-4 text-dna-emerald" />;
      case 'contribution_card':
        return <DollarSign className="w-4 h-4 text-dna-gold" />;
      default:
        return null;
    }
  };

  const renderSharedContent = (post: any) => {
    if (post.post_type === 'event_share' && post.shared_event) {
      return (
        <div className="mt-4 p-4 bg-dna-copper/10 border border-dna-copper/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-dna-copper" />
            <span className="font-semibold text-dna-copper">Event</span>
          </div>
          <h4 className="font-semibold">{post.shared_event.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{post.shared_event.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>📅 {new Date(post.shared_event.date_time).toLocaleDateString()}</span>
            <span>📍 {post.shared_event.location || 'Virtual'}</span>
          </div>
        </div>
      );
    }

    if (post.post_type === 'community_share' && post.shared_community) {
      return (
        <div className="mt-4 p-4 bg-dna-emerald/10 border border-dna-emerald/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-dna-emerald" />
            <span className="font-semibold text-dna-emerald">Community</span>
          </div>
          <h4 className="font-semibold">{post.shared_community.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{post.shared_community.description}</p>
          <Badge variant="outline" className="mt-2">
            {post.shared_community.category}
          </Badge>
        </div>
      );
    }

    return null;
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">Sign in to see posts from the diaspora community</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Enhanced Post Creator */}
      <EnhancedPostCreator />

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Loading posts...</p>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">No posts yet. Be the first to share something!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
                      <AvatarFallback className="bg-dna-mint text-dna-forest">
                        {post.author?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {post.author?.full_name || 'Community Member'}
                        </p>
                        {renderPostTypeIcon(post.post_type)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {post.author?.professional_role && `${post.author.professional_role} • `}
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed">
                    {renderContent(post.content)}
                  </p>
                </div>

                {/* Shared Content */}
                {renderSharedContent(post)}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    {Object.entries(REACTION_ICONS).map(([reactionType, { icon, emoji }]) => (
                      <Button
                        key={reactionType}
                        variant="ghost"
                        size="sm"
                        onClick={() => reactToPost(post.id, reactionType)}
                        className={`flex items-center gap-1 ${
                          userReactions[post.id] === reactionType 
                            ? 'bg-dna-mint text-dna-forest' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-base">{emoji}</span>
                        <span className="text-sm">{post.likes_count || 0}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.comments_count}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => sharePost(post.id)}
                    >
                      <Share className="w-4 h-4" />
                      <span className="text-sm">{post.shares_count}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
