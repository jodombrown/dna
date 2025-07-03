
import React from 'react';
import Header from '@/components/Header';
import EnhancedSocialFeed from '@/components/social/EnhancedSocialFeed';
import FeedLayout from '@/components/feed/FeedLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const CleanSocialFeedPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <FeedLayout>
          <EnhancedSocialFeed />
        </FeedLayout>
      </div>
    </ProtectedRoute>
  );
};

export default CleanSocialFeedPage;
