import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Routes, Route } from 'react-router-dom';
import UnifiedHeader from '@/components/UnifiedHeader';
import { MobileNavigation, MobilePostButton } from '@/components/mobile';
import { DashboardProvider } from '@/contexts/DashboardContext';
// V1 Dashboard imports (preserved)
import Dashboard from './app/Dashboard';
import Search from './app/Search';
import Connect from './app/Connect';
import Messages from './app/Messages';
import Events from './app/Events';
import Communities from './app/Communities';
import Profile from './app/Profile';
import ProfileEdit from './app/ProfileEdit';
import Settings from './app/Settings';
import Admin from './app/Admin';
import Invites from './app/Invites';

const App = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!profile) {
        // If user exists but no profile, redirect to onboarding
        navigate('/onboarding');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-dna-copper border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
        {/* Unified Header */}
        <UnifiedHeader />

        {/* Main Content */}
        <main className="pt-16 pb-20 lg:pb-0">
          <Routes>
            {/* Redirect to v1 dashboard by default */}
            <Route index element={<Dashboard />} />
            
            {/* V1 Dashboard Routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<Search />} />
            <Route path="connect" element={<Connect />} />
            <Route path="messages" element={<Messages />} />
            <Route path="events" element={<Events />} />
            <Route path="communities" element={<Communities />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<ProfileEdit />} />
            <Route path="settings" element={<Settings />} />
            <Route path="invites" element={<Invites />} />
            <Route path="admin" element={<Admin />} />
          </Routes>
        </main>
        <MobileNavigation />
        <MobilePostButton />
      </div>
    </DashboardProvider>
  );
};

export default App;