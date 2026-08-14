import { Camera } from 'lucide-react';
import { Nkonsonkonson, Mpatapo } from '@/components/icons/adinkra';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * The chat-style "What's on your mind?" bar atop the feed. Lives outside
 * src/pages so the page file carries no page-level layout values
 * (CLAUDE.md: Section owns rhythm, Container owns width).
 */
export function FeedComposerTeaser({
  avatarUrl,
  avatarFallback,
  onOpenStory,
  onOpenEvent,
}: {
  avatarUrl: string | null | undefined;
  avatarFallback: string;
  onOpenStory: () => void;
  onOpenEvent: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 h-11 bg-card rounded-full px-3 shadow-dna-1 border border-border/40 cursor-pointer hover:shadow-dna-2 transition-all duration-200"
      onClick={onOpenStory}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={avatarUrl || ''} />
        <AvatarFallback className="text-meta">{avatarFallback}</AvatarFallback>
      </Avatar>
      <span className="flex-1 text-body text-muted-foreground">
        What's on your mind?
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onOpenStory(); }}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          title="Photo"
        >
          <Camera className="h-4 w-4 text-dna-convey" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenEvent(); }}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          title="Event"
        >
          <Nkonsonkonson className="h-4 w-4 text-dna-gold" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onOpenStory(); }}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          title="Story"
        >
          <Mpatapo className="h-4 w-4 text-dna-copper" />
        </button>
      </div>
    </div>
  );
}

export default FeedComposerTeaser;
