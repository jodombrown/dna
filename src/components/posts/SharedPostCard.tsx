import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { PostWithAuthor } from '@/types/posts';
import { Repeat2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface SharedPostCardProps {
  post: PostWithAuthor;
}

export function SharedPostCard({ post }: SharedPostCardProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!post.original_post_id) return null;

  return (
    <Card className="p-4 border-l-4 border-l-primary/50 bg-muted/30 mt-3">
      <div className="flex items-start gap-3 mb-3">
        <Avatar 
          className="h-8 w-8 cursor-pointer"
          onClick={() => post.original_author_username && navigate(`/dna/${post.original_author_username}`)}
        >
          <AvatarImage 
            src={post.original_author_avatar_url} 
            alt={post.original_author_full_name || 'Original author'} 
          />
          <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white text-xs">
            {post.original_author_full_name ? getInitials(post.original_author_full_name) : '??'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p 
            className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
            onClick={() => post.original_author_username && navigate(`/dna/${post.original_author_username}`)}
          >
            {post.original_author_full_name || 'Unknown User'}
          </p>
          {post.original_author_headline && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {post.original_author_headline}
            </p>
          )}
          {post.original_created_at && (
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.original_created_at), { addSuffix: true })}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm whitespace-pre-wrap">
        {post.original_content || post.content}
      </p>

      {post.original_image_url && (
        <div className="mt-3 rounded-lg overflow-hidden border max-h-64">
          {post.original_image_url.match(/\.(mp4|webm|mov|quicktime)$/i) ? (
            <video
              src={post.original_image_url}
              controls
              className="w-full h-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={post.original_image_url}
              alt="Shared post media"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}
    </Card>
  );
}
