
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfilePictureSection from './form/ProfilePictureSection';
import BasicInfoSection from './form/BasicInfoSection';
import ProfessionalInfoSection from './form/ProfessionalInfoSection';
import SkillsInterestsSection from './form/SkillsInterestsSection';
import CulturalBackgroundSection from './form/CulturalBackgroundSection';
import CommunityImpactSection from './form/CommunityImpactSection';
import ContactLinksSection from './form/ContactLinksSection';
import MentorshipSection from './form/MentorshipSection';
import AdditionalInfoSection from './form/AdditionalInfoSection';

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
      <ProfilePictureSection
        avatarUrl={avatarUrl}
        fullName={formData.full_name}
        onAvatarChange={setAvatarUrl}
      />

      <BasicInfoSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <ProfessionalInfoSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <SkillsInterestsSection
        skills={skills}
        interests={interests}
        professionalSectors={professionalSectors}
        newSkill={newSkill}
        newInterest={newInterest}
        newSector={newSector}
        onSkillChange={setNewSkill}
        onInterestChange={setNewInterest}
        onSectorChange={setNewSector}
        onAddSkill={addSkill}
        onAddInterest={addInterest}
        onAddSector={addSector}
        onRemoveSkill={removeSkill}
        onRemoveInterest={removeInterest}
        onRemoveSector={removeSector}
      />

      <CulturalBackgroundSection
        formData={formData}
        diasporaNetworks={diasporaNetworks}
        newNetwork={newNetwork}
        onInputChange={handleInputChange}
        onNetworkChange={setNewNetwork}
        onAddNetwork={addNetwork}
        onRemoveNetwork={removeNetwork}
      />

      <CommunityImpactSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <ContactLinksSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <MentorshipSection
        formData={formData}
        mentorshipAreas={mentorshipAreas}
        newMentorshipArea={newMentorshipArea}
        onInputChange={handleInputChange}
        onMentorshipAreaChange={setNewMentorshipArea}
        onAddMentorshipArea={addMentorshipArea}
        onRemoveMentorshipArea={removeMentorshipArea}
      />

      <AdditionalInfoSection
        formData={formData}
        onInputChange={handleInputChange}
      />

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
