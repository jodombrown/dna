import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.9";
import webpush from "npm:web-push@3.6.7";
import { requireInternal, requireUser } from "../_shared/auth.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  action?: 'register' | 'send';
  user_id: string;
  title?: string;
  message?: string;
  type?: string;
  action_url?: string;
  actor_avatar_url?: string;
  tag?: string;
  notification_id?: string;
  // For registration
  endpoint?: string;
  subscription_data?: unknown;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: PushNotificationRequest = await req.json();

    // Registration is user-initiated (called from the browser with a user JWT).
    if (data.action === 'register') {
      const authed = await requireUser(req);
      if (!authed.ok) return authed.response;
      // Ensure users can only register subscriptions for themselves.
      if (data.user_id !== authed.userId) {
        return new Response(
          JSON.stringify({ error: "Forbidden" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // Sending is triggered by an ordinary user's own session pushing a
      // notification to a *different* user — e.g. messageService.ts fires
      // this when a message is sent, targeting the recipient, not the
      // sender — the same recipient-not-caller shape as
      // send-notification-email. This branch previously required
      // requireInternal() (service-role key or CRON_SECRET), which the
      // browser never has, so every real "send" caller
      // (messageService.ts, notificationSystemService.ts) was rejected
      // outright. Accept either an authenticated user or a genuine
      // internal/cron caller.
      const authed = await requireUser(req);
      if (!authed.ok) {
        const internal = requireInternal(req);
        if (!internal.ok) return authed.response;
      }
    }

    
    // Handle subscription registration
    if (data.action === 'register' && data.endpoint && data.subscription_data) {
      console.log("Registering push subscription for user:", data.user_id);
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: data.user_id,
          endpoint: data.endpoint,
          subscription_data: data.subscription_data,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,endpoint',
        });

      if (error) {
        console.error("Error storing subscription:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, action: 'registered' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Handle sending push notification
    console.log("Sending push notification to user:", data.user_id);

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', data.user_id)
      .eq('is_active', true);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ success: false, error: subError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No active push subscriptions for user");
      return new Response(
        JSON.stringify({ success: false, reason: "no_subscriptions" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check user preferences for push notifications
    const { data: preferences } = await supabase
      .from('dia_preferences')
      .select('in_app_enabled')
      .eq('user_id', data.user_id)
      .single();

    if (preferences && preferences.in_app_enabled === false) {
      console.log("Push notifications disabled for user");
      return new Response(
        JSON.stringify({ success: false, reason: "push_disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload = JSON.stringify({
      title: data.title || 'DNA Notification',
      message: data.message,
      body: data.message,
      type: data.type,
      action_url: data.action_url,
      actor_avatar_url: data.actor_avatar_url,
      tag: data.tag || `dna-${data.type}-${Date.now()}`,
      notification_id: data.notification_id,
    });

    let successCount = 0;
    const failedSubscriptionIds: string[] = [];

    // Get VAPID keys for proper web push signing
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:notifications@diasporanetwork.africa";

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("VAPID keys not configured - push notifications may not work");
    } else {
      // The previous implementation never actually signed anything: it sent
      // the plaintext payload as the request body and attached a
      // `Crypto-Key: p256ecdsa=...` header with no VAPID JWT and no Web Push
      // payload encryption (aes128gcm). Every push service (Chrome/FCM,
      // Mozilla autopush, etc.) requires both per RFC 8291/8292 and rejects
      // anything else — so push notifications never actually reached a
      // device regardless of auth. web-push implements both correctly.
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    }

    // Send to all subscriptions
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = subscription.subscription_data as {
          endpoint: string;
          keys?: { p256dh: string; auth: string };
        };

        if (!pushSubscription.endpoint || !pushSubscription.keys?.p256dh || !pushSubscription.keys?.auth) {
          failedSubscriptionIds.push(subscription.id);
          continue;
        }

        if (!vapidPublicKey || !vapidPrivateKey) {
          // Config problem, not a bad subscription — don't deactivate it.
          console.warn(`Skipping push to ${subscription.id}: VAPID keys not configured`);
          continue;
        }

        await webpush.sendNotification(
          { endpoint: pushSubscription.endpoint, keys: pushSubscription.keys },
          payload,
          { TTL: 86400 }
        );
        successCount++;
        console.log(`Push sent successfully to endpoint`);
      } catch (pushError) {
        const statusCode = (pushError as { statusCode?: number })?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          // Subscription expired or invalid
          failedSubscriptionIds.push(subscription.id);
          console.log(`Subscription expired: ${subscription.id}`);
        } else {
          console.error("Error sending to subscription:", pushError);
        }
      }
    }

    // Clean up invalid subscriptions
    if (failedSubscriptionIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .in('id', failedSubscriptionIds);
    }

    console.log(`Push notifications sent: ${successCount}/${subscriptions.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        total: subscriptions.length,
        cleaned: failedSubscriptionIds.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in push notification handler:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
