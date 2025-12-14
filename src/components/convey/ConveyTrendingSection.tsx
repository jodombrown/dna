import { useNavigate } from 'react-router-dom';
import { TrendingUp, MessageCircle, Eye, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UniversalFeedItem } from '@/types/feed';

interface ConveyTrendingSectionProps {
  stories: UniversalFeedItem[];
  isLoading?: boolean;
  onSeeAll?: () => void;
}

// Emoji reaction display with counts
const ReactionBar = ({ reactions }: { reactions: Record<string, number> }) => {
  const emojis = ['👍', '❤️', '😂', '🤯', '🙌'];
  const total = Object.values(reactions || {}).reduce((a, b) => a + b, 0);
  
  if (total === 0) return null;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1">
        {emojis.slice(0, 3).map((emoji) => (
          <span key={emoji} className="text-sm">{emoji}</span>
        ))}
      </div>
      <span className="text-xs text-white/80 font-medium">{total}</span>
    </div>
  );
};

// Individual trending card
const TrendingCard = ({ 
  story, 
  rank, 
  isHero = false 
}: { 
  story: UniversalFeedItem; 
  rank: number;
  isHero?: boolean;
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Navigate to story detail using post_id
    navigate(`/dna/convey/stories/${story.post_id}`);
  };
  
  // Mock reactions/engagement - in real app, pull from story data
  const mockReactions = { '👍': 12, '❤️': 8, '😂': 3 };
  const commentCount = story.comment_count || 0;
  const viewCount = story.view_count || Math.floor(Math.random() * 500) + 100;
  
  const getAuthorInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DN';
  };
  
  return (
    <div 
      onClick={handleClick}
      className={cn(
        "relative group cursor-pointer rounded-2xl overflow-hidden",
        "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        isHero ? "col-span-2 row-span-2 min-h-[320px] md:min-h-[400px]" : "min-h-[180px] md:min-h-[200px]"
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-br from-dna-gold/20 via-amber-600/30 to-orange-700/40">
        {story.media_url && (
          <img 
            src={story.media_url} 
            alt={story.content?.substring(0, 50)} 
            className="w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>
      
      {/* Rank Number */}
      <div className={cn(
        "absolute top-3 left-3 font-black text-white/30",
        isHero ? "text-7xl md:text-8xl" : "text-4xl md:text-5xl"
      )}>
        {rank}
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        {/* Story Type Badge */}
        <Badge 
          variant="secondary" 
          className="w-fit mb-2 bg-dna-gold/90 text-white border-0 text-xs"
        >
          {story.linked_entity_type === 'story' ? 'Story' : story.post_type || 'Story'}
        </Badge>
        
        {/* Title */}
        <h3 className={cn(
          "font-bold text-white leading-tight mb-2 group-hover:text-dna-gold transition-colors",
          isHero ? "text-xl md:text-2xl" : "text-sm md:text-base"
        )}>
          {story.title || story.content?.substring(0, isHero ? 150 : 80)}
          {!story.title && (story.content?.length || 0) > (isHero ? 150 : 80) && '...'}
        </h3>
        
        {/* Author + Engagement Row */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-white/20">
              <AvatarImage src={story.author_avatar_url || undefined} />
              <AvatarFallback className="bg-dna-gold/20 text-white text-xs">
                {getAuthorInitials(story.author_display_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-white/80 font-medium truncate max-w-[100px]">
              {story.author_display_name}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-white/70">
            <ReactionBar reactions={mockReactions} />
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="text-xs">{commentCount}</span>
            </div>
            {isHero && (
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs">{viewCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton
const TrendingSkeleton = ({ isHero = false }: { isHero?: boolean }) => (
  <div className={cn(
    "rounded-2xl bg-muted animate-pulse",
    isHero ? "col-span-2 row-span-2 min-h-[320px] md:min-h-[400px]" : "min-h-[180px] md:min-h-[200px]"
  )} />
);

export function ConveyTrendingSection({ stories, isLoading, onSeeAll }: ConveyTrendingSectionProps) {
  const trendingStories = stories.slice(0, 4);
  
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <TrendingUp className="h-5 w-5 text-dna-gold animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
          <h2 className="text-lg font-bold">Trending</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TrendingSkeleton isHero />
          <TrendingSkeleton />
          <TrendingSkeleton />
        </div>
      </section>
    );
  }
  
  if (trendingStories.length === 0) return null;
  
  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <TrendingUp className="h-5 w-5 text-dna-gold" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          <h2 className="text-lg font-bold">Trending</h2>
          <Badge variant="outline" className="text-xs border-dna-gold/30 text-dna-gold">
            LIVE
          </Badge>
        </div>
        {onSeeAll && (
          <button 
            onClick={onSeeAll}
            className="flex items-center gap-1 text-sm text-dna-gold hover:underline font-medium"
          >
            See All Trending
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* BuzzFeed-style Grid: Hero + 3 smaller cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {trendingStories[0] && (
          <TrendingCard story={trendingStories[0]} rank={1} isHero />
        )}
        {trendingStories.slice(1, 4).map((story, i) => (
          <TrendingCard key={story.post_id} story={story} rank={i + 2} />
        ))}
      </div>
    </section>
  );
}
