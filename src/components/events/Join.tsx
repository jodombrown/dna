import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorLogger';

const Join: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventUrl, setEventUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleJoinLink = async () => {
      if (!token) {
        setError('Invalid join link - no token provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase.rpc('rpc_event_join_link', { 
          p_token: token 
        });

        if (error) {
          setError(error.message || 'Failed to process join link');
          return;
        }

        if (data) {
          setEventUrl(data as string);
          toast.success('Join link processed successfully!');
          
          // Auto-redirect after a short delay
          setTimeout(() => {
            window.location.replace(data as string);
          }, 2000);
        } else {
          setError('Invalid or expired join link');
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err) || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    handleJoinLink();
  }, [token]);

  const handleManualRedirect = () => {
    if (eventUrl) {
      window.location.replace(eventUrl);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Calendar className="w-12 h-12 text-primary" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Connecting you to the event</h2>
                <p className="text-muted-foreground">
                  Processing your join link...
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-destructive">
                  Unable to Join Event
                </h2>
                <p className="text-muted-foreground">
                  {error}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button onClick={handleGoHome} variant="outline">
                  Go to Homepage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (eventUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Calendar className="w-12 h-12 text-green-600" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-green-600">
                  Join Link Processed!
                </h2>
                <p className="text-muted-foreground">
                  You will be redirected to the event page shortly.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button 
                  onClick={handleManualRedirect}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Go to Event Now
                </Button>
                <Button onClick={handleGoHome} variant="outline">
                  Go to Homepage
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Redirecting automatically in 2 seconds...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default Join;