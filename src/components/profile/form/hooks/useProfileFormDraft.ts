
import { useEffect } from 'react';
import { FormData, ArrayStates, HelperStates } from '../FormDataTypes';

const DRAFT_KEY = "dna-profile-draft";

interface UseProfileFormDraftProps {
  formData: FormData;
  arrayStates: ArrayStates;
  helperStates: HelperStates;
  updateFormField: (field: keyof FormData, value: string | boolean | number) => void;
  updateArrayField: (field: keyof ArrayStates, value: string[]) => void;
  updateHelperField: (field: keyof HelperStates, value: string) => void;
}

export const useProfileFormDraft = ({
  formData,
  arrayStates,
  helperStates,
  updateFormField,
  updateArrayField,
  updateHelperField,
}: UseProfileFormDraftProps) => {

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData && parsed.arrayStates && parsed.helperStates) {
          // Restore form data
          Object.entries(parsed.formData).forEach(([key, value]) => {
            updateFormField(key as keyof FormData, value as string | boolean | number);
          });
          
          // Restore array states
          Object.entries(parsed.arrayStates).forEach(([key, value]) => {
            updateArrayField(key as keyof ArrayStates, value as string[]);
          });
          
          // Restore helper states
          Object.entries(parsed.helperStates).forEach(([key, value]) => {
            updateHelperField(key as keyof HelperStates, value as string);
          });
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Save draft on changes (debounced)
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ formData, arrayStates, helperStates })
      );
    }, 700);

    return () => clearTimeout(saveTimeout);
  }, [formData, arrayStates, helperStates]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  return {
    clearDraft,
  };
};
