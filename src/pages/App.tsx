import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

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
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Fixed Header */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
            <div className="h-14 flex items-center px-4">
              <SidebarTrigger className="mr-4" />
              <Header />
            </div>
          </div>

          {/* Sidebar */}
          <AppSidebar />

          {/* Main Content */}
          <main className="flex-1 pt-14">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-dna-forest mb-4">
                      Welcome, {profile?.display_name || profile?.full_name || user.user_metadata?.full_name || 'DNA Member'}!
                    </h3>
                    <p className="text-gray-600 text-sm">
                      This is your DNA dashboard where you can connect, collaborate, and contribute to the diaspora community.
                    </p>
                  </div>
                </div>

                {/* Main Feed */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold text-dna-forest mb-4">Community Feed</h3>
                    <p className="text-gray-600 text-sm">
                      Your personalized feed will appear here once more content is available.
                    </p>
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
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default App;