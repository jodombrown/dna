// Server-side image compression via TinyPNG.
// Accepts binary image body; returns compressed image bytes.
// Falls back to original bytes if TinyPNG is unavailable.

import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Every call proxies to TinyPNG's paid API, billed against our own key.
// `verify_jwt = true` in config.toml only requires *some* signed JWT, and
// the public (non-secret) anon key satisfies that — it gates nothing.
// Require a real user session instead.
const MAX_BODY_BYTES = 15 * 1024 * 1024; // 15MB — generous for a single image upload

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const __auth = await requireUser(req);
  if (!__auth.ok) return __auth.response;

  const contentLength = Number(req.headers.get('content-length') || '0');
  if (contentLength > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ error: 'Image too large' }), {
      status: 413,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('TINIFY_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'TINIFY_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const contentType = req.headers.get('content-type') || 'image/jpeg';
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(contentType)) {
    return new Response(JSON.stringify({ error: 'Unsupported content-type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const inputBytes = new Uint8Array(await req.arrayBuffer());
  if (inputBytes.byteLength === 0) {
    return new Response(JSON.stringify({ error: 'Empty body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Step 1: shrink (POST returns a Location header to the compressed image)
    const shrink = await fetch('https://api.tinify.com/shrink', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
        'Content-Type': contentType,
      },
      body: inputBytes,
    });

    if (!shrink.ok) {
      const errText = await shrink.text();
      return new Response(
        JSON.stringify({ error: 'TinyPNG error', status: shrink.status, detail: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const location = shrink.headers.get('location');
    const outType = shrink.headers.get('content-type') || contentType;

    let outBytes: ArrayBuffer;
    if (location) {
      const dl = await fetch(location, {
        headers: { Authorization: `Basic ${btoa(`api:${apiKey}`)}` },
      });
      if (!dl.ok) {
        return new Response(JSON.stringify({ error: 'TinyPNG download failed' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      outBytes = await dl.arrayBuffer();
    } else {
      outBytes = await shrink.arrayBuffer();
    }

    return new Response(outBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': outType,
        'X-Original-Size': String(inputBytes.byteLength),
        'X-Compressed-Size': String(outBytes.byteLength),
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Compression failed', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
