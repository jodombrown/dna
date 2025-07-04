
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCleanSocialPosts } from '@/hooks/useCleanSocialPosts';
import { useRichContent } from '@/hooks/useRichContent';
import { useAuth } from '@/contexts/CleanAuthContext';
import UnifiedContentCreator from './UnifiedContentCreator';
import FeedContent from './FeedContent';

const EnhancedSocialFeed: React.FC = () => {
  const { user } = useAuth();
  const { posts, loading: postsLoading } = useCleanSocialPosts();
  const { richContent, loading: richLoading } = useRichContent();

  // Combine posts and rich content, then sort by date
  const allContent = React.useMemo(() => {
    const combined = [
      ...posts.map(post => ({ ...post, contentType: 'post' as const })),
      ...richContent.map(item => ({ ...item, contentType: 'rich' as const }))
    ];
    
    return combined.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [posts, richContent]);

  const loading = postsLoading || richLoading;

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">Sign in to see posts from the diaspora community</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Content Creator */}
      <div className="sticky top-0 z-20 bg-gray-50 pb-4">
        <UnifiedContentCreator />
      </div>

      {/* Scrollable Feed */}
      <div className="flex-1 overflow-y-auto">
        <FeedContent content={allContent} loading={loading} />
      </div>
    </div>
  );
};

export default EnhancedSocialFeed;
