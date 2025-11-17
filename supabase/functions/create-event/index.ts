import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { corsHeaders } from '../_shared/cors.ts';

interface CreateEventRequest {
  title: string;
  description: string;
  event_type: 'conference' | 'workshop' | 'meetup' | 'webinar' | 'networking' | 'social' | 'other';
  format: 'in_person' | 'virtual' | 'hybrid';
  location_name?: string;
  location_address?: string;
  location_city?: string;
  location_country?: string;
  meeting_url?: string;
  meeting_platform?: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  max_attendees?: number;
  is_public?: boolean;
  requires_approval?: boolean;
  allow_guests?: boolean;
  cover_image_url?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('Creating event for user:', user.id);

    // Fetch user profile to check eligibility
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('profile_completion_percentage, user_type')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Check profile completion requirement
    const completionPercentage = profile.profile_completion_percentage ?? 0;
    if (completionPercentage < 40) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Profile must be at least 40% complete to create events. Please complete your profile first.',
          required_completion: 40,
          current_completion: completionPercentage,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user is banned
    const { data: banCheck } = await supabase
      .from('banned_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (banCheck) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Your account has been restricted from creating events.',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const eventData: CreateEventRequest = await req.json();

    // Validation
    if (!eventData.title || eventData.title.length < 10 || eventData.title.length > 200) {
      throw new Error('Title must be between 10 and 200 characters');
    }

    if (!eventData.description || eventData.description.length < 50) {
      throw new Error('Description must be at least 50 characters');
    }

    if (!eventData.start_time || !eventData.end_time) {
      throw new Error('Start and end times are required');
    }

    // Validate time range
    const startTime = new Date(eventData.start_time);
    const endTime = new Date(eventData.end_time);
    const now = new Date();

    if (startTime <= now) {
      throw new Error('Event start time must be in the future');
    }

    if (endTime <= startTime) {
      throw new Error('Event end time must be after start time');
    }

    // Validate format-specific requirements
    if (eventData.format === 'in_person' || eventData.format === 'hybrid') {
      if (!eventData.location_city || !eventData.location_country) {
        throw new Error('Location city and country are required for in-person or hybrid events');
      }
    }

    if (eventData.format === 'virtual' || eventData.format === 'hybrid') {
      if (!eventData.meeting_url) {
        throw new Error('Meeting URL is required for virtual or hybrid events');
      }
    }

    if (eventData.max_attendees && eventData.max_attendees <= 0) {
      throw new Error('Max attendees must be greater than 0');
    }

    console.log('Validation passed, creating event...');

    // Create event
    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        organizer_id: user.id,
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        format: eventData.format,
        location_name: eventData.location_name || null,
        location_address: eventData.location_address || null,
        location_city: eventData.location_city || null,
        location_country: eventData.location_country || null,
        meeting_url: eventData.meeting_url || null,
        meeting_platform: eventData.meeting_platform || null,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        timezone: eventData.timezone || 'UTC',
        max_attendees: eventData.max_attendees || null,
        is_public: eventData.is_public !== false,
        requires_approval: eventData.requires_approval || false,
        allow_guests: eventData.allow_guests !== false,
        cover_image_url: eventData.cover_image_url || null,
        is_cancelled: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error(`Failed to create event: ${insertError.message}`);
    }

    console.log('Event created successfully:', event.id);

    // Create feed post for the event
    try {
      await supabase.from('posts').insert({
        author_id: user.id,
        post_type: 'event',
        content: `Created an event: ${event.title}`,
        linked_entity_type: 'event',
        linked_entity_id: event.id,
        event_id: event.id,
        space_id: event.space_id,
        image_url: event.cover_image_url,
        privacy_level: 'public',
      });
    } catch (feedError) {
      console.error('Failed to create feed post for event:', feedError);
      // Don't fail the request if feed post creation fails
    }

    // Track event creation in analytics
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'event_created',
      event_metadata: {
        event_id: event.id,
        event_type: eventData.event_type,
        format: eventData.format,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        event,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-event function:', error);
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
