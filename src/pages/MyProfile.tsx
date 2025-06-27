
import React from 'react';
import Header from '@/components/Header';
import MyProfileContainer from '@/components/profile/MyProfileContainer';
import ProtectedRoute from '@/components/ProtectedRoute';

const MyProfile = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <MyProfileContainer />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MyProfile;
