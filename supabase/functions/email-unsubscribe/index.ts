import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * DNA Email Unsubscribe Handler
 * 
 * Supports one-click unsubscribe via token (CAN-SPAM/GDPR compliant)
 * GET: Returns HTML page confirming unsubscribe
 * POST: Processes unsubscribe for specific notification types
 */

const generateHtmlPage = (title: string, message: string, success: boolean) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - DNA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .icon {
      font-size: 48px;
      margin-bottom: 24px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin-bottom: 16px;
    }
    p {
      color: #71717a;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
      color: white;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .btn:hover { transform: translateY(-2px); }
    .logo {
      margin-top: 32px;
      color: #a1a1aa;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✅' : '❌'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://diasporanetwork.africa/dna/settings/notifications" class="btn">
      Manage Preferences
    </a>
    <div class="logo">
      <p>Diaspora Network of Africa</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const type = url.searchParams.get("type") || "all"; // all, connections, reactions, comments, messages, mentions, events, stories

    if (!token) {
      console.log("Missing unsubscribe token");
      return new Response(
        generateHtmlPage("Invalid Link", "This unsubscribe link is invalid or has expired.", false),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by unsubscribe token
    const { data: prefs, error: findError } = await supabase
      .from("adin_preferences")
      .select("id, user_id, email_enabled")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !prefs) {
      console.log("Invalid token:", findError);
      return new Response(
        generateHtmlPage("Invalid Link", "This unsubscribe link is invalid or has expired.", false),
        { status: 404, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    console.log(`Unsubscribe request: user=${prefs.user_id}, type=${type}`);

    // Build update based on type
    let updateData: Record<string, boolean> = {};
    let successMessage = "";

    if (type === "all") {
      updateData = { email_enabled: false };
      successMessage = "You have been unsubscribed from all DNA email notifications.";
    } else {
      // Map type to column name
      const columnMap: Record<string, string> = {
        connections: "email_connections",
        reactions: "email_reactions",
        comments: "email_comments",
        messages: "email_messages",
        mentions: "email_mentions",
        events: "email_events",
        stories: "email_stories",
      };

      const column = columnMap[type];
      if (column) {
        updateData = { [column]: false };
        successMessage = `You have been unsubscribed from ${type} notifications.`;
      } else {
        updateData = { email_enabled: false };
        successMessage = "You have been unsubscribed from all DNA email notifications.";
      }
    }

    // Update preferences
    const { error: updateError } = await supabase
      .from("adin_preferences")
      .update(updateData)
      .eq("id", prefs.id);

    if (updateError) {
      console.error("Error updating preferences:", updateError);
      return new Response(
        generateHtmlPage("Error", "Something went wrong. Please try again or manage preferences in your settings.", false),
        { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    console.log(`Successfully unsubscribed user ${prefs.user_id} from ${type}`);

    return new Response(
      generateHtmlPage("Unsubscribed", successMessage + " You can re-enable notifications anytime in your settings.", true),
      { status: 200, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return new Response(
      generateHtmlPage("Error", "Something went wrong. Please try again.", false),
      { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );
  }
};

serve(handler);
