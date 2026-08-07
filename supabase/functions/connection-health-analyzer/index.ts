import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { requireInternal } from "../_shared/auth.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConnectionHealth {
  connection_id: string
  user_a: string
  user_b: string
  health_score: number
  health_status: 'strong' | 'moderate' | 'weak' | 'fading'
  last_interaction: string | null
  interaction_count: number
  days_since_interaction: number
}

async function analyzeConnectionHealth(supabase: any, userId: string, connectionId: string, connectedAt: string): Promise<ConnectionHealth> {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  // Resolve the 1:1 conversation(s) between exactly this pair, so the
  // messages query below can scope to it. The old `.or(sender_id.eq.A,
  // sender_id.eq.B)` filter only checked sender_id and never scoped to a
  // shared conversation — it counted each user's messages to *anyone* on
  // the platform, inflating health scores for users who are simply active
  // in messaging elsewhere and defeating the "fading connection" nudge.
  const { data: sharedConversations } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user_a.eq.${userId},user_b.eq.${connectionId}),and(user_a.eq.${connectionId},user_b.eq.${userId})`)

  const conversationIds = (sharedConversations || []).map((c: { id: string }) => c.id)

  // Check for various interactions between users
  const [messagesData, commentsData, reactionsData] = await Promise.all([
    // Messages between users — scoped to their actual shared conversation(s)
    conversationIds.length > 0
      ? supabase.from('messages')
          .select('created_at')
          .in('conversation_id', conversationIds)
          .gte('created_at', ninetyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as { created_at: string }[] }),

    // Comments on each other's posts
    supabase.from('post_comments')
      .select('created_at, author_id')
      .in('author_id', [userId, connectionId])
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false }),
    
    // Reactions to each other's posts
    supabase.from('post_reactions')
      .select('created_at, user_id')
      .in('user_id', [userId, connectionId])
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
  ])

  // Combine all interactions
  const allInteractions = [
    ...(messagesData.data || []),
    ...(commentsData.data || []),
    ...(reactionsData.data || [])
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const lastInteraction = allInteractions[0]?.created_at || null
  const daysSinceInteraction = lastInteraction 
    ? Math.floor((now.getTime() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  // Count recent interactions (last 30 days)
  const recentInteractions = allInteractions.filter(
    i => new Date(i.created_at) >= thirtyDaysAgo
  ).length

  // Calculate health score (0-100)
  let healthScore = 0

  // Recency bonus (max 40 points)
  if (daysSinceInteraction < 7) healthScore += 40
  else if (daysSinceInteraction < 14) healthScore += 30
  else if (daysSinceInteraction < 30) healthScore += 20
  else if (daysSinceInteraction < 60) healthScore += 10

  // Frequency bonus (max 40 points)
  if (recentInteractions >= 10) healthScore += 40
  else if (recentInteractions >= 5) healthScore += 30
  else if (recentInteractions >= 3) healthScore += 20
  else if (recentInteractions >= 1) healthScore += 10

  // Longevity bonus (max 20 points)
  const daysSinceConnection = Math.floor(
    (now.getTime() - new Date(connectedAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSinceConnection > 180) healthScore += 20
  else if (daysSinceConnection > 90) healthScore += 15
  else if (daysSinceConnection > 30) healthScore += 10
  else healthScore += 5

  // Determine health status
  let healthStatus: 'strong' | 'moderate' | 'weak' | 'fading'
  if (healthScore >= 70) healthStatus = 'strong'
  else if (healthScore >= 40) healthStatus = 'moderate'
  else if (healthScore >= 20) healthStatus = 'weak'
  else healthStatus = 'fading'

  return {
    connection_id: `${userId}_${connectionId}`,
    user_a: userId,
    user_b: connectionId,
    health_score: healthScore,
    health_status: healthStatus,
    last_interaction: lastInteraction,
    interaction_count: allInteractions.length,
    days_since_interaction: daysSinceInteraction
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const internal = requireInternal(req);
  if (!internal.ok) return internal.response;



  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting connection health analysis...')

    // Get accepted connections. Capped and chunked below: an unbounded
    // fetch plus a fully sequential per-connection loop (each connection
    // running 2x3 queries plus up to 4 more) will exceed the edge function
    // execution timeout once the connection count grows past a few
    // hundred. See engagement-tracker for the same pattern.
    const BATCH_LIMIT = 2000
    const CONCURRENCY = 15

    const { data: connections, error: fetchError } = await supabase
      .from('connections')
      .select('id, requester_id, recipient_id, created_at')
      .eq('status', 'accepted')
      .order('id')
      .limit(BATCH_LIMIT)

    if (fetchError) {
      throw fetchError
    }

    console.log(`Analyzing ${connections?.length || 0} connections...`)

    let weakConnections = 0
    let fadingConnections = 0
    let nudgesCreated = 0

    const processConnection = async (connection: { id: string; requester_id: string; recipient_id: string; created_at: string }) => {
      let localWeak = 0
      let localFading = 0
      let localNudges = 0
      try {
        // Analyze health for both directions
        const healthA = await analyzeConnectionHealth(
          supabase, 
          connection.requester_id, 
          connection.recipient_id,
          connection.created_at
        )

        const healthB = await analyzeConnectionHealth(
          supabase, 
          connection.recipient_id, 
          connection.requester_id,
          connection.created_at
        )

        // Track weak/fading connections
        if (healthA.health_status === 'weak') localWeak++
        if (healthA.health_status === 'fading') localFading++

        // Create nudges for fading connections (60+ days no interaction)
        if (healthA.days_since_interaction >= 60) {
          const { data: userAProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', connection.recipient_id)
            .single()

          const { data: userBProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', connection.requester_id)
            .single()

          // Create nudge for user A
          await supabase.from('dia_nudges').insert({
            user_id: connection.requester_id,
            connection_id: connection.recipient_id,
            nudge_type: 'weak_connection',
            nudge_category: 'connection',
            priority: 'low',
            message: `You haven't connected with ${userAProfile?.full_name || 'your connection'} in ${healthA.days_since_interaction} days. Send them a message?`,
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })

          // Create nudge for user B
          await supabase.from('dia_nudges').insert({
            user_id: connection.recipient_id,
            connection_id: connection.requester_id,
            nudge_type: 'weak_connection',
            nudge_category: 'connection',
            priority: 'low',
            message: `You haven't connected with ${userBProfile?.full_name || 'your connection'} in ${healthB.days_since_interaction} days. Send them a message?`,
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })

          localNudges += 2
        }

      } catch (connError) {
        console.error(`Error analyzing connection ${connection.id}:`, connError)
      }
      return { weak: localWeak, fading: localFading, nudges: localNudges }
    }

    for (let i = 0; i < (connections || []).length; i += CONCURRENCY) {
      const chunk = (connections || []).slice(i, i + CONCURRENCY)
      const results = await Promise.all(chunk.map(processConnection))
      for (const r of results) {
        weakConnections += r.weak
        fadingConnections += r.fading
        nudgesCreated += r.nudges
      }
    }

    console.log(`Connection health analysis complete.`)
    console.log(`Weak connections: ${weakConnections}`)
    console.log(`Fading connections: ${fadingConnections}`)
    console.log(`Nudges created: ${nudgesCreated}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        connections_analyzed: connections?.length || 0,
        weak_connections: weakConnections,
        fading_connections: fadingConnections,
        nudges_created: nudgesCreated
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in connection-health-analyzer:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
