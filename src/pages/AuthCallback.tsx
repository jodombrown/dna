import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session after auth callback
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth');
          return;
        }

        if (!session?.user) {
          navigate('/auth');
          return;
        }

        // Check if user has completed onboarding and get username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed_at, username')
          .eq('id', session.user.id)
          .maybeSingle();

        console.log('AuthCallback - Profile data:', profile);
        console.log('AuthCallback - Profile error:', profileError);

        if (profile?.onboarding_completed_at) {
          console.log('Onboarding completed, redirecting to profile:', profile.username);
          if (profile.username) {
            navigate(`/profile/${profile.username}`, { replace: true });
          } else {
            navigate('/contribute', { replace: true });
          }
          return;
        }

        // If onboarding not completed but username exists, finalize and redirect
        if (profile?.username) {
          console.log('Username exists but onboarding not marked complete, finalizing...');
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({ onboarding_completed_at: new Date().toISOString() })
            .eq('id', session.user.id);

          if (!updateErr) {
            console.log('Successfully marked onboarding complete, redirecting to profile');
            navigate(`/profile/${profile.username}`, { replace: true });
            return;
          }
        }

        console.log('No profile or username found, redirecting to onboarding');
        navigate('/onboarding', { replace: true });
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
