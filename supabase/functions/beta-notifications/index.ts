import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: 'application_approved' | 'application_rejected' | 'magic_link';
  data: {
    full_name: string;
    admin_notes?: string;
    magic_link?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, data }: EmailRequest = await req.json();
    console.log(`Sending ${type} email to ${to}`);

    let subject: string;
    let html: string;

    switch (type) {
      case 'application_approved':
        subject = "🎉 Welcome to DNA Beta - You're In!";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2D5A4B, #4A7C59); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to DNA Beta!</h1>
              <p style="color: #E8F5E8; margin: 10px 0 0 0; font-size: 16px;">You've been selected to help shape the future</p>
            </div>
            
            <div style="padding: 0 20px;">
              <h2 style="color: #2D5A4B; margin-bottom: 20px;">Hi ${data.full_name},</h2>
              
              <p style="color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
                Congratulations! Your beta application for the Diaspora Network of Africa (DNA) has been approved. 
                We're excited to have you as one of our founding community members.
              </p>
              
              <div style="background: #F7FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #C17B47; margin: 20px 0;">
                <h3 style="color: #2D5A4B; margin-top: 0;">What's Next?</h3>
                <ol style="color: #4A5568; line-height: 1.6;">
                  <li>You'll receive a magic link to create your profile shortly</li>
                  <li>Complete your DNA profile to connect with other diaspora members</li>
                  <li>Explore collaboration opportunities and community events</li>
                  <li>Share feedback to help us improve the platform</li>
                </ol>
              </div>
              
              ${data.admin_notes ? `
                <div style="background: #FFF8E1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #B8860B; margin-top: 0;">Note from our team:</h4>
                  <p style="color: #4A5568; margin-bottom: 0;">${data.admin_notes}</p>
                </div>
              ` : ''}
              
              <p style="color: #4A5568; line-height: 1.6; margin: 30px 0 20px 0;">
                Thank you for joining us in building a stronger, more connected African diaspora community.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="color: #718096; font-size: 14px;">
                  Welcome to the DNA family!<br>
                  <strong>The DNA Team</strong>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'application_rejected':
        subject = "DNA Beta Application Update";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #2D5A4B; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">DNA Beta Application Update</h1>
            </div>
            
            <div style="padding: 0 20px;">
              <h2 style="color: #2D5A4B; margin-bottom: 20px;">Hi ${data.full_name},</h2>
              
              <p style="color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
                Thank you for your interest in joining the DNA beta program. After careful review, 
                we're unable to accept your application for this round of beta testing.
              </p>
              
              ${data.admin_notes ? `
                <div style="background: #FFF8E1; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #B8860B; margin-top: 0;">Feedback from our team:</h4>
                  <p style="color: #4A5568; margin-bottom: 0;">${data.admin_notes}</p>
                </div>
              ` : ''}
              
              <div style="background: #F7FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #C17B47; margin: 20px 0;">
                <h3 style="color: #2D5A4B; margin-top: 0;">What's Next?</h3>
                <p style="color: #4A5568; line-height: 1.6; margin-bottom: 10px;">
                  While we can't include you in this beta round, we encourage you to:
                </p>
                <ul style="color: #4A5568; line-height: 1.6;">
                  <li>Stay connected for future opportunities</li>
                  <li>Follow our updates as we prepare for public launch</li>
                  <li>Consider applying again when we open the next round</li>
                </ul>
              </div>
              
              <p style="color: #4A5568; line-height: 1.6; margin: 30px 0 20px 0;">
                We appreciate your interest in the Diaspora Network of Africa and hope to connect with you in the future.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="color: #718096; font-size: 14px;">
                  <strong>The DNA Team</strong>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case 'magic_link':
        subject = "🔗 Your DNA Profile Creation Link";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2D5A4B, #4A7C59); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Create Your DNA Profile</h1>
              <p style="color: #E8F5E8; margin: 10px 0 0 0; font-size: 16px;">Your exclusive access link</p>
            </div>
            
            <div style="padding: 0 20px;">
              <h2 style="color: #2D5A4B; margin-bottom: 20px;">Hi ${data.full_name},</h2>
              
              <p style="color: #4A5568; line-height: 1.6; margin-bottom: 30px;">
                You're ready to create your DNA profile! Click the button below to get started with your 
                exclusive beta access to the Diaspora Network of Africa.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.magic_link}" style="background: #C17B47; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Create Your Profile
                </a>
              </div>
              
              <div style="background: #F7FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #C17B47; margin: 30px 0;">
                <h3 style="color: #2D5A4B; margin-top: 0;">Getting Started Tips:</h3>
                <ul style="color: #4A5568; line-height: 1.6; margin-bottom: 0;">
                  <li>Complete your profile to maximize networking opportunities</li>
                  <li>Add your skills and impact areas to find relevant collaborations</li>
                  <li>Browse community events and connect with other members</li>
                  <li>Share your feedback to help us improve the platform</li>
                </ul>
              </div>
              
              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0;">
                <strong>Note:</strong> This link is secure and expires in 24 hours. If you need a new link, please contact our support team.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="color: #718096; font-size: 14px;">
                  Welcome to the DNA community!<br>
                  <strong>The DNA Team</strong>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "DNA Platform <noreply@diasporanetwork.africa>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in beta-notifications function:", error);
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