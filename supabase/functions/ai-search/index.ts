import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchIntent {
  query: string;
  filters: {
    types: string[];
    location?: string;
    timeframe?: string;
    skills?: string[];
    categories?: string[];
  };
  expandedTerms: string[];
  suggestions: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId } = await req.json();
    
    console.log(`AI Search request: ${query} for user: ${userId}`);

    // Use OpenAI to understand the search intent
    const intent = await analyzeSearchIntent(query);
    console.log('Search intent analyzed:', intent);

    // Perform enhanced search based on AI understanding
    const results = await performEnhancedSearch(intent, userId);
    
    return new Response(JSON.stringify({
      intent,
      results,
      suggestions: intent.suggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-search function:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeSearchIntent(query: string): Promise<SearchIntent> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a search intent analyzer for the Diaspora Network of Africa (DNA) platform. 
          Analyze search queries and extract:
          1. Core search terms
          2. Intended content types (profile, community, event, post)
          3. Location filters (countries, cities, regions)
          4. Time-based filters (this week, next month, etc.)
          5. Skills/expertise mentioned
          6. Categories (technology, business, culture, etc.)
          7. Expanded search terms (synonyms, related concepts)
          8. Search suggestions for refinement
          
          Return JSON only with this structure:
          {
            "query": "cleaned search query",
            "filters": {
              "types": ["profile", "community", "event", "post"],
              "location": "location if mentioned",
              "timeframe": "time filter if mentioned",
              "skills": ["skills mentioned"],
              "categories": ["categories mentioned"]
            },
            "expandedTerms": ["related terms to also search"],
            "suggestions": ["3 suggested refinements"]
          }`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  try {
    return JSON.parse(aiResponse);
  } catch (e) {
    console.error('Failed to parse AI response:', aiResponse);
    // Fallback intent
    return {
      query: query,
      filters: { types: ['profile', 'community', 'event', 'post'] },
      expandedTerms: [query],
      suggestions: [`Find ${query} professionals`, `${query} communities`, `${query} events`]
    };
  }
}

async function performEnhancedSearch(intent: SearchIntent, userId?: string) {
  const results: any = {
    profiles: [],
    communities: [],
    events: [],
    posts: []
  };

  // Create search terms including expanded terms
  const allSearchTerms = [intent.query, ...intent.expandedTerms];
  const searchPattern = allSearchTerms.map(term => `%${term.toLowerCase()}%`).join('|');

  // Search profiles if requested
  if (!intent.filters.types.length || intent.filters.types.includes('profile')) {
    const profileQuery = supabase
      .from('profiles')
      .select('id, full_name, display_name, bio, avatar_url, location, professional_role, skills, created_at')
      .eq('is_public', true)
      .limit(15);

    // Add text search across multiple fields
    let profileFilter = allSearchTerms.map(term => 
      `full_name.ilike.%${term}%,display_name.ilike.%${term}%,bio.ilike.%${term}%,professional_role.ilike.%${term}%`
    ).join(',');
    
    profileQuery.or(profileFilter);

    if (intent.filters.location) {
      profileQuery.ilike('location', `%${intent.filters.location}%`);
    }

    const { data: profiles } = await profileQuery;
    if (profiles) {
      results.profiles = profiles.map(profile => ({
        id: profile.id,
        type: 'profile',
        title: profile.display_name || profile.full_name || 'Unknown User',
        description: profile.bio || profile.professional_role || 'DNA Community Member',
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        metadata: {
          location: profile.location,
          role: profile.professional_role,
          skills: profile.skills
        }
      }));
    }
  }

  // Search communities
  if (!intent.filters.types.length || intent.filters.types.includes('community')) {
    const communityFilter = allSearchTerms.map(term => 
      `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`
    ).join(',');

    const { data: communities } = await supabase
      .from('communities')
      .select('id, name, description, category, image_url, member_count, created_at')
      .or(communityFilter)
      .eq('is_active', true)
      .limit(10);

    if (communities) {
      results.communities = communities.map(community => ({
        id: community.id,
        type: 'community',
        title: community.name,
        description: community.description || `${community.category} community`,
        image_url: community.image_url,
        created_at: community.created_at,
        metadata: {
          category: community.category,
          member_count: community.member_count
        }
      }));
    }
  }

  // Search events with time filtering
  if (!intent.filters.types.length || intent.filters.types.includes('event')) {
    const eventQuery = supabase
      .from('events')
      .select('id, title, description, location, date_time, image_url, created_at, type')
      .limit(10);

    const eventFilter = allSearchTerms.map(term => 
      `title.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%,type.ilike.%${term}%`
    ).join(',');
    
    eventQuery.or(eventFilter);

    // Add time filtering if specified
    if (intent.filters.timeframe) {
      const now = new Date();
      if (intent.filters.timeframe.includes('week')) {
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        eventQuery.gte('date_time', now.toISOString()).lte('date_time', weekFromNow.toISOString());
      } else if (intent.filters.timeframe.includes('month')) {
        const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        eventQuery.gte('date_time', now.toISOString()).lte('date_time', monthFromNow.toISOString());
      }
    }

    const { data: events } = await eventQuery;
    if (events) {
      results.events = events.map(event => ({
        id: event.id,
        type: 'event',
        title: event.title,
        description: event.description || `${event.type} event`,
        image_url: event.image_url,
        created_at: event.created_at,
        metadata: {
          location: event.location,
          date_time: event.date_time,
          event_type: event.type
        }
      }));
    }
  }

  // Search posts
  if (!intent.filters.types.length || intent.filters.types.includes('post')) {
    const postFilter = allSearchTerms.map(term => 
      `title.ilike.%${term}%,content.ilike.%${term}%`
    ).join(',');

    const { data: posts } = await supabase
      .from('community_posts')
      .select('id, title, content, created_at, post_type, author_id, community_id')
      .or(postFilter)
      .limit(10);

    if (posts) {
      results.posts = posts.map(post => ({
        id: post.id,
        type: 'post',
        title: post.title || 'Community Post',
        description: post.content?.substring(0, 150) + (post.content?.length > 150 ? '...' : ''),
        created_at: post.created_at,
        metadata: {
          post_type: post.post_type,
          author_id: post.author_id,
          community_id: post.community_id
        }
      }));
    }
  }

  return results;
}