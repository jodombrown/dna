import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { MobileNavigation, MobilePostButton } from '@/components/mobile';
import { DashboardProvider } from '@/contexts/DashboardContext';
// V2 Dashboard imports
import Dashboard from './app/Dashboard';
import Search from './app/Search';
import Connect from './app/Connect';
import Profile from './app/Profile';
import ProfileEdit from './app/ProfileEdit';
import Admin from './app/Admin';
import AdminDiagnostics from './app/AdminDiagnostics';
import Invites from './app/Invites';
import Spaces from './app/Spaces';
import Opportunities from './app/Opportunities';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import SpaceDetail from './app/SpaceDetail';
import Recommendations from './app/Recommendations';
import SpaceMembers from './app/SpaceMembers';
import ProfileCompletionBanner from '@/components/profile/ProfileCompletionBanner';

const AppDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      }
      // Allow dashboard access regardless of onboarding/profile completion
    }
  }, [user, loading, navigate]);

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

            <main className="pb-20 lg:pb-0">
              <div className="pt-4">
                <ProfileCompletionBanner />
              </div>
              <div className="pt-6 lg:pt-8">
                <Routes>
                {/* Main dashboard route */}
                <Route index element={<Dashboard />} />
                
                {/* V2 Dashboard Routes */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="search" element={<Search />} />
                <Route path="connect" element={<Connect />} />
                <Route path="spaces" element={<Spaces />} />
                <Route path="spaces/:id" element={<SpaceDetail />} />
                <Route path="spaces/:id/members" element={<SpaceMembers />} />
                <Route path="opportunities" element={<Opportunities />} />
                <Route path="profile" element={<Profile />} />
                <Route path="profile/edit" element={<ProfileEdit />} />
                <Route path="invites" element={<Invites />} />
                <Route path="admin" element={<Admin />} />
                <Route path="admin/diagnostics" element={<AdminDiagnostics />} />
                <Route path="recommendations" element={<Recommendations />} />
                
                {/* Catch-all: redirect any undefined routes back to dashboard */}
                <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
              </Routes>
              </div>
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