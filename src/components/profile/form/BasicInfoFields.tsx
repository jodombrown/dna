
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoFieldsProps {
  formData: {
    full_name: string;
    profession: string;
    company: string;
    location: string;
    bio: string;
  };
  errors: {
    full_name?: string;
    profession?: string;
    company?: string;
    location?: string;
    bio?: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  formData,
  errors,
  onFieldChange,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-dna-forest">
          Full Name <span className="text-dna-crimson">*</span>
        </Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => onFieldChange('full_name', e.target.value)}
          placeholder="Your full name"
          className={errors.full_name ? 'border-dna-crimson' : ''}
          maxLength={100}
          required
        />
        {errors.full_name && (
          <p className="text-sm text-dna-crimson">{errors.full_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profession" className="text-dna-forest">Profession</Label>
        <Input
          id="profession"
          value={formData.profession}
          onChange={(e) => onFieldChange('profession', e.target.value)}
          placeholder="e.g. Software Engineer, Doctor, Entrepreneur"
          className={errors.profession ? 'border-dna-crimson' : ''}
          maxLength={100}
        />
        {errors.profession && (
          <p className="text-sm text-dna-crimson">{errors.profession}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company" className="text-dna-forest">Company/Organization</Label>
        <Input
          id="company"
          value={formData.company}
          onChange={(e) => onFieldChange('company', e.target.value)}
          placeholder="Current company or organization"
          className={errors.company ? 'border-dna-crimson' : ''}
          maxLength={100}
        />
        {errors.company && (
          <p className="text-sm text-dna-crimson">{errors.company}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-dna-forest">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => onFieldChange('location', e.target.value)}
          placeholder="City, Country"
          className={errors.location ? 'border-dna-crimson' : ''}
          maxLength={100}
        />
        {errors.location && (
          <p className="text-sm text-dna-crimson">{errors.location}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-dna-forest">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => onFieldChange('bio', e.target.value)}
          placeholder="Tell us about yourself, your background, and your connection to Africa..."
          className={errors.bio ? 'border-dna-crimson' : ''}
          rows={4}
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          {errors.bio && (
            <p className="text-sm text-dna-crimson">{errors.bio}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.bio.length}/1000 characters
          </p>
        </div>
      </div>
    </>
  );
};

export default BasicInfoFields;
