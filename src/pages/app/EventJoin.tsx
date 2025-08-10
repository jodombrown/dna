import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { LoaderIcon, ExternalLinkIcon, AlertCircleIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EventJoin: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleJoinLink = async () => {
      if (!token) {
        setError('Invalid join token');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('rpc_event_join_link', {
          p_token: token,
        });

        if (error) {
          throw error;
        }

        if (data) {
          // Track analytics and redirect
          toast.success('Redirecting to event...');
          
          // Small delay for user feedback
          setTimeout(() => {
            window.location.replace(data);
          }, 1000);
        } else {
          throw new Error('No URL returned');
        }
      } catch (error: any) {
        console.error('Join link error:', error);
        
        if (error.message.includes('Invalid or unauthorized')) {
          setError('This join link is invalid or has expired');
        } else {
          setError('Failed to access event');
        }
        
        toast.error('Unable to join event');
      } finally {
        setLoading(false);
      }
    };

    handleJoinLink();
  }, [token]);

  const handleGoBack = () => {
    navigate('/app/events');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {loading ? (
              <>
                <LoaderIcon className="w-8 h-8 mx-auto animate-spin text-primary" />
                <h2 className="text-xl font-semibold">Joining Event...</h2>
                <p className="text-muted-foreground">
                  Please wait while we redirect you to the event
                </p>
              </>
            ) : error ? (
              <>
                <AlertCircleIcon className="w-8 h-8 mx-auto text-destructive" />
                <h2 className="text-xl font-semibold">Unable to Join</h2>
                <p className="text-muted-foreground">{error}</p>
                <div className="pt-4">
                  <button
                    onClick={handleGoBack}
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>← Return to Events</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <ExternalLinkIcon className="w-8 h-8 mx-auto text-green-600" />
                <h2 className="text-xl font-semibold">Redirecting...</h2>
                <p className="text-muted-foreground">
                  Taking you to the event now
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventJoin;