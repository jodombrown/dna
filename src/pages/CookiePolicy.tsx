import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { config } from '@/lib/config';
import { PageSEO } from '@/components/seo/PageSEO';
import { RelatedPolicies } from '@/components/legal/RelatedPolicies';

const CookiePolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Cookie Policy | DNA Platform"
        description="Learn how DNA uses cookies and similar technologies to provide, improve, and protect our platform and services."
        canonicalPath="/legal/cookie-policy"
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
          <h1 className="text-4xl font-bold text-dna-forest mb-2">Cookie Policy</h1>
          <p className="text-lg text-muted-foreground">How we use cookies and similar technologies</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card rounded-lg border p-8 mb-8">
          <p className="text-sm text-dna-copper font-semibold mb-4">
            Effective on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-foreground leading-relaxed">
              DNA – Diaspora Network of Africa ("DNA," "we," "us," or "our") uses cookies and similar technologies
              to recognize you when you visit our platform. This Cookie Policy explains what these technologies are,
              why we use them, and your rights to control our use of them.
            </p>
          </div>
        </div>

        <Accordion type="multiple" className="space-y-4">
          <AccordionItem value="what-are-cookies" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              1. What Are Cookies?
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">
                Cookies are small data files placed on your computer or mobile device when you visit a website.
                Cookies are widely used by website owners to make their websites work, work more efficiently, and
                to provide reporting information.
              </p>
              <p>
                Cookies set by the website owner (in this case, DNA) are called "first-party cookies." Cookies set
                by parties other than the website owner are called "third-party cookies." Third-party cookies enable
                third-party features or functionality to be provided on or through the website (e.g., analytics and
                interactive content).
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="why-we-use-cookies" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              2. Why Do We Use Cookies?
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">We use first-party and third-party cookies for several reasons:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the operation of our platform. They include cookies that enable you to log in to secure areas, use authentication features, and maintain your session.</li>
                <li><strong>Performance & Analytics Cookies:</strong> Allow us to count visits and traffic sources so we can measure and improve platform performance.</li>
                <li><strong>Functional Cookies:</strong> Enable the platform to provide enhanced functionality and personalization, such as remembering your preferences, language settings, and display options.</li>
                <li><strong>Targeting/Advertising Cookies:</strong> May be set through our platform by our advertising partners to build a profile of your interests and show you relevant content on other sites.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="types-of-cookies" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              3. Types of Cookies We Use
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-dna-emerald/20">
                      <th className="text-left py-2 pr-4 font-semibold text-dna-forest">Category</th>
                      <th className="text-left py-2 pr-4 font-semibold text-dna-forest">Purpose</th>
                      <th className="text-left py-2 font-semibold text-dna-forest">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2 pr-4 font-medium">Authentication</td>
                      <td className="py-2 pr-4">Keep you signed in and verify your identity</td>
                      <td className="py-2">Session / Persistent</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Security</td>
                      <td className="py-2 pr-4">Detect abuse and protect your account</td>
                      <td className="py-2">Session / Persistent</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Preferences</td>
                      <td className="py-2 pr-4">Remember your settings (theme, language, region)</td>
                      <td className="py-2">Persistent</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Analytics</td>
                      <td className="py-2 pr-4">Understand usage patterns and improve the platform</td>
                      <td className="py-2">Persistent</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="similar-technologies" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              4. Other Tracking Technologies
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">In addition to cookies, we may use other similar technologies such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Local Storage & Session Storage:</strong> Used to store data locally in your browser for performance and functionality purposes.</li>
                <li><strong>Pixels / Web Beacons:</strong> Tiny graphics that may be included in our emails or pages to help us understand engagement and improve communications.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="your-choices" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              5. Your Choices & How to Control Cookies
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences in the following ways:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Browser Settings:</strong> Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. However, if you block essential cookies, some parts of the platform may not function properly.</li>
                <li>
                  <strong>Opt-Out Links:</strong> Some third-party cookies can be opted out of through industry opt-out mechanisms such as the{' '}
                  <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-dna-copper hover:underline">Digital Advertising Alliance</a>{' '}
                  or the{' '}
                  <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-dna-copper hover:underline">European Interactive Digital Advertising Alliance</a>.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="updates" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              6. Updates to This Policy
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p>We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. When we make changes, we will update the "Effective Date" at the top of this policy. We encourage you to review this policy periodically.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              7. Contact Us
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p className="mb-4">If you have questions about our use of cookies or this Cookie Policy, please contact us at:</p>
              <p className="font-medium">
                DNA – Diaspora Network of Africa<br />
                Email:{' '}
                <a href={`mailto:${config.supportEmail}`} className="text-dna-copper hover:underline">
                  {config.supportEmail}
                </a>
              </p>
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

export default CookiePolicy;
