
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProfileFormState } from './hooks/useProfileFormState';
import { useProfileFormArrays } from './hooks/useProfileFormArrays';
import { useProfileFormDraft } from './hooks/useProfileFormDraft';
import { handleProfileSubmission } from './ProfileFormSubmission';
import ProfilePictureSection from './ProfilePictureSection';
import BasicInfoSection from './BasicInfoSection';
import ProfessionalInfoSection from './ProfessionalInfoSection';
import SkillsInterestsSection from './SkillsInterestsSection';
import CulturalBackgroundSection from './CulturalBackgroundSection';
import CommunityImpactSection from './CommunityImpactSection';
import ContactLinksSection from './ContactLinksSection';
import MentorshipSection from './MentorshipSection';
import AdditionalInfoSection from './AdditionalInfoSection';

interface ProfileFormContainerProps {
  profile?: any;
  onSave?: () => void;
}

const ProfileFormContainer: React.FC<ProfileFormContainerProps> = ({ profile, onSave }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state management
  const {
    formData,
    arrayStates,
    helperStates,
    updateFormField,
    updateArrayField,
    updateHelperField,
  } = useProfileFormState({ profile, user });

  // Array field handlers
  const arrayHandlers = useProfileFormArrays({
    arrayStates,
    helperStates,
    updateArrayField,
    updateHelperField,
  });

  // Draft management
  const { clearDraft } = useProfileFormDraft({
    formData,
    arrayStates,
    helperStates,
    updateFormField,
    updateArrayField,
    updateHelperField,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await handleProfileSubmission(
        user.id,
        formData,
        arrayStates,
        helperStates.avatarUrl,
        helperStates.bannerUrl
      );
      
      clearDraft();
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

  const handleCancel = () => {
    if (window.confirm("Cancel editing and discard unsaved changes?")) {
      clearDraft();
      toast({ 
        title: "Edits canceled", 
        description: "All unsaved changes have been discarded." 
      });
      if (onSave) onSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfilePictureSection
        avatarUrl={helperStates.avatarUrl}
        bannerUrl={helperStates.bannerUrl}
        fullName={formData.full_name}
        onAvatarChange={(url) => updateHelperField('avatarUrl', url)}
        onBannerChange={(url) => updateHelperField('bannerUrl', url)}
      />

      <BasicInfoSection
        formData={formData}
        impactAreas={arrayStates.impactAreas}
        engagementIntentions={arrayStates.engagementIntentions}
        onInputChange={updateFormField}
        onImpactAreasChange={(areas) => updateArrayField('impactAreas', areas)}
        onEngagementIntentionsChange={(intentions) => updateArrayField('engagementIntentions', intentions)}
      />

      <ProfessionalInfoSection
        formData={formData}
        skillsOffered={arrayStates.skillsOffered}
        skillsNeeded={arrayStates.skillsNeeded}
        availableFor={arrayStates.availableFor}
        onInputChange={updateFormField}
        onSkillsOfferedChange={(skills) => updateArrayField('skillsOffered', skills)}
        onSkillsNeededChange={(skills) => updateArrayField('skillsNeeded', skills)}
        onAvailableForChange={(available) => updateArrayField('availableFor', available)}
      />

      <SkillsInterestsSection
        skills={arrayStates.skills}
        interests={arrayStates.interests}
        professionalSectors={arrayStates.professionalSectors}
        newSkill={helperStates.newSkill}
        newInterest={helperStates.newInterest}
        newSector={helperStates.newSector}
        onSkillChange={(skill) => updateHelperField('newSkill', skill)}
        onInterestChange={(interest) => updateHelperField('newInterest', interest)}
        onSectorChange={(sector) => updateHelperField('newSector', sector)}
        onAddSkill={arrayHandlers.skillsHandlers.add}
        onAddInterest={arrayHandlers.interestsHandlers.add}
        onAddSector={arrayHandlers.sectorsHandlers.add}
        onRemoveSkill={arrayHandlers.skillsHandlers.remove}
        onRemoveInterest={arrayHandlers.interestsHandlers.remove}
        onRemoveSector={arrayHandlers.sectorsHandlers.remove}
      />

      <CulturalBackgroundSection
        formData={formData}
        diasporaNetworks={arrayStates.diasporaNetworks}
        newNetwork={helperStates.newNetwork}
        onInputChange={updateFormField}
        onNetworkChange={(network) => updateHelperField('newNetwork', network)}
        onAddNetwork={arrayHandlers.networksHandlers.add}
        onRemoveNetwork={arrayHandlers.networksHandlers.remove}
      />

      <CommunityImpactSection
        formData={formData}
        onInputChange={updateFormField}
      />

      <ContactLinksSection
        formData={formData}
        onInputChange={updateFormField}
      />

      <MentorshipSection
        formData={formData}
        mentorshipAreas={arrayStates.mentorshipAreas}
        newMentorshipArea={helperStates.newMentorshipArea}
        onInputChange={updateFormField}
        onMentorshipAreaChange={(area) => updateHelperField('newMentorshipArea', area)}
        onAddMentorshipArea={arrayHandlers.mentorshipAreasHandlers.add}
        onRemoveMentorshipArea={arrayHandlers.mentorshipAreasHandlers.remove}
      />

      <AdditionalInfoSection
        formData={formData}
        onInputChange={updateFormField}
      />

      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={handleCancel} 
          disabled={loading}
        >
          Cancel
        </Button>
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

export default ProfileFormContainer;
