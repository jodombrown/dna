import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const targetUrl = url.searchParams.get('url')

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate URL format
    try {
      new URL(targetUrl)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Try noembed.com first (supports many providers)
    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(targetUrl)}`
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'DNA Platform/1.0 (diasporanetwork.africa)',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`oEmbed service error: ${response.status}`)
    }

    const data = await response.json()

    // Add our own metadata
    const enrichedData = {
      ...data,
      fetched_at: new Date().toISOString(),
      cache_age: data.cache_age || 86400 // Default 24 hours
    }

    return new Response(
      JSON.stringify(enrichedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      }
    )

  } catch (error) {
    console.error('oEmbed proxy error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch embed data',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})