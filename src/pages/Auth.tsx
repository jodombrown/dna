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
    // Redirect authenticated users to my-profile after signup/signin—but NOT for 'update' mode!
    if (user && !loading) {
      if (authMode === 'signup' || authMode === 'signin') {
        navigate('/my-profile');
      } else if (authMode === 'update') {
        // do nothing
      } else {
        navigate('/my-profile');
      }
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
