import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardV1Context';
import LegacyHeader from './components/LegacyHeader';
import { MobileNavigation, MobilePostButton } from './components/mobile';
import LegacyBanner from './components/LegacyBanner';

// V1 Dashboard Pages
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Connect from './pages/Connect';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Admin from './pages/Admin';
import Invites from './pages/Invites';

const V1App = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!profile) {
        navigate('/onboarding');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-dna-copper border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Legacy Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Legacy Banner */}
        <LegacyBanner />
        
        {/* Legacy Header */}
        <LegacyHeader />

        {/* Main Content */}
        <main className="pt-32 pb-20 lg:pb-0">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<Search />} />
            <Route path="connect" element={<Connect />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<ProfileEdit />} />
            <Route path="invites" element={<Invites />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/app/v1/dashboard" replace />} />
          </Routes>
        </main>
        
        <MobileNavigation />
        <MobilePostButton />
      </div>
    </DashboardProvider>
  );
};

export default V1App;