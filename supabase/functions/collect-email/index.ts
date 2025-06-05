
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
    const { firstName, lastName, email }: EmailSubmissionRequest = await req.json();

    console.log("Received email submission:", { firstName, lastName, email });

    // Send notification email to jaune@roadmap.africa
    const emailResponse = await resend.emails.send({
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
          <strong>Submitted:</strong> ${new Date().toLocaleString()}
        </div>
        
        <p>This person is interested in joining the Diaspora Network of Africa and wants to stay informed about the platform development.</p>
        
        <p>Best regards,<br>DNA Platform System</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Thank you for your interest! We'll keep you updated." 
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
