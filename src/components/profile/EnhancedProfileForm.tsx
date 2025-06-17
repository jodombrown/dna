import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProfilePictureSection from './form/ProfilePictureSection';
import BasicInfoSection from './form/BasicInfoSection';
import ProfessionalInfoSection from './form/ProfessionalInfoSection';
import SkillsInterestsSection from './form/SkillsInterestsSection';
import CulturalBackgroundSection from './form/CulturalBackgroundSection';
import CommunityImpactSection from './form/CommunityImpactSection';
import ContactLinksSection from './form/ContactLinksSection';
import MentorshipSection from './form/MentorshipSection';
import AdditionalInfoSection from './form/AdditionalInfoSection';
import { useFormState } from './form/FormStateManager';
import { createArrayHandlers } from './form/ArrayFieldHandlers';
import { handleProfileSubmission } from './form/ProfileFormSubmission';

interface EnhancedProfileFormProps {
  profile?: any;
  onSave?: () => void;
}

const DRAFT_KEY = "dna-profile-draft";

const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({ profile, onSave }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    formData,
    arrayStates,
    helperStates,
    handleInputChange,
    updateArrayState,
    updateHelperState,
  } = useFormState(profile, user);

  // Draft: Load on mount
  useEffect(() => {
    const local = localStorage.getItem(DRAFT_KEY);
    if (local) {
      try {
        // EXPLICIT CASTING for types
        const parsed = JSON.parse(local);
        const f = parsed.formData as import("./form/FormDataTypes").FormData;
        const a = parsed.arrayStates as import("./form/FormDataTypes").ArrayStates;
        const h = parsed.helperStates as import("./form/FormDataTypes").HelperStates;
        if (f && a && h) {
          handleRestoreDraft(f, a, h);
        }
      } catch {}
    }
    // eslint-disable-next-line
  }, []);

  // Draft: Save on changes (debounced for perf)
  useEffect(() => {
    const save = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ formData, arrayStates, helperStates })
      );
    }, 700);
    return () => clearTimeout(save);
  }, [formData, arrayStates, helperStates]);

  // Set correct arg types for handleRestoreDraft
  const handleRestoreDraft = (
    f: import("./form/FormDataTypes").FormData,
    a: import("./form/FormDataTypes").ArrayStates,
    h: import("./form/FormDataTypes").HelperStates
  ) => {
    Object.entries(f).forEach(([k, v]) => handleInputChange(k, v));
    Object.entries(a).forEach(([k, v]) => updateArrayState(k as any, v as string[]));
    Object.entries(h).forEach(([k, v]) => updateHelperState(k as any, v as string));
  };

  const {
    addSkill,
    removeSkill,
    addInterest,
    removeInterest,
    addSector,
    removeSector,
    addNetwork,
    removeNetwork,
    addMentorshipArea,
    removeMentorshipArea,
  } = createArrayHandlers(arrayStates, helperStates, updateArrayState, updateHelperState);

  const handleClearDraft = () => localStorage.removeItem(DRAFT_KEY);

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
      handleClearDraft();
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
    handleClearDraft();
    toast({ title: "Edits canceled", description: "All unsaved changes have been discarded." });
    if (window.confirm("Cancel editing and discard unsaved changes?")) {
      if (onSave) onSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfilePictureSection
        avatarUrl={helperStates.avatarUrl}
        bannerUrl={helperStates.bannerUrl}
        fullName={formData.full_name}
        onAvatarChange={(url) => updateHelperState('avatarUrl', url)}
        onBannerChange={(url) => updateHelperState('bannerUrl', url)}
      />

      <BasicInfoSection
        formData={formData}
        impactAreas={arrayStates.impactAreas}
        engagementIntentions={arrayStates.engagementIntentions}
        onInputChange={handleInputChange}
        onImpactAreasChange={(areas) => updateArrayState('impactAreas', areas)}
        onEngagementIntentionsChange={(intentions) => updateArrayState('engagementIntentions', intentions)}
      />

      <ProfessionalInfoSection
        formData={formData}
        skillsOffered={arrayStates.skillsOffered}
        skillsNeeded={arrayStates.skillsNeeded}
        availableFor={arrayStates.availableFor}
        onInputChange={handleInputChange}
        onSkillsOfferedChange={(skills) => updateArrayState('skillsOffered', skills)}
        onSkillsNeededChange={(skills) => updateArrayState('skillsNeeded', skills)}
        onAvailableForChange={(available) => updateArrayState('availableFor', available)}
      />

      <SkillsInterestsSection
        skills={arrayStates.skills}
        interests={arrayStates.interests}
        professionalSectors={arrayStates.professionalSectors}
        newSkill={helperStates.newSkill}
        newInterest={helperStates.newInterest}
        newSector={helperStates.newSector}
        onSkillChange={(skill) => updateHelperState('newSkill', skill)}
        onInterestChange={(interest) => updateHelperState('newInterest', interest)}
        onSectorChange={(sector) => updateHelperState('newSector', sector)}
        onAddSkill={addSkill}
        onAddInterest={addInterest}
        onAddSector={addSector}
        onRemoveSkill={removeSkill}
        onRemoveInterest={removeInterest}
        onRemoveSector={removeSector}
      />

      <CulturalBackgroundSection
        formData={formData}
        diasporaNetworks={arrayStates.diasporaNetworks}
        newNetwork={helperStates.newNetwork}
        onInputChange={handleInputChange}
        onNetworkChange={(network) => updateHelperState('newNetwork', network)}
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
        mentorshipAreas={arrayStates.mentorshipAreas}
        newMentorshipArea={helperStates.newMentorshipArea}
        onInputChange={handleInputChange}
        onMentorshipAreaChange={(area) => updateHelperState('newMentorshipArea', area)}
        onAddMentorshipArea={addMentorshipArea}
        onRemoveMentorshipArea={removeMentorshipArea}
      />

      <AdditionalInfoSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="ghost" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-dna-copper hover:bg-dna-gold text-white px-8" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};

export default EnhancedProfileForm;
