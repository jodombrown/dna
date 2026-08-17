import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.9";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const APP_URL = Deno.env.get("APP_URL") ?? "https://diasporanetwork.africa";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseAdmin =
  SUPABASE_URL && SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

interface GrantRequest {
  waitlistId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!supabaseAdmin) return json({ error: "Service not configured" }, 500);

    // Admin-only.
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Unauthorized" }, 401);

    const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userRes?.user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin, error: roleErr } = await supabaseAdmin.rpc("has_role", {
      _user_id: userRes.user.id,
      _role: "admin",
    });
    if (roleErr) {
      console.error("Role check failed:", roleErr);
      return json({ error: "Role check failed" }, 500);
    }
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const { waitlistId }: GrantRequest = await req.json();
    if (!waitlistId) return json({ error: "waitlistId is required" }, 400);

    const { data: entry, error: entryErr } = await supabaseAdmin
      .from("beta_waitlist")
      .select("id, email, full_name, status, archived_at")
      .eq("id", waitlistId)
      .maybeSingle();

    if (entryErr) {
      console.error("Waitlist lookup failed:", entryErr);
      return json({ error: "Waitlist lookup failed" }, 500);
    }
    if (!entry) return json({ error: "Waitlist entry not found" }, 404);
    if (entry.archived_at) return json({ error: "Entry is archived" }, 409);
    if (entry.status !== "approved") {
      return json({ error: "Entry is not approved" }, 409);
    }

    const redirectTo = `${APP_URL}/onboarding/reset-password-complete`;

    // Invite creates the account on first use. If the account already exists
    // the invite fails, so fall back to a plain magic link so a re-send never
    // dies on "user already registered".
    let actionLink: string | null = null;

    const invite = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email: entry.email,
      options: { redirectTo },
    });

    if (invite.error) {
      const magic = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: entry.email,
        options: { redirectTo },
      });
      if (magic.error) {
        console.error("Link generation failed:", invite.error, magic.error);
        return json({ error: "Could not generate a sign-in link", details: magic.error.message }, 500);
      }
      actionLink = magic.data.properties?.action_link ?? null;
    } else {
      actionLink = invite.data.properties?.action_link ?? null;
    }

    if (!actionLink) return json({ error: "Could not generate a sign-in link" }, 500);

    const firstName = (entry.full_name || "").trim().split(/\s+/)[0] || "there";

    const { error: emailError } = await resend.emails.send({
      from: "DNA <hello@diasporanetwork.africa>",
      to: [entry.email],
      subject: "Your DNA beta access is open",
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #1c1917; line-height: 1.6;">
          <p>Hi ${firstName},</p>
          <p>Your beta access to Diaspora Network of Africa is open. Beta runs August 15 to October 15, 2026.</p>
          <p>
            <a href="${actionLink}"
               style="display:inline-block;background:#2D6A4F;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;">
              Set your password and sign in
            </a>
          </p>
          <p style="color:#57534e;font-size:14px;">
            This link is single use and expires. If it stops working, reply and we will send a new one.
          </p>
          <p>See you inside.<br />The DNA team</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend send failed:", emailError);
      return json({ error: "Could not send the access email", details: String(emailError) }, 502);
    }

    const nowIso = new Date().toISOString();
    const { error: stampErr } = await supabaseAdmin
      .from("beta_waitlist")
      .update({
        last_invite_sent_at: nowIso,
        last_invite_sent_by: userRes.user.id,
        updated_at: nowIso,
      })
      .eq("id", waitlistId);

    if (stampErr) console.error("Could not stamp invite send:", stampErr);

    const { error: auditErr } = await supabaseAdmin.from("admin_activity_log").insert({
      admin_id: userRes.user.id,
      action: "waitlist_access_email_sent",
      entity_type: "waitlist",
      entity_id: waitlistId,
      details: { email: entry.email, redirect_to: redirectTo },
    });
    if (auditErr) console.error("Could not write audit entry:", auditErr);

    return json({ success: true, sentAt: nowIso }, 200);
  } catch (error: unknown) {
    console.error("send-beta-access-granted failed:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return json({ error: message }, 500);
  }
};

serve(handler);
