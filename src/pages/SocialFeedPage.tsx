
import React from 'react';
import Header from '@/components/Header';
import SocialFeed from '@/components/social/SocialFeed';
import ProtectedRoute from '@/components/ProtectedRoute';

const SocialFeedPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <SocialFeed />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SocialFeedPage;
