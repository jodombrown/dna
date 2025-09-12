import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { MobileNavigation, MobilePostButton } from '@/components/mobile';
import { DashboardProvider } from '@/contexts/DashboardContext';
// Core networking features
import Dashboard from './app/Dashboard';
import Search from './app/Search';
import Connect from './app/Connect';
import Profile from './app/Profile';
import ProfileEdit from './app/ProfileEdit';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';


const AppDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  // DEVELOPMENT: Skip authentication checks
  // useEffect(() => {
  //   if (!loading) {
  //     if (!user) {
  //       navigate('/auth');
  //     }
  //     // Allow dashboard access regardless of onboarding/profile completion
  //   }
  // }, [user, loading, navigate]);

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

  // DEVELOPMENT: Allow access without user
  // if (!user) {
  //   return null;
  // }

  return (
    <DashboardProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <div className="flex-1 relative">
            {/* App Header with sidebar control */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
              <div className="h-12 flex items-center px-4 gap-3">
                <SidebarTrigger />
                <div className="text-sm text-muted-foreground">Navigation</div>
              </div>
            </header>

            <main className="pt-10 lg:pt-12 pb-20 lg:pb-0">
              <Routes>
                {/* Core networking features */}
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="search" element={<Search />} />
                <Route path="connect" element={<Connect />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/edit" element={<ProfileEdit />} />
                
                {/* Catch-all: redirect any undefined routes back to dashboard */}
                <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
              </Routes>
            </main>
            <MobileNavigation />
            <MobilePostButton />
            
          </div>
        </div>
      </SidebarProvider>
    </DashboardProvider>
  );
};

export default AppDashboard;