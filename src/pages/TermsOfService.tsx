import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { config } from '@/lib/config';
import { PageSEO } from '@/components/seo/PageSEO';
import { RelatedPolicies } from '@/components/legal/RelatedPolicies';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Terms of Service | DNA Platform"
        description="Terms and conditions for using the Diaspora Network of Africa platform. Guidelines for professional networking and collaboration."
        canonicalPath="/terms-of-service"
        noIndex={false}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-dna-terra/10 to-dna-sunset/10 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-dna-forest hover:text-dna-copper"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-dna-forest mb-2">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">Guidelines for using the Diaspora Network of Africa platform</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-lg border p-8 mb-8">
          <p className="text-sm text-dna-copper font-semibold mb-4">
            Effective on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <Accordion type="multiple" className="space-y-4">
          <AccordionItem value="acceptance" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              1. Acceptance of Terms
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">
                By accessing and using the Diaspora Network of Africa (DNA) platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p>
                If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time, and your continued use constitutes acceptance of any changes.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="platform-purpose" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              2. Platform Purpose
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">
                DNA is a professional networking and collaboration platform designed to connect the African diaspora with Africa's development through innovation, entrepreneurship, and strategic partnerships.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Foster professional connections across the African diaspora</li>
                <li>Facilitate business collaborations and investment opportunities</li>
                <li>Support knowledge sharing and skill development</li>
                <li>Promote cultural exchange and heritage preservation</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="user-responsibilities" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              3. User Responsibilities
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">As a user of our platform, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Provide accurate and truthful information in your profile</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Respect other users and maintain professional conduct</li>
                <li>Not engage in harmful, illegal, or inappropriate activities</li>
                <li>Not spam, harass, or abuse other platform members</li>
                <li>Respect intellectual property rights</li>
              </ul>
              <p>Violation of these responsibilities may result in suspension or termination of your account.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content-guidelines" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              4. Content Guidelines
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">Content shared on our platform must be:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Professional and respectful in nature</li>
                <li>Relevant to the platform's mission and community</li>
                <li>Free from offensive, discriminatory, or harmful material</li>
                <li>Compliant with applicable laws and regulations</li>
                <li>Your own original content or properly attributed</li>
              </ul>
              <p>We reserve the right to remove content that violates these guidelines and may suspend users who repeatedly violate our content policies.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="privacy-data" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              5. Privacy and Data Protection
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">Your privacy is important to us. We collect and use your information in accordance with our Privacy Policy, which details:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>What information we collect and why</li>
                <li>How we use and protect your data</li>
                <li>Your rights regarding your personal information</li>
                <li>How to contact us with privacy concerns</li>
              </ul>
              <p>Please review our <a href="/legal/privacy-policy" className="text-dna-copper hover:underline font-medium">Privacy Policy</a> for complete details.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="intellectual-property" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              6. Intellectual Property
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">The DNA platform, including its design, features, and content, is protected by intellectual property laws. Users retain ownership of their original content but grant DNA a license to use it for platform operations.</p>
              <p>You may not copy, modify, distribute, or create derivative works of our platform without explicit permission.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="limitation-liability" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              7. Limitation of Liability
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">DNA is provided "as is" without warranties of any kind. We are not liable for:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Actions or content of other users</li>
                <li>Technical issues or service interruptions</li>
                <li>Business decisions made based on platform interactions</li>
                <li>Third-party services or links</li>
              </ul>
              <p>Our liability is limited to the maximum extent permitted by law.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="termination" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              8. Account Termination
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">You may delete your account at any time. We may suspend or terminate accounts for violations of these terms or for any other reason at our discretion.</p>
              <p>Upon termination, your access to the platform will cease, though some information may be retained as required by law or for legitimate business purposes.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              9. Contact Information
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">For questions about these Terms of Service, please contact us:</p>
              <p>Email: <a href={`mailto:${config.emails.legal}`} className="text-dna-copper hover:underline">{config.emails.legal}</a></p>
              <p>Website: <a href={config.APP_URL} className="text-dna-copper hover:underline">{config.APP_DOMAIN}</a></p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="bg-card rounded-lg border p-8 mt-8">
          <RelatedPolicies />
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="mt-2">© {new Date().getFullYear()} Diaspora Network of Africa. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
