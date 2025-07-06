import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppHeader from '@/components/app/AppHeader';
import AppSidebar from '@/components/app/AppSidebar';
import FeedSection from '@/components/app/FeedSection';
import RightSidebar from '@/components/app/RightSidebar';

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
          .from('users')
          .select('id')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dna-emerald mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userExists === false) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <div className="column-container flex layout-stable">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0 hidden lg:block border-r border-gray-200 bg-white">
          <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="p-4">
              <AppSidebar />
            </div>
          </div>
        </div>
        
        {/* Main Feed */}
        <div className="flex-1 min-w-0 border-r border-gray-200 bg-white">
          <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="p-4">
              <FeedSection />
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0 hidden xl:block bg-white">
          <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="p-4">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDashboard;