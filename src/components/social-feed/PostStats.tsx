import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface PostStatsProps {
  createdAt: string;
  pillar: string;
  likeCount: number;
  commentCount: number;
}

const getPillarLabel = (pillar: string) => {
  return pillar.charAt(0).toUpperCase() + pillar.slice(1);
};

export const PostStats: React.FC<PostStatsProps> = ({
  createdAt,
  pillar,
  likeCount,
  commentCount
}) => {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <time 
          dateTime={createdAt}
          className="hover:text-foreground transition-colors"
          title={new Date(createdAt).toLocaleString()}
        >
          {timeAgo}
        </time>
        <span className="text-muted-foreground/50">•</span>
        <span className="text-muted-foreground/80">
          in {getPillarLabel(pillar)}
        </span>
      </div>
      
      {(likeCount > 0 || commentCount > 0) && (
        <div className="flex items-center gap-3">
          {likeCount > 0 && (
            <span className="text-muted-foreground/80">
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </span>
          )}
          {commentCount > 0 && (
            <span className="text-muted-foreground/80">
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};