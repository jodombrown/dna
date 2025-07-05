import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppHeader from '@/components/app/AppHeader';
import AppLayout from '@/components/app/AppLayout';

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
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <AppLayout />
    </div>
  );
};

export default AppDashboard;