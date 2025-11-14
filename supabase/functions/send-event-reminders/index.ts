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

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Create job log entry
  const jobLogId = crypto.randomUUID();
  const startTime = new Date().toISOString();
  
  try {
    // Check if reminders are enabled (feature flag)
    const remindersEnabled = Deno.env.get('ENABLE_EVENT_REMINDERS') !== 'false';
    
    if (!remindersEnabled) {
      console.log('Event reminders disabled via feature flag');
      return new Response(JSON.stringify({ 
        message: 'Event reminders disabled',
        enabled: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log job start
    await supabaseClient.from('cron_job_logs').insert({
      id: jobLogId,
      job_name: 'send-event-reminders',
      started_at: startTime,
      status: 'running',
    });

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
      
      // Log completion
      await supabaseClient.from('cron_job_logs').update({
        completed_at: new Date().toISOString(),
        status: 'success',
        events_processed: 0,
        reminders_sent: 0,
      }).eq('id', jobLogId);

      return new Response(JSON.stringify({ 
        message: 'No events to remind about', 
        count: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${upcomingEvents.length} events to remind about`);

    let totalReminders = 0;
    const errors: string[] = [];

    for (const event of upcomingEvents) {
      try {
        // Get all attendees who RSVP'd "going"
        const { data: attendees, error: attendeesError } = await supabaseClient
          .from('event_attendees')
          .select('user_id, profiles(email, full_name, email_notifications)')
          .eq('event_id', event.id)
          .eq('status', 'going');

        if (attendeesError) {
          console.error(`Error fetching attendees for event ${event.id}:`, attendeesError);
          errors.push(`Event ${event.id}: ${attendeesError.message}`);
          continue;
        }

        if (!attendees || attendees.length === 0) {
          console.log(`No attendees for event ${event.id}`);
          continue;
        }

        console.log(`Processing ${attendees.length} attendees for event: ${event.title}`);

        // Check which attendees already received reminders (idempotency)
        const { data: existingReminders } = await supabaseClient
          .from('event_reminder_logs')
          .select('user_id')
          .eq('event_id', event.id)
          .eq('reminder_type', 'event_24h');

        const alreadyRemindedUserIds = new Set(
          existingReminders?.map(r => r.user_id) || []
        );

        // Filter out users who already got reminders
        const attendeesToRemind = attendees.filter(
          a => !alreadyRemindedUserIds.has(a.user_id) && 
               a.profiles?.email_notifications !== false
        );

        if (attendeesToRemind.length === 0) {
          console.log(`All attendees already reminded for event ${event.id}`);
          continue;
        }

        console.log(`Sending ${attendeesToRemind.length} new reminders for event: ${event.title}`);

        // Create notifications
        const notifications = attendeesToRemind.map(attendee => ({
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

        const { data: createdNotifications, error: notifError } = await supabaseClient
          .from('notifications')
          .insert(notifications)
          .select('id, user_id');

        if (notifError) {
          console.error(`Error creating notifications for event ${event.id}:`, notifError);
          errors.push(`Event ${event.id} notifications: ${notifError.message}`);
          continue;
        }

        // Log successful reminders
        const reminderLogs = createdNotifications?.map(notif => ({
          event_id: event.id,
          user_id: notif.user_id,
          reminder_type: 'event_24h',
          notification_id: notif.id,
          sent_at: new Date().toISOString(),
        })) || [];

        if (reminderLogs.length > 0) {
          const { error: logError } = await supabaseClient
            .from('event_reminder_logs')
            .insert(reminderLogs);

          if (logError) {
            console.error(`Error logging reminders for event ${event.id}:`, logError);
            // Don't fail the job for logging errors, but record it
            errors.push(`Event ${event.id} logging: ${logError.message}`);
          } else {
            totalReminders += reminderLogs.length;
            console.log(`Created ${reminderLogs.length} notifications for event ${event.id}`);
          }
        }
      } catch (eventError) {
        console.error(`Error processing event ${event.id}:`, eventError);
        errors.push(`Event ${event.id}: ${eventError instanceof Error ? eventError.message : 'Unknown error'}`);
      }
    }

    console.log(`Event reminder job completed. Total reminders sent: ${totalReminders}`);

    // Log completion
    await supabaseClient.from('cron_job_logs').update({
      completed_at: new Date().toISOString(),
      status: errors.length > 0 ? 'error' : 'success',
      events_processed: upcomingEvents.length,
      reminders_sent: totalReminders,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      metadata: {
        errors_count: errors.length,
        window_start: in24Hours.toISOString(),
        window_end: in26Hours.toISOString(),
      }
    }).eq('id', jobLogId);

    return new Response(
      JSON.stringify({ 
        message: 'Event reminders sent successfully', 
        events_processed: upcomingEvents.length,
        reminders_sent: totalReminders,
        errors: errors.length > 0 ? errors : undefined,
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-event-reminders:', error);
    
    // Log error
    try {
      await supabaseClient.from('cron_job_logs').update({
        completed_at: new Date().toISOString(),
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      }).eq('id', jobLogId);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
