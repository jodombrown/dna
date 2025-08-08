import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PostActions } from './PostActions';
import { PostStats } from './PostStats';
import CommentThread from './comments/CommentThread';
import { EmbedPreview } from './EmbedPreview';
import type { Post } from './PostList';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AdminPostControls } from './AdminPostControls';

interface PostCardProps {
  post: Post;
  onComment?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

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

export const PostCard: React.FC<PostCardProps> = ({ post, onComment, onEdit, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const { isAdmin } = useIsAdmin();
  
  const handleCommentToggle = () => {
    setShowComments(!showComments);
    onComment?.(post.id);
  };

  const handleEdit = (postId: string) => {
    onEdit?.(post);
  };

  const handleDelete = (postId: string) => {
    onDelete?.(postId);
  };
  return (
    <Card 
      className="bg-background border-border hover:bg-accent/5 transition-colors"
      role="article"
      aria-labelledby={`post-author-${post.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={post.profiles.avatar_url} 
              alt={`${post.profiles.full_name}'s profile picture`}
            />
            <AvatarFallback className="bg-dna-forest text-white text-sm">
              {getInitials(post.profiles.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 
                id={`post-author-${post.id}`}
                className="font-semibold text-foreground truncate"
              >
                {post.profiles.full_name}
              </h4>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getPillarColor(post.pillar)}`}
                aria-label={`Post category: ${getPillarLabel(post.pillar)}`}
              >
                {getPillarLabel(post.pillar)}
              </Badge>
              {post.type === 'link' && (
                <Badge variant="secondary" className="text-xs bg-dna-forest text-white" aria-label="Link post">
                  Link
                </Badge>
              )}
              {post.type === 'poll' && (
                <Badge variant="secondary" className="text-xs bg-dna-emerald text-white" aria-label="Poll post">
                  Poll
                </Badge>
              )}
              {post.type === 'question' && (
                <Badge variant="secondary" className="text-xs bg-dna-copper text-white" aria-label="Question post">
                  Question
                </Badge>
              )}
              {post.type === 'opportunity' && (
                <Badge variant="secondary" className="text-xs bg-dna-emerald text-white" aria-label="Opportunity post">
                  Opportunity
                </Badge>
              )}
              {post.type === 'spotlight' && (
                <Badge variant="secondary" className="text-xs bg-dna-gold text-black" aria-label="Spotlight post">
                  Spotlight
                </Badge>
              )}
            </div>
            
            {post.profiles.professional_role && (
              <p className="text-sm text-muted-foreground truncate">
                {post.profiles.professional_role}
              </p>
            )}
            
            {post.profiles.location && (
              <p className="text-xs text-muted-foreground">
                {post.profiles.location}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Show embed preview if link_metadata or embed_metadata exists, otherwise show content */}
          {((post as any).link_metadata || post.embed_metadata) ? (
            <div className="space-y-3">
              {/* Show content without URLs if it has additional text */}
              {post.content && post.content.trim() && !post.content.trim().match(/^https?:\/\/[^\s]+$/i) && (
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content.replace(/https?:\/\/[^\s]+/gi, '').trim()}
                </p>
              )}
              <EmbedPreview 
                embedData={(post as any).link_metadata || post.embed_metadata}
                onRemove={() => {}} 
                showRemoveButton={false}
              />
            </div>
          ) : (
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          )}

          {post.media_url && (
            <div className="rounded-lg overflow-hidden border">
              {post.type === 'video' ? (
                <video 
                  src={post.media_url} 
                  controls
                  className="w-full h-auto max-h-96 object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img 
                  src={post.media_url} 
                  alt="Post media" 
                  className="w-full h-auto max-h-96 object-cover"
                />
              )}
            </div>
          )}

          {post.type === 'poll' && (post as any).poll_options?.options && (
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium mb-2">Poll</div>
              <ul className="space-y-2">
                {((post as any).poll_options.options as string[]).map((opt: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {post.type === 'opportunity' && (post as any).opportunity_link && (
            <div className="rounded-lg border p-3 flex items-center justify-between">
              <span className="text-sm">Opportunity link</span>
              <Button asChild variant="outline" size="sm">
                <a href={(post as any).opportunity_link} target="_blank" rel="noopener noreferrer">Open</a>
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <PostStats
              createdAt={post.created_at}
              pillar={post.pillar}
              likeCount={post.like_count || 0}
              commentCount={post.comment_count || 0}
            />
            
            <PostActions
              postId={post.id}
              authorId={post.author_id}
              initialLikeCount={post.like_count || 0}
              initialCommentCount={post.comment_count || 0}
              initialIsLiked={post.user_has_liked || false}
              initialIsSaved={post.user_has_saved || false}
              onComment={handleCommentToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* Comments Section Toggle */}
          {(post.comment_count || 0) > 0 && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCommentToggle}
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span>
                  {showComments ? 'Hide' : 'View'} {post.comment_count || 0} {(post.comment_count || 0) === 1 ? 'comment' : 'comments'}
                </span>
                {showComments ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Expanded Comments Section */}
      {showComments && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            <CommentThread postId={post.id} />
          </div>
        </CardContent>
      )}
    </Card>
  );
};