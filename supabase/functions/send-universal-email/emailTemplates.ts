
export interface EmailContent {
  subject: string;
  adminHtml: string;
  userSubject: string;
  userHtml: string;
}

export const getEmailContent = (formType: string, formData: any): EmailContent => {
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

    case 'beta-application':
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
          <p><em>Please review this application in the admin panel.</em></p>
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
            <li>If approved, you'll receive a special invitation link to create your beta account</li>
          </ul>
          <p>Thank you for your patience as we carefully select our beta testers. We're looking for passionate individuals who can help us shape the platform and provide valuable feedback.</p>
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'beta-approval':
      return {
        subject: "Beta Application Approved - DNA Platform",
        adminHtml: `
          <h2>Beta Application Approved</h2>
          <p>Application for ${formData.name} (${formData.email}) has been approved.</p>
          <p>Magic link has been sent to the applicant.</p>
        `,
        userSubject: "Welcome to DNA Beta Program - Create Your Account",
        userHtml: `
          <h1>Congratulations! You've been selected for the DNA Beta Program</h1>
          <p>Hi ${formData.name},</p>
          <p>We're thrilled to invite you to join the DNA Beta Program! After reviewing your application, we believe you'll be a valuable addition to our beta testing community.</p>
          
          <h3>Create Your Beta Account:</h3>
          <p>Click the link below to complete your account setup and start your beta journey:</p>
          <p><a href="${formData.magicLink}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Create My Beta Account</a></p>
          
          <p><strong>Important:</strong> This link expires in 7 days (${new Date(formData.expiresAt).toLocaleDateString()})</p>
          
          <h3>Your Beta Phase:</h3>
          <p><strong>${formData.beta_phase}</strong></p>
          
          <h3>What to expect:</h3>
          <ul>
            <li>Early access to DNA platform features</li>
            <li>Direct communication channel with our development team</li>
            <li>Opportunity to shape the future of the platform</li>
            <li>Recognition as a founding beta tester</li>
          </ul>
          
          <p>We can't wait to see what you'll help us build!</p>
          
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'beta-rejection':
      return {
        subject: "Thank you for your interest in DNA Beta Program",
        adminHtml: `
          <h2>Beta Application Rejected</h2>
          <p>Application for ${formData.name} (${formData.email}) has been rejected.</p>
          <p><strong>Admin Notes:</strong> ${formData.adminNotes || 'None provided'}</p>
        `,
        userSubject: "Thank you for your interest in DNA Beta Program",
        userHtml: `
          <h1>Thank you for your interest in the DNA Beta Program</h1>
          <p>Hi ${formData.name},</p>
          <p>Thank you for taking the time to apply for our Beta Program. After careful consideration, we've decided to move forward with other candidates for this phase.</p>
          
          <p>This doesn't mean we're not interested in having you as part of the DNA community! We encourage you to:</p>
          <ul>
            <li>Stay connected with us for future opportunities</li>
            <li>Join our public launch when we go live</li>
            <li>Follow our progress and updates</li>
          </ul>
          
          <p>We truly appreciate your interest in helping to build the future of African diaspora networking.</p>
          
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'beta-signup':
      return {
        subject: "New Beta Program Signup - DNA Platform",
        adminHtml: `
          <h2>New Beta Program Signup</h2>
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
        userSubject: "Welcome to DNA Beta Program!",
        userHtml: `
          <h1>Welcome to the DNA Beta Program!</h1>
          <p>Hi ${formData.name},</p>
          <p>Thank you for joining our beta program. We're excited to have you help us build the future of African diaspora networking.</p>
          
          <h3>Your Beta Phase:</h3>
          <p><strong>${formData.selectedPhase}</strong></p>
          
          <p>You should receive an email verification link shortly. Once verified, you'll have access to the beta platform.</p>
          
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'connect_survey':
      return {
        subject: "New Connect Survey Response - DNA Platform",
        adminHtml: `
          <h2>New Connect Survey Response Received</h2>
          <p><strong>Page Type:</strong> Connect (Networking)</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <h3>Respondent Information:</h3>
          <p><strong>Name:</strong> ${formData.first_name}</p>
          <p><strong>Email:</strong> ${formData.email || 'Not provided'}</p>
          <h3>Connect Survey Responses:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p><strong>Current Experience:</strong><br>${formData.current_experience}</p>
            <p><strong>Usage Frequency:</strong> ${formData.usage_frequency}</p>
            <p><strong>Desired Features:</strong><br>${formData.desired_features.join(', ')}</p>
            <p><strong>Interaction Preferences:</strong><br>${formData.interaction_preferences}</p>
            <p><strong>Missing Elements:</strong><br>${formData.missing_elements}</p>
            <p><strong>Improvement Suggestions:</strong><br>${formData.improvement_suggestions}</p>
            <p><strong>Additional Comments:</strong><br>${formData.additional_comments}</p>
          </div>
        `,
        userSubject: "Thank you for your Connect feedback!",
        userHtml: `
          <h1>Thank you for sharing your networking insights!</h1>
          <p>Hi ${formData.first_name},</p>
          <p>Your feedback about connecting with the African diaspora community is invaluable to us. We're using insights like yours to shape our networking features.</p>
          <p><strong>Your input will help us build better:</strong></p>
          <ul>
            <li>Professional networking tools</li>
            <li>Mentorship matching systems</li>
            <li>Community discovery features</li>
            <li>Connection and messaging capabilities</li>
          </ul>
          <p>We'll keep you updated as we develop these features and invite you to be among the first to try them!</p>
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'collaborate_survey':
      return {
        subject: "New Collaborate Survey Response - DNA Platform",
        adminHtml: `
          <h2>New Collaborate Survey Response Received</h2>
          <p><strong>Page Type:</strong> Collaborate (Project Collaboration)</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <h3>Respondent Information:</h3>
          <p><strong>Name:</strong> ${formData.first_name}</p>
          <p><strong>Email:</strong> ${formData.email || 'Not provided'}</p>
          <h3>Collaborate Survey Responses:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p><strong>Current Experience:</strong><br>${formData.current_experience}</p>
            <p><strong>Usage Frequency:</strong> ${formData.usage_frequency}</p>
            <p><strong>Desired Features:</strong><br>${formData.desired_features.join(', ')}</p>
            <p><strong>Interaction Preferences:</strong><br>${formData.interaction_preferences}</p>
            <p><strong>Missing Elements:</strong><br>${formData.missing_elements}</p>
            <p><strong>Improvement Suggestions:</strong><br>${formData.improvement_suggestions}</p>
            <p><strong>Additional Comments:</strong><br>${formData.additional_comments}</p>
          </div>
        `,
        userSubject: "Thank you for your Collaboration feedback!",
        userHtml: `
          <h1>Thank you for sharing your collaboration insights!</h1>
          <p>Hi ${formData.first_name},</p>
          <p>Your feedback about collaborative projects for African development is exactly what we need to build the perfect platform for diaspora collaboration.</p>
          <p><strong>Your input will help us create better:</strong></p>
          <ul>
            <li>Project matching and discovery systems</li>
            <li>Team formation and collaboration tools</li>
            <li>Progress tracking and project management</li>
            <li>Resource sharing capabilities</li>
          </ul>
          <p>We're excited to build these features with your insights in mind and can't wait to have you try them!</p>
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'contribute_survey':
      return {
        subject: "New Contribute Survey Response - DNA Platform",
        adminHtml: `
          <h2>New Contribute Survey Response Received</h2>
          <p><strong>Page Type:</strong> Contribute (Impact & Giving)</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <h3>Respondent Information:</h3>
          <p><strong>Name:</strong> ${formData.first_name}</p>
          <p><strong>Email:</strong> ${formData.email || 'Not provided'}</p>
          <h3>Contribute Survey Responses:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            <p><strong>Current Experience:</strong><br>${formData.current_experience}</p>
            <p><strong>Usage Frequency:</strong> ${formData.usage_frequency}</p>
            <p><strong>Desired Features:</strong><br>${formData.desired_features.join(', ')}</p>
            <p><strong>Interaction Preferences:</strong><br>${formData.interaction_preferences}</p>
            <p><strong>Missing Elements:</strong><br>${formData.missing_elements}</p>
            <p><strong>Improvement Suggestions:</strong><br>${formData.improvement_suggestions}</p>
            <p><strong>Additional Comments:</strong><br>${formData.additional_comments}</p>
          </div>
        `,
        userSubject: "Thank you for your Contribution feedback!",
        userHtml: `
          <h1>Thank you for sharing your contribution insights!</h1>
          <p>Hi ${formData.first_name},</p>
          <p>Your feedback about contributing to African development initiatives is crucial for building an effective impact platform.</p>
          <p><strong>Your input will help us develop better:</strong></p>
          <ul>
            <li>Impact tracking and measurement tools</li>
            <li>Contribution and funding mechanisms</li>
            <li>Volunteer opportunity matching</li>
            <li>Project impact visualization</li>
          </ul>
          <p>We're committed to creating tools that make meaningful contribution accessible and rewarding!</p>
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'waitlist_signup':
      return {
        subject: "New Waitlist Signup - DNA Platform",
        adminHtml: `
          <h2>New Waitlist Signup</h2>
          <p><strong>Name:</strong> ${formData.full_name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Location:</strong> ${formData.location || 'Not provided'}</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `,
        userSubject: "Welcome to the DNA Waitlist! 🎉",
        userHtml: `
          <h1>Welcome to the DNA Community!</h1>
          <p>Hi ${formData.full_name},</p>
          <p>Thank you for joining the Diaspora Network of Africa waitlist! You're now part of a growing movement to connect, collaborate, and contribute to Africa's development.</p>
          
          <div style="background: linear-gradient(135deg, #059669, #D97706); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>You'll be among the first to get platform access</li>
              <li>Receive updates on our development progress</li>
              <li>Get invited to exclusive community events</li>
              <li>Help shape the platform through beta testing</li>
            </ul>
          </div>
          
          <p>We're currently in the prototype phase and working hard to build the platform that the African diaspora deserves. Your early support means everything to us!</p>
          
          <p><strong>Stay connected with us:</strong></p>
          <ul>
            <li>Follow our progress on social media</li>
            <li>Share DNA with other diaspora members</li>
            <li>Join our community discussions when they launch</li>
          </ul>
          
          <p>Together, we're building more than a platform - we're building a home for Africa's global family.</p>
          
          <p>Asante sana (Thank you very much),<br>
          <strong>The DNA Team</strong><br>
          <em>Diaspora Network of Africa</em></p>
        `
      };
    
    case 'fact-sheet-stakeholder':
      return {
        subject: `DNA Fact Sheet - ${formData.stakeholderType} Inquiry from ${formData.name}`,
        adminHtml: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1a4d2e 0%, #2d7a4f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #1a4d2e; margin-bottom: 5px; }
                .value { background: white; padding: 12px; border-radius: 4px; border-left: 3px solid #d4af37; }
                .stakeholder-badge { display: inline-block; background: #d4af37; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">DNA Fact Sheet Inquiry</h1>
                  <span class="stakeholder-badge">${formData.stakeholderType.toUpperCase()}</span>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Stakeholder Type:</div>
                    <div class="value">${formData.stakeholderType}</div>
                  </div>
                  <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${formData.name}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value">${formData.email}</div>
                  </div>
                  ${formData.organization ? `
                  <div class="field">
                    <div class="label">${formData.stakeholderType === 'User' ? 'Professional Background' : 'Organization'}:</div>
                    <div class="value">${formData.organization}</div>
                  </div>
                  ` : ''}
                  ${formData.message ? `
                  <div class="field">
                    <div class="label">Message:</div>
                    <div class="value">${formData.message}</div>
                  </div>
                  ` : ''}
                  <div class="field" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #2d7a4f;">
                    <div class="label">Next Steps:</div>
                    <div class="value">
                      ${formData.stakeholderType === 'User' ? 'Review profile and send onboarding instructions' : ''}
                      ${formData.stakeholderType === 'Partner' ? 'Schedule partnership exploration call' : ''}
                      ${formData.stakeholderType === 'Investor' ? 'Send investment deck and schedule investor briefing' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
        userSubject: `Thank you for your interest in DNA - ${formData.stakeholderType}`,
        userHtml: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1a4d2e 0%, #2d7a4f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .greeting { font-size: 18px; margin-bottom: 20px; }
                .message { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 3px solid #d4af37; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #2d7a4f; color: #666; }
                .cta { background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Diaspora Network of Africa</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Building Africa's Future Together</p>
                </div>
                <div class="content">
                  <div class="greeting">Asé ${formData.name},</div>
                  <div class="message">
                    <p><strong>Thank you for your interest in the Diaspora Network of Africa!</strong></p>
                    <p>We received your inquiry as a potential <strong>${formData.stakeholderType}</strong> and are excited about the possibility of working together.</p>
                    ${formData.stakeholderType === 'User' ? '<p>We\'re building a powerful platform to connect diasporans like you with opportunities across Africa. Our team will review your information and reach out with next steps for getting started.</p>' : ''}
                    ${formData.stakeholderType === 'Partner' ? '<p>We believe in the power of strategic partnerships to amplify our collective impact. Our team will review your organization\'s potential for collaboration and be in touch soon to explore synergies.</p>' : ''}
                    ${formData.stakeholderType === 'Investor' ? '<p>We\'re building the infrastructure for diaspora-driven transformation. Our team will send you our investment materials and schedule a time to discuss how you can be part of this movement.</p>' : ''}
                    <p><em>The diaspora is ready. Africa is calling. The time is now.</em></p>
                  </div>
                  <div class="footer">
                    <p><strong>Diaspora Network of Africa</strong></p>
                    <p style="font-size: 12px;">Ubuntu | Sankofa | Excellence</p>
                    <p style="font-size: 12px; margin-top: 10px;">
                      Contact: aweh@diasporanetwork.africa
                    </p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      };

    default:
      throw new Error(`Unknown form type: ${formType}`);
  }
};
