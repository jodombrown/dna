// Nightly inbox digest. Sends one email to each user with unread messages
// who has not been seen in the last 24h and has email_digest=true.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { requireInternal, escapeHtml } from "../_shared/auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const __auth = requireInternal(req);
  if (!__auth.ok) return __auth.response;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Pull users with unread + opted-in + stale presence. Capped: the RPC
    // has no LIMIT of its own, and this ran as a fully sequential
    // one-at-a-time loop with no cap — on a large user base that's an
    // unbounded number of sequential network round-trips, risking the
    // function's execution timeout every night it runs.
    const BATCH_LIMIT = 500;
    const CONCURRENCY = 10;

    const { data: candidates, error } = await supabase
      .rpc("get_email_digest_recipients")
      .limit(BATCH_LIMIT);
    if (error) throw error;

    type Recipient = {
      user_id: string;
      email: string;
      full_name: string | null;
      unread_total: number;
      conversation_count: number;
    };

    const sendOne = async (row: Recipient): Promise<boolean> => {
      try {
        // This previously called send-universal-email with a
        // { type, data: { to, subject, html } } body, but that function
        // only understands { formType, formData } and switches on
        // formType — it has no "user_notification" case, so every call
        // threw "Unknown form type: undefined" and was swallowed by this
        // try/catch. The digest has been silently failing 100% of sends.
        // This already builds its own complete HTML, so send it directly.
        const { error: sendErr } = await resend.emails.send({
          from: "DNA Platform <notifications@diasporanetwork.africa>",
          to: [row.email],
          subject: `You have ${row.unread_total} unread message${row.unread_total === 1 ? "" : "s"} on DNA`,
          html: `
            <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#F9F7F4;color:#1A1A1A">
              <h1 style="font-family:Lora,serif;font-size:22px;margin:0 0 12px">Hi ${escapeHtml(row.full_name || "there")},</h1>
              <p style="font-size:15px;line-height:1.5">You have <strong>${row.unread_total} unread message${row.unread_total === 1 ? "" : "s"}</strong> across ${row.conversation_count} conversation${row.conversation_count === 1 ? "" : "s"} waiting for you.</p>
              <p style="margin:24px 0">
                <a href="https://diasporanetwork.africa/dna/messages" style="background:#4A8D77;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:600">Open inbox</a>
              </p>
              <p style="font-size:12px;color:#666;margin-top:32px">You can turn off these digests in Messages settings.</p>
            </div>`,
        });
        if (sendErr) throw sendErr;
        return true;
      } catch (e) {
        console.error("digest send failed for", row.user_id, e);
        return false;
      }
    };

    const recipients = (candidates || []) as Recipient[];
    let sent = 0;
    for (let i = 0; i < recipients.length; i += CONCURRENCY) {
      const chunk = recipients.slice(i, i + CONCURRENCY);
      const results = await Promise.all(chunk.map(sendOne));
      sent += results.filter(Boolean).length;
    }

    return new Response(JSON.stringify({ ok: true, candidates: recipients.length, sent }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
