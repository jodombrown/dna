import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Attempting to delete user:', userId)

    // First, delete related records that reference the user
    // Delete from impact_log (this was causing the foreign key constraint error)
    const { error: impactError } = await supabaseClient
      .from('impact_log')
      .delete()
      .eq('user_id', userId)

    if (impactError) {
      console.error('Error deleting impact_log records:', impactError)
    }

    // Delete from other tables that might reference the user
    const tablesToClean = [
      'contributions',
      'contact_requests',
      'notifications',
      'user_dna_points',
      'user_adin_profile',
      'user_badges',
      'admin_users',
      'posts',
      'comments',
      'community_memberships',
      'community_posts',
      'community_events',
      'messages',
      'conversations'
    ]

    for (const table of tablesToClean) {
      try {
        await supabaseClient
          .from(table)
          .delete()
          .eq('user_id', userId)
      } catch (error) {
        console.log(`Non-critical: Could not delete from ${table}:`, error)
      }
    }

    // Delete from profiles table
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
    }

    // Finally, delete the user from auth.users using the admin API
    const { data, error: authError } = await supabaseClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting user from auth:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User deleted successfully:', userId)

    return new Response(
      JSON.stringify({ message: 'User deleted successfully', data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Delete user error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})