
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactFieldsProps {
  formData: {
    linkedin_url: string;
  };
  errors: {
    linkedin_url?: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

const ContactFields: React.FC<ContactFieldsProps> = ({
  formData,
  errors,
  onFieldChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="linkedin_url" className="text-dna-forest">LinkedIn URL</Label>
      <Input
        id="linkedin_url"
        type="url"
        value={formData.linkedin_url}
        onChange={(e) => onFieldChange('linkedin_url', e.target.value)}
        placeholder="https://linkedin.com/in/yourprofile"
        className={errors.linkedin_url ? 'border-dna-crimson' : ''}
      />
      {errors.linkedin_url && (
        <p className="text-sm text-dna-crimson">{errors.linkedin_url}</p>
      )}
    </div>
  );
};

export default ContactFields;
