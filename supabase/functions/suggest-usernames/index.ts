import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, industry, countryOrigin, currentLocation } = await req.json();

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create context-aware prompt for diaspora username suggestions
    const prompt = `Generate 8 creative and professional username suggestions for an African diaspora professional with these details:

Name: ${fullName}
Industry: ${industry || 'Professional'}
Country of Origin: ${countryOrigin || 'Africa'}
Current Location: ${currentLocation || 'Global'}

Guidelines:
- Combine elements of name, industry, and diaspora identity
- Use formats like: name_industry_location, name.profession, initials_field, etc.
- Include African diaspora context (e.g., _africa, _diaspora, .connects, etc.)
- Keep usernames 3-20 characters, use only letters, numbers, dots, underscores, hyphens
- Make them memorable and professional
- Avoid offensive or inappropriate content

Examples for inspiration:
- amina_bio_kenya
- kofi.dev
- nana_tech_ghana
- diaspora_engineer
- african_innovator

Return ONLY a JSON array of objects with this exact format:
[
  {
    "username": "suggested_username",
    "explanation": "Brief explanation of why this works for them"
  }
]`;

    console.log('Generating username suggestions for:', { fullName, industry, countryOrigin });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a creative username generator specializing in African diaspora professional identity. Generate meaningful, culturally-aware username suggestions. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorData);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later.', suggestions: [] }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service unavailable, please try again later.', suggestions: [] }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const suggestions = data.choices[0]?.message?.content;

    if (!suggestions) {
      throw new Error('No suggestions generated');
    }

    // Parse the JSON response
    let parsedSuggestions;
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanedSuggestions = suggestions.trim();
      if (cleanedSuggestions.startsWith('```json')) {
        cleanedSuggestions = cleanedSuggestions.slice(7);
      }
      if (cleanedSuggestions.startsWith('```')) {
        cleanedSuggestions = cleanedSuggestions.slice(3);
      }
      if (cleanedSuggestions.endsWith('```')) {
        cleanedSuggestions = cleanedSuggestions.slice(0, -3);
      }
      parsedSuggestions = JSON.parse(cleanedSuggestions.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', suggestions);
      // Fallback suggestions if AI response is malformed
      parsedSuggestions = [
        {
          username: `${fullName?.toLowerCase().replace(/\s+/g, '_').slice(0, 10)}_pro`,
          explanation: "Professional username based on your name"
        },
        {
          username: `${countryOrigin?.toLowerCase().slice(0, 4) || 'afro'}_innovator`,
          explanation: "Reflects your innovative diaspora identity"
        }
      ];
    }

    console.log('Generated suggestions:', parsedSuggestions);

    return new Response(
      JSON.stringify({ suggestions: parsedSuggestions }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Error in suggest-usernames function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: [] 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
})
