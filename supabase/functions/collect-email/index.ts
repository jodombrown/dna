
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

interface EmailSubmissionRequest {
  firstName: string;
  lastName: string;
  email: string;
  linkedin?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]{1,50}$/;
  return nameRegex.test(name);
};

const validateLinkedInUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'linkedin.com' || 
           urlObj.hostname === 'www.linkedin.com' ||
           /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(url);
  } catch {
    return false;
  }
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"'&]/g, '');
};

const getClientIP = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  return cfConnectingIP || forwarded?.split(',')[0] || realIP || '127.0.0.1';
};

const checkRateLimit = async (ipAddress: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      _ip_address: ipAddress,
      _submission_type: 'email_collection',
      _max_submissions: 3,
      _time_window_minutes: 15
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return false; // Fail closed for security
    }

    return data;
  } catch (error) {
    console.error('Rate limit check exception:', error);
    return false;
  }
};

const logSubmission = async (ipAddress: string, email: string): Promise<void> => {
  try {
    await supabase.from('form_submissions').insert({
      ip_address: ipAddress,
      email: sanitizeInput(email),
      submission_type: 'email_collection'
    });
  } catch (error) {
    console.error('Error logging submission:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Method not allowed" 
    }), { 
      status: 405, 
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  try {
    // Check content length
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10000) {
      throw new Error("Request too large");
    }

    const clientIP = getClientIP(req);
    console.log("Request from IP:", clientIP);

    // Check rate limiting
    const isAllowed = await checkRateLimit(clientIP);
    if (!isAllowed) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Too many requests. Please try again later." 
      }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const body = await req.json();
    const { firstName, lastName, email, linkedin }: EmailSubmissionRequest = body;

    // Enhanced validation
    if (!firstName || !lastName || !email) {
      throw new Error("Missing required fields: firstName, lastName, or email");
    }

    if (!validateName(firstName) || !validateName(lastName)) {
      throw new Error("Invalid name format");
    }

    if (!validateEmail(email)) {
      throw new Error("Invalid email format");
    }

    if (linkedin && !validateLinkedInUrl(linkedin)) {
      throw new Error("Invalid LinkedIn URL format");
    }

    // Sanitize inputs
    const sanitizedData = {
      firstName: sanitizeInput(firstName).substring(0, 50),
      lastName: sanitizeInput(lastName).substring(0, 50),
      email: sanitizeInput(email).substring(0, 254),
      linkedin: linkedin ? sanitizeInput(linkedin).substring(0, 200) : undefined
    };

    console.log("Processing email submission for:", sanitizedData.email);

    // Log the submission for rate limiting
    await logSubmission(clientIP, sanitizedData.email);

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
          <strong>Name:</strong> ${sanitizedData.firstName} ${sanitizedData.lastName}<br>
          <strong>Email:</strong> ${sanitizedData.email}<br>
          ${sanitizedData.linkedin ? `<strong>LinkedIn:</strong> <a href="${sanitizedData.linkedin}">${sanitizedData.linkedin}</a><br>` : ''}
          <strong>Submitted:</strong> ${new Date().toLocaleString()}<br>
          <strong>IP Address:</strong> ${clientIP}
        </div>
        
        <p>This person is interested in joining the Diaspora Network of Africa and wants to stay informed about the platform development.</p>
        
        <p>Best regards,<br>DNA Platform System</p>
      `,
    });

    console.log("Notification email sent:", notificationResponse);

    // Send confirmation email to the user
    const confirmationResponse = await resend.emails.send({
      from: "DNA Platform <onboarding@resend.dev>",
      to: [sanitizedData.email],
      subject: "Welcome to the DNA Platform Community!",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #183c2e; margin-bottom: 20px;">Welcome to the DNA Community, ${sanitizedData.firstName}!</h1>
          
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
    
    // Don't expose internal error details
    const safeErrorMessage = error.message.includes('Missing required fields') ||
                            error.message.includes('Invalid') ||
                            error.message.includes('Too many requests') ||
                            error.message.includes('Request too large')
                            ? error.message 
                            : "An error occurred while processing your request";

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: safeErrorMessage
      }),
      {
        status: error.message.includes('Too many requests') ? 429 : 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
