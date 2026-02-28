/**
 * FeedCommunityPulse — Redesigned right sidebar ("Community Pulse")
 * Live activity ticker, spotlight card, trending tag pills, DIA conversation bubble
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ExternalLink, TrendingUp, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrendingHashtags } from '@/hooks/useTrendingHashtags';
import { Skeleton } from '@/components/ui/skeleton';
import { FeedHappeningNow } from '@/components/feed/FeedHappeningNow';
import { LiveActivityTicker } from '@/components/feed/LiveActivityTicker';
import { SpotlightCard } from '@/components/feed/SpotlightCard';
import { CulturalPattern } from '@/components/shared/CulturalPattern';

export const FeedCommunityPulse: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {/* Live Activity */}
      <LiveActivityTicker />

      {/* Happening Now */}
      <FeedHappeningNow />

      {/* Spotlight */}
      <SpotlightCard />

      {/* Trending Topics — Tag Pills */}
      <TrendingTagPills />

      {/* DIA Conversation Bubble */}
      <div className="relative overflow-hidden bg-card rounded-dna-xl shadow-dna-1">
        <CulturalPattern pattern="adinkra" opacity={0.04} />
        <div className="relative z-10 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-[hsl(var(--dna-gold)/0.12)]">
              <Sparkles className="h-4 w-4 text-dna-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Ask DIA anything</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Get AI-powered insights about Africa and the global diaspora
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="h-auto p-0 mt-2 text-xs text-dna-gold hover:text-dna-gold/80"
                onClick={() => navigate('/dna/dia')}
              >
                Start a conversation
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-[11px] text-muted-foreground px-1 pt-1">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <a href="/about" className="hover:underline">About</a>
          <span>·</span>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <span>·</span>
          <a href="/terms" className="hover:underline">Terms</a>
          <span>·</span>
          <a href="/help" className="hover:underline">Help</a>
        </div>
        <p className="mt-1.5">DNA © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

/** Trending as tag pills instead of a numbered list */
const TrendingTagPills: React.FC = () => {
  const navigate = useNavigate();
  const { data: trending, isLoading } = useTrendingHashtags(8);

  return (
    <div className="bg-card rounded-dna-xl shadow-dna-1 p-3.5">
      <h3 className="font-heritage text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-dna-copper" />
        Trending in DNA
      </h3>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      ) : trending && trending.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {trending.map((item, index) => {
            const tagName = item.tag || '';
            const count = item.recent_usage_count || 0;
            return (
              <button
                key={tagName}
                onClick={() => navigate(`/dna/hashtag/${tagName}`)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[hsl(var(--dna-copper)/0.08)] text-foreground hover:bg-[hsl(var(--dna-copper)/0.16)] transition-colors"
              >
                <Hash className="h-3 w-3 text-dna-copper" />
                {tagName}
                {count > 0 && (
                  <span className="text-[10px] text-muted-foreground ml-0.5">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-3">
          Trending topics coming soon 🚀
        </p>
      )}
    </div>
  );
};
