import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { CreateEventForm } from '@/components/events/CreateEventForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get preselected group ID from navigation state
  const preselectedGroupId = location.state?.groupId;

  // Check user eligibility
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-eligibility', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_completion_percentage, user_type')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const completionPercentage = profile?.profile_completion_percentage ?? 0;
  const canCreateEvent = completionPercentage >= 40;

  if (isLoading) {
    return (
      <LayoutController
        leftColumn={<LeftNav />}
        centerColumn={
          <div className="container max-w-4xl mx-auto px-4 py-8">
            <p className="text-center text-muted-foreground">Loading...</p>
          </div>
        }
        rightColumn={<RightWidgets variant="convene" />}
      />
    );
  }

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dna/convene')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Convene
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Create Event</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Bring the diaspora together around a shared experience
            </p>
          </div>

          {!canCreateEvent ? (
            <Alert className="border-warning">
              <AlertDescription>
                Your profile must be at least 40% complete to create events. 
                You're currently at {completionPercentage}%.
                <Button 
                  variant="link" 
                  className="px-1"
                  onClick={() => navigate('/dna/profile/edit')}
                >
                  Complete your profile
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <CreateEventForm preselectedGroupId={preselectedGroupId} />
          )}
        </div>
      }
      rightColumn={<RightWidgets variant="convene" />}
    />
  );
};

export default CreateEvent;
