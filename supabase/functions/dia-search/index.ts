import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiaRequest {
  query: string;
  source?: string; // dashboard, connect, convene, etc.
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

interface NetworkMatches {
  profiles: Array<{
    id: string;
    full_name: string;
    headline: string;
    avatar_url: string;
    relevance: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    start_date: string;
    relevance: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    relevance: string;
  }>;
  hashtags: Array<{
    id: string;
    name: string;
    post_count: number;
  }>;
}

// Utility: Normalize query for caching
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

// Utility: Generate SHA256 hash
async function hashQuery(query: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(query);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Utility: Extract keywords from query
function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    "what", "how", "where", "when", "who", "why", "is", "are", "the", "a", "an",
    "in", "on", "at", "to", "for", "of", "and", "or", "but", "with", "about",
    "can", "could", "would", "should", "do", "does", "did", "have", "has", "had",
    "be", "been", "being", "there", "their", "they", "this", "that", "these",
    "those", "some", "any", "all", "most", "other", "into", "through", "during",
    "before", "after", "above", "below", "between", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "just", "also",
    "tell", "me", "find", "show", "give", "want", "need", "looking", "search"
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

// Call Perplexity API
async function callPerplexity(query: string): Promise<PerplexityResponse> {
  const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY not configured");
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: `You are DIA, the Diaspora Intelligence Assistant.
You are DNA's AI-powered intelligence layer built to mobilize the African diaspora toward Africa's progress.
You specialize in providing accurate, up-to-date information about:
- African economic opportunities and investments
- Diaspora engagement and contributions to Africa
- African countries, markets, and sectors
- Pan-African business and professional opportunities
- Cultural and social developments across the African continent

Always provide balanced, factual information with clear citations.
Focus on actionable insights that help diaspora professionals connect with African opportunities.
Be concise but comprehensive. Use bullet points for clarity when listing multiple items.`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      max_tokens: 1024,
      temperature: 0.2,
      return_citations: true,
      search_domain_filter: [], // No domain restrictions
      search_recency_filter: "month", // Prefer recent information
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Query DNA network for relevant matches
async function queryNetworkMatches(
  supabase: any,
  keywords: string[]
): Promise<NetworkMatches> {
  const matches: NetworkMatches = {
    profiles: [],
    events: [],
    projects: [],
    hashtags: [],
  };

  if (keywords.length === 0) {
    return matches;
  }

  try {
    // Build OR filter for profiles - use valid columns only
    const profileFilters = keywords.flatMap((k) => [
      `headline.ilike.%${k}%`,
      `bio.ilike.%${k}%`,
      `location.ilike.%${k}%`
    ]);

    // Query profiles - using public profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, headline, avatar_url, location")
      .eq("is_public", true)
      .or(profileFilters.slice(0, 9).join(","))
      .limit(5);

    if (profileError) {
      console.log("Profile query error:", profileError.message);
    } else if (profiles && profiles.length > 0) {
      matches.profiles = profiles.map((p: any) => ({
        id: p.id,
        full_name: p.full_name || "DNA Member",
        headline: p.headline || "",
        avatar_url: p.avatar_url || "",
        relevance: "Expertise match",
      }));
    }

    // Query events - upcoming events (correct column: start_time)
    const eventFilters = keywords.flatMap((k) => [
      `title.ilike.%${k}%`,
      `description.ilike.%${k}%`
    ]);

    const { data: events, error: eventError } = await supabase
      .from("events")
      .select("id, title, start_time, description")
      .gte("start_time", new Date().toISOString())
      .eq("is_cancelled", false)
      .eq("is_public", true)
      .or(eventFilters.slice(0, 6).join(","))
      .order("start_time", { ascending: true })
      .limit(3);

    if (eventError) {
      console.log("Event query error:", eventError.message);
    } else if (events && events.length > 0) {
      matches.events = events.map((e: any) => ({
        id: e.id,
        title: e.title,
        start_date: e.start_time,
        relevance: "Topic match",
      }));
    }

    // Query collaboration spaces as projects (correct column: title)
    const projectFilters = keywords.flatMap((k) => [
      `title.ilike.%${k}%`,
      `description.ilike.%${k}%`
    ]);

    const { data: projects, error: projectError } = await supabase
      .from("collaboration_spaces")
      .select("id, title, status, description")
      .eq("status", "active")
      .or(projectFilters.slice(0, 6).join(","))
      .limit(3);

    if (projectError) {
      console.log("Project query error:", projectError.message);
    } else if (projects && projects.length > 0) {
      matches.projects = projects.map((p: any) => ({
        id: p.id,
        name: p.title,
        status: p.status || "active",
        relevance: "Related project",
      }));
    }

    // Query hashtags (correct column: tag)
    const hashtagFilters = keywords.map((k) => `tag.ilike.%${k}%`);

    const { data: hashtags, error: hashtagError } = await supabase
      .from("hashtags")
      .select("id, tag, usage_count")
      .or(hashtagFilters.join(","))
      .order("usage_count", { ascending: false })
      .limit(5);

    if (hashtagError) {
      console.log("Hashtag query error:", hashtagError.message);
    } else if (hashtags && hashtags.length > 0) {
      matches.hashtags = hashtags.map((h: any) => ({
        id: h.id,
        name: h.tag,
        post_count: h.usage_count || 0,
      }));
    }
  } catch (error) {
    console.error("Error querying network matches:", error);
  }

  return matches;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token", message: "Please sign in to use DIA" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { query, source = "dashboard" }: DiaRequest = await req.json();

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query is required", message: "Please enter a question" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (query.length > 500) {
      return new Response(
        JSON.stringify({ error: "Query too long", message: "Maximum 500 characters allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startTime = Date.now();
    const normalizedQuery = normalizeQuery(query);
    const queryHash = await hashQuery(normalizedQuery);

    // Step 1: Check user rate limits
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const periodStart = currentMonth.toISOString().split("T")[0];

    let { data: usage } = await supabase
      .from("dia_user_usage")
      .select("*")
      .eq("user_id", user.id)
      .eq("period_start", periodStart)
      .single();

    if (!usage) {
      // Create usage record for new period
      const { data: newUsage, error: insertError } = await supabase
        .from("dia_user_usage")
        .insert({
          user_id: user.id,
          period_start: periodStart,
          query_count: 0,
          query_limit: 10, // Default free tier
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating usage record:", insertError);
      }
      usage = newUsage;
    }

    if (usage && usage.query_count >= usage.query_limit) {
      return new Response(
        JSON.stringify({
          error: "Monthly query limit reached",
          message: "You've used all your DIA queries this month",
          limit: usage.query_limit,
          used: usage.query_count,
          resets_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Check cache
    const { data: cachedQuery } = await supabase
      .from("dia_queries")
      .select("*")
      .eq("query_hash", queryHash)
      .gt("expires_at", new Date().toISOString())
      .single();

    let response: any;
    let cacheHit = false;

    if (cachedQuery) {
      // Cache hit!
      cacheHit = true;
      response = {
        answer: cachedQuery.perplexity_response.choices[0].message.content,
        citations: cachedQuery.citations || [],
        network_matches: cachedQuery.network_matches || { profiles: [], events: [], projects: [], hashtags: [] },
        cached: true,
      };

      // Increment cache hit counter (fire and forget)
      supabase
        .from("dia_queries")
        .update({ cache_hits: (cachedQuery.cache_hits || 0) + 1 })
        .eq("id", cachedQuery.id)
        .then(() => {})
        .catch((err: any) => console.error("Cache hit update failed:", err));
    } else {
      // Cache miss - call Perplexity
      const perplexityResponse = await callPerplexity(query);
      const keywords = extractKeywords(query);
      const networkMatches = await queryNetworkMatches(supabase, keywords);

      // Calculate estimated cost (Sonar: $1/1M input, $1/1M output + $5/1K requests)
      const tokensUsed = (perplexityResponse.usage?.prompt_tokens || 0) +
                         (perplexityResponse.usage?.completion_tokens || 0);
      const tokenCost = tokensUsed * 0.000001; // $1 per 1M tokens
      const requestCost = 0.005; // $5 per 1K requests = $0.005 per request
      const estimatedCost = tokenCost + requestCost;

      // Cache the response
      const { error: cacheError } = await supabase.from("dia_queries").insert({
        query_hash: queryHash,
        query_text: query,
        normalized_query: normalizedQuery,
        perplexity_response: perplexityResponse,
        citations: perplexityResponse.citations || [],
        network_matches: networkMatches,
        model_used: "sonar",
        tokens_used: tokensUsed,
        estimated_cost: estimatedCost,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      if (cacheError) {
        console.error("Cache insert error:", cacheError);
      }

      response = {
        answer: perplexityResponse.choices[0].message.content,
        citations: perplexityResponse.citations || [],
        network_matches: networkMatches,
        cached: false,
      };

      // Update user usage stats
      const { error: usageError } = await supabase
        .from("dia_user_usage")
        .update({
          query_count: (usage?.query_count || 0) + 1,
          total_tokens_used: (usage?.total_tokens_used || 0) + tokensUsed,
          total_estimated_cost: parseFloat((usage?.total_estimated_cost || 0)) + estimatedCost,
          last_query_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("period_start", periodStart);

      if (usageError) {
        console.error("Usage update error:", usageError);
      }
    }

    // Log the query (for analytics)
    const { error: logError } = await supabase.from("dia_query_log").insert({
      user_id: user.id,
      query_text: query,
      cache_hit: cacheHit,
      response_time_ms: Date.now() - startTime,
      source: source,
    });

    if (logError) {
      console.error("Query log insert error:", logError);
    }

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        data: response,
        usage: {
          queries_used: (usage?.query_count || 0) + (cacheHit ? 0 : 1),
          queries_limit: usage?.query_limit || 10,
          queries_remaining: Math.max(0, (usage?.query_limit || 10) - (usage?.query_count || 0) - (cacheHit ? 0 : 1)),
        },
        response_time_ms: Date.now() - startTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("DIA Search Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message || "Something went wrong. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
