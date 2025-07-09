import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown, Plus, X, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContributorVerificationModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ContributorVerificationModal = ({ 
  children, 
  isOpen, 
  onOpenChange 
}: ContributorVerificationModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>(['']);
  const [impactType, setImpactType] = useState('');
  const [countryFocus, setCountryFocus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const impactTypes = [
    { value: 'startup', label: 'Startup/Business', description: 'Founded or led impactful ventures' },
    { value: 'policy', label: 'Policy/Advocacy', description: 'Influenced policy or social change' },
    { value: 'research', label: 'Research/Innovation', description: 'Advanced knowledge or technology' },
    { value: 'education', label: 'Education', description: 'Created learning opportunities or curricula' },
    { value: 'infrastructure', label: 'Infrastructure', description: 'Built physical or digital infrastructure' },
    { value: 'community', label: 'Community Building', description: 'Organized communities or movements' },
    { value: 'other', label: 'Other', description: 'Other meaningful contributions' }
  ];

  const africanCountries = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 
    'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 
    'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 
    'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 
    'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 
    'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 
    'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'São Tomé and Príncipe', 
    'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 
    'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ];

  const handleAddLink = () => {
    setEvidenceLinks([...evidenceLinks, '']);
  };

  const handleRemoveLink = (index: number) => {
    setEvidenceLinks(evidenceLinks.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...evidenceLinks];
    newLinks[index] = value;
    setEvidenceLinks(newLinks);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request verification.",
        variant: "destructive"
      });
      return;
    }

    if (!description.trim() || !impactType || !countryFocus) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty evidence links
      const validLinks = evidenceLinks.filter(link => link.trim());

      const { error } = await supabase
        .from('adin_contributor_requests')
        .insert({
          user_id: user.id,
          description: description.trim(),
          evidence_links: validLinks.length > 0 ? validLinks : null,
          impact_type: impactType,
          country_focus: countryFocus,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Verification Request Submitted",
        description: "Your request has been submitted for admin review. You'll be notified of the decision.",
      });

      // Reset form
      setDescription('');
      setEvidenceLinks(['']);
      setImpactType('');
      setCountryFocus('');
      
      // Close modal
      const shouldClose = onOpenChange ? onOpenChange : setOpen;
      shouldClose(false);

    } catch (error) {
      console.error('Error submitting verification request:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-dna-gold" />
          Request Contributor Verification
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Info Banner */}
        <div className="bg-dna-gold/10 border border-dna-gold/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-dna-gold mt-0.5" />
            <div>
              <h4 className="font-semibold text-dna-gold mb-1">About Contributor Verification</h4>
              <p className="text-sm text-gray-700">
                Verified Contributors are individuals who have made meaningful, documented contributions 
                to African progress. This badge enhances your credibility and gives your content higher 
                visibility on the DNA platform.
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Describe Your Contribution or Project *
          </Label>
          <Textarea
            id="description"
            placeholder="Provide a detailed description of your contribution to African progress. Include specifics about impact, scale, and outcomes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-gray-500">
            Be specific about what you built, led, or accomplished and its impact on African communities.
          </p>
        </div>

        {/* Evidence Links */}
        <div className="space-y-2">
          <Label>Supporting Evidence (Optional)</Label>
          <p className="text-xs text-gray-500 mb-3">
            Provide links to websites, articles, social media, or other documentation that supports your contribution.
          </p>
          
          {evidenceLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="https://example.com/my-project"
                value={link}
                onChange={(e) => handleLinkChange(index, e.target.value)}
              />
              {evidenceLinks.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveLink(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLink}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Link
          </Button>
        </div>

        {/* Impact Type */}
        <div className="space-y-2">
          <Label htmlFor="impact-type">Impact Type *</Label>
          <Select value={impactType} onValueChange={setImpactType}>
            <SelectTrigger>
              <SelectValue placeholder="Select the type of impact you've made" />
            </SelectTrigger>
            <SelectContent>
              {impactTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country Focus */}
        <div className="space-y-2">
          <Label htmlFor="country-focus">Primary Country/Region of Impact *</Label>
          <Select value={countryFocus} onValueChange={setCountryFocus}>
            <SelectTrigger>
              <SelectValue placeholder="Select the main country or region where your impact occurred" />
            </SelectTrigger>
            <SelectContent className="max-h-48">
              <SelectItem value="continental">Continental Africa</SelectItem>
              <SelectItem value="diaspora-global">Global Diaspora</SelectItem>
              {africanCountries.map((country) => (
                <SelectItem key={country} value={country.toLowerCase()}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !description.trim() || !impactType || !countryFocus}
            className="flex-1 bg-dna-gold hover:bg-dna-gold/90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const shouldClose = onOpenChange ? onOpenChange : setOpen;
              shouldClose(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  if (children) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        {modalContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Crown className="h-4 w-4" />
          Request Contributor Verification
        </Button>
      </DialogTrigger>
      {modalContent}
    </Dialog>
  );
};

export default ContributorVerificationModal;