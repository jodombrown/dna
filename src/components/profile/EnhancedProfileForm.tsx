
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X, Plus } from 'lucide-react';

interface EnhancedProfileFormProps {
  profile?: any;
  onSave?: () => void;
}

const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({ profile, onSave }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    profession: profile?.profession || '',
    company: profile?.company || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    linkedin_url: profile?.linkedin_url || '',
    website_url: profile?.website_url || '',
    years_experience: profile?.years_experience || '',
    education: profile?.education || '',
    certifications: profile?.certifications || '',
    languages: profile?.languages || '',
    skills: profile?.skills || '',
    interests: profile?.interests || '',
    innovation_pathways: profile?.innovation_pathways || '',
    achievements: profile?.achievements || '',
    phone: profile?.phone || '',
    country_of_origin: profile?.country_of_origin || '',
    current_country: profile?.current_country || '',
    availability_for_mentoring: profile?.availability_for_mentoring || false,
    looking_for_opportunities: profile?.looking_for_opportunities || false,
  });

  const [skillsList, setSkillsList] = useState<string[]>(
    profile?.skills ? profile.skills.split(',').map((s: string) => s.trim()) : []
  );
  const [newSkill, setNewSkill] = useState('');

  const [interestsList, setInterestsList] = useState<string[]>(
    profile?.interests ? profile.interests.split(',').map((s: string) => s.trim()) : []
  );
  const [newInterest, setNewInterest] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      const updatedSkills = [...skillsList, newSkill.trim()];
      setSkillsList(updatedSkills);
      setFormData(prev => ({ ...prev, skills: updatedSkills.join(', ') }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skillsList.filter(skill => skill !== skillToRemove);
    setSkillsList(updatedSkills);
    setFormData(prev => ({ ...prev, skills: updatedSkills.join(', ') }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interestsList.includes(newInterest.trim())) {
      const updatedInterests = [...interestsList, newInterest.trim()];
      setInterestsList(updatedInterests);
      setFormData(prev => ({ ...prev, interests: updatedInterests.join(', ') }));
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    const updatedInterests = interestsList.filter(interest => interest !== interestToRemove);
    setInterestsList(updatedInterests);
    setFormData(prev => ({ ...prev, interests: updatedInterests.join(', ') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      if (onSave) onSave();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Professional Profile</CardTitle>
          <CardDescription>
            Build your comprehensive professional profile to connect with the diaspora community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Current Profession</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => handleChange('profession', e.target.value)}
                    placeholder="e.g. Software Engineer, Doctor, Entrepreneur"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="Current company or organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    value={formData.years_experience}
                    onChange={(e) => handleChange('years_experience', e.target.value)}
                    placeholder="e.g. 5 years"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Current Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Cultural Background */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Cultural Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_of_origin">Country of Origin</Label>
                  <Input
                    id="country_of_origin"
                    value={formData.country_of_origin}
                    onChange={(e) => handleChange('country_of_origin', e.target.value)}
                    placeholder="Your African country of origin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_country">Current Country</Label>
                  <Input
                    id="current_country"
                    value={formData.current_country}
                    onChange={(e) => handleChange('current_country', e.target.value)}
                    placeholder="Where you currently live"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => handleChange('languages', e.target.value)}
                    placeholder="English, French, Swahili, etc."
                  />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Professional Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Tell us about your professional background, experience, and connection to Africa..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    placeholder="Your educational background, degrees, institutions..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => handleChange('certifications', e.target.value)}
                    placeholder="Professional certifications, licenses, awards..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achievements">Key Achievements</Label>
                  <Textarea
                    id="achievements"
                    value={formData.achievements}
                    onChange={(e) => handleChange('achievements', e.target.value)}
                    placeholder="Notable accomplishments, projects, recognition..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Skills & Expertise</h3>
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillsList.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-dna-forest border-dna-forest">
                      {skill}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Interests & Passion Areas</h3>
              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  />
                  <Button type="button" onClick={addInterest} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {interestsList.map((interest) => (
                    <Badge key={interest} variant="outline" className="text-dna-copper border-dna-copper">
                      {interest}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Innovation Pathways */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Innovation & Impact</h3>
              <div className="space-y-2">
                <Label htmlFor="innovation_pathways">Innovation Pathways Involvement</Label>
                <Textarea
                  id="innovation_pathways"
                  value={formData.innovation_pathways}
                  onChange={(e) => handleChange('innovation_pathways', e.target.value)}
                  placeholder="Describe your involvement in innovation projects, startups, or initiatives that impact Africa..."
                  rows={3}
                />
              </div>
            </div>

            {/* Contact & Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Contact & Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">Personal Website</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleChange('website_url', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Availability Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dna-forest">Community Engagement</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="availability_for_mentoring"
                    checked={formData.availability_for_mentoring}
                    onChange={(e) => handleChange('availability_for_mentoring', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="availability_for_mentoring">Available for mentoring</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="looking_for_opportunities"
                    checked={formData.looking_for_opportunities}
                    onChange={(e) => handleChange('looking_for_opportunities', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="looking_for_opportunities">Looking for opportunities</Label>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-dna-copper hover:bg-dna-gold text-white"
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : 'Save Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedProfileForm;
