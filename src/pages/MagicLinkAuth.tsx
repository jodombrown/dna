import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const MagicLinkAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Invalid magic link - no token provided');
          return;
        }

        // Check if magic link is valid and not expired
        const { data: magicLinkData, error: fetchError } = await supabase
          .from('magic_links')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        if (fetchError || !magicLinkData) {
          setStatus('error');
          setMessage('Invalid or expired magic link');
          return;
        }

        // Check if already used
        if (magicLinkData.used_at) {
          setStatus('error');
          setMessage('This magic link has already been used');
          return;
        }

        // Check if expired
        const now = new Date();
        const expiresAt = new Date(magicLinkData.expires_at);
        if (now > expiresAt) {
          setStatus('expired');
          setMessage('This magic link has expired');
          return;
        }

        // Mark magic link as used
        const { error: updateError } = await supabase
          .from('magic_links')
          .update({ 
            used_at: new Date().toISOString(),
            used_by_id: magicLinkData.user_email
          })
          .eq('token', token);

        if (updateError) {
          console.error('Error marking magic link as used:', updateError);
        }

        // Create account or sign in with email
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: magicLinkData.user_email,
          password: `magic_${token}_${Date.now()}`, // Temporary password
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: magicLinkData.full_name,
              beta_application_id: magicLinkData.beta_application_id,
              magic_link_signup: true,
              onboarding_source: 'magic_link'
            }
          }
        });

        if (signUpError && !signUpError.message.includes('User already registered')) {
          throw signUpError;
        }

        // If user already exists, sign them in with OTP
        if (signUpError?.message.includes('User already registered')) {
          const { error: signInError } = await supabase.auth.signInWithOtp({
            email: magicLinkData.user_email,
            options: {
              emailRedirectTo: `${window.location.origin}/onboarding`
            }
          });

          if (signInError) throw signInError;

          setStatus('success');
          setMessage('Check your email for the sign-in link and complete your profile setup!');
        } else {
          setStatus('success');
          setMessage('Account created successfully! You can now sign in and complete your profile setup.');
          
          // Send welcome email with profile creation instructions
          await supabase.functions.invoke('beta-notifications', {
            body: {
              to: magicLinkData.user_email,
              type: 'magic_link',
              data: {
                full_name: magicLinkData.full_name,
                magic_link: `${window.location.origin}/auth?welcome=true`
              }
            }
          });
        }

        // Update beta application with profile creation timestamp
        if (magicLinkData.beta_application_id) {
          await supabase
            .from('beta_applications')
            .update({ profile_created_at: new Date().toISOString() })
            .eq('id', magicLinkData.beta_application_id);
        }

      } catch (error: any) {
        console.error('Magic link verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to verify magic link');
      }
    };

    verifyMagicLink();
  }, [searchParams]);

  // Countdown for redirect
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/auth');
    }
  }, [status, countdown, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="w-16 h-16 animate-spin text-dna-copper" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-dna-emerald" />;
      case 'expired':
        return <AlertTriangle className="w-16 h-16 text-orange-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying your invitation...';
      case 'success':
        return 'Welcome to DNA!';
      case 'expired':
        return 'Link Expired';
      case 'error':
        return 'Verification Failed';
      default:
        return '';
    }
  };

  const getStatusMessage = () => {
    if (status === 'expired') {
      return 'Your magic link has expired for security reasons. Magic links are valid for 24 hours from when they are sent.';
    }
    return message;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/2768ac69-7468-4ee5-a1aa-3f241d1b7b25.png" 
            alt="DNA Logo" 
            className="w-16 h-16 mx-auto"
          />
        </div>

        {/* Status Icon */}
        <div className="mb-6 flex justify-center">
          {getStatusIcon()}
        </div>

        {/* Status Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {getStatusTitle()}
        </h1>

        {/* Status Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {getStatusMessage()}
        </p>

        {/* Success State */}
        {status === 'success' && (
          <div className="space-y-4">
            <div className="bg-dna-emerald/10 border border-dna-emerald/20 rounded-lg p-4">
              <p className="text-sm text-dna-emerald font-medium">
                Redirecting to sign-in in {countdown} seconds...
              </p>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-dna-copper text-white py-3 px-4 rounded-lg font-medium hover:bg-dna-copper/90 transition-colors"
            >
              Continue to Sign In
            </button>
          </div>
        )}

        {/* Expired State */}
        {status === 'expired' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-600">
                Please request a new invitation link from an administrator. For faster access, contact us directly.
              </p>
            </div>
            <button
              onClick={() => navigate('/beta-application')}
              className="w-full bg-dna-copper text-white py-3 px-4 rounded-lg font-medium hover:bg-dna-copper/90 transition-colors"
            >
              Request New Invitation
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">
                Please contact support if this issue persists. Include this error in your message for faster resolution.
              </p>
            </div>
            <button
              onClick={() => navigate('/contact')}
              className="w-full bg-dna-copper text-white py-3 px-4 rounded-lg font-medium hover:bg-dna-copper/90 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagicLinkAuth;