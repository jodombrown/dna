
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import Header from '@/components/Header';
import UserProfileContainer from '@/components/profile/UserProfileContainer';

const UserProfile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/functional-auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <UserProfileContainer />
      </div>
    </div>
  );
};

export default UserProfile;
