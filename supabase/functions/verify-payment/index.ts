import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Supabase client for optional analytics/context
    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Optionally fetch event context from Supabase using metadata.event_id
    let event_title: string | null = null;
    let event_slug: string | null = null;
    const eventId = (session.metadata?.event_id as string) || null;
    try {
      if (eventId) {
        const { data } = await supa
          .from("events")
          .select("title, slug")
          .eq("id", eventId)
          .maybeSingle();
        if (data) {
          event_title = (data as any).title ?? null;
          event_slug = (data as any).slug ?? null;
        }
      }
    } catch (_e) {
      // Non-fatal: event context is helpful but optional
    }

    if (session.payment_status === 'paid') {
      try {
        if (eventId) {
          await supa.from('event_analytics').insert({
            event_id: eventId,
            kind: 'payment_success',
            payload: { session_id: session.id, amount_total: session.amount_total, currency: session.currency }
          });
        }
      } catch (_) {}
      return new Response(JSON.stringify({ 
        success: true, 
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        session_id: session.id,
        event_title,
        event_slug,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    try {
      if (eventId) {
        await supa.from('event_analytics').insert({
          event_id: eventId,
          kind: 'payment_failed',
          payload: { session_id: session.id, amount_total: session.amount_total, currency: session.currency, status: session.payment_status }
        });
      }
    } catch (_) {}

    return new Response(JSON.stringify({ 
      success: false, 
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      session_id: session.id,
      event_title,
      event_slug,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});