import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PostReaction {
  id: string;
  emoji: string;
  user_id: string;
}

interface PostCardProps {
  post: {
    id: string;
    content: string;
    media_url?: string;
    type: string;
    pillar: string;
    created_at: string;
    profiles: {
      id: string;
      full_name: string;
      avatar_url?: string;
      location?: string;
      professional_role?: string;
    };
    like_count?: number;
    comment_count?: number;
    user_has_liked?: boolean;
  };
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '🎉', '😂', '😮', '😢', '👏'];

export const EnhancedPostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onComment, 
  onShare 
}) => {
  const [isLiked, setIsLiked] = useState(post.user_has_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [reactions, setReactions] = useState<PostReaction[]>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch reactions on component mount
  useEffect(() => {
    fetchReactions();
  }, [post.id]);

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('id, emoji, user_id')
        .eq('post_id', post.id);

      if (error) throw error;

      setReactions(data || []);
      
      if (user) {
        const myReactions = data?.filter(r => r.user_id === user.id).map(r => r.emoji) || [];
        setUserReactions(myReactions);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleEmojiReaction = async (emoji: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to react to posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const hasReacted = userReactions.includes(emoji);

      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .eq('emoji', emoji);

        if (error) throw error;

        setUserReactions(prev => prev.filter(e => e !== emoji));
        setReactions(prev => prev.filter(r => !(r.user_id === user.id && r.emoji === emoji)));
      } else {
        // Add reaction
        const { data, error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: post.id,
            user_id: user.id,
            emoji: emoji,
          })
          .select()
          .single();

        if (error) throw error;

        setUserReactions(prev => [...prev, emoji]);
        setReactions(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }

    setIsLiking(true);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
          });

        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }

      onLike?.(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'connect': return 'bg-dna-emerald text-white';
      case 'collaborate': return 'bg-dna-copper text-white';
      case 'contribute': return 'bg-dna-gold text-black';
      default: return 'bg-dna-forest text-white';
    }
  };

  const getPillarLabel = (pillar: string) => {
    return pillar.charAt(0).toUpperCase() + pillar.slice(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleComment = () => {
    onComment?.(post.id);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({
      title: "Link copied!",
      description: "Post link has been copied to your clipboard.",
    });
    onShare?.(post.id);
  };

  // Improved media detection
  const isVideoFile = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
           url.includes('video') || 
           post.type === 'video';
  };

  // Group reactions by emoji with counts
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="bg-background border-border">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.full_name} />
              <AvatarFallback className="bg-dna-forest text-white">
                {getInitials(post.profiles.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-foreground">
                  {post.profiles.full_name}
                </h4>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getPillarColor(post.pillar)}`}
                >
                  {getPillarLabel(post.pillar)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {post.profiles.professional_role && (
                  <span>{post.profiles.professional_role}</span>
                )}
                {post.profiles.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{post.profiles.location}</span>
                    </div>
                  </>
                )}
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
          
          {/* Enhanced Media content */}
          {post.media_url && (
            <div className="mt-3 rounded-lg overflow-hidden border">
              {isVideoFile(post.media_url) ? (
                <video 
                  src={post.media_url} 
                  controls 
                  className="w-full h-auto max-h-96"
                  poster={post.media_url.replace(/\.(mp4|webm|ogg|mov|avi|mkv)$/i, '-thumb.jpg')}
                >
                  <source src={post.media_url} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={post.media_url} 
                  alt="Post media" 
                  className="w-full h-auto max-h-96 object-cover"
                  loading="lazy"
                />
              )}
            </div>
          )}
        </div>

        {/* Emoji Reactions Display */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                onClick={() => handleEmojiReaction(emoji)}
                className={`flex items-center gap-1 h-8 ${
                  userReactions.includes(emoji) 
                    ? 'bg-dna-forest/10 border-dna-forest text-dna-forest' 
                    : 'hover:bg-muted'
                }`}
              >
                <span>{emoji}</span>
                <span className="text-xs">{count}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Engagement Stats */}
        {(likeCount > 0 || (post.comment_count && post.comment_count > 0)) && (
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 pb-3 border-b">
            <div className="flex items-center gap-4">
              {likeCount > 0 && (
                <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
              )}
              {post.comment_count && post.comment_count > 0 && (
                <span>{post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              Like
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Smile className="h-4 w-4" />
                  <span className="text-lg">😊</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex gap-1">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmojiReaction(emoji)}
                      className={`p-2 h-auto ${
                        userReactions.includes(emoji) 
                          ? 'bg-dna-forest/10 border border-dna-forest' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Comment
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};