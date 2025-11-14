import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role for admin operations
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Starting event reminder job');

    // Get events starting in the next 24-26 hours
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in26Hours = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    const { data: upcomingEvents, error: eventsError } = await supabaseClient
      .from('events')
      .select('id, title, start_time, format, location_name, location_city, meeting_url, organizer_id')
      .gte('start_time', in24Hours.toISOString())
      .lte('start_time', in26Hours.toISOString())
      .eq('is_cancelled', false);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    if (!upcomingEvents || upcomingEvents.length === 0) {
      console.log('No events found in the next 24 hours');
      return new Response(JSON.stringify({ message: 'No events to remind about', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${upcomingEvents.length} events to remind about`);

    let totalReminders = 0;

    for (const event of upcomingEvents) {
      // Get all attendees who RSVP'd "going"
      const { data: attendees, error: attendeesError } = await supabaseClient
        .from('event_attendees')
        .select('user_id, profiles(email, full_name, email_notifications)')
        .eq('event_id', event.id)
        .eq('status', 'going');

      if (attendeesError) {
        console.error(`Error fetching attendees for event ${event.id}:`, attendeesError);
        continue;
      }

      if (!attendees || attendees.length === 0) {
        console.log(`No attendees for event ${event.id}`);
        continue;
      }

      console.log(`Sending reminders to ${attendees.length} attendees for event: ${event.title}`);

      // Create notifications for each attendee
      const notifications = attendees
        .filter(a => a.profiles?.email_notifications !== false) // Respect email preferences
        .map(attendee => ({
          user_id: attendee.user_id,
          type: 'event_reminder',
          title: `Reminder: ${event.title} starts tomorrow`,
          message: `Your event "${event.title}" is starting in 24 hours. Don't forget to ${event.format === 'virtual' ? 'join online' : 'head to the venue'}!`,
          link: `/dna/convene/events/${event.id}`,
          metadata: {
            event_id: event.id,
            event_title: event.title,
            start_time: event.start_time,
            format: event.format,
            location: event.location_name || event.location_city,
            meeting_url: event.meeting_url
          },
          read: false,
          created_at: new Date().toISOString()
        }));

      if (notifications.length > 0) {
        const { error: notifError } = await supabaseClient
          .from('notifications')
          .insert(notifications);

        if (notifError) {
          console.error(`Error creating notifications for event ${event.id}:`, notifError);
        } else {
          totalReminders += notifications.length;
          console.log(`Created ${notifications.length} notifications for event ${event.id}`);
        }
      }
    }

    console.log(`Event reminder job completed. Total reminders sent: ${totalReminders}`);

    return new Response(
      JSON.stringify({ 
        message: 'Event reminders sent successfully', 
        events_processed: upcomingEvents.length,
        reminders_sent: totalReminders
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-event-reminders:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
