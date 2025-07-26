import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CommunityFeed from '@/components/community/CommunityFeed';

const Dashboard = () => {
  const { profile, user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-dna-forest mb-4">
              Welcome, {profile?.display_name || profile?.full_name || user?.user_metadata?.full_name || 'DNA Member'}!
            </h3>
            <p className="text-gray-600 text-sm">
              This is your DNA dashboard where you can connect, collaborate, and contribute to the diaspora community.
            </p>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <h3 className="font-semibold text-dna-forest text-lg">Community Feed</h3>
            <CommunityFeed />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-dna-forest mb-4">Discover</h3>
            <p className="text-gray-600 text-sm">
              Trending topics, suggested connections, and opportunities will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;