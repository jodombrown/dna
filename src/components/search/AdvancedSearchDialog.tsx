
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Users, Briefcase, MapPin, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdvancedSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedSearchDialog: React.FC<AdvancedSearchDialogProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin_url: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please fill in your name and email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-universal-email', {
        body: {
          formType: 'feedback',
          formData: {
            name: formData.name,
            email: formData.email,
            linkedin_url: formData.linkedin_url,
            feedback: formData.message || 'User provided feedback about advanced search features.',
            pageType: 'Advanced Search Features'
          },
          userEmail: formData.email
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Thank you for your feedback! We\'ve sent you a confirmation email.');
        setFormData({ name: '', email: '', linkedin_url: '', message: '' });
        onClose();
      } else {
        throw new Error(data?.error || 'Failed to send feedback');
      }
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[500px] sm:max-w-[500px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-dna-emerald" />
              Advanced Search Features
            </SheetTitle>
            <SheetDescription>
              Discover how our advanced search will help you find the perfect connections in the African diaspora network.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-6">
              {/* Feature Preview */}
              <div className="space-y-4">
                <div className="bg-dna-emerald/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-dna-forest mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Smart Professional Matching
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Our AI-powered search will find professionals based on:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Industry Expertise</Badge>
                    <Badge variant="outline">Cultural Background</Badge>
                    <Badge variant="outline">Geographic Location</Badge>
                    <Badge variant="outline">Career Level</Badge>
                  </div>
                </div>

                <div className="bg-dna-copper/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-dna-forest mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Advanced Filters
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Filter by specific criteria including:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Skills & Expertise</Badge>
                    <Badge variant="outline">Company Size</Badge>
                    <Badge variant="outline">Investment Interests</Badge>
                    <Badge variant="outline">Mentorship Availability</Badge>
                  </div>
                </div>

                <div className="bg-dna-gold/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-dna-forest mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Global Diaspora Network
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Connect across continents with professionals in:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">North America</Badge>
                    <Badge variant="outline">Europe</Badge>
                    <Badge variant="outline">Africa</Badge>
                    <Badge variant="outline">Asia-Pacific</Badge>
                  </div>
                </div>
              </div>

              {/* Interest Form */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-dna-forest mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Help Shape Our Search Experience
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tell us what search features matter most to you:
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        disabled={isSubmitting}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        required
                        disabled={isSubmitting}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin_url" className="text-sm font-medium">
                        LinkedIn URL (Optional)
                      </Label>
                      <Input
                        id="linkedin_url"
                        name="linkedin_url"
                        type="url"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                        disabled={isSubmitting}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-medium">
                        What search features do you need most?
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about the search capabilities that would help you connect with the right professionals..."
                        rows={3}
                        className="resize-none mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Share Feedback'}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Maybe Later
                    </Button>
                  </div>
                </form>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  Want to try the current search functionality?
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={() => {
                    onClose();
                    navigate('/search');
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Go to Search Page
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedSearchDialog;
