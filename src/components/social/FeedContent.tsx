
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PostItem from './PostItem';
import RichContentItem from './RichContentItem';
import { CleanSocialPost } from '@/hooks/useCleanSocialPosts';
import { RichContentItem as RichContentType } from '@/hooks/useRichContent';

type CombinedContentItem = 
  | (CleanSocialPost & { contentType: 'post' })
  | (RichContentType & { contentType: 'rich' });

interface FeedContentProps {
  content: CombinedContentItem[];
  loading: boolean;
}

const FeedContent: React.FC<FeedContentProps> = ({ content, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Loading content...</p>
        </CardContent>
      </Card>
    );
  }

  if (content.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to DNA!</h3>
          <p className="text-gray-500 text-lg">No content yet. Be the first to share something with the community!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {content.map((item) => {
        if (item.contentType === 'post') {
          return <PostItem key={`post-${item.id}`} post={item} />;
        } else {
          return <RichContentItem key={`rich-${item.id}`} item={item} />;
        }
      })}
    </div>
  );
};

export default FeedContent;
