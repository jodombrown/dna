
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

    case 'referral':
      return {
        subject: "New Referral Created - DNA Platform",
        adminHtml: `
          <h2>New Referral Created</h2>
          <p><strong>Referrer:</strong> ${formData.referrerName} (${formData.referrerEmail})</p>
          <p><strong>Referred Email:</strong> ${formData.referredEmail}</p>
          <p><strong>Referral Code:</strong> ${formData.referralCode}</p>
          <p><strong>Invite Link:</strong> <a href="${formData.inviteLink}">${formData.inviteLink}</a></p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `,
        userSubject: "You're Invited to Join the DNA Community!",
        userHtml: `
          <h1>You're Invited to DNA!</h1>
          <p>Hi there,</p>
          <p><strong>${formData.referrerName}</strong> has invited you to join the Diaspora Network of Africa (DNA) - a professional platform connecting the global African diaspora.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a5f3f; margin-top: 0;">What is DNA?</h3>
            <ul>
              <li><strong>Connect:</strong> Build meaningful professional relationships across the diaspora</li>
              <li><strong>Collaborate:</strong> Work together on impactful projects</li>
              <li><strong>Contribute:</strong> Make a difference across Africa and its communities</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${formData.inviteLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accept Your Invitation</a>
          </div>
          <p><strong>Why join DNA?</strong></p>
          <ul>
            <li>Early access to our beta platform</li>
            <li>Connect with diaspora professionals globally</li>
            <li>Discover and contribute to African impact projects</li>
            <li>Access exclusive events and opportunities</li>
          </ul>
          <p>This invitation is from ${formData.referrerName}, who thought you'd be a great addition to our community.</p>
          <p>Welcome to the movement!</p>
          <p>Best regards,<br>The DNA Team</p>
        `
      };

    case 'waitlist':
      return {
        subject: "New Waitlist Signup - DNA Platform",
        adminHtml: `
          <h2>New Waitlist Signup</h2>
          <p><strong>Name:</strong> ${formData.fullName}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Location:</strong> ${formData.location || 'Not provided'}</p>
          <p><strong>Role:</strong> ${formData.role || 'Individual'}</p>
          ${formData.causes && formData.causes.length > 0 ? `<p><strong>Interests:</strong> ${formData.causes.join(', ')}</p>` : ''}
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `,
        userSubject: "Welcome to the DNA Waitlist!",
        userHtml: `
          <h1>You're In! Welcome to the DNA Community</h1>
          <p>Hi ${formData.fullName},</p>
          <p>Thank you for joining the Diaspora Network of Africa waitlist! We're excited to have you as part of our growing community of changemakers.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>You'll be among the first to receive early access when we launch</li>
            <li>We'll keep you updated on our development progress and milestones</li>
            <li>You may be invited to participate in beta testing opportunities</li>
            <li>Connect with other diaspora members through exclusive updates</li>
          </ul>
          <p><strong>Stay Connected:</strong></p>
          <p>Follow our journey and connect with fellow community members as we build the future of diaspora networking together.</p>
          <p>Thank you for being part of the movement to Connect, Collaborate, and Contribute to Africa's advancement!</p>
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
