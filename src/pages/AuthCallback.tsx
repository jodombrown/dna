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
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed_at, username')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.onboarding_completed_at) {
          if (profile.username) {
            navigate(`/profile/${profile.username}`, { replace: true });
          } else {
            navigate('/contribute', { replace: true });
          }
          return;
        }

        // If onboarding not completed but username exists, finalize and redirect
        if (profile?.username) {
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({ onboarding_completed_at: new Date().toISOString() })
            .eq('id', session.user.id);

          if (!updateErr) {
            navigate(`/profile/${profile.username}`, { replace: true });
            return;
          }
        }

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
