
import { ArrayStates, HelperStates } from '../FormDataTypes';

interface UseProfileFormArraysProps {
  arrayStates: ArrayStates;
  helperStates: HelperStates;
  updateArrayField: (field: keyof ArrayStates, value: string[]) => void;
  updateHelperField: (field: keyof HelperStates, value: string) => void;
}

export const useProfileFormArrays = ({
  arrayStates,
  helperStates,
  updateArrayField,
  updateHelperField,
}: UseProfileFormArraysProps) => {
  
  const skillsHandlers = {
    add: () => {
      if (helperStates.newSkill.trim() && !arrayStates.skills.includes(helperStates.newSkill.trim())) {
        updateArrayField('skills', [...arrayStates.skills, helperStates.newSkill.trim()]);
        updateHelperField('newSkill', '');
      }
    },
    remove: (skillToRemove: string) => {
      updateArrayField('skills', arrayStates.skills.filter(skill => skill !== skillToRemove));
    },
  };

  const interestsHandlers = {
    add: () => {
      if (helperStates.newInterest.trim() && !arrayStates.interests.includes(helperStates.newInterest.trim())) {
        updateArrayField('interests', [...arrayStates.interests, helperStates.newInterest.trim()]);
        updateHelperField('newInterest', '');
      }
    },
    remove: (interestToRemove: string) => {
      updateArrayField('interests', arrayStates.interests.filter(interest => interest !== interestToRemove));
    },
  };

  const sectorsHandlers = {
    add: () => {
      if (helperStates.newSector.trim() && !arrayStates.professionalSectors.includes(helperStates.newSector.trim())) {
        updateArrayField('professionalSectors', [...arrayStates.professionalSectors, helperStates.newSector.trim()]);
        updateHelperField('newSector', '');
      }
    },
    remove: (sectorToRemove: string) => {
      updateArrayField('professionalSectors', arrayStates.professionalSectors.filter(sector => sector !== sectorToRemove));
    },
  };

  const networksHandlers = {
    add: () => {
      if (helperStates.newNetwork.trim() && !arrayStates.diasporaNetworks.includes(helperStates.newNetwork.trim())) {
        updateArrayField('diasporaNetworks', [...arrayStates.diasporaNetworks, helperStates.newNetwork.trim()]);
        updateHelperField('newNetwork', '');
      }
    },
    remove: (networkToRemove: string) => {
      updateArrayField('diasporaNetworks', arrayStates.diasporaNetworks.filter(network => network !== networkToRemove));
    },
  };

  const mentorshipAreasHandlers = {
    add: () => {
      if (helperStates.newMentorshipArea.trim() && !arrayStates.mentorshipAreas.includes(helperStates.newMentorshipArea.trim())) {
        updateArrayField('mentorshipAreas', [...arrayStates.mentorshipAreas, helperStates.newMentorshipArea.trim()]);
        updateHelperField('newMentorshipArea', '');
      }
    },
    remove: (areaToRemove: string) => {
      updateArrayField('mentorshipAreas', arrayStates.mentorshipAreas.filter(area => area !== areaToRemove));
    },
  };

  return {
    skillsHandlers,
    interestsHandlers,
    sectorsHandlers,
    networksHandlers,
    mentorshipAreasHandlers,
  };
};
