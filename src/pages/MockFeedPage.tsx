import React from 'react';
import Header from '@/components/Header';
import MockFeedLayout from '@/components/feed/MockFeedLayout';
import MockSocialFeed from '@/components/social/MockSocialFeed';

const MockFeedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MockFeedLayout>
        <MockSocialFeed />
      </MockFeedLayout>
    </div>
  );
};

export default MockFeedPage;