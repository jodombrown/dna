import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { config } from '@/lib/config';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-sage to-dna-forest">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div 
              className="group"
              title="Back"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-white hover:text-dna-copper hover:bg-white/10 transition-all duration-200 group-hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-white/80 text-lg">
              How we protect and handle your personal information
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="information-collection">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                1. Information We Collect
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you create an account, join our waitlist, or contact us. This may include:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Personal identifiers (name, email address, phone number)</li>
                  <li>Professional information (job title, company, industry)</li>
                  <li>Location information (city, country, current location)</li>
                  <li>Profile information and preferences</li>
                  <li>Communication records and feedback</li>
                  <li>Usage data and analytics information</li>
                </ul>
                <p>
                  We also automatically collect certain information when you use our platform, including device information, browser type, and usage patterns.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="information-use">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                2. How We Use Your Information
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
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
                <p>
                  We process your information based on legitimate business interests, your consent, or to fulfill our contractual obligations to you.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="information-sharing">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                3. Information Sharing and Disclosure
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li><strong>Service Providers:</strong> With trusted partners who assist us in operating our platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                  <li><strong>Public Information:</strong> Information you choose to make public on your profile</li>
                </ul>
                <p>
                  All third-party service providers are bound by confidentiality agreements and data protection requirements.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-security">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                4. Data Security and Protection
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response and breach notification procedures</li>
                </ul>
                <p>
                  However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but strive to use commercially acceptable means to protect your data.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="user-rights">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                5. Your Rights and Choices
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
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
                <p>
                  To exercise these rights, please contact us using the information provided below. We will respond to your request within 30 days.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-retention">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                6. Data Retention
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  We retain your personal information for as long as necessary to:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Provide our services and maintain your account</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Improve our services and user experience</li>
                </ul>
                <p>
                  When we no longer need your information, we will securely delete or anonymize it in accordance with our data retention policies.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="international-transfers">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                7. International Data Transfers
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  As a global platform serving the African diaspora, your information may be transferred to and processed in countries other than your own. We ensure that:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Adequate protection measures are in place</li>
                  <li>Data transfers comply with applicable laws</li>
                  <li>Recipients provide appropriate safeguards</li>
                  <li>Your rights remain protected regardless of location</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="children-privacy">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                8. Children's Privacy
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  Our platform is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16.
                </p>
                <p>
                  If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="policy-changes">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                9. Changes to This Policy
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Notify you of significant changes via email or platform notification</li>
                  <li>Update the "last modified" date at the bottom of this policy</li>
                  <li>Provide you with the opportunity to review changes</li>
                </ul>
                <p>
                  Your continued use of our platform after changes take effect constitutes acceptance of the updated policy.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact-us">
              <AccordionTrigger className="text-lg font-semibold text-dna-forest">
                10. Contact Us
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2">
                  <p>Email: <a href={`mailto:${config.emails.privacy}`} className="text-dna-copper hover:underline">{config.emails.privacy}</a></p>
                  <p>Data Protection Officer: <a href={`mailto:${config.emails.dpo}`} className="text-dna-copper hover:underline">{config.emails.dpo}</a></p>
                  <p>Website: <a href={config.APP_URL} className="text-dna-copper hover:underline">{config.APP_DOMAIN}</a></p>
                </div>
                <p className="mt-4 text-sm">
                  We are committed to resolving any privacy concerns promptly and transparently.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="border-t mt-8 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;