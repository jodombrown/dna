import { format } from 'date-fns';

interface HashtagStatsGridProps {
  postCount: number;
  followerCount: number;
  createdAt?: string | Date;
}

/**
 * A reusable stats grid component for displaying hashtag metrics.
 * Shows posts, followers, and creation date in a 3-column grid layout.
 */
export function HashtagStatsGrid({ postCount, followerCount, createdAt }: HashtagStatsGridProps) {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    // For dates less than 7 days old, show relative time
    if (diffDays < 7) {
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    }

    // For older dates, use absolute format
    // Same year: "Jan 26"
    // Different year: "Jan 2024"
    if (d.getFullYear() === now.getFullYear()) {
      return format(d, 'MMM d');
    }
    return format(d, 'MMM yyyy');
  };

  return (
    <div className="grid grid-cols-3 gap-2 p-2.5 sm:p-3 bg-muted/50 rounded-lg mt-3">
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold text-foreground">
          {formatCount(postCount)}
        </p>
        <p className="text-xs text-muted-foreground">
          Posts
        </p>
      </div>
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold text-foreground">
          {formatCount(followerCount)}
        </p>
        <p className="text-xs text-muted-foreground">
          Followers
        </p>
      </div>
      <div className="text-center">
        <p className="text-lg sm:text-xl font-bold text-foreground">
          {createdAt ? formatDate(createdAt) : '-'}
        </p>
        <p className="text-xs text-muted-foreground">
          Created
        </p>
      </div>
    </div>
  );
}
