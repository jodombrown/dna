
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import AuthForm from '@/components/auth/AuthForm';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';

const FunctionalAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset' | 'update'>('signin');

  useEffect(() => {
    // Check URL parameters for mode
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') setMode('signup');
    else if (urlMode === 'reset') setMode('reset');
    else if (urlMode === 'update') setMode('update');
    
    // If user is already authenticated, redirect to feed
    if (user && !loading) {
      navigate('/feed');
    }
  }, [user, loading, searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleToggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  const handlePasswordReset = () => {
    setMode('reset');
  };

  const handleBackToAuth = () => {
    setMode('signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <CardTitle className="text-2xl font-bold text-dna-forest mb-2">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Join the DNA Network'}
              {mode === 'reset' && 'Reset Password'}
              {mode === 'update' && 'Update Password'}
            </CardTitle>
            
            <p className="text-gray-600">
              {mode === 'signin' && 'Sign in to your DNA account'}
              {mode === 'signup' && 'Connect with Africa\'s diaspora community'}
              {mode === 'reset' && 'Enter your email to reset your password'}
              {mode === 'update' && 'Create a new secure password'}
            </p>
          </CardHeader>
          
          <CardContent>
            {mode === 'reset' ? (
              <PasswordResetForm onBackToAuth={handleBackToAuth} />
            ) : mode === 'update' ? (
              <UpdatePasswordForm onComplete={handleBackToAuth} />
            ) : (
              <AuthForm 
                mode={mode}
                onToggleMode={handleToggleMode}
                onPasswordReset={handlePasswordReset}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FunctionalAuth;
