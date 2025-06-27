import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthForm from '@/components/auth/AuthForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset' | 'update'>(
    mode as 'signin' | 'signup' | 'reset' | 'update'
  );
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Update auth mode when URL changes
    const urlMode = searchParams.get('mode');
    if (urlMode && ['signin', 'signup', 'reset', 'update'].includes(urlMode)) {
      setAuthMode(urlMode as 'signin' | 'signup' | 'reset' | 'update');
    }
  }, [searchParams]);

  useEffect(() => {
    // Handle authenticated user redirection
    if (user && !loading) {
      if (authMode === 'update') {
        // Stay on update page
        return;
      }
      
      // Check if user has a profile to determine where to redirect
      const checkProfileAndRedirect = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (!profile || !profile.full_name) {
            // New user or incomplete profile - go to onboarding
            navigate('/onboarding-wizard');
          } else {
            // Existing user with profile - go to my-profile
            navigate('/my-profile');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          // Default to onboarding if there's an error
          navigate('/onboarding-wizard');
        }
      };

      checkProfileAndRedirect();
    }
  }, [user, loading, navigate, authMode]);

  const toggleMode = () => {
    const newMode = authMode === 'signin' ? 'signup' : 'signin';
    setAuthMode(newMode);
    navigate(`/auth?mode=${newMode}`);
  };

  const showPasswordReset = () => {
    setAuthMode('reset');
    navigate('/auth?mode=reset');
  };

  const backToAuth = () => {
    setAuthMode('signin');
    navigate('/auth?mode=signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const renderForm = () => {
    switch (authMode) {
      case 'reset':
        return <PasswordResetForm onBackToAuth={backToAuth} />;
      case 'update':
        return <UpdatePasswordForm />;
      default:
        return (
          <AuthForm 
            mode={authMode as 'signin' | 'signup'} 
            onToggleMode={toggleMode}
            onPasswordReset={showPasswordReset}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-africa-green to-africa-earth flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {renderForm()}
      </div>
    </div>
  );
};

export default Auth;
