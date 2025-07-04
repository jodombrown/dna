
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MessageCircle, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Contact = () => {
  useScrollToTop();
  
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqItems = [
    {
      question: "How can I get involved in DNA initiatives?",
      answer: "You can join our community via WhatsApp, subscribe to updates, and explore our Connect, Collaborate, and Contribute opportunities across the platform."
    },
    {
      question: "Is the platform free to use?",
      answer: "Yes, our core networking and collaboration features are free. We also offer premium features for enhanced visibility and advanced tools for serious projects and partnerships."
    },
    {
      question: "How do you ensure project quality and legitimacy?",
      answer: "We have a verification process for all members and projects, community moderation, and transparent tracking systems to ensure all initiatives meet our standards for impact and authenticity."
    },
    {
      question: "Can organizations partner with DNA Platform?",
      answer: "Absolutely! We welcome partnerships with organizations, governments, NGOs, and businesses that share our mission. Contact us to discuss collaboration opportunities."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-dna-emerald text-white mb-4">Get in Touch</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Contact <span className="text-dna-emerald">Us</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our platform? Want to partner with us? 
              We'd love to hear from you and explore how we can work together.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="text-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
              <CardContent 
                className="pt-6"
                onClick={() => setShowWhatsAppModal(true)}
              >
                <div className="w-16 h-16 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-dna-copper" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Let's Connect on WhatsApp</h3>
                <p className="text-gray-600 mb-4">Have a question or ready to get involved? Chat with our team directly.</p>
                <Button 
                  onClick={() => setShowWhatsAppModal(true)}
                  className="bg-dna-copper hover:bg-dna-gold text-white"
                >
                  Join Our Community
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-dna-forest" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Reach</h3>
                <p className="text-gray-600 mb-2">Serving diaspora worldwide</p>
                <span className="text-dna-forest">50+ Countries Connected</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <Collapsible open={openFAQ === index} onOpenChange={(isOpen) => setOpenFAQ(isOpen ? index : null)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {item.question}
                        {openFAQ === index ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <p className="text-gray-700">{item.answer}</p>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Modal */}
      <Dialog open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center">
              <MessageCircle className="w-5 h-5 text-dna-copper" />
              Join Our WhatsApp Group
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <img 
                src="/lovable-uploads/dea2fe8e-c718-403d-b6be-24cd5152c4a4.png" 
                alt="WhatsApp QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">
                📱 <strong>On Mobile:</strong> Click the button below to join directly
              </p>
              <p className="text-sm text-gray-600 font-medium">
                💻 <strong>On Desktop:</strong> Scan the QR code above with your phone's camera or WhatsApp app
              </p>
            </div>
            <Button 
              asChild
              className="bg-dna-copper hover:bg-dna-gold text-white w-full"
            >
              <a 
                href="https://chat.whatsapp.com/GXZrIElj1gY2UZYVm6J8zh" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Click Here to Join WhatsApp Group
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Contact;
