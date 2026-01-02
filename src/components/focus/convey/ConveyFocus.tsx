/**
 * ConveyFocus - Focus Mode Content for Convey Module
 *
 * Displays actionable Convey content including:
 * - User's content performance
 * - Recent engagement notifications
 * - Trending content in the diaspora
 * - Aspiration mode for when publishing is launching
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, TrendingUp, Heart, MessageCircle, Eye, Bell, PenTool, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConveyFocusData, type UserStory, type EngagementNotification, type TrendingContent } from '@/hooks/useConveyFocusData';

function UserStoryCard({ story }: { story: UserStory }) {
  return (
    <Link
      to={`/dna/convey/story/${story.id}`}
      className="block p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-neutral-900 line-clamp-2">
            {story.title}
          </h4>
          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {story.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {story.reactionCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {story.commentCount}
            </span>
          </div>
        </div>
        {story.isTrending && (
          <Badge className="bg-dna-purple text-white shrink-0 ml-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending
          </Badge>
        )}
      </div>
    </Link>
  );
}

function EngagementItem({ notification }: { notification: EngagementNotification }) {
  const icons = {
    comment: <MessageCircle className="w-4 h-4 text-dna-mint" />,
    reaction: <Heart className="w-4 h-4 text-dna-sunset" />,
    share: <Megaphone className="w-4 h-4 text-dna-purple" />,
    view: <Eye className="w-4 h-4 text-neutral-400" />,
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
        {icons[notification.type]}
      </div>
      <p className="text-sm text-neutral-600 flex-1">
        {notification.message}
      </p>
    </div>
  );
}

function TrendingCard({ content }: { content: TrendingContent }) {
  return (
    <Link
      to={`/dna/convey/story/${content.id}`}
      className="block p-3 border border-neutral-100 rounded-lg hover:border-neutral-200 transition-colors"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={content.authorAvatar || undefined} />
          <AvatarFallback className="bg-dna-purple/20 text-dna-purple text-xs">
            {content.authorName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-neutral-900 line-clamp-2">
            {content.title}
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            by {content.authorName}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-400">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {content.viewCount > 1000 ? `${(content.viewCount / 1000).toFixed(1)}K` : content.viewCount}
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="w-3 h-3" />
              {content.reactionCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AspirationMode() {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dna-purple/10 flex items-center justify-center">
        <Megaphone className="w-8 h-8 text-dna-purple" />
      </div>
      <h3 className="font-semibold text-neutral-900 mb-2">Publishing is coming soon</h3>
      <p className="text-sm text-neutral-500 mb-4">
        Share your insights, celebrate wins, and shape the narrative of African excellence.
      </p>
      <div className="space-y-2">
        <Button variant="outline" className="w-full">
          <Bell className="w-4 h-4 mr-2" />
          Notify Me When It Opens
        </Button>
        <Link to="/dna/convey/early-access">
          <Button variant="ghost" className="w-full text-dna-emerald">
            <PenTool className="w-4 h-4 mr-2" />
            Apply for Early Creator Access
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ConveyFocus() {
  const {
    userStories,
    engagementNotifications,
    trendingContent,
    isLoading,
    hasUserContent,
    totalEngagement,
  } = useConveyFocusData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-dna-emerald" />
      </div>
    );
  }

  // Show aspiration mode if no user content and no trending
  if (!hasUserContent && trendingContent.length === 0) {
    return <AspirationMode />;
  }

  return (
    <div className="space-y-6">
      {/* User's Recent Stories */}
      {hasUserContent && userStories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              Your Recent Stories
            </h3>
            <Link
              to="/dna/convey"
              className="text-xs text-dna-emerald hover:underline"
            >
              View Analytics
            </Link>
          </div>
          <div className="space-y-2">
            {userStories.slice(0, 2).map((story) => (
              <UserStoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Engagement */}
      {engagementNotifications.length > 0 && (
        <section>
          <h3 className="font-semibold text-sm text-neutral-900 mb-2">
            Recent Engagement
          </h3>
          <div className="divide-y divide-neutral-100">
            {engagementNotifications.slice(0, 4).map((notification) => (
              <EngagementItem key={notification.id} notification={notification} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Content */}
      {trendingContent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-900">
              Trending in the Diaspora
            </h3>
            <Link
              to="/dna/convey"
              className="text-xs text-dna-emerald hover:underline"
            >
              Explore Stories
            </Link>
          </div>
          <div className="space-y-2">
            {trendingContent.slice(0, 2).map((content) => (
              <TrendingCard key={content.id} content={content} />
            ))}
          </div>
        </section>
      )}

      {/* Write a Story CTA */}
      <div className="pt-2">
        <Link to="/dna/convey/create">
          <Button className="w-full bg-dna-purple hover:bg-dna-purple/90">
            <PenTool className="w-4 h-4 mr-2" />
            Write a Story
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ConveyFocus;
