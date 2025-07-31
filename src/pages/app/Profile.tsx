import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdinImpactProfile from '@/components/profile/AdinImpactProfile';

const Profile = () => {
  const { profile, user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Basic Profile Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-dna-forest mb-4">Profile</h1>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-gray-900">{profile?.display_name || profile?.full_name || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Role</label>
            <p className="text-gray-900">{profile?.current_role || 'DNA Member'}</p>
          </div>
        </div>
        <p className="text-gray-600 mt-6">Full profile editing coming soon...</p>
      </div>

      {/* ADIN Impact Profile */}
      <AdinImpactProfile />
    </div>
  );
};

export default Profile;