import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';
import { corsHeaders } from '../_shared/cors.ts';

// The one deliberately anonymous entry point (verify_jwt = false in config.toml).
// Do not copy that setting onto any other function.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'https://diasporanetwork.africa';
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const supabaseAdmin = SUPABASE_URL && SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) : null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Starting set; extendable later without touching the check logic.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'throwawaymail.com',
  'yopmail.com',
]);

const IP_RATE_LIMIT_WINDOW_COUNT = 10;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (!forwardedFor) return null;
  return forwardedFor.split(',')[0].trim() || null;
}

async function recordAbuseSignal(
  supabaseAdmin: ReturnType<typeof createClient>,
  signal: {
    signal_type: string;
    action: 'blocked' | 'flagged';
    email_domain: string | null;
    email_hash: string;
    ip_address: string | null;
    event_id: string | null;
  },
) {
  const { error } = await supabaseAdmin.from('signup_abuse_signals').insert({
    source: 'guest_rsvp',
    ...signal,
  });
  if (error) console.error('signup_abuse_signals insert error:', error);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!supabaseAdmin) {
    return json({ error: 'Service not configured' }, 500);
  }

  try {
    const { event_id, email: rawEmail } = await req.json();
    const email = (rawEmail || '').trim().toLowerCase();

    if (!event_id || typeof event_id !== 'string') {
      return json({ error: 'event_id is required' }, 400);
    }
    if (!email || !EMAIL_RE.test(email)) {
      return json({ error: 'A valid email is required' }, 400);
    }

    const emailDomain = email.split('@')[1] || null;
    const emailHash = await sha256Hex(email);
    const clientIp = getClientIp(req);

    if (emailDomain && DISPOSABLE_DOMAINS.has(emailDomain)) {
      await recordAbuseSignal(supabaseAdmin, {
        signal_type: 'disposable_domain',
        action: 'blocked',
        email_domain: emailDomain,
        email_hash: emailHash,
        ip_address: clientIp,
        event_id,
      });
      return json({ error: 'Please use a non-disposable email address' }, 400);
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    if (clientIp) {
      const { count: recentIpRegCount, error: ipRateLimitError } = await supabaseAdmin
        .from('event_guest_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', clientIp)
        .gte('created_at', oneHourAgo);

      if (ipRateLimitError) throw ipRateLimitError;
      if ((recentIpRegCount || 0) >= IP_RATE_LIMIT_WINDOW_COUNT) {
        // Deliberately not a hard block: one IP can legitimately represent
        // many real people (e.g. shared wifi at an event). Flag for
        // visibility and let the registration proceed.
        await recordAbuseSignal(supabaseAdmin, {
          signal_type: 'ip_rate_pattern',
          action: 'flagged',
          email_domain: emailDomain,
          email_hash: emailHash,
          ip_address: clientIp,
          event_id,
        });
      }
    }

    const { count: recentRequestCount, error: rateLimitError } = await supabaseAdmin
      .from('event_guest_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', oneHourAgo);

    if (rateLimitError) throw rateLimitError;
    if ((recentRequestCount || 0) >= 5) {
      return json({ error: 'Too many requests. Please try again later.' }, 429);
    }

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, slug, title')
      .eq('id', event_id)
      .maybeSingle();

    if (eventError) throw eventError;
    if (!event) {
      return json({ error: 'Event not found' }, 404);
    }

    // A retry/refresh from the same guest for the same event reuses the
    // existing registration and resends the link, rather than piling up
    // duplicate event_attendees rows (no unique constraint stops that,
    // since the partial index only guards non-null user_id).
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('event_guest_registrations')
      .select('magic_link_token, attendee_id, event_attendees!inner(event_id)')
      .eq('email', email)
      .eq('event_attendees.event_id', event_id)
      .maybeSingle();

    if (existingError) throw existingError;

    let magicLinkToken = existing?.magic_link_token as string | undefined;

    if (!magicLinkToken) {
      const { data: attendee, error: attendeeError } = await supabaseAdmin
        .from('event_attendees')
        .insert({
          event_id,
          user_id: null,
          guest_name: null,
          status: 'going',
          source: 'guest',
        })
        .select('id')
        .single();

      if (attendeeError) throw attendeeError;

      const { data: registration, error: registrationError } = await supabaseAdmin
        .from('event_guest_registrations')
        .insert({ attendee_id: attendee.id, email, ip_address: clientIp })
        .select('magic_link_token')
        .single();

      if (registrationError) throw registrationError;
      magicLinkToken = registration.magic_link_token;
    }

    const guestLink = `${APP_URL}/event/${event.slug || event.id}?guest_token=${magicLinkToken}`;

    await resend.emails.send({
      from: 'DNA Events <noreply@diasporanetwork.africa>',
      to: [email],
      subject: `You're going to ${event.title}`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 32px;">
            <h1 style="color: #065f46; margin: 0 0 16px 0; font-size: 20px;">You're in.</h1>
            <p style="color: #374151; line-height: 1.6; margin: 0 0 24px 0;">
              Your spot for <strong>${event.title}</strong> is confirmed. Use the link below to view your event details.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${guestLink}"
                 style="background: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                View your event
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; margin: 32px 0 0 0;">
              This link is unique to you. If you didn't request it, you can ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return json({ success: true });
  } catch (error) {
    console.error('guest-rsvp error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 500);
  }
});
