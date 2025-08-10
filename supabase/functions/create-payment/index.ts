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
    const { ticketTypeId, eventId } = await req.json();

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user and profile_id
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Map auth user -> profiles.id (fallback to user.id if profile missing)
    const { data: profileRow } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    const profile_id = profileRow?.id ?? user.id;

    // Get ticket type details
    const { data: ticketType, error: ticketError } = await supabaseClient
      .from('event_ticket_types')
      .select('*')
      .eq('id', ticketTypeId)
      .single();

    if (ticketError || !ticketType) {
      throw new Error('Ticket type not found');
    }

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // Validate business rules before creating checkout session
    const now = new Date();
    if (ticketType.hidden) {
      throw new Error('This ticket type is not available');
    }
    if (ticketType.payment_type && !['paid', 'flex'].includes(ticketType.payment_type)) {
      throw new Error('This ticket type does not require payment');
    }
    if (ticketType.sales_start && new Date(ticketType.sales_start) > now) {
      throw new Error('Ticket sales have not started yet');
    }
    if (ticketType.sales_end && new Date(ticketType.sales_end) < now) {
      throw new Error('Ticket sales have ended');
    }
    if (event.date_time && new Date(event.date_time) < now) {
      throw new Error('Event has already occurred');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `${event.title} - ${ticketType.name}`,
              description: ticketType.description || undefined,
            },
            unit_amount: ticketType.price_cents || 0,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${Deno.env.get("APP_URL")}/events/${eventId}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("APP_URL")}/events/${eventId}`,
      metadata: {
        event_id: eventId,
        ticket_type_id: ticketTypeId,
        profile_id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});