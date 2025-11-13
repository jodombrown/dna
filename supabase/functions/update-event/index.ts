import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { corsHeaders } from '../_shared/cors.ts';

interface UpdateEventRequest {
  event_id: string;
  title?: string;
  description?: string;
  event_type?: 'conference' | 'workshop' | 'meetup' | 'webinar' | 'networking' | 'social' | 'other';
  format?: 'in_person' | 'virtual' | 'hybrid';
  location_name?: string | null;
  location_address?: string | null;
  location_city?: string | null;
  location_country?: string | null;
  meeting_url?: string | null;
  meeting_platform?: string | null;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  max_attendees?: number | null;
  is_public?: boolean;
  requires_approval?: boolean;
  allow_guests?: boolean;
  cover_image_url?: string | null;
  is_cancelled?: boolean;
  cancellation_reason?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const updateData: UpdateEventRequest = await req.json();
    
    if (!updateData.event_id) {
      throw new Error('Event ID is required');
    }

    console.log('Updating event:', updateData.event_id, 'for user:', user.id);

    // Fetch existing event and verify ownership
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .eq('id', updateData.event_id)
      .maybeSingle();

    if (fetchError || !existingEvent) {
      throw new Error('Event not found');
    }

    if (existingEvent.organizer_id !== user.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'You can only edit events you created',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if event is in the past
    const eventEndTime = new Date(existingEvent.end_time);
    if (eventEndTime < new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cannot edit past events',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validation for updated fields
    if (updateData.title && (updateData.title.length < 10 || updateData.title.length > 200)) {
      throw new Error('Title must be between 10 and 200 characters');
    }

    if (updateData.description && updateData.description.length < 50) {
      throw new Error('Description must be at least 50 characters');
    }

    if (updateData.start_time && updateData.end_time) {
      const startTime = new Date(updateData.start_time);
      const endTime = new Date(updateData.end_time);
      
      if (endTime <= startTime) {
        throw new Error('Event end time must be after start time');
      }
    }

    // Build update object (only include provided fields)
    const updateObject: any = {};
    
    if (updateData.title !== undefined) updateObject.title = updateData.title;
    if (updateData.description !== undefined) updateObject.description = updateData.description;
    if (updateData.event_type !== undefined) updateObject.event_type = updateData.event_type;
    if (updateData.format !== undefined) updateObject.format = updateData.format;
    if (updateData.location_name !== undefined) updateObject.location_name = updateData.location_name;
    if (updateData.location_address !== undefined) updateObject.location_address = updateData.location_address;
    if (updateData.location_city !== undefined) updateObject.location_city = updateData.location_city;
    if (updateData.location_country !== undefined) updateObject.location_country = updateData.location_country;
    if (updateData.meeting_url !== undefined) updateObject.meeting_url = updateData.meeting_url;
    if (updateData.meeting_platform !== undefined) updateObject.meeting_platform = updateData.meeting_platform;
    if (updateData.start_time !== undefined) updateObject.start_time = updateData.start_time;
    if (updateData.end_time !== undefined) updateObject.end_time = updateData.end_time;
    if (updateData.timezone !== undefined) updateObject.timezone = updateData.timezone;
    if (updateData.max_attendees !== undefined) updateObject.max_attendees = updateData.max_attendees;
    if (updateData.is_public !== undefined) updateObject.is_public = updateData.is_public;
    if (updateData.requires_approval !== undefined) updateObject.requires_approval = updateData.requires_approval;
    if (updateData.allow_guests !== undefined) updateObject.allow_guests = updateData.allow_guests;
    if (updateData.cover_image_url !== undefined) updateObject.cover_image_url = updateData.cover_image_url;
    if (updateData.is_cancelled !== undefined) {
      updateObject.is_cancelled = updateData.is_cancelled;
      if (updateData.is_cancelled && updateData.cancellation_reason) {
        updateObject.cancellation_reason = updateData.cancellation_reason;
      }
    }

    updateObject.updated_at = new Date().toISOString();

    console.log('Updating event with:', updateObject);

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update(updateObject)
      .eq('id', updateData.event_id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error(`Failed to update event: ${updateError.message}`);
    }

    // If significant changes (time or location), notify attendees
    const significantChange = updateData.start_time || updateData.end_time || 
                             updateData.location_city || updateData.meeting_url ||
                             updateData.is_cancelled;

    if (significantChange) {
      console.log('Significant change detected, fetching attendees for notification');
      
      const { data: attendees } = await supabase
        .from('event_attendees')
        .select('user_id')
        .eq('event_id', updateData.event_id)
        .in('status', ['going', 'maybe']);

      if (attendees && attendees.length > 0) {
        const notifications = attendees.map(attendee => ({
          user_id: attendee.user_id,
          type: updateData.is_cancelled ? 'event_cancelled' : 'event_updated',
          title: updateData.is_cancelled ? 'Event Cancelled' : 'Event Updated',
          message: updateData.is_cancelled 
            ? `The event "${updatedEvent.title}" has been cancelled.`
            : `The event "${updatedEvent.title}" has been updated.`,
          related_entity_type: 'event',
          related_entity_id: updateData.event_id,
        }));

        await supabase.from('notifications').insert(notifications);
        console.log(`Created ${notifications.length} notifications for attendees`);
      }
    }

    console.log('Event updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        event: updatedEvent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in update-event function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
