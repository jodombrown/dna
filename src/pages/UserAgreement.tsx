import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft } from 'lucide-react';

const UserAgreement = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-4xl font-bold text-dna-forest mb-2">User Agreement</h1>
          <p className="text-lg text-muted-foreground">Diaspora Network of Africa (DNA)</p>
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
              Our mission is to <strong>connect the African Diaspora and allies</strong> to empower transformative development across Africa. 
              Our services are designed to promote <strong>economic opportunity, innovation, and entrepreneurship</strong> for our members by enabling 
              diaspora professionals and allies to <strong>discover, connect, convene, contribute, and convey</strong> (meeting, exchanging ideas, 
              learning, finding opportunities, building ventures, and making decisions) in a network of trusted relationships rooted in 
              <strong> Ubuntu, Sankofa, and Afro-futurism</strong>.
            </p>
          </div>
        </div>

        <Accordion type="multiple" className="space-y-4">
          {/* Introduction */}
          <AccordionItem value="introduction" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              1. Introduction
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <h3 className="text-dna-copper font-semibold mt-4">1.1 Contract</h3>
              <p>
                When you use our Services, you agree to all of these terms. Your use of our Services is also subject to our 
                <a href="/legal/privacy-policy" className="text-dna-copper hover:underline mx-1">Privacy Policy</a>
                and
                <a href="/legal/terms" className="text-dna-copper hover:underline mx-1">Terms & Conditions</a>, 
                which cover how we collect, use, share, and store your personal information.
              </p>
              <p>
                By creating a DNA account or accessing our Services, you are agreeing to enter into a legally binding contract with 
                the Diaspora Network of Africa (DNA). If you do not agree to this contract ("User Agreement"), do not create an account 
                or use any of our Services.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">1.2 Services</h3>
              <p>
                This Contract applies to the DNA platform, DNA-branded apps, and related sites, apps, communications, and services 
                that state they are offered under this Contract ("Services"), including the collection of data for those Services.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">1.3 Members and Visitors</h3>
              <p>
                This Contract applies to Members and Visitors. When you register and join DNA Services, you become a "Member." 
                If you have not registered, you may access certain features as a "Visitor."
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">1.4 Changes</h3>
              <p>
                We may modify this Contract, our Privacy Policy, and our Terms & Conditions from time to time. If we materially change 
                these terms or are legally required to provide notice, we will notify you through our Services or by other means to 
                provide you the opportunity to review changes before they become effective. Your continued use of our Services after we 
                publish or send notice about changes means you are consenting to the updated terms as of their effective date.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Obligations */}
          <AccordionItem value="obligations" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              2. Obligations
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <h3 className="text-dna-copper font-semibold mt-4">2.1 Service Eligibility</h3>
              <p>
                To use the Services, you agree that: (1) you must be at least 16 years old; (2) you will only have one DNA account, 
                which must be in your real name; and (3) you are not already restricted by DNA from using the Services. Creating an 
                account with false information is a violation of our terms.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">2.2 Your Account</h3>
              <p>
                You will keep your password secure and not share your account with anyone. You agree to: (1) protect against wrongful 
                access to your account; (2) not share or transfer your account; and (3) follow the law and our Community Policies. 
                You are responsible for anything that happens through your account unless you close it or report misuse.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">2.3 Payment</h3>
              <p>
                If you purchase any paid Services, you agree to pay applicable fees and taxes. Your purchase may be subject to exchange 
                rate differences based on location. We may store and continue billing your payment method even after expiration to avoid 
                service interruptions. To avoid future charges, cancel before your renewal date.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">2.4 Notices and Messages</h3>
              <p>
                You agree that we will provide notices and messages through our Services or contact information you provided (email, 
                mobile number, physical address). You agree to keep your contact information up to date.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">2.5 Sharing</h3>
              <p>
                When you share information on our Services, others can see, copy, and use that information. Our Services allow sharing 
                of information in many ways, and depending on your choices, information you share may be seen by other Members, Visitors, 
                or others on or off the Services. We will honor the choices you make about who can see your content.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Rights and Limits */}
          <AccordionItem value="rights" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              3. Rights and Limits
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <h3 className="text-dna-copper font-semibold mt-4">3.1 Your License to DNA</h3>
              <p>
                You own all of your original content that you provide to us, but you also grant us a non-exclusive license to use, 
                copy, modify, distribute, publicly perform and display your content for the purposes of operating and improving our Services. 
                You can end this license by deleting content or closing your account.
              </p>
              <p>
                We will not include your content in advertisements for third-party products without your consent. However, ads may be 
                served near your content, and your social actions may be visible with ads, as noted in the Privacy Policy.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">3.2 Service Availability</h3>
              <p>
                We may change, suspend, or discontinue any of our Services. We may also limit feature availability so they are not 
                available to all Members. DNA is not a storage service. You agree we have no obligation to store, maintain, or provide 
                you a copy of any content, except as required by law.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">3.3 Other Content, Sites and Apps</h3>
              <p>
                Your use of others' content and information on our Services is at your own risk. While we apply automated tools to 
                review content, we cannot prevent all misuse. You agree that we are not responsible for content made available by others, 
                including Members.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">3.4 Limits</h3>
              <p>
                DNA reserves the right to limit your use of the Services, including connection numbers and contact abilities. 
                DNA reserves the right to restrict, suspend, or terminate your account if you breach this Contract or are misusing 
                the Services (e.g., violating Community Policies).
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">3.5 Intellectual Property Rights</h3>
              <p>
                DNA reserves all intellectual property rights in the Services. DNA trademarks, logos, and graphics are trademarks 
                or registered trademarks of the Diaspora Network of Africa.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">3.6 Recommendations and Automated Processing</h3>
              <p>
                We use data and information you provide to make relevant recommendations for connections, content, and features that 
                may be useful to you. We may also use AI features to generate content. Please review such content before sharing, 
                as you are responsible for ensuring it complies with our Community Policies.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Disclaimer and Limit of Liability */}
          <AccordionItem value="liability" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              4. Disclaimer and Limit of Liability
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <h3 className="text-dna-copper font-semibold mt-4">4.1 No Warranty</h3>
              <p>
                DNA and its affiliates make no representation or warranty about the Services, including any representation that the 
                Services will be uninterrupted or error-free, and provide the Services on an "AS IS" and "AS AVAILABLE" basis. 
                To the fullest extent permitted under applicable law, DNA disclaims any implied warranty, including any implied warranty 
                of title, accuracy, non-infringement, merchantability, or fitness for a particular purpose.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">4.2 Exclusion of Liability</h3>
              <p>
                To the fullest extent permitted by law, DNA and its affiliates will not be liable for lost profits, lost business 
                opportunities, reputation, loss of data, or any indirect, incidental, consequential, special, or punitive damages. 
                DNA and its affiliates will not be liable to you for any amount that exceeds (A) the total fees paid by you to DNA 
                for the Services, if any, or (B) $1,000 USD.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">4.3 Basis of the Bargain; Exclusions</h3>
              <p>
                These limitations of liability do not apply to liability for death or personal injury or for fraud, gross negligence, 
                or intentional misconduct, or in cases where a material obligation has been breached.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Termination */}
          <AccordionItem value="termination" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              5. Termination
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p>
                Both you and DNA may terminate this Contract at any time with notice to the other. On termination, you lose the 
                right to access or use the Services. The following shall survive termination: our rights to use your feedback; 
                rights and limits provisions; disclaimer and liability provisions; governing law; and any amounts owed prior to 
                termination remain owed after termination.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Governing Law */}
          <AccordionItem value="governing-law" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              6. Governing Law and Dispute Resolution
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p>
                The laws of the State of Delaware, U.S.A., excluding conflict of laws rules, shall govern any dispute relating to 
                this Contract and/or the Services. You and DNA agree that all claims and disputes can be litigated only in the 
                federal or state courts in Delaware, and you and DNA each agree to personal jurisdiction in those courts.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* General Terms */}
          <AccordionItem value="general" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              7. General Terms
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p>
                If a court finds any part of this Contract unenforceable, you and we agree that the court should modify terms to 
                make that part enforceable while achieving its intent. This Contract is the only agreement between us regarding the 
                Services and supersedes all prior agreements. You may not assign or transfer this Contract without our consent. 
                However, DNA may assign this Contract to its affiliates or a party that acquires it without your consent.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Dos and Don'ts */}
          <AccordionItem value="dos-donts" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              8. DNA "Dos and Don'ts"
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p>
                DNA is a community of professionals committed to Ubuntu, Sankofa, and building Africa's future. This list of 
                "Dos and Don'ts" along with our Community Policies limits what you can and cannot do on our Services.
              </p>

              <h3 className="text-dna-copper font-semibold mt-6">8.1 Dos</h3>
              <p>You agree that you will:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Comply with all applicable laws, including privacy laws, intellectual property laws, anti-spam laws, and regulatory requirements</li>
                <li>Provide accurate contact and identity information and keep it updated</li>
                <li>Use your real name on your profile</li>
                <li>Use the Services in a professional and culturally respectful manner</li>
                <li>Honor Ubuntu principles by treating others with dignity and fostering collective progress</li>
              </ul>

              <h3 className="text-dna-copper font-semibold mt-6">8.2 Don'ts</h3>
              <p>You agree that you will not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create a false identity, misrepresent your identity, or use another's account</li>
                <li>Use software, scripts, robots, or other means to scrape or copy the Services, including profiles and data</li>
                <li>Override security features or bypass access controls or use limits</li>
                <li>Copy or distribute information obtained from the Services without consent</li>
                <li>Violate intellectual property rights of others, including copyrights, patents, trademarks, or trade secrets</li>
                <li>Violate DNA's intellectual property, including using "DNA" or our logos without permission</li>
                <li>Post anything containing software viruses, worms, or harmful code</li>
                <li>Rent, lease, loan, trade, sell, or monetize the Services without DNA's consent</li>
                <li>Use bots or automated methods to drive inauthentic engagement</li>
                <li>Interfere with operation of the Services (spam, denial of service, viruses, algorithm manipulation)</li>
                <li>Violate Community Policies or use Services for unlawful, misleading, discriminatory, fraudulent, or deceitful purposes</li>
                <li>Misuse reporting or appeals processes</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Complaints */}
          <AccordionItem value="complaints" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              9. Complaints Regarding Content
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p>
                We ask that you report content and information you believe violates your rights (including intellectual property rights), 
                our Community Policies, or this Contract. To the extent we can under law, we may remove or restrict access to content, 
                features, or information if we believe it's reasonably necessary to avoid harm to DNA or others, violates the law, or 
                represents misuse of our Services.
              </p>
              <p>
                We respect intellectual property rights of others. We require that information shared by Members be accurate and not 
                in violation of third-party rights. We provide a policy and process for complaints concerning content shared by our Members.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Contact */}
          <AccordionItem value="contact" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="text-xl font-semibold text-dna-forest hover:text-dna-copper">
              10. How To Contact Us
            </AccordionTrigger>
            <AccordionContent className="prose prose-slate max-w-none text-foreground">
              <p>
                For general inquiries, you may contact us through our
                <a href="/contact" className="text-dna-copper hover:underline mx-1">Contact page</a>.
              </p>
              <p className="mt-4">
                <strong>Diaspora Network of Africa</strong><br />
                Email: <a href="mailto:support@diasporanetworkofafrica.org" className="text-dna-copper hover:underline">support@diasporanetworkofafrica.org</a>
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} Diaspora Network of Africa. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserAgreement;
