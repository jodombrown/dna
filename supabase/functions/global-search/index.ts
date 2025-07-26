import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GlobalSearchResult {
  title: string;
  description: string;
  url?: string;
  source: string;
  relevanceScore: number;
  type?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchType = 'web' } = await req.json();
    
    console.log(`Global search request: ${query}, type: ${searchType}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Perform dynamic search across all content types
    const results = await performDynamicSearch(supabase, query, searchType);
    
    return new Response(JSON.stringify({
      query,
      searchType,
      results: results.slice(0, 20),
      suggestions: generateDynamicSuggestions(query),
      totalResults: results.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in global-search function:', error);
    return new Response(JSON.stringify({ 
      error: 'Global search failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performDynamicSearch(supabase: any, query: string, searchType: string): Promise<GlobalSearchResult[]> {
  const results: GlobalSearchResult[] = [];
  const searchTerm = `%${query.toLowerCase()}%`;
  
  try {
    // Search People/Profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, bio, professional_role, location, avatar_url')
      .or(`full_name.ilike.${searchTerm},display_name.ilike.${searchTerm},bio.ilike.${searchTerm},professional_role.ilike.${searchTerm}`)
      .eq('is_public', true)
      .limit(5);

    if (profiles) {
      profiles.forEach((profile: any) => {
        results.push({
          title: profile.display_name || profile.full_name || 'DNA Member',
          description: `${profile.professional_role || 'Professional'} ${profile.location ? `in ${profile.location}` : ''}. ${profile.bio || 'DNA Community Member'}`,
          url: `/app/profile?id=${profile.id}`, // Fixed URL for internal navigation
          source: 'DNA Profiles',
          relevanceScore: 0.9,
          type: 'people'
        });
      });
    }

    // Search Events
    const { data: events } = await supabase
      .from('events')
      .select('id, title, description, location, date_time, type')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
      .gte('date_time', new Date().toISOString())
      .limit(5);

    if (events) {
      events.forEach((event: any) => {
        results.push({
          title: event.title,
          description: `${event.type} event ${event.location ? `in ${event.location}` : ''}. ${event.description || 'Join the DNA community'}`,
          url: `/app/events?id=${event.id}`, // Fixed URL for internal navigation
          source: 'DNA Events',
          relevanceScore: 0.85,
          type: 'events'
        });
      });
    }

    // Search Communities/Organizations
    const { data: communities } = await supabase
      .from('communities')
      .select('id, name, description, category, member_count')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
      .eq('is_active', true)
      .limit(5);

    if (communities) {
      communities.forEach((community: any) => {
        results.push({
          title: community.name,
          description: `${community.category} community with ${community.member_count} members. ${community.description || 'Connect and collaborate'}`,
          url: `/app/communities?id=${community.id}`, // Fixed URL for internal navigation
          source: 'DNA Communities',
          relevanceScore: 0.8,
          type: 'organizations'
        });
      });
    }

    // Search Projects/Opportunities
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, description, category, status')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
      .eq('status', 'active')
      .limit(5);

    if (projects) {
      projects.forEach((project: any) => {
        results.push({
          title: project.title,
          description: `${project.category} opportunity. ${project.description || 'Collaborate on this DNA project'}`,
          url: `/projects/${project.id}`,
          source: 'DNA Projects',
          relevanceScore: 0.75,
          type: 'opportunities'
        });
      });
    }

    // Search Posts/News
    const { data: posts } = await supabase
      .from('community_posts')
      .select('id, title, content, created_at, community_id')
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (posts) {
      posts.forEach((post: any) => {
        results.push({
          title: post.title || 'Community Discussion',
          description: `${post.content?.substring(0, 120) || 'Join the conversation'}...`,
          url: `/app/communities?id=${post.community_id}`, // Fixed URL for internal navigation
          source: 'DNA Posts',
          relevanceScore: 0.7,
          type: 'news'
        });
      });
    }

    console.log(`Found ${results.length} dynamic search results for query: ${query}`);
    
  } catch (error) {
    console.error('Error in dynamic search:', error);
  }

  // Add some curated external results to supplement database results
  const externalResults = generateCuratedExternalResults(query, searchType);
  results.push(...externalResults);

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function generateCuratedExternalResults(query: string, searchType: string): GlobalSearchResult[] {
  const queryLower = query.toLowerCase();
  const results: GlobalSearchResult[] = [];

  // Tech and startup keywords
  if (queryLower.includes('startup') || queryLower.includes('tech') || queryLower.includes('entrepreneur')) {
    results.push({
      title: "African Tech Ecosystem Report 2024",
      description: "Latest insights on Africa's growing tech ecosystem, funding trends, and emerging opportunities.",
      url: "https://techpoint.africa/reports",
      source: "External",
      relevanceScore: 0.6,
      type: "news"
    });
  }

  // Investment keywords
  if (queryLower.includes('invest') || queryLower.includes('fund') || queryLower.includes('capital')) {
    results.push({
      title: "African Investment Opportunities 2024",
      description: "Comprehensive guide to investment opportunities across African markets and diaspora networks.",
      url: "https://africaninvestor.com",
      source: "External",
      relevanceScore: 0.6,
      type: "opportunities"
    });
  }

  // Event keywords
  if (queryLower.includes('conference') || queryLower.includes('event') || queryLower.includes('summit')) {
    results.push({
      title: "Africa Tech Summit 2024",
      description: "Premier technology conference connecting African innovators, investors, and entrepreneurs globally.",
      url: "https://africatechsummit.com",
      source: "External",
      relevanceScore: 0.6,
      type: "events"
    });
  }

  return results;
}

function generateDynamicSuggestions(query: string): string[] {
  const suggestions = [
    `${query} professionals`,
    `${query} events`,
    `${query} communities`,
    `${query} opportunities`,
    "African tech startups",
    "Nigeria diaspora network",
    "Investment opportunities Africa",
    "African innovation events"
  ];
  
  return suggestions.slice(0, 6);
}