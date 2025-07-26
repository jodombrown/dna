import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import WaitlistSlideIn from '@/components/waitlist/WaitlistSlideIn';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  Clock,
  Users,
  MessageSquare,
  Lightbulb,
  Briefcase,
  MessageCircle,
  Sparkles
 } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Contact = () => {
  useScrollToTop();
  
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: ''
  });

  const inquiryTypes = [
    { id: 'general', label: 'General Inquiry', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'partnership', label: 'Partnership', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'feedback', label: 'Platform Feedback', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'community', label: 'Community Building', icon: <Users className="w-4 h-4" /> }
  ];

  const contactMethods = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Let's Connect on WhatsApp",
      detail: "Join our community chat",
      description: "Have a question or ready to get involved? Chat with our team directly.",
      onClick: () => setShowWhatsAppModal(true)
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      detail: "aweh@diasporanetwork.africa",
      description: "For general inquiries and support"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Join the DNA Community",
      detail: "Be the first to connect",
      description: "Get early access to our platform and exclusive community events",
      component: 'waitlist'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInquiryTypeSelect = (type: string) => {
    setFormData(prev => ({ ...prev, inquiryType: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill in all required fields",
        description: "Name, email, and message are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: ''
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-dna-copper/10 text-dna-copper border-dna-copper/20 mb-6">
              Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-dna-forest mb-6">
              Let's Build Together
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Whether you have questions, ideas, or want to partner with us, we'd love to hear from you. 
              Let's explore how we can work together to advance Africa's development.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <Card 
                key={index} 
                className={`border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ${method.onClick || method.component ? 'cursor-pointer' : ''}`}
                onClick={method.onClick}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4 text-dna-emerald">
                    {method.icon}
                  </div>
                  <h3 className="text-lg font-bold text-dna-forest mb-2">{method.title}</h3>
                  <p className="text-dna-copper font-semibold mb-2">{method.detail}</p>
                  <p className="text-gray-600 text-sm">{method.description}</p>
                  {method.onClick && (
                    <Button 
                      onClick={method.onClick}
                      className="bg-dna-copper hover:bg-dna-gold text-white mt-4"
                    >
                      Join Our Community
                    </Button>
                  )}
                  {method.component === 'waitlist' && (
                    <WaitlistSlideIn>
                      <Button 
                        className="bg-gradient-to-r from-dna-emerald to-dna-copper hover:from-dna-forest hover:to-dna-gold text-white mt-4 w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Join Waitlist
                      </Button>
                    </WaitlistSlideIn>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-dna-mint/30 via-dna-mint/20 to-dna-emerald/15 rounded-2xl p-8 border border-dna-emerald/10">
            <div className="w-16 h-16 bg-gradient-to-br from-dna-emerald via-dna-copper to-dna-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-dna-forest mb-4">
              Ready to Join the DNA Community?
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Be the first to connect with the global African diaspora when we launch. 
              Join our waitlist to get early access and help shape the future of diaspora collaboration.
            </p>
            <div className="flex flex-col gap-6 justify-center items-center">
              <WaitlistSlideIn>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-dna-emerald to-dna-copper hover:from-dna-forest hover:to-dna-gold text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Join Waitlist
                </Button>
              </WaitlistSlideIn>
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  🎯 Get early access
                </span>
                <span className="flex items-center gap-1">
                  📧 Platform updates
                </span>
                <span className="flex items-center gap-1">
                  🤝 Exclusive events
                </span>
              </div>
            </div>
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