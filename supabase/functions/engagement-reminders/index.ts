import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderData {
  reminder_id: string;
  user_id: string;
  user_email: string;
  reminder_type: string;
  cohort: string;
  metadata: any;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Ubuntu-inspired messaging templates
const getReminderContent = (reminderType: string, cohort: string, metadata: any) => {
  const userName = metadata.user_name || 'DNA Family Member';
  const userType = metadata.user_type || 'member';
  const daysOnboarded = metadata.days_since_onboarding || 0;
  
  const baseUrl = Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '') || 'https://dna-platform.com';
  const unsubscribeUrl = `${baseUrl}/unsubscribe`;
  const dashboardUrl = `${baseUrl}/app`;
  
  let subject = '';
  let greeting = '';
  let mainMessage = '';
  let cta = '';
  let ubuntu_touch = '';
  
  // Ubuntu opening with cultural authenticity
  const ubuntuOpenings = [
    'Asé, your presence is missed in the DNA village',
    'Ubuntu reminds us that we are because we are together',
    'The ancestors whisper - your voice matters in our circle',
    'Sawubona, the DNA community awaits your wisdom'
  ];
  
  ubuntu_touch = ubuntuOpenings[Math.floor(Math.random() * ubuntuOpenings.length)];
  
  switch (reminderType) {
    case '3_day':
      subject = `${userName}, your DNA journey awaits - Welcome back! 🌍`;
      greeting = `Habari ${userName}!`;
      mainMessage = `
        <p>${ubuntu_touch}. You joined DNA ${daysOnboarded} days ago, and we're excited to help you connect with your Pan-African family.</p>
        
        <p><strong>Your next steps as a ${userType}:</strong></p>
        <ul>
          <li>🤝 <strong>Connect:</strong> Discover and reach out to fellow diasporans in your field</li>
          <li>🚀 <strong>Collaborate:</strong> Join ongoing projects that match your interests</li>
          <li>💡 <strong>Contribute:</strong> Share your expertise with the community</li>
        </ul>
        
        <p>Remember: <em>"If you want to go fast, go alone. If you want to go far, go together."</em> - African Proverb</p>
      `;
      cta = 'Complete Your DNA Profile';
      break;
      
    case '7_day':
      subject = `${userName}, the village is stronger with your voice 🌟`;
      greeting = `Sanibonani ${userName}!`;
      mainMessage = `
        <p>${ubuntu_touch}. It's been a week since you joined our Pan-African movement, and your unique perspective is needed.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin-top: 0;">This Week in DNA:</h3>
          <ul>
            <li>🌍 <strong>52 new connections</strong> made across the diaspora</li>
            <li>🤝 <strong>12 new collaborations</strong> launched</li>
            <li>💰 <strong>$2.1M in funding</strong> raised by our founder community</li>
          </ul>
        </div>
        
        <p>As a ${userType}, you bring invaluable experience to our community. Whether you're looking to mentor, be mentored, or collaborate on projects that drive Africa's development - we're here to connect you with the right people.</p>
      `;
      cta = 'Explore DNA Community';
      break;
      
    case '14_day':
      subject = `${userName}, Ubuntu calls - Your community needs you ❤️`;
      greeting = `Salaam ${userName}!`;
      mainMessage = `
        <p>${ubuntu_touch}. Two weeks ago, you took a powerful step by joining DNA - a movement that believes in the potential of African innovation and diaspora collaboration.</p>
        
        <p><strong>We understand life gets busy.</strong> That's exactly why DNA exists - to create meaningful connections that fit into your world, not disrupt it.</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d97706; margin-top: 0;">Success Story:</h3>
          <p><em>"Through DNA, I connected with a developer in Lagos who became my co-founder. We just closed our seed round!"</em></p>
          <p><strong>- Amara K., DNA Founder</strong></p>
        </div>
        
        <p>Your journey as a ${userType} in the diaspora network can start with just one conversation. We've designed DNA to make meaningful connections effortless - whether you have 5 minutes or 5 hours.</p>
        
        <p><strong>Ready to take the next step?</strong> We're here to support you.</p>
      `;
      cta = 'Reconnect with DNA';
      break;
      
    default:
      subject = `${userName}, your DNA community awaits`;
      greeting = `Hello ${userName}!`;
      mainMessage = `<p>Your presence strengthens our Pan-African community. Ready to reconnect?</p>`;
      cta = 'Join the Conversation';
  }
  
  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px 24px; text-align: center; }
          .logo { color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 8px; }
          .tagline { color: #dcfce7; font-size: 14px; margin: 0; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 20px; font-weight: 600; color: #1f2937; margin-bottom: 16px; }
          .cta-button { display: inline-block; background-color: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .cta-button:hover { background-color: #15803d; }
          .footer { background-color: #f3f4f6; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; }
          .unsubscribe { color: #9ca3af; text-decoration: none; }
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
          @media (max-width: 600px) {
            .container { margin: 0 16px; }
            .content, .header { padding: 24px 16px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo">DNA</div>
            <p class="tagline">Diaspora Network of Africa</p>
          </div>

          <!-- Main Content -->
          <div class="content">
            <h1 class="greeting">${greeting}</h1>
            
            ${mainMessage}

            <div style="text-align: center; margin: 32px 0;">
              <a href="${dashboardUrl}" class="cta-button">${cta}</a>
            </div>
            
            <p style="font-style: italic; color: #6b7280; border-left: 4px solid #16a34a; padding-left: 16px; margin: 24px 0;">
              "Ubuntu: I am because we are. Your success is our success, and together we build the Africa we envision."
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 8px 0;">
              <strong>DNA - Diaspora Network of Africa</strong><br>
              Building bridges, Creating opportunities, Transforming Africa
            </p>
            <p style="margin: 16px 0; font-size: 12px;">
              You're receiving this because you're part of the DNA community. 
              <a href="${unsubscribeUrl}" class="unsubscribe">Unsubscribe from reminders</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🚀 Starting engagement reminders processing...");

    // Get pending reminders
    const { data: pendingReminders, error: fetchError } = await supabase
      .rpc('get_pending_reminders', { batch_size: 20 });

    if (fetchError) {
      console.error("Error fetching pending reminders:", fetchError);
      throw fetchError;
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      console.log("No pending reminders to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No pending reminders" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 Processing ${pendingReminders.length} pending reminders`);

    let sentCount = 0;
    let failedCount = 0;

    // Process each reminder
    for (const reminder of pendingReminders as ReminderData[]) {
      try {
        console.log(`Processing reminder ${reminder.reminder_id} for user ${reminder.user_email}`);
        
        // Generate culturally authentic content
        const emailContent = getReminderContent(
          reminder.reminder_type,
          reminder.cohort,
          reminder.metadata
        );

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: "DNA Community <community@diasporanetwork.africa>",
          to: [reminder.user_email],
          subject: emailContent.subject,
          html: emailContent.html,
        });

        if (emailResponse.data?.id) {
          // Mark as sent
          await supabase.rpc('update_reminder_status', {
            reminder_id: reminder.reminder_id,
            new_status: 'sent'
          });

          // Log engagement event
          await supabase.rpc('log_engagement_event', {
            target_user_id: reminder.user_id,
            event_type_param: 'reminder_sent',
            event_context_param: {
              reminder_type: reminder.reminder_type,
              email_id: emailResponse.data.id,
              cohort: reminder.cohort
            },
            cohort_param: reminder.cohort
          });

          sentCount++;
          console.log(`✅ Reminder sent successfully to ${reminder.user_email}`);
        } else {
          throw new Error('No email ID returned from Resend');
        }

      } catch (emailError) {
        console.error(`❌ Failed to send reminder to ${reminder.user_email}:`, emailError);
        
        // Mark as failed
        await supabase.rpc('update_reminder_status', {
          reminder_id: reminder.reminder_id,
          new_status: 'failed',
          error_message: emailError.message
        });

        failedCount++;
      }
    }

    // Log batch completion
    await supabase.rpc('log_engagement_event', {
      target_user_id: '00000000-0000-0000-0000-000000000000',
      event_type_param: 'reminder_batch_processed',
      event_context_param: {
        total_processed: pendingReminders.length,
        sent_count: sentCount,
        failed_count: failedCount,
        processed_at: new Date().toISOString()
      }
    });

    console.log(`🎯 Batch complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingReminders.length,
        sent: sentCount,
        failed: failedCount,
        message: `Processed ${pendingReminders.length} reminders`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in engagement reminders function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process engagement reminders",
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);