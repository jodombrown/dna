import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Plus } from 'lucide-react';

interface EnhancedProfileFormProps {
  profile?: any;
  onSave?: () => void;
}

const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({ profile, onSave }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || user?.email || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    linkedin_url: profile?.linkedin_url || '',
    website_url: profile?.website_url || '',
    phone: profile?.phone || '',
    profession: profile?.profession || '',
    company: profile?.company || '',
    years_experience: profile?.years_experience || '',
    education: profile?.education || '',
    certifications: profile?.certifications || '',
    languages: profile?.languages || '',
    country_of_origin: profile?.country_of_origin || '',
    current_country: profile?.current_country || '',
    innovation_pathways: profile?.innovation_pathways || '',
    achievements: profile?.achievements || '',
    is_public: profile?.is_public !== false,
    availability_for_mentoring: profile?.availability_for_mentoring || false,
    looking_for_opportunities: profile?.looking_for_opportunities || false,
    years_in_diaspora: profile?.years_in_diaspora || '',
    community_involvement: profile?.community_involvement || '',
    giving_back_initiatives: profile?.giving_back_initiatives || '',
    home_country_projects: profile?.home_country_projects || '',
    volunteer_experience: profile?.volunteer_experience || '',
  });

  const [skills, setSkills] = useState<string[]>(
    profile?.skills ? (Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',').map((s: string) => s.trim())) : []
  );
  const [interests, setInterests] = useState<string[]>(
    profile?.interests ? (Array.isArray(profile.interests) ? profile.interests : profile.interests.split(',').map((s: string) => s.trim())) : []
  );
  const [professionalSectors, setProfessionalSectors] = useState<string[]>(
    profile?.professional_sectors ? (Array.isArray(profile.professional_sectors) ? profile.professional_sectors : []) : []
  );
  const [diasporaNetworks, setDiasporaNetworks] = useState<string[]>(
    profile?.diaspora_networks ? (Array.isArray(profile.diaspora_networks) ? profile.diaspora_networks : []) : []
  );
  const [mentorshipAreas, setMentorshipAreas] = useState<string[]>(
    profile?.mentorship_areas ? (Array.isArray(profile.mentorship_areas) ? profile.mentorship_areas : []) : []
  );

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newNetwork, setNewNetwork] = useState('');
  const [newMentorshipArea, setNewMentorshipArea] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const addSector = () => {
    if (newSector.trim() && !professionalSectors.includes(newSector.trim())) {
      setProfessionalSectors([...professionalSectors, newSector.trim()]);
      setNewSector('');
    }
  };

  const removeSector = (sectorToRemove: string) => {
    setProfessionalSectors(professionalSectors.filter(sector => sector !== sectorToRemove));
  };

  const addNetwork = () => {
    if (newNetwork.trim() && !diasporaNetworks.includes(newNetwork.trim())) {
      setDiasporaNetworks([...diasporaNetworks, newNetwork.trim()]);
      setNewNetwork('');
    }
  };

  const removeNetwork = (networkToRemove: string) => {
    setDiasporaNetworks(diasporaNetworks.filter(network => network !== networkToRemove));
  };

  const addMentorshipArea = () => {
    if (newMentorshipArea.trim() && !mentorshipAreas.includes(newMentorshipArea.trim())) {
      setMentorshipAreas([...mentorshipAreas, newMentorshipArea.trim()]);
      setNewMentorshipArea('');
    }
  };

  const removeMentorshipArea = (areaToRemove: string) => {
    setMentorshipAreas(mentorshipAreas.filter(area => area !== areaToRemove));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...formData,
          avatar_url: avatarUrl,
          skills: skills,
          interests: interests,
          professional_sectors: professionalSectors,
          diaspora_networks: diasporaNetworks,
          mentorship_areas: mentorshipAreas,
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
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Avatar className="w-32 h-32">
            <AvatarImage src={avatarUrl} alt={formData.full_name} />
            <AvatarFallback className="bg-dna-copper text-white text-2xl">
              {formData.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Current Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                placeholder="Software Engineer, Doctor, etc."
              />
            </div>
            <div>
              <Label htmlFor="company">Company/Organization</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Company name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="years_experience">Years of Experience</Label>
            <Input
              id="years_experience"
              type="number"
              value={formData.years_experience}
              onChange={(e) => handleInputChange('years_experience', e.target.value)}
              placeholder="5"
            />
          </div>

          <div>
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              placeholder="University, degree, certifications..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diaspora-Specific Professional Sectors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Professional Sectors</CardTitle>
          <CardDescription>Industries and sectors important to the diaspora community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Professional Sectors</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                placeholder="Healthcare, Technology, Finance, Education..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSector())}
              />
              <Button type="button" onClick={addSector} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {professionalSectors.map((sector, index) => (
                <Badge key={index} variant="outline" className="text-dna-emerald border-dna-emerald">
                  {sector}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeSector(sector)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Skills & Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-dna-forest border-dna-forest">
                  {skill}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Interests</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              />
              <Button type="button" onClick={addInterest} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <Badge key={index} variant="outline" className="text-dna-copper border-dna-copper">
                  {interest}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Background & Diaspora Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Cultural Background & Diaspora Identity</CardTitle>
          <CardDescription>Your cultural heritage and diaspora journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country_of_origin">Country of Origin</Label>
              <Input
                id="country_of_origin"
                value={formData.country_of_origin}
                onChange={(e) => handleInputChange('country_of_origin', e.target.value)}
                placeholder="Nigeria, Ghana, Kenya, etc."
              />
            </div>
            <div>
              <Label htmlFor="current_country">Current Country</Label>
              <Input
                id="current_country"
                value={formData.current_country}
                onChange={(e) => handleInputChange('current_country', e.target.value)}
                placeholder="United States, Canada, UK, etc."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="years_in_diaspora">Years in Diaspora</Label>
              <Input
                id="years_in_diaspora"
                type="number"
                value={formData.years_in_diaspora}
                onChange={(e) => handleInputChange('years_in_diaspora', e.target.value)}
                placeholder="5"
              />
            </div>
            <div>
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                value={formData.languages}
                onChange={(e) => handleInputChange('languages', e.target.value)}
                placeholder="English, French, Yoruba, Swahili, etc."
              />
            </div>
          </div>

          <div>
            <Label>Diaspora Networks & Organizations</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newNetwork}
                onChange={(e) => setNewNetwork(e.target.value)}
                placeholder="African diaspora organizations you're part of..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNetwork())}
              />
              <Button type="button" onClick={addNetwork} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {diasporaNetworks.map((network, index) => (
                <Badge key={index} variant="outline" className="text-dna-gold border-dna-gold">
                  {network}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeNetwork(network)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Impact & Giving Back */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Community Impact & Giving Back</CardTitle>
          <CardDescription>Your contributions to diaspora and home country communities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="community_involvement">Community Involvement</Label>
            <Textarea
              id="community_involvement"
              value={formData.community_involvement}
              onChange={(e) => handleInputChange('community_involvement', e.target.value)}
              placeholder="Describe your involvement in diaspora or local communities..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="giving_back_initiatives">Giving Back Initiatives</Label>
            <Textarea
              id="giving_back_initiatives"
              value={formData.giving_back_initiatives}
              onChange={(e) => handleInputChange('giving_back_initiatives', e.target.value)}
              placeholder="Projects or initiatives focused on giving back to your home country or diaspora community..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="home_country_projects">Home Country Projects</Label>
            <Textarea
              id="home_country_projects"
              value={formData.home_country_projects}
              onChange={(e) => handleInputChange('home_country_projects', e.target.value)}
              placeholder="Specific projects or contributions to home country development..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="volunteer_experience">Volunteer Experience</Label>
            <Textarea
              id="volunteer_experience"
              value={formData.volunteer_experience}
              onChange={(e) => handleInputChange('volunteer_experience', e.target.value)}
              placeholder="Volunteer work within diaspora or home country communities..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Contact & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
            <Input
              id="linkedin_url"
              value={formData.linkedin_url}
              onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div>
            <Label htmlFor="website_url">Website/Portfolio</Label>
            <Input
              id="website_url"
              value={formData.website_url}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mentorship & Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Mentorship & Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Mentorship Areas</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newMentorshipArea}
                onChange={(e) => setNewMentorshipArea(e.target.value)}
                placeholder="Career development, entrepreneurship, cultural adaptation..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMentorshipArea())}
              />
              <Button type="button" onClick={addMentorshipArea} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {mentorshipAreas.map((area, index) => (
                <Badge key={index} variant="outline" className="text-dna-crimson border-dna-crimson">
                  {area}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeMentorshipArea(area)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Available for Mentoring</Label>
              <p className="text-sm text-gray-600">Let other diaspora members know you're available to mentor</p>
            </div>
            <Switch
              checked={formData.availability_for_mentoring}
              onCheckedChange={(checked) => handleInputChange('availability_for_mentoring', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Looking for Opportunities</Label>
              <p className="text-sm text-gray-600">Show that you're open to new opportunities</p>
            </div>
            <Switch
              checked={formData.looking_for_opportunities}
              onCheckedChange={(checked) => handleInputChange('looking_for_opportunities', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Profile</Label>
              <p className="text-sm text-gray-600">Make your profile visible to other diaspora members</p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => handleInputChange('is_public', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dna-forest">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="innovation_pathways">Innovation Pathways & Impact</Label>
            <Textarea
              id="innovation_pathways"
              value={formData.innovation_pathways}
              onChange={(e) => handleInputChange('innovation_pathways', e.target.value)}
              placeholder="Describe your innovation journey and impact..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="achievements">Key Achievements</Label>
            <Textarea
              id="achievements"
              value={formData.achievements}
              onChange={(e) => handleInputChange('achievements', e.target.value)}
              placeholder="Notable achievements, awards, recognitions..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea
              id="certifications"
              value={formData.certifications}
              onChange={(e) => handleInputChange('certifications', e.target.value)}
              placeholder="Professional certifications..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button 
          type="submit" 
          className="bg-dna-copper hover:bg-dna-gold text-white px-8"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};

export default EnhancedProfileForm;

</initial_code>
