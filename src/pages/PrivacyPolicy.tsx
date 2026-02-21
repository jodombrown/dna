import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { config } from '@/lib/config';
import { PageSEO } from '@/components/seo/PageSEO';
import { RelatedPolicies } from '@/components/legal/RelatedPolicies';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Privacy Policy | DNA Platform"
        description="How DNA protects and handles your personal information. Learn about data collection, security, and your privacy rights on the Diaspora Network of Africa."
        canonicalPath="/privacy-policy"
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
          <h1 className="text-4xl font-bold text-dna-forest mb-2">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">How we protect and handle your personal information</p>
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
          <AccordionItem value="information-collection" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              1. Information We Collect
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">We collect information you provide directly to us, such as when you create an account, join our waitlist, or contact us. This may include:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Personal identifiers (name, email address, phone number)</li>
                <li>Professional information (job title, company, industry)</li>
                <li>Location information (city, country, current location)</li>
                <li>Profile information and preferences</li>
                <li>Communication records and feedback</li>
                <li>Usage data and analytics information</li>
              </ul>
              <p>We also automatically collect certain information when you use our platform, including device information, browser type, and usage patterns.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="information-use" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              2. How We Use Your Information
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices, updates, and administrative messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Facilitate networking and collaboration opportunities</li>
                <li>Personalize and improve your experience</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect and prevent fraud and abuse</li>
              </ul>
              <p>We process your information based on legitimate business interests, your consent, or to fulfill our contractual obligations to you.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="information-sharing" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              3. Information Sharing and Disclosure
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li><strong>Service Providers:</strong> With trusted partners who assist us in operating our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                <li><strong>Public Information:</strong> Information you choose to make public on your profile</li>
              </ul>
              <p>All third-party service providers are bound by confidentiality agreements and data protection requirements.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-security" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              4. Data Security and Protection
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">We implement appropriate technical and organizational measures to protect your personal information:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p>However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but strive to use commercially acceptable means to protect your data.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="user-rights" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              5. Your Rights and Choices
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p>To exercise these rights, please contact us using the information provided below. We will respond to your request within 30 days.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="data-retention" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              6. Data Retention
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">We retain your personal information for as long as necessary to:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our services and user experience</li>
              </ul>
              <p>When we no longer need your information, we will securely delete or anonymize it in accordance with our data retention policies.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="international-transfers" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              7. International Data Transfers
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">As a global platform serving the African diaspora, your information may be transferred to and processed in countries other than your own. We ensure that:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Adequate protection measures are in place</li>
                <li>Data transfers comply with applicable laws</li>
                <li>Recipients provide appropriate safeguards</li>
                <li>Your rights remain protected regardless of location</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="children-privacy" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              8. Children's Privacy
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">Our platform is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16.</p>
              <p>If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="policy-changes" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              9. Changes to This Policy
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will:</p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Notify you of significant changes via email or platform notification</li>
                <li>Update the "last modified" date at the bottom of this policy</li>
                <li>Provide you with the opportunity to review changes</li>
              </ul>
              <p>Your continued use of our platform after changes take effect constitutes acceptance of the updated policy.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact-us" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              10. Contact Us
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              <p>Email: <a href={`mailto:${config.emails.privacy}`} className="text-dna-copper hover:underline">{config.emails.privacy}</a></p>
              <p>Data Protection Officer: <a href={`mailto:${config.emails.dpo}`} className="text-dna-copper hover:underline">{config.emails.dpo}</a></p>
              <p>Website: <a href={config.APP_URL} className="text-dna-copper hover:underline">{config.APP_DOMAIN}</a></p>
              <p className="mt-4 text-sm">We are committed to resolving any privacy concerns promptly and transparently.</p>
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

export default PrivacyPolicy;
