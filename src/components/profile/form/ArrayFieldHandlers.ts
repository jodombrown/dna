
import { ArrayStates, HelperStates } from './FormDataTypes';

export const createArrayHandlers = (
  arrayStates: ArrayStates,
  helperStates: HelperStates,
  updateArrayState: (field: keyof ArrayStates, value: string[]) => void,
  updateHelperState: (field: keyof HelperStates, value: string) => void
) => {
  const addSkill = () => {
    if (helperStates.newSkill.trim() && !arrayStates.skills.includes(helperStates.newSkill.trim())) {
      updateArrayState('skills', [...arrayStates.skills, helperStates.newSkill.trim()]);
      updateHelperState('newSkill', '');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateArrayState('skills', arrayStates.skills.filter(skill => skill !== skillToRemove));
  };

  const addInterest = () => {
    if (helperStates.newInterest.trim() && !arrayStates.interests.includes(helperStates.newInterest.trim())) {
      updateArrayState('interests', [...arrayStates.interests, helperStates.newInterest.trim()]);
      updateHelperState('newInterest', '');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    updateArrayState('interests', arrayStates.interests.filter(interest => interest !== interestToRemove));
  };

  const addSector = () => {
    if (helperStates.newSector.trim() && !arrayStates.professionalSectors.includes(helperStates.newSector.trim())) {
      updateArrayState('professionalSectors', [...arrayStates.professionalSectors, helperStates.newSector.trim()]);
      updateHelperState('newSector', '');
    }
  };

  const removeSector = (sectorToRemove: string) => {
    updateArrayState('professionalSectors', arrayStates.professionalSectors.filter(sector => sector !== sectorToRemove));
  };

  const addNetwork = () => {
    if (helperStates.newNetwork.trim() && !arrayStates.diasporaNetworks.includes(helperStates.newNetwork.trim())) {
      updateArrayState('diasporaNetworks', [...arrayStates.diasporaNetworks, helperStates.newNetwork.trim()]);
      updateHelperState('newNetwork', '');
    }
  };

  const removeNetwork = (networkToRemove: string) => {
    updateArrayState('diasporaNetworks', arrayStates.diasporaNetworks.filter(network => network !== networkToRemove));
  };

  const addMentorshipArea = () => {
    if (helperStates.newMentorshipArea.trim() && !arrayStates.mentorshipAreas.includes(helperStates.newMentorshipArea.trim())) {
      updateArrayState('mentorshipAreas', [...arrayStates.mentorshipAreas, helperStates.newMentorshipArea.trim()]);
      updateHelperState('newMentorshipArea', '');
    }
  };

  const removeMentorshipArea = (areaToRemove: string) => {
    updateArrayState('mentorshipAreas', arrayStates.mentorshipAreas.filter(area => area !== areaToRemove));
  };

  return {
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
  };
};
