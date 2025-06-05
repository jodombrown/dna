
import { 
  validateCharacterLimit, 
  validateProfessionalField,
  validateBioContent,
  isValidLinkedInUrl
} from '@/utils/securityValidation';

interface FormErrors {
  full_name?: string;
  profession?: string;
  company?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
}

interface FormData {
  full_name: string;
  profession: string;
  company: string;
  location: string;
  bio: string;
  linkedin_url: string;
}

export const validateProfileForm = (formData: FormData, userId?: string): FormErrors => {
  const errors: FormErrors = {};

  // Required field validation with enhanced security
  if (!formData.full_name.trim()) {
    errors.full_name = 'Full name is required';
  } else if (!validateCharacterLimit(formData.full_name, 100)) {
    errors.full_name = 'Full name must be less than 100 characters';
  } else if (!/^[a-zA-Z\s\-'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]+$/.test(formData.full_name)) {
    errors.full_name = 'Full name contains invalid characters';
  }

  // Enhanced professional field validation
  if (formData.profession && !validateProfessionalField(formData.profession)) {
    errors.profession = 'Profession contains invalid characters or is too long (100 chars max)';
  }

  if (formData.company && !validateProfessionalField(formData.company)) {
    errors.company = 'Company name contains invalid characters or is too long (100 chars max)';
  }

  if (formData.location && !validateCharacterLimit(formData.location, 100)) {
    errors.location = 'Location must be less than 100 characters';
  }

  // Enhanced bio validation with security checks
  if (formData.bio) {
    if (!validateCharacterLimit(formData.bio, 1000)) {
      errors.bio = 'Bio must be less than 1000 characters';
    } else if (!validateBioContent(formData.bio)) {
      errors.bio = 'Bio contains content that is not allowed';
    }
  }

  // Enhanced LinkedIn URL validation
  if (formData.linkedin_url && !isValidLinkedInUrl(formData.linkedin_url)) {
    errors.linkedin_url = 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)';
  }

  return errors;
};
