import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchType = 'web' } = await req.json();
    
    console.log(`Global search request: ${query}, type: ${searchType}`);

    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    let searchPrompt = '';
    let searchFilters: any = {};

    // Customize search based on type
    switch (searchType) {
      case 'events':
        searchPrompt = `Find current and upcoming events related to: ${query}. Include event details like dates, locations, organizers, and how to attend.`;
        searchFilters.search_recency_filter = 'month';
        break;
      case 'people':
        searchPrompt = `Find information about people, professionals, or experts related to: ${query}. Include their background, achievements, and current activities.`;
        break;
      case 'organizations':
        searchPrompt = `Find organizations, companies, or institutions related to: ${query}. Include their mission, location, and key activities.`;
        break;
      case 'opportunities':
        searchPrompt = `Find current opportunities, jobs, funding, or programs related to: ${query}. Include application details and deadlines.`;
        searchFilters.search_recency_filter = 'month';
        break;
      case 'news':
        searchPrompt = `Find recent news and developments about: ${query}. Focus on the most current and relevant information.`;
        searchFilters.search_recency_filter = 'week';
        break;
      default:
        searchPrompt = `Search for comprehensive information about: ${query}. Provide diverse results including people, organizations, events, and recent developments.`;
    }

    console.log('Making Perplexity API request with prompt:', searchPrompt);

    const requestBody = {
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: `You are a global search assistant for the Diaspora Network of Africa (DNA). 
          Provide comprehensive, accurate, and well-structured information.
          Format your response as a JSON array of search results with this structure:
          [
            {
              "title": "Result title",
              "description": "Detailed description (2-3 sentences)",
              "url": "source URL if available",
              "source": "Source name",
              "relevanceScore": 0.9,
              "type": "event|person|organization|opportunity|news|other"
            }
          ]
          
          Aim for 5-10 diverse, high-quality results. Prioritize recent and relevant information.`
        },
        {
          role: 'user',
          content: searchPrompt
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 2000,
      return_images: false,
      return_related_questions: true,
      frequency_penalty: 1,
      presence_penalty: 0
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Perplexity API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error response:', errorText);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    const relatedQuestions = data.related_questions || [];

    if (!aiResponse) {
      throw new Error('No response from Perplexity API');
    }

    console.log('Perplexity raw response:', aiResponse);

    let results: GlobalSearchResult[] = [];
    
    try {
      // Try to parse the JSON response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: parse structured text response
        results = parseTextResponse(aiResponse, query);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      results = parseTextResponse(aiResponse, query);
    }

    // Sort by relevance score
    results.sort((a, b) => (b.relevanceScore || 0.5) - (a.relevanceScore || 0.5));

    return new Response(JSON.stringify({
      query,
      searchType,
      results: results.slice(0, 10), // Limit to 10 results
      suggestions: relatedQuestions.slice(0, 5),
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

function parseTextResponse(text: string, query: string): GlobalSearchResult[] {
  const results: GlobalSearchResult[] = [];
  
  // Split by common separators and extract structured information
  const sections = text.split(/\n\n|\n(?=\d+\.|\-|\*)/);
  
  sections.forEach((section, index) => {
    if (section.trim().length > 50) { // Meaningful content
      const lines = section.trim().split('\n');
      const title = lines[0].replace(/^\d+\.\s*|\*\s*|\-\s*/, '').trim();
      const description = lines.slice(1).join(' ').trim() || 
                         lines[0].substring(title.length).trim();
      
      if (title && description) {
        results.push({
          title: title.substring(0, 100),
          description: description.substring(0, 300),
          source: 'Global Search',
          relevanceScore: Math.max(0.3, 1 - (index * 0.1)),
          url: undefined
        });
      }
    }
  });
  
  return results;
}