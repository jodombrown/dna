
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendNewsletterRequest {
  newsletterId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { newsletterId }: SendNewsletterRequest = await req.json();

    // Get newsletter details
    const { data: newsletter, error: newsletterError } = await supabaseClient
      .from("newsletters")
      .select("*")
      .eq("id", newsletterId)
      .eq("is_published", true)
      .single();

    if (newsletterError || !newsletter) {
      throw new Error("Newsletter not found or not published");
    }

    // Get author details
    const { data: author } = await supabaseClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", newsletter.created_by)
      .single();

    // Get followers who opted in for newsletter emails
    const { data: followers, error: followersError } = await supabaseClient
      .rpc("get_newsletter_followers", { newsletter_user_id: newsletter.created_by });

    if (followersError) {
      throw new Error("Failed to get followers");
    }

    if (!followers || followers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No followers with email opt-in found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send emails to followers
    const emailPromises = followers.map(async (follower: any) => {
      try {
        const emailResponse = await resend.emails.send({
          from: "DNA Newsletter <noreply@dnanetwork.com>",
          to: [follower.email],
          subject: `New from ${author?.full_name || "DNA"} on DNA`,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <header style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">DNA Newsletter</h1>
              </header>
              
              <main style="padding: 20px; background: #f9f9f9;">
                <h2 style="color: #1f2937; margin-bottom: 16px;">${newsletter.title}</h2>
                
                ${newsletter.summary ? `<p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">${newsletter.summary}</p>` : ''}
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  ${newsletter.content.substring(0, 300)}${newsletter.content.length > 300 ? '...' : ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://your-domain.com/newsletters/${newsletter.id}" 
                     style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Read Full Newsletter
                  </a>
                </div>
              </main>
              
              <footer style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>You received this because you follow ${author?.full_name || "this author"} on DNA.</p>
                <p>To unsubscribe from newsletters, update your preferences in your DNA profile.</p>
              </footer>
            </div>
          `,
        });

        // Record delivery
        await supabaseClient.from("newsletter_deliveries").insert({
          newsletter_id: newsletterId,
          recipient_id: follower.user_id,
          status: "sent",
        });

        return { success: true, recipient: follower.email };
      } catch (error) {
        console.error(`Failed to send to ${follower.email}:`, error);
        
        // Record failed delivery
        await supabaseClient.from("newsletter_deliveries").insert({
          newsletter_id: newsletterId,
          recipient_id: follower.user_id,
          status: "failed",
        });

        return { success: false, recipient: follower.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    // Update newsletter with email sent info
    await supabaseClient
      .from("newsletters")
      .update({
        email_sent_at: new Date().toISOString(),
        email_recipient_count: successCount,
      })
      .eq("id", newsletterId);

    return new Response(
      JSON.stringify({
        message: "Newsletter emails sent",
        sent: successCount,
        total: followers.length,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
