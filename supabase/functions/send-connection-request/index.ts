import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify JWT and get user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Parse request body
    const { target_user_id, message } = await req.json();

    if (!target_user_id) {
      return new Response(
        JSON.stringify({ error: 'target_user_id is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    console.log(`Connection request from ${user.id} to ${target_user_id}`);

    // RATE LIMITING: Check if user has exceeded rate limit (20 requests per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentRequests, error: rateLimitError } = await supabaseClient
      .from('rate_limit_checks')
      .select('id')
      .eq('user_id', user.id)
      .eq('action_type', 'connection_request')
      .gte('created_at', oneHourAgo);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    if (recentRequests && recentRequests.length >= 20) {
      console.warn(`User ${user.id} exceeded connection request rate limit`);
      return new Response(
        JSON.stringify({ 
          status: 'rate_limited',
          error: 'Too many connection requests. Please wait before sending more.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    // Validate target user exists and is not the same as requester
    if (target_user_id === user.id) {
      return new Response(
        JSON.stringify({ 
          status: 'invalid',
          error: 'Cannot send connection request to yourself' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check if target user exists
    const { data: targetProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, profile_completion_percentage')
      .eq('id', target_user_id)
      .single();

    if (profileError || !targetProfile) {
      console.error('Target user not found:', profileError);
      return new Response(
        JSON.stringify({ 
          status: 'not_found',
          error: 'User not found' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Verify target user has sufficient profile completion (40%)
    if ((targetProfile.profile_completion_percentage || 0) < 40) {
      return new Response(
        JSON.stringify({ 
          status: 'profile_incomplete',
          error: 'This user has not completed their profile yet' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check for blocked relationships
    const { data: blockCheck } = await supabaseClient
      .from('blocked_users')
      .select('id')
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${target_user_id}),and(blocker_id.eq.${target_user_id},blocked_id.eq.${user.id})`)
      .limit(1)
      .maybeSingle();

    if (blockCheck) {
      console.log(`Blocked relationship detected between ${user.id} and ${target_user_id}`);
      return new Response(
        JSON.stringify({ 
          status: 'blocked',
          error: 'Cannot send connection request to this user' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Check if already connected or pending
    const { data: existingConnection } = await supabaseClient
      .from('connections')
      .select('id, status, requester_id, recipient_id')
      .or(`and(requester_id.eq.${user.id},recipient_id.eq.${target_user_id}),and(requester_id.eq.${target_user_id},recipient_id.eq.${user.id})`)
      .limit(1)
      .maybeSingle();

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return new Response(
          JSON.stringify({ 
            status: 'already_connected',
            message: 'You are already connected with this user' 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
      
      if (existingConnection.status === 'pending') {
        const isPending = existingConnection.requester_id === user.id;
        return new Response(
          JSON.stringify({ 
            status: isPending ? 'already_pending' : 'request_received',
            message: isPending 
              ? 'You already sent a connection request to this user'
              : 'This user has already sent you a connection request'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }

    // Insert the connection request
    const { data: newConnection, error: insertError } = await supabaseClient
      .from('connections')
      .insert({
        requester_id: user.id,
        recipient_id: target_user_id,
        status: 'pending',
        message: message || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create connection:', insertError);
      return new Response(
        JSON.stringify({ 
          status: 'error',
          error: 'Failed to create connection request' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Log rate limit check
    await supabaseClient
      .from('rate_limit_checks')
      .insert({
        user_id: user.id,
        action_type: 'connection_request',
      });

    console.log(`Connection request created: ${newConnection.id}`);

    // Create notification (handled by trigger notify_connection_request)
    // The trigger will automatically create a notification for the recipient

    return new Response(
      JSON.stringify({ 
        status: 'pending',
        connection_id: newConnection.id,
        message: 'Connection request sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: error.message || 'An unexpected error occurred' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
