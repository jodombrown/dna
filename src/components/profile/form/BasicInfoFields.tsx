import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import LocationAutocomplete from './LocationAutocomplete';
import { COUNTRIES, STATES_USA, CITIES_SAMPLE } from './locationData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BasicInfoFieldsProps {
  formData: {
    full_name: string;
    profession: string;
    company: string;
    location: string;
    city?: string;
    state_province?: string;
    bio?: string;
    country_of_origin?: string;
    current_country?: string;
    years_in_diaspora?: string;
  };
  errors: {
    full_name?: string;
    profession?: string;
    company?: string;
    location?: string;
    city?: string;
    state_province?: string;
    bio?: string;
    country_of_origin?: string;
    current_country?: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  formData,
  errors,
  onFieldChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="full_name" className="text-dna-forest">Full Name *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => onFieldChange('full_name', e.target.value)}
          placeholder="Enter your full name"
          className={errors.full_name ? 'border-dna-crimson' : ''}
          required
        />
        {errors.full_name && (
          <p className="text-sm text-dna-crimson mt-1">{errors.full_name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="profession" className="text-dna-forest">Profession</Label>
          <Input
            id="profession"
            value={formData.profession}
            onChange={(e) => onFieldChange('profession', e.target.value)}
            placeholder="Software Engineer, Doctor, etc."
            className={errors.profession ? 'border-dna-crimson' : ''}
          />
          {errors.profession && (
            <p className="text-sm text-dna-crimson mt-1">{errors.profession}</p>
          )}
        </div>

        <div>
          <Label htmlFor="company" className="text-dna-forest">Company/Organization</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => onFieldChange('company', e.target.value)}
            placeholder="Your company or organization"
            className={errors.company ? 'border-dna-crimson' : ''}
          />
          {errors.company && (
            <p className="text-sm text-dna-crimson mt-1">{errors.company}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <LocationAutocomplete
            id="city"
            label="City"
            value={formData.city || ''}
            placeholder="Enter city"
            onChange={val => onFieldChange('city', val)}
            suggestions={CITIES_SAMPLE}
          />
          {errors.city && (
            <p className="text-sm text-dna-crimson mt-1">{errors.city}</p>
          )}
        </div>
        <div>
          <LocationAutocomplete
            id="state_province"
            label="State / Province"
            value={formData.state_province || ''}
            placeholder="Enter state or province"
            onChange={val => onFieldChange('state_province', val)}
            suggestions={STATES_USA}
          />
          {errors.state_province && (
            <p className="text-sm text-dna-crimson mt-1">{errors.state_province}</p>
          )}
        </div>
        <div>
          <LocationAutocomplete
            id="current_country"
            label="Country"
            value={formData.current_country || ''}
            placeholder="Enter country"
            onChange={val => onFieldChange('current_country', val)}
            suggestions={COUNTRIES}
          />
          {errors.current_country && (
            <p className="text-sm text-dna-crimson mt-1">{errors.current_country}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="bio" className="text-dna-forest">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => onFieldChange('bio', e.target.value)}
          placeholder="Tell us about yourself and your diaspora journey..."
          rows={4}
          className={errors.bio ? 'border-dna-crimson' : ''}
        />
        {errors.bio && (
          <p className="text-sm text-dna-crimson mt-1">{errors.bio}</p>
        )}
      </div>
    </div>
  );
};

export default BasicInfoFields;
