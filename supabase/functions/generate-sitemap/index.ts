import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://diasporanetwork.africa';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const urls: SitemapUrl[] = [];

    // Static pages - highest priority
    const staticPages: SitemapUrl[] = [
      { loc: '/', changefreq: 'weekly', priority: 1.0 },
      { loc: '/about', changefreq: 'monthly', priority: 0.9 },
      { loc: '/contact', changefreq: 'monthly', priority: 0.8 },
      { loc: '/connect', changefreq: 'weekly', priority: 0.9 },
      { loc: '/convene', changefreq: 'weekly', priority: 0.9 },
      { loc: '/collaborate', changefreq: 'weekly', priority: 0.9 },
      { loc: '/contribute', changefreq: 'weekly', priority: 0.9 },
      { loc: '/convey', changefreq: 'weekly', priority: 0.9 },
      { loc: '/auth', changefreq: 'monthly', priority: 0.7 },
      { loc: '/terms-of-service', changefreq: 'yearly', priority: 0.5 },
      { loc: '/privacy-policy', changefreq: 'yearly', priority: 0.5 },
      { loc: '/releases', changefreq: 'weekly', priority: 0.6 },
    ];
    urls.push(...staticPages);

    // Fetch public events (upcoming and recent past - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('slug, updated_at')
      .eq('status', 'published')
      .eq('visibility', 'public')
      .gte('end_time', thirtyDaysAgo.toISOString())
      .order('start_time', { ascending: false })
      .limit(500);

    if (eventsError) {
      console.error('[generate-sitemap] events query failed:', eventsError);
    }

    if (events) {
      for (const event of events) {
        if (event.slug) {
          urls.push({
            loc: `/event/${event.slug}`,
            lastmod: event.updated_at,
            changefreq: 'daily',
            priority: 0.8,
          });
        }
      }
    }

    // Fetch public profiles (users with public visibility and completed profiles)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .eq('visibility', 'public')
      .not('username', 'is', null)
      .not('full_name', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1000);

    if (profilesError) {
      console.error('[generate-sitemap] profiles query failed:', profilesError);
    }

    if (profiles) {
      for (const profile of profiles) {
        if (profile.username) {
          urls.push({
            loc: `/dna/${profile.username}`,
            lastmod: profile.updated_at,
            changefreq: 'weekly',
            priority: 0.7,
          });
        }
      }
    }

    // Fetch public posts. `posts.visibility` does not exist; the real column is
    // `privacy_level`, and the /post/:id route (get_public_post) only resolves
    // rows where privacy_level='public' AND is_deleted is not true — mirror that
    // so the sitemap never lists a URL that 404s.
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, updated_at')
      .eq('privacy_level', 'public')
      .not('is_deleted', 'is', true)
      .order('created_at', { ascending: false })
      .limit(500);

    if (postsError) {
      console.error('[generate-sitemap] posts query failed:', postsError);
    }

    if (posts) {
      for (const post of posts) {
        urls.push({
          loc: `/post/${post.id}`,
          lastmod: post.updated_at,
          changefreq: 'monthly',
          priority: 0.6,
        });
      }
    }

    // Fetch public stories. Convey stories are posts (post_type='story'); there
    // is no `stories` table in the catalog. The public detail route is
    // /dna/story/:slug, resolved by slug, so only stories with a slug are listed.
    const { data: stories, error: storiesError } = await supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('post_type', 'story')
      .eq('privacy_level', 'public')
      .not('is_deleted', 'is', true)
      .not('slug', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (storiesError) {
      console.error('[generate-sitemap] stories query failed:', storiesError);
    }

    if (stories) {
      for (const story of stories) {
        if (story.slug) {
          urls.push({
            loc: `/dna/story/${story.slug}`,
            lastmod: story.updated_at,
            changefreq: 'monthly',
            priority: 0.7,
          });
        }
      }
    }

    // Generate XML
    const xml = generateSitemapXml(urls);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map((url) => {
      let entry = `  <url>\n    <loc>${SITE_URL}${url.loc}</loc>\n`;
      if (url.lastmod) {
        entry += `    <lastmod>${new Date(url.lastmod).toISOString().split('T')[0]}</lastmod>\n`;
      }
      entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
      entry += `    <priority>${url.priority}</priority>\n`;
      entry += `  </url>`;
      return entry;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
