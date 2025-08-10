import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Webhook: JWT verification disabled via config.toml
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  if (!endpointSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new Response("Missing webhook secret", { status: 500, headers: corsHeaders });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing signature", { status: 400, headers: corsHeaders });
  }

  let event: Stripe.Event;
  const body = await req.text();
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400, headers: corsHeaders });
  }

  // Service-role client for trusted writes
  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Idempotency: if already linked, exit
        const { data: existing, error: queryErr } = await supabaseService
          .from("event_registrations")
          .select("id")
          .eq("stripe_session_id", session.id)
          .maybeSingle();
        if (queryErr) console.error("Lookup error:", queryErr);
        if (existing) {
          return new Response("ok", { status: 200, headers: corsHeaders });
        }

        const eventId = session.metadata?.event_id as string | undefined;
        const ticketTypeId = session.metadata?.ticket_type_id as string | undefined;
        const profileId = session.metadata?.profile_id as string | undefined;
        if (!eventId || !profileId) {
          console.error("Missing metadata", session.metadata);
          return new Response("Missing metadata", { status: 400, headers: corsHeaders });
        }

        // Enforce business rules via RPC (capacity/waitlist)
        // Existing rpc_event_register registers user for event; then we attach payment info
        let regId: string | null = null;

        try {
          await supabaseService.rpc("rpc_event_register", { p_event: eventId });
        } catch (e) {
          console.error("rpc_event_register error:", e);
          // Proceed to attach payment data to latest row if it exists; otherwise just return OK
        }

        // Find latest registration for this user/event
        const { data: regRow } = await supabaseService
          .from("event_registrations")
          .select("id")
          .eq("event_id", eventId)
          .eq("user_id", profileId)
          .order("registered_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        regId = regRow?.id ?? null;

        if (regId) {
          const { error: updErr } = await supabaseService
            .from("event_registrations")
            .update({
              ticket_type_id: ticketTypeId ?? null,
              price_paid_cents: session.amount_total ?? null,
              currency: session.currency ?? null,
              stripe_session_id: session.id,
              stripe_payment_intent_id: (session.payment_intent as string) ?? null,
            })
            .eq("id", regId);
          if (updErr) console.error("Update registration error:", updErr);
        } else {
          // As a fallback, create a minimal row (trusted key bypasses RLS)
          const { error: insErr } = await supabaseService.from("event_registrations").insert({
            event_id: eventId,
            user_id: profileId,
            ticket_type_id: ticketTypeId ?? null,
            price_paid_cents: session.amount_total ?? null,
            currency: session.currency ?? null,
            status: "going",
            stripe_session_id: session.id,
            stripe_payment_intent_id: (session.payment_intent as string) ?? null,
          });
          if (insErr) console.error("Insert fallback error:", insErr);
        }

        break;
      }
      // You may handle async success events here if you enable 3DS/etc.
      default:
        // No-op for other events
        break;
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Webhook error", { status: 500, headers: corsHeaders });
  }
});
