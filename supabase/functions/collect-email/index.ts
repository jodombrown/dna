
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailSubmissionRequest {
  firstName: string;
  lastName: string;
  email: string;
  linkedin?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const body = await req.json();
    console.log("Raw request body:", body);
    
    const { firstName, lastName, email, linkedin }: EmailSubmissionRequest = body;

    console.log("Received email submission:", { firstName, lastName, email, linkedin });

    // Validate required fields
    if (!firstName || !lastName || !email) {
      throw new Error("Missing required fields: firstName, lastName, or email");
    }

    // Send notification email to jaune@roadmap.africa
    const notificationResponse = await resend.emails.send({
      from: "DNA Platform <onboarding@resend.dev>",
      to: ["jaune@roadmap.africa"],
      subject: "New DNA Platform Interest - Early Access Request",
      html: `
        <h1>New Early Access Request</h1>
        <p>Someone has signed up for early access to the DNA Platform:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <strong>Contact Details:</strong><br>
          <strong>Name:</strong> ${firstName} ${lastName}<br>
          <strong>Email:</strong> ${email}<br>
          ${linkedin ? `<strong>LinkedIn:</strong> <a href="${linkedin}">${linkedin}</a><br>` : ''}
          <strong>Submitted:</strong> ${new Date().toLocaleString()}
        </div>
        
        <p>This person is interested in joining the Diaspora Network of Africa and wants to stay informed about the platform development.</p>
        
        <p>Best regards,<br>DNA Platform System</p>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

    // Send confirmation email to the user
    const confirmationResponse = await resend.emails.send({
      from: "DNA Platform <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the DNA Platform Community!",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #183c2e; margin-bottom: 20px;">Welcome to the DNA Community, ${firstName}!</h1>
          
          <p>Thank you for joining our mission to connect and empower the African diaspora worldwide.</p>
          
          <div style="background-color: #abddd6; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #459c71;">
            <h3 style="color: #183c2e; margin-top: 0;">What happens next?</h3>
            <ul style="color: #183c2e;">
              <li>We'll keep you updated on our prototype development (launching June 2025)</li>
              <li>You'll be among the first to know about collaboration opportunities during our prototyping phase</li>
              <li>We'll reach out soon with more information about how you can get involved in building this platform together</li>
            </ul>
          </div>
          
          <p>This is just the beginning of our journey, and we're excited to have you as part of our founding community. Together, we're building the infrastructure for African diaspora impact.</p>
          
          <p style="margin-top: 30px;">
            <strong>Building together,</strong><br>
            Jaune and the DNA Platform Team
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            You're receiving this email because you signed up for early access to the Diaspora Network of Africa platform. 
            We respect your privacy and will only send updates about our platform development.
          </p>
        </div>
      `,
    });

    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Thank you for joining our community! Check your email for confirmation." 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in collect-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
