import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Mail, BarChart3, Settings, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import GuestsTab from '@/components/events/manage/GuestsTab';
import WaitlistTab from '@/components/events/manage/WaitlistTab';
import RegistrationQuestionsTab from '@/components/events/manage/RegistrationQuestionsTab';
import InsightsTab from '@/components/events/manage/InsightsTab';
import BlastsTab from '@/components/events/manage/BlastsTab';
interface Event {
  id: string;
  title: string;
  created_by: string;
}

const EventManage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;

      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          toast.error('You must be logged in');
          navigate('/app/events');
          return;
        }

        const { data, error } = await supabase
          .from('events')
          .select('id, title, created_by')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error loading event:', error);
          toast.error('Failed to load event');
          navigate('/app/events');
          return;
        }

        if (!data) {
          toast.error('Event not found');
          navigate('/app/events');
          return;
        }

        setEvent(data);
        setCanManage(data.created_by === user.user.id);

        if (data.created_by !== user.user.id) {
          toast.error('You do not have permission to manage this event');
          navigate(`/app/events/${id}`);
          return;
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('An unexpected error occurred');
        navigate('/app/events');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!event || !canManage) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(`/app/events/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Button>
        <Button onClick={() => navigate(`/app/events/${id}/checkin`)}>Open Check-In</Button>
        <h1 className="text-2xl font-bold">Manage: {event.title}</h1>
      </div>

      <Tabs defaultValue="registration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="registration" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Registration
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="guests" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Guests
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Waitlist
          </TabsTrigger>
          <TabsTrigger value="blasts" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Blasts
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registration">
          <Card>
            <CardHeader>
              <CardTitle>Registration Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationQuestionsTab eventId={id!} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests">
          <GuestsTab eventId={id!} />
        </TabsContent>

        <TabsContent value="waitlist">
          <WaitlistTab eventId={id!} />
        </TabsContent>

        <TabsContent value="blasts">
          <BlastsTab eventId={id!} />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsTab eventId={id!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventManage;