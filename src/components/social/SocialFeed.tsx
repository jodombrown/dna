
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
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostCreator from './PostCreator';

interface Post {
  id: string;
  user_id: string;
  content: string;
  hashtags: string[];
  created_at: string;
  reactions: {
    '👍': number;
    '❤️': number;
    '🔥': number;
    '💡': number;
    '🙌': number;
  };
  comments_count: number;
  author?: {
    full_name: string;
    avatar_url?: string;
    professional_role?: string;
  };
}

const REACTION_ICONS: Record<string, React.ReactNode> = {
  '👍': <ThumbsUp className="w-4 h-4" />,
  '❤️': <Heart className="w-4 h-4" />,
  '🔥': <Flame className="w-4 h-4" />,
  '💡': <Lightbulb className="w-4 h-4" />,
  '🙌': <HandHeart className="w-4 h-4" />
};

const SocialFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    // Load posts from localStorage (in production, this would be from Supabase)
    const storedPosts = JSON.parse(localStorage.getItem('dna_posts') || '[]');
    
    // Add mock author data for demo purposes
    const postsWithAuthors = storedPosts.map((post: Post) => ({
      ...post,
      author: {
        full_name: 'Community Member',
        professional_role: 'Professional',
        avatar_url: undefined
      }
    }));
    
    setPosts(postsWithAuthors);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleReaction = (postId: string, reaction: string) => {
    const currentReaction = userReactions[postId];
    
    if (currentReaction === reaction) {
      // Remove reaction
      setUserReactions(prev => {
        const newReactions = { ...prev };
        delete newReactions[postId];
        return newReactions;
      });
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [reaction]: Math.max(0, post.reactions[reaction as keyof typeof post.reactions] - 1)
              }
            }
          : post
      ));
    } else {
      // Add new reaction (remove old one if exists)
      setUserReactions(prev => ({ ...prev, [postId]: reaction }));
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                ...(currentReaction && { [currentReaction]: Math.max(0, post.reactions[currentReaction as keyof typeof post.reactions] - 1) }),
                [reaction]: post.reactions[reaction as keyof typeof post.reactions] + 1
              }
            }
          : post
      ));
    }
  };

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Post Creator */}
      <PostCreator onPostCreated={handlePostCreated} />

      {/* Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
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
                      <p className="font-semibold text-gray-900">
                        {post.author?.full_name || 'Community Member'}
                      </p>
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

                {/* Reactions and Comments */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    {Object.entries(post.reactions).map(([emoji, count]) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(post.id, emoji)}
                        className={`flex items-center gap-1 ${
                          userReactions[post.id] === emoji 
                            ? 'bg-dna-mint text-dna-forest' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-base">{emoji}</span>
                        <span className="text-sm">{count}</span>
                      </Button>
                    ))}
                  </div>

                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments_count}</span>
                  </Button>
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
