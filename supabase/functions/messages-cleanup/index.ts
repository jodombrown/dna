// supabase/functions/messages-cleanup/index.ts
//
// Phase 10 - Disappearing messages cleanup.
//
// Deletes messages whose parent conversation has a non-null `disappearing_seconds`
// value, where the message's `created_at` plus that interval has elapsed.
//
// Intended to be invoked on a cron schedule. Returns a JSON summary.

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { requireInternal } from '../_shared/auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const __auth = requireInternal(req);
  if (!__auth.ok) return __auth.response;

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing service env' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(url, serviceKey);

  // Pull eligible conversations with a duration set. Capped and processed
  // in concurrent batches below: an unbounded fetch plus a fully
  // sequential per-conversation delete will exceed the edge function
  // execution timeout once the number of disappearing-message
  // conversations grows large. Each delete targets a distinct
  // conversation's rows, so running them concurrently is safe.
  const BATCH_LIMIT = 2000;
  const CONCURRENCY = 20;

  const { data: convos, error: cErr } = await admin
    .from('conversations')
    .select('id, disappearing_seconds')
    .not('disappearing_seconds', 'is', null)
    .order('id')
    .limit(BATCH_LIMIT);

  if (cErr) {
    return new Response(JSON.stringify({ error: cErr.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let totalDeleted = 0;

  const deleteExpiredFor = async (c: { id: string; disappearing_seconds: number | null }): Promise<number> => {
    const seconds = c.disappearing_seconds as number;
    if (!seconds || seconds <= 0) return 0;
    const cutoff = new Date(Date.now() - seconds * 1000).toISOString();
    const { error: dErr, count } = await admin
      .from('messages')
      .delete({ count: 'exact' })
      .eq('conversation_id', c.id)
      .lt('created_at', cutoff);
    return !dErr && typeof count === 'number' ? count : 0;
  };

  const eligible = (convos ?? []) as { id: string; disappearing_seconds: number | null }[];
  for (let i = 0; i < eligible.length; i += CONCURRENCY) {
    const chunk = eligible.slice(i, i + CONCURRENCY);
    const counts = await Promise.all(chunk.map(deleteExpiredFor));
    totalDeleted += counts.reduce((sum, n) => sum + n, 0);
  }

  return new Response(
    JSON.stringify({ ok: true, deleted: totalDeleted, conversations: convos?.length ?? 0 }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
