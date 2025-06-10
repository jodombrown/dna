
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
    country_of_origin?: string;
    current_country?: string;
    years_in_diaspora?: string;
  };
  errors: {
    full_name?: string;
    profession?: string;
    company?: string;
    location?: string;
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country_of_origin" className="text-dna-forest">Country of Origin</Label>
          <Input
            id="country_of_origin"
            value={formData.country_of_origin || ''}
            onChange={(e) => onFieldChange('country_of_origin', e.target.value)}
            placeholder="Nigeria, Ghana, Kenya, etc."
            className={errors.country_of_origin ? 'border-dna-crimson' : ''}
          />
          {errors.country_of_origin && (
            <p className="text-sm text-dna-crimson mt-1">{errors.country_of_origin}</p>
          )}
        </div>

        <div>
          <Label htmlFor="current_country" className="text-dna-forest">Current Country</Label>
          <Input
            id="current_country"
            value={formData.current_country || ''}
            onChange={(e) => onFieldChange('current_country', e.target.value)}
            placeholder="United States, Canada, UK, etc."
            className={errors.current_country ? 'border-dna-crimson' : ''}
          />
          {errors.current_country && (
            <p className="text-sm text-dna-crimson mt-1">{errors.current_country}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location" className="text-dna-forest">Current Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onFieldChange('location', e.target.value)}
            placeholder="City, State/Province"
            className={errors.location ? 'border-dna-crimson' : ''}
          />
          {errors.location && (
            <p className="text-sm text-dna-crimson mt-1">{errors.location}</p>
          )}
        </div>

        <div>
          <Label htmlFor="years_in_diaspora" className="text-dna-forest">Years in Diaspora</Label>
          <Input
            id="years_in_diaspora"
            type="number"
            value={formData.years_in_diaspora || ''}
            onChange={(e) => onFieldChange('years_in_diaspora', e.target.value)}
            placeholder="5"
          />
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
