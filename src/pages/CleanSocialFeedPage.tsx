
import React from 'react';
import Header from '@/components/Header';
import EnhancedSocialFeed from '@/components/social/EnhancedSocialFeed';
import ProtectedRoute from '@/components/ProtectedRoute';

const CleanSocialFeedPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
              <p className="text-gray-600">
                Share updates, events, initiatives, and opportunities with the diaspora community
              </p>
            </div>

            <EnhancedSocialFeed />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CleanSocialFeedPage;
