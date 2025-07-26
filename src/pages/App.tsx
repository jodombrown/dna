import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Routes, Route } from 'react-router-dom';
import LinkedInHeader from '@/components/linkedin/LinkedInHeader';
import Dashboard from './app/Dashboard';
import Search from './app/Search';
import Connect from './app/Connect';
import Messages from './app/Messages';
import Events from './app/Events';
import Communities from './app/Communities';
import Profile from './app/Profile';
import Settings from './app/Settings';

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
    <div className="min-h-screen bg-gray-50">
      {/* LinkedIn-style Header */}
      <LinkedInHeader />

      {/* Main Content */}
      <main className="pt-14">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<Search />} />
          <Route path="connect" element={<Connect />} />
          <Route path="messages" element={<Messages />} />
          <Route path="events" element={<Events />} />
          <Route path="communities" element={<Communities />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;