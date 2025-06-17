
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Globe,
  Building
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: any;
  onPostUpdate: (post: any) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdate }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    checkIfLiked();
  }, [post.id, user]);

  const checkIfLiked = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('post_likes' as any)
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
      
      setIsLiked(!!data);
    } catch (error) {
      // Not liked
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('post_likes' as any)
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        setIsLiked(false);
        onPostUpdate({
          ...post,
          likes_count: Math.max(0, (post.likes_count || 0) - 1)
        });
      } else {
        await supabase
          .from('post_likes' as any)
          .insert({
            post_id: post.id,
            user_id: user.id
          });
        
        setIsLiked(true);
        onPostUpdate({
          ...post,
          likes_count: (post.likes_count || 0) + 1
        });
      }
    } catch (error: any) {
      console.error('Error updating like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const profile = post.profiles;
  const likesCount = post.likes_count || 0;
  const commentsCount = post.comments_count || 0;

  return (
    <Card className="border hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback className="bg-dna-copper text-white">
                {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-dna-forest">
                {profile?.full_name || 'DNA Member'}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                {profile?.professional_role && (
                  <div className="flex items-center gap-1">
                    <span>{profile.professional_role}</span>
                    {profile?.company && (
                      <>
                        <span>at</span>
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span className="text-dna-copper font-medium">{profile.company}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                  <Globe className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Engagement Stats */}
        {(likesCount > 0 || commentsCount > 0) && (
          <div className="flex items-center justify-between py-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {likesCount > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-5 h-5 bg-dna-crimson rounded-full flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white fill-current" />
                  </div>
                  {likesCount}
                </span>
              )}
              {commentsCount > 0 && (
                <span>{commentsCount} comments</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex-1 ${isLiked ? 'text-dna-crimson' : 'text-gray-600'} hover:bg-dna-crimson/10`}
          >
            <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            Like
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex-1 text-gray-600 hover:bg-dna-emerald/10"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Comment
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-gray-600 hover:bg-dna-gold/10"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500 text-center py-4">
              Comments feature coming soon...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
