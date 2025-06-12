import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageCircle, MapPin, Send, Clock, Globe, QrCode } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate form submission - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetInTouch = () => {
    const subject = encodeURIComponent("Inquiry from DNA Platform");
    const body = encodeURIComponent("Hello,\n\nI would like to get in touch regarding the DNA Platform.\n\nBest regards");
    window.location.href = `mailto:aweh@diasporanetwork.africa?subject=${subject}&body=${body}`;
    
    // Show success modal after a brief delay
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 500);
  };

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
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-dna-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600 mb-2">Send us a message anytime</p>
                <a href="mailto:aweh@diasporanetwork.africa" className="text-dna-emerald hover:underline">
                  aweh@diasporanetwork.africa
                </a>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-dna-copper" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Join us on WhatsApp</h3>
                <p className="text-gray-600 mb-2">Chat with our team on WhatsApp</p>
                <Button 
                  variant="ghost"
                  onClick={() => setShowWhatsAppModal(true)}
                  className="text-dna-copper hover:underline p-0 h-auto"
                >
                  Available Mon-Fri, 9AM-6PM GMT
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

          {/* Get in Touch Button */}
          <div className="text-center mb-12">
            <Button 
              onClick={handleGetInTouch}
              className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3 text-lg"
            >
              <Mail className="w-5 h-5 mr-2" />
              Get in Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
            <p className="text-gray-600">
              Fill out the form below and we'll get back to you within 24 hours
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What is this regarding?"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="resize-none"
                    placeholder="Tell us more about your inquiry, partnership opportunity, or how we can help..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="text-center">
                  <Button 
                    type="submit"
                    className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3"
                    disabled={isSubmitting}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How can I join DNA?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  You can join by clicking the "Join Now" button on our homepage and creating your profile. 
                  We welcome all African diaspora professionals, entrepreneurs, and innovators.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is the platform free to use?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Yes, our core networking and collaboration features are free. We also offer premium 
                  features for enhanced visibility and advanced tools for serious projects and partnerships.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do you ensure project quality and legitimacy?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  We have a verification process for all members and projects, community moderation, 
                  and transparent tracking systems to ensure all initiatives meet our standards for impact and authenticity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can organizations partner with DNA Platform?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Absolutely! We welcome partnerships with organizations, governments, NGOs, and businesses 
                  that share our mission. Contact us to discuss collaboration opportunities.
                </p>
              </CardContent>
            </Card>
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

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center text-dna-emerald">
              <Mail className="w-5 h-5" />
              Message Sent Successfully!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Thank you for reaching out! We've received your message and will get back to you within 24 hours.
            </p>
            <p className="text-sm text-gray-600">
              You should also receive a confirmation email at your provided email address.
            </p>
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Contact;
