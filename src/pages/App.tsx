import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Routes, Route } from 'react-router-dom';
import UnifiedHeader from '@/components/UnifiedHeader';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import Dashboard from './app/Dashboard';
import { DashboardProvider } from '@/contexts/DashboardContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import Search from './app/Search';
import Connect from './app/Connect';
import Messages from './app/Messages';
import Events from './app/Events';
import Communities from './app/Communities';
import Profile from './app/Profile';
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
    <ErrorBoundary>
      <DashboardProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Unified Header */}
          <UnifiedHeader />

          {/* Main Content */}
          <main className="pt-16 pb-20 lg:pb-0">
            <Routes>
              <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="search" element={<ErrorBoundary><Search /></ErrorBoundary>} />
              <Route path="connect" element={<ErrorBoundary><Connect /></ErrorBoundary>} />
              <Route path="messages" element={<ErrorBoundary><Messages /></ErrorBoundary>} />
              <Route path="events" element={<ErrorBoundary><Events /></ErrorBoundary>} />
              <Route path="communities" element={<ErrorBoundary><Communities /></ErrorBoundary>} />
              <Route path="profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
              <Route path="settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
              <Route path="invites" element={<ErrorBoundary><Invites /></ErrorBoundary>} />
              <Route path="admin" element={<ErrorBoundary><Admin /></ErrorBoundary>} />
            </Routes>
          </main>
          <MobileBottomNav />
        </div>
      </DashboardProvider>
    </ErrorBoundary>
  );
};

export default App;