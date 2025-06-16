
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getEmailContent } from "./emailTemplates.ts";
import { EmailService } from "./emailService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UniversalEmailRequest {
  formType: string;
  formData: any;
  userEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formType, formData, userEmail }: UniversalEmailRequest = await req.json();
    
    // Initialize email service
    const emailService = new EmailService({
      resendApiKey: Deno.env.get("RESEND_API_KEY")!,
      fromEmail: "DNA Platform <aweh@diasporanetwork.africa>",
      adminEmail: "aweh@diasporanetwork.africa"
    });

    // Get email content based on form type
    const emailContent = getEmailContent(formType, formData);

    // Send email to admin
    const adminEmailResponse = await emailService.sendAdminEmail(emailContent);
    console.log("Admin email sent successfully:", adminEmailResponse);

    // Send confirmation email to user if email provided
    let userEmailResponse = null;
    if (userEmail) {
      userEmailResponse = await emailService.sendUserConfirmationEmail(userEmail, emailContent);
      console.log("User confirmation email sent successfully:", userEmailResponse);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      adminEmailId: adminEmailResponse.data?.id,
      userEmailSent: !!userEmail 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in universal email function:", error);
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
