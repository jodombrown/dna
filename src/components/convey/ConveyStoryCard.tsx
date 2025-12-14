import { useNavigate } from 'react-router-dom';
import { MessageCircle, Eye, Bookmark, Share2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { UniversalFeedItem } from '@/types/feed';

interface ConveyStoryCardProps {
  story: UniversalFeedItem;
  variant?: 'default' | 'compact' | 'featured';
  showAuthor?: boolean;
  showEngagement?: boolean;
}

// Emoji reactions with picker
const EmojiReactions = ({ reactions, onReact }: { 
  reactions?: Record<string, number>;
  onReact?: (emoji: string) => void;
}) => {
  const activeReactions = reactions || {};
  const totalReactions = Object.values(activeReactions).reduce((a, b) => a + b, 0);
  
  // Show top 3 reactions with counts
  const topReactions = Object.entries(activeReactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  return (
    <div className="flex items-center gap-2">
      {/* Show existing reactions */}
      {topReactions.length > 0 && (
        <div className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
          {topReactions.map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact?.(emoji)}
              className="flex items-center gap-0.5 hover:scale-110 transition-transform"
            >
              <span className="text-sm">{emoji}</span>
              {count > 1 && (
                <span className="text-xs text-muted-foreground">{count}</span>
              )}
            </button>
          ))}
          {totalReactions > 3 && (
            <span className="text-xs text-muted-foreground ml-1">
              +{totalReactions - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Add reaction button */}
      <button 
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => onReact?.('👍')}
      >
        <span className="text-lg opacity-60 hover:opacity-100">😊</span>
        <span className="text-xs">React</span>
      </button>
    </div>
  );
};

// Story type badge colors
const getStoryTypeBadge = (type: string) => {
  const types: Record<string, { bg: string; text: string; label: string }> = {
    impact: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Impact Story' },
    update: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'Update' },
    spotlight: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: 'Spotlight' },
    photo_essay: { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'Photo Essay' },
    story: { bg: 'bg-dna-gold/10', text: 'text-dna-gold', label: 'Story' },
  };
  return types[type] || types.story;
};

export function ConveyStoryCard({ 
  story, 
  variant = 'default',
  showAuthor = true,
  showEngagement = true,
}: ConveyStoryCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/dna/convey/stories/${story.post_id}`);
  };
  
  const getAuthorInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DN';
  };
  
  const timeAgo = story.created_at 
    ? formatDistanceToNow(new Date(story.created_at), { addSuffix: true })
    : '';
  
  // Engagement data from story
  const commentCount = story.comment_count || 0;
  const viewCount = story.view_count || 0;
  const mockReactions = { '👍': story.like_count || 0, '❤️': 3, '😂': 1 };
  
  const storyType = getStoryTypeBadge(story.post_type || 'story');
  
  if (variant === 'compact') {
    return (
      <div 
        onClick={handleClick}
        className={cn(
          "flex gap-3 p-3 rounded-xl cursor-pointer",
          "bg-card border border-border/50 hover:border-dna-gold/30",
          "transition-all duration-200 hover:shadow-md"
        )}
      >
        {/* Thumbnail */}
        {story.media_url && (
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
            <img 
              src={story.media_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <Badge className={cn("text-xs mb-1", storyType.bg, storyType.text)}>
            {storyType.label}
          </Badge>
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">
            {story.title || story.content?.substring(0, 80)}...
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{story.author_display_name}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (variant === 'featured') {
    return (
      <div 
        onClick={handleClick}
        className={cn(
          "relative rounded-2xl overflow-hidden cursor-pointer group",
          "min-h-[280px] md:min-h-[320px]",
          "transition-all duration-300 hover:shadow-xl"
        )}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dna-gold/30 to-orange-600/40">
          {story.media_url && (
            <img 
              src={story.media_url} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <Badge className={cn("w-fit mb-2", storyType.bg, storyType.text)}>
            {storyType.label}
          </Badge>
          
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3 line-clamp-3 group-hover:text-dna-gold transition-colors">
            {story.title || story.content?.substring(0, 150)}...
          </h2>
          
          {showAuthor && (
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8 border-2 border-white/20">
                <AvatarImage src={story.author_avatar_url || undefined} />
                <AvatarFallback className="bg-dna-gold text-white text-xs">
                  {getAuthorInitials(story.author_display_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{story.author_display_name}</p>
                <p className="text-xs text-white/60">{timeAgo}</p>
              </div>
            </div>
          )}
          
          {showEngagement && (
            <div className="flex items-center justify-between">
              <EmojiReactions reactions={mockReactions} />
              <div className="flex items-center gap-3 text-white/70">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">{commentCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">{viewCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Default variant - BuzzFeed-style card
  return (
    <div 
      className={cn(
        "bg-card rounded-2xl overflow-hidden border border-border/50",
        "hover:border-dna-gold/30 hover:shadow-lg",
        "transition-all duration-300 group"
      )}
    >
      {/* Image */}
      {story.media_url && (
        <div 
          onClick={handleClick}
          className="relative aspect-[16/9] overflow-hidden cursor-pointer"
        >
          <img 
            src={story.media_url} 
            alt="" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <Badge className={cn("absolute top-3 left-3", storyType.bg, storyType.text)}>
            {storyType.label}
          </Badge>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 
          onClick={handleClick}
          className="font-bold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-dna-gold transition-colors"
        >
          {story.title || story.content?.substring(0, 100)}...
        </h3>
        
        {/* Author Row */}
        {showAuthor && (
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-7 w-7">
              <AvatarImage src={story.author_avatar_url || undefined} />
              <AvatarFallback className="bg-dna-gold/10 text-dna-gold text-xs">
                {getAuthorInitials(story.author_display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{story.author_display_name}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
        )}
        
        {/* Engagement Row */}
        {showEngagement && (
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <EmojiReactions reactions={mockReactions} />
            
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <Bookmark className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
