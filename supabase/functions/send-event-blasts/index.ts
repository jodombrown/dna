import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Blast = {
  id: string;
  event_id: string;
  subject: string;
  body_markdown: string;
  segment: any;
  scheduled_for: string | null;
  sent_at: string | null;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  const resendKey = Deno.env.get('RESEND_API_KEY') || '';
  const fromEmail = Deno.env.get('EMAIL_FROM') || '';
  if (!resendKey || !fromEmail) {
    return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY or EMAIL_FROM' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
  const resend = new Resend(resendKey);

  try {
    const { eventId } = await req.json().catch(() => ({ eventId: null }));

    let blasts: Blast[] = [];
    const nowIso = new Date().toISOString();

    if (eventId) {
      const { data, error } = await supabase
        .from('event_blasts')
        .select('id, event_id, subject, body_markdown, segment, scheduled_for, sent_at')
        .eq('event_id', eventId)
        .is('sent_at', null)
        .or(`scheduled_for.is.null,scheduled_for.lte.${nowIso}`);
      if (error) throw error;
      blasts = data as Blast[];
    } else {
      const { data, error } = await supabase
        .from('event_blasts')
        .select('id, event_id, subject, body_markdown, segment, scheduled_for, sent_at')
        .is('sent_at', null)
        .lte('scheduled_for', nowIso);
      if (error) throw error;
      blasts = data as Blast[];
    }

    const results: any[] = [];

    for (const blast of blasts) {
      const seg = (blast.segment || {}) as { type?: string; status?: string };
      const segType = (seg.type ?? seg.status ?? 'all') as string;

      // Collect recipient user IDs based on segment
      let userIds: string[] = [];

      if (segType === 'waitlist') {
        const { data: wl, error: wlErr } = await supabase
          .from('event_waitlist')
          .select('user_id')
          .eq('event_id', blast.event_id);
        if (wlErr) throw wlErr;
        userIds = Array.from(new Set((wl || []).map((w: any) => w.user_id)));
      } else {
        const statuses = segType === 'all' ? ['going', 'pending']
          : segType === 'confirmed' ? ['going']
          : [segType];
        const { data: regsList, error: regsListErr } = await supabase
          .from('event_registrations')
          .select('user_id, status')
          .eq('event_id', blast.event_id)
          .in('status', statuses);
        if (regsListErr) throw regsListErr;
        userIds = Array.from(new Set(((regsList || []) as any[]).map(r => r.user_id)));
      }

      let emails: string[] = [];
      if (userIds.length) {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
        if (pErr) throw pErr;
        emails = (profiles || []).map((p: any) => p.email).filter((e: string) => !!e);
      }

      const isHtml = (blast.body_markdown || '').trim().startsWith('<');
      const bodyHtml = isHtml ? (blast.body_markdown || '') : mdToHtml(blast.body_markdown || '');
      const html = `<div style="font-family:Inter,system-ui,sans-serif;line-height:1.6;">
        <h2>${escapeHtml(blast.subject)}</h2>
        <div>${bodyHtml}</div>
      </div>`;

      const sendResults: any[] = [];
      for (const to of emails) {
        try {
          const res = await resend.emails.send({ from: fromEmail, to: [to], subject: blast.subject, html });
          sendResults.push({ to, id: (res as any).id || null });
        } catch (e) {
          console.error('send error', e);
          sendResults.push({ to, error: String(e) });
        }
      }

      // Mark blast sent
      const { error: updErr } = await supabase
        .from('event_blasts')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', blast.id);
      if (updErr) console.error('update blast sent err', updErr);

      results.push({ blastId: blast.id, recipients: emails.length, sendResults });
    }

    return new Response(JSON.stringify({ processed: blasts.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (e) {
    console.error('send-event-blasts error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function mdToHtml(md: string) {
  // Minimal conversion: escape HTML then convert newlines to <br/>
  return (md || '').split('\n').map(l => escapeHtml(l)).join('<br/>');
}
