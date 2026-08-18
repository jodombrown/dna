import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@2.0.0";
import { requireAdmin, escapeHtml } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BetaInviteRequest {
  waitlistId: string;
  email: string;
  fullName: string | null;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    // This is invoked from the admin's own browser session (WaitlistManagement.tsx),
    // not server-to-server, so it needs an admin JWT check, not requireInternal
    // (which only accepts the service-role key or CRON_SECRET and would 401 every
    // real call from the client).
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const { waitlistId, email, fullName }: BetaInviteRequest = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'email is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    // Generate the code server-side, atomically with the invites row.
    const code = crypto.randomUUID().replace(/-/g, '').slice(0, 16);

    const { error: insertErr } = await supabase.from('invites').insert({
      email,
      code,
      role: 'beta',
      created_by: auth.userId,
    });
    if (insertErr) throw insertErr;

    const signupUrl = `https://diasporanetwork.africa/invite?ref=${code}`;
    const greetingName = fullName || 'there';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're invited to the DNA beta</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin:0; padding:0; background-color:#f8fafc;">
        <div style="max-width:600px; margin:0 auto; background-color:#ffffff; padding:32px;">
          <h1 style="font-size:20px;">Hey ${escapeHtml(greetingName)},</h1>
          <p>Your access to the DNA beta is ready. Beta runs August 15 to October 15, 2026.</p>
          <p style="margin:24px 0;">
            <a href="${signupUrl}" style="background-color:#2D6A4F; color:#ffffff; padding:12px 24px; border-radius:6px; text-decoration:none;">
              Join the beta
            </a>
          </p>
          <p style="font-size:12px; color:#64748b;">This invite expires in 7 days.</p>
        </div>
      </body>
      </html>`;

    const emailResponse = await resend.emails.send({
      from: "DNA Beta <beta@diasporanetwork.africa>",
      to: [email],
      subject: "You're invited to the DNA beta",
      html,
    });

    console.log("Beta invite email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, code }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (e) {
    console.error('send-beta-invite-email error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
