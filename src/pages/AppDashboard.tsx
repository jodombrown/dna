import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight } from 'lucide-react';
import AppHeader from '@/components/app/AppHeader';
import AppSidebar from '@/components/app/AppSidebar';
import FeedSection from '@/components/app/FeedSection';
import RightSidebar from '@/components/app/RightSidebar';
import { useLayoutStore } from '@/stores/layoutStore';

const AppDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const checkUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, is_public')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking user profile:', error);
          setUserExists(false);
        } else {
          setUserExists(!!data);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        setUserExists(false);
      } finally {
        setCheckingUser(false);
      }
    };

    checkUserProfile();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!checkingUser && userExists === false) {
      navigate('/onboarding');
    }
  }, [checkingUser, userExists, navigate]);

  if (loading || checkingUser) {
    return (
      <div className="min-h-screen bg-dna-mint/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-dna-emerald mx-auto mb-4"></div>
          <p className="text-dna-forest font-medium">Loading your DNA dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to the diaspora network</p>
        </div>
      </div>
    );
  }

  if (!user || userExists === false) {
    return null; // Will redirect
  }

  const { leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar } = useLayoutStore();

  return (
    <div className="min-h-screen bg-dna-mint/20 flex flex-col">
      <AppHeader />
      
      {/* Mobile Toggle Controls */}
      <div className="lg:hidden flex justify-between items-center p-3 bg-white border-b border-dna-mint shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLeftSidebar}
          className={`flex items-center gap-2 transition-colors ${
            leftSidebarOpen ? 'bg-dna-emerald/10 text-dna-emerald' : 'hover:bg-dna-mint/30'
          }`}
        >
          <PanelLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Profile</span>
        </Button>
        
        <div className="text-center">
          <p className="text-sm font-semibold text-dna-forest">DNA Network</p>
          <p className="text-xs text-gray-500">Dashboard</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleRightSidebar}
          className={`flex items-center gap-2 transition-colors ${
            rightSidebarOpen ? 'bg-dna-emerald/10 text-dna-emerald' : 'hover:bg-dna-mint/30'
          }`}
        >
          <PanelRight className="h-4 w-4" />
          <span className="text-sm font-medium">Discover</span>
        </Button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <div className={`
          ${leftSidebarOpen ? 'block' : 'hidden'} 
          ${leftSidebarOpen && 'lg:block'} 
          w-80 flex-shrink-0 border-r border-dna-mint bg-white
          lg:relative absolute lg:translate-x-0 inset-y-0 left-0 z-50
          transition-transform duration-300 ease-in-out
          shadow-lg lg:shadow-none
        `}>
          <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="p-4 space-y-4">
              <AppSidebar />
            </div>
          </div>
          {/* Mobile overlay backdrop */}
          {leftSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleLeftSidebar}
            />
          )}
        </div>
        
        {/* Main Feed */}
        <div className="flex-1 min-w-0 bg-dna-mint/10">
          <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="p-4 lg:p-6">
              <FeedSection />
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className={`
          ${rightSidebarOpen ? 'block' : 'hidden'} 
          ${rightSidebarOpen && 'xl:block'} 
          w-80 flex-shrink-0 bg-white border-l border-dna-mint
          xl:relative absolute xl:translate-x-0 inset-y-0 right-0 z-50
          transition-transform duration-300 ease-in-out
          shadow-lg xl:shadow-none
        `}>
          <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="p-4 space-y-4">
              <RightSidebar />
            </div>
          </div>
          {/* Mobile overlay backdrop */}
          {rightSidebarOpen && (
            <div 
              className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleRightSidebar}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AppDashboard;