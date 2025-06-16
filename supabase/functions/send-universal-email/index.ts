
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

const getEmailContent = (formType: string, formData: any) => {
  switch (formType) {
    case 'survey':
      return {
        subject: "New Survey Response - DNA Platform",
        adminHtml: `
          <h2>New Survey Response Received</h2>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <h3>Survey Responses:</h3>
          <pre>${JSON.stringify(formData, null, 2)}</pre>
        `,
        userSubject: "Thank you for your valuable feedback!",
        userHtml: `
          <h1>Thank you for completing our survey!</h1>
          <p>Your insights are invaluable in helping us build a platform that truly serves the African diaspora community.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>We'll analyze your feedback along with others to improve our platform</li>
            <li>You'll be notified as we progress through our development phases</li>
            <li>We'll keep you updated on beta testing opportunities</li>
          </ul>
          <p>Best regards,<br>The DNA Team</p>
        `
      };
    
    case 'contact':
      return {
        subject: "New Contact Form Submission - DNA Platform",
        adminHtml: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          ${formData.linkedin_url ? `<p><strong>LinkedIn:</strong> ${formData.linkedin_url}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${formData.message}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `,
        userSubject: "We received your message - DNA Platform",
        userHtml: `
          <h1>Thank you for reaching out!</h1>
          <p>Hi ${formData.name},</p>
          <p>We've received your message and our team will review it carefully.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Our team will review your inquiry within 24-48 hours</li>
            <li>We'll respond to you directly at ${formData.email}</li>
            <li>For urgent matters, you can also reach us through our social channels</li>
          </ul>
          <p>Thank you for your interest in the Diaspora Network of Africa!</p>
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'feedback':
      return {
        subject: "New Feedback Submission - DNA Platform",
        adminHtml: `
          <h2>New Feedback Received</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Page:</strong> ${formData.pageType || 'Unknown'}</p>
          ${formData.linkedin_url ? `<p><strong>LinkedIn:</strong> ${formData.linkedin_url}</p>` : ''}
          <p><strong>Feedback:</strong></p>
          <p>${formData.feedback}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `,
        userSubject: "Thank you for your feedback!",
        userHtml: `
          <h1>Thank you for your feedback!</h1>
          <p>Hi ${formData.name},</p>
          <p>Your input helps us improve the DNA platform and better serve the diaspora community.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Your feedback will be reviewed by our development team</li>
            <li>We'll use your insights to prioritize platform improvements</li>
            <li>If you provided contact information, we may reach out for clarification</li>
          </ul>
          <p>Keep the feedback coming as we continue to build together!</p>
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'beta-signup':
      return {
        subject: "New Beta Program Application - DNA Platform",
        adminHtml: `
          <h2>New Beta Program Application</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
          <p><strong>Role:</strong> ${formData.role || 'Not provided'}</p>
          <p><strong>Selected Phase:</strong> ${formData.selectedPhase}</p>
          <p><strong>Experience:</strong></p>
          <p>${formData.experience || 'Not provided'}</p>
          <p><strong>Motivation:</strong></p>
          <p>${formData.motivation || 'Not provided'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `,
        userSubject: "Beta Application Received - DNA Platform",
        userHtml: `
          <h1>Thank you for applying to our Beta Program!</h1>
          <p>Hi ${formData.name},</p>
          <p>We've received your application for the DNA Beta Program and are excited about your interest in helping us build the future of diaspora networking.</p>
          <p><strong>Your Application Details:</strong></p>
          <ul>
            <li><strong>Selected Phase:</strong> ${formData.selectedPhase}</li>
            <li><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Our team will review your application within 48 hours</li>
            <li>We'll contact you directly if you're selected for the beta program</li>
            <li>Selected participants will receive exclusive access and direct communication channels</li>
          </ul>
          <p>Thank you for your interest in shaping the future of the African diaspora network!</p>
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    default:
      return {
        subject: "New Form Submission - DNA Platform",
        adminHtml: `
          <h2>New Form Submission</h2>
          <p><strong>Form Type:</strong> ${formType}</p>
          <p><strong>Data:</strong></p>
          <pre>${JSON.stringify(formData, null, 2)}</pre>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `,
        userSubject: "Thank you for your submission!",
        userHtml: `
          <h1>Thank you for your submission!</h1>
          <p>We've received your information and will be in touch soon.</p>
          <p>Best regards,<br>The DNA Team</p>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formType, formData, userEmail }: UniversalEmailRequest = await req.json();
    const emailContent = getEmailContent(formType, formData);

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "DNA Platform <onboarding@resend.dev>",
      to: ["aweh@diasporanetwork.africa"],
      subject: emailContent.subject,
      html: emailContent.adminHtml,
    });

    console.log("Admin email sent successfully:", adminEmailResponse);

    // Send confirmation email to user if email provided
    if (userEmail) {
      const userEmailResponse = await resend.emails.send({
        from: "DNA Platform <onboarding@resend.dev>",
        to: [userEmail],
        subject: emailContent.userSubject,
        html: emailContent.userHtml,
      });

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
