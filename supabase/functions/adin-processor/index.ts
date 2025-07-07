import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, payload } = await req.json();

    switch (type) {
      case 'process_post_classification':
        return await processPostClassification(supabaseClient, payload);
      case 'update_connection_signals':
        return await updateConnectionSignals(supabaseClient, payload);
      case 'calculate_feed_scores':
        return await calculateFeedScores(supabaseClient, payload);
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  } catch (error) {
    console.error('Error in ADIN processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processPostClassification(supabaseClient: any, payload: any) {
  const { postId, content, userId } = payload;
  
  // Simple keyword-based classification (can be enhanced with AI later)
  const connectKeywords = ['networking', 'meet', 'connection', 'community', 'event'];
  const collaborateKeywords = ['partnership', 'project', 'team', 'startup', 'mentor'];
  const contributeKeywords = ['donation', 'volunteer', 'help', 'support', 'charity'];
  
  const contentLower = content.toLowerCase();
  
  const scores = {
    connect: connectKeywords.filter(k => contentLower.includes(k)).length,
    collaborate: collaborateKeywords.filter(k => contentLower.includes(k)).length,
    contribute: contributeKeywords.filter(k => contentLower.includes(k)).length
  };
  
  const pillar = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[1]] ? a : b)[0];
  const confidence = Math.max(...Object.values(scores)) / 5; // Normalize
  
  // Update post with classification
  await supabaseClient
    .from('posts')
    .update({ 
      pillar: pillar,
      // Store ADIN metadata in a future jsonb column if needed
    })
    .eq('id', postId);
  
  // Update user's ADIN profile
  await supabaseClient.rpc('update_adin_last_active', { target_user_id: userId });
  
  return new Response(
    JSON.stringify({ pillar, confidence }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateConnectionSignals(supabaseClient: any, payload: any) {
  const { sourceUserId, targetUserId, reason, score, context } = payload;
  
  // Create connection signal
  await supabaseClient
    .from('adin_connection_signals')
    .insert({
      source_user: sourceUserId,
      target_user: targetUserId,
      reason,
      score,
      context
    });
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function calculateFeedScores(supabaseClient: any, payload: any) {
  const { userId, postIds } = payload;
  
  // Get user's ADIN profile
  const { data: userProfile } = await supabaseClient
    .from('user_adin_profile')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (!userProfile) {
    return new Response(
      JSON.stringify({ scores: {} }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Get posts and calculate scores
  const { data: posts } = await supabaseClient
    .from('posts')
    .select('id, pillar, content, created_at, author_id')
    .in('id', postIds);
  
  const scores: Record<string, number> = {};
  
  for (const post of posts || []) {
    let score = 0.5; // Base score
    
    // Pillar preference boost
    if (userProfile.engagement_pillars?.includes(post.pillar)) {
      score += 0.3;
    }
    
    // Interest alignment
    const interests = userProfile.interests || [];
    const contentMatch = interests.some(interest => 
      post.content?.toLowerCase().includes(interest.toLowerCase())
    );
    if (contentMatch) {
      score += 0.2;
    }
    
    // Recency boost
    const hoursAge = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursAge < 24) {
      score += (24 - hoursAge) / 24 * 0.2;
    }
    
    scores[post.id] = Math.min(1.0, score);
  }
  
  return new Response(
    JSON.stringify({ scores }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}