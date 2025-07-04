
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  Briefcase
 } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const EnhancedContact = () => {
  useScrollToTop();
  
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      detail: "hello@diasporanetwork.africa",
      description: "For general inquiries and support"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Schedule a Call",
      detail: "Book a 30-minute conversation",
      description: "Perfect for partnership discussions"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Our Locations",
      detail: "Global presence, local impact",
      description: "Offices in Lagos, London, and New York"
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
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4 text-dna-emerald">
                    {method.icon}
                  </div>
                  <h3 className="text-lg font-bold text-dna-forest mb-2">{method.title}</h3>
                  <p className="text-dna-copper font-semibold mb-2">{method.detail}</p>
                  <p className="text-gray-600 text-sm">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-6">Send Us a Message</h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-dna-forest">Contact Form</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inquiry Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    What can we help you with? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {inquiryTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleInquiryTypeSelect(type.id)}
                        className={`p-3 rounded-lg border text-left transition-all duration-200 hover:shadow-md ${
                          formData.inquiryType === type.id
                            ? 'border-dna-emerald bg-dna-emerald/10 text-dna-emerald'
                            : 'border-gray-200 hover:border-dna-emerald/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name and Email Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-dna-emerald focus:ring-dna-emerald/20"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-dna-emerald focus:ring-dna-emerald/20"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:border-dna-emerald focus:ring-dna-emerald/20"
                    placeholder="Brief subject line"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="border-gray-300 focus:border-dna-emerald focus:ring-dna-emerald/20 resize-none"
                    placeholder="Tell us about your inquiry, ideas, or how we can work together..."
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-dna-emerald hover:bg-dna-forest text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Response Time Banner */}
      <section className="py-12 bg-dna-forest text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-dna-gold" />
            <h3 className="text-2xl font-bold">We Respond Quickly</h3>
          </div>
          <p className="text-lg text-gray-200">
            Our team typically responds to inquiries within 24 hours. For urgent matters, 
            please email us directly at hello@diasporanetwork.africa
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EnhancedContact;
