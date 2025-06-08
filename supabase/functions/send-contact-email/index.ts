
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();

    console.log("Sending email to:", email, "from:", name);

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "DNA Platform <noreply@resend.dev>",
      to: [email],
      subject: "Welcome to the DNA Platform - We received your interest!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #065f46; margin-bottom: 20px;">Thank you for your interest, ${name}!</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We're excited that you want to be part of the DNA (Diaspora Network Africa) platform!
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Our mission is to connect, collaborate, and contribute to Africa's development through the power of our global diaspora network.
          </p>
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-bottom: 10px;">What's Next?</h3>
            <ul style="color: #374151; padding-left: 20px;">
              <li>We'll keep you updated on our platform development progress</li>
              <li>You'll be among the first to know when we launch</li>
              <li>Get early access to connect with diaspora professionals worldwide</li>
              <li>Join exclusive events and collaboration opportunities</li>
            </ul>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Together, we're building bridges between the African diaspora and the continent to create lasting impact.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong>The DNA Platform Team</strong>
          </p>
        </div>
      `,
    });

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "DNA Platform <noreply@resend.dev>",
      to: ["admin@dnaplatform.com"], // Replace with your admin email
      subject: `New Interest from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #065f46;">New Platform Interest</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log("User email sent successfully:", userEmailResponse);
    console.log("Admin email sent successfully:", adminEmailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
