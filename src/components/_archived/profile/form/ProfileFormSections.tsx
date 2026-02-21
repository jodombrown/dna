import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileFormSectionsProps {
  formData: any;
  arrayStates: any;
  helperStates: any;
  updateFormField: (field: string, value: any) => void;
  updateArrayField: (field: string, value: string[]) => void;
  updateHelperField: (field: string, value: string) => void;
  showAllSections?: boolean;
}

const ProfileFormSections: React.FC<ProfileFormSectionsProps> = ({
  formData,
  arrayStates,
  helperStates,
  updateFormField,
  updateArrayField,
  updateHelperField,
  showAllSections = false,
}) => {
  const addArrayItem = (fieldName: string, value: string) => {
    if (value.trim()) {
      const currentArray = arrayStates[fieldName] || [];
      if (!currentArray.includes(value.trim())) {
        updateArrayField(fieldName, [...currentArray, value.trim()]);
        updateHelperField(`new${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`, '');
      }
    }
  };

  const removeArrayItem = (fieldName: string, index: number) => {
    const currentArray = arrayStates[fieldName] || [];
    updateArrayField(fieldName, currentArray.filter((_, i) => i !== index));
  };

  const ArrayFieldEditor = ({ fieldName, label, placeholder, helperFieldName }) => (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={`new-${fieldName}`}
          placeholder={placeholder}
          value={helperStates[helperFieldName] || ''}
          onChange={(e) => updateHelperField(helperFieldName, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addArrayItem(fieldName, helperStates[helperFieldName] || '');
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(fieldName, helperStates[helperFieldName] || '')}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(arrayStates[fieldName] || []).map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {item}
            <X
              className="w-3 h-3 cursor-pointer"
              onClick={() => removeArrayItem(fieldName, index)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name || ''}
              onChange={(e) => updateFormField('full_name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              placeholder="e.g., Software Engineer at Tech Company"
              value={formData.headline || ''}
              onChange={(e) => updateFormField('headline', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself, your background, and what you're passionate about..."
            value={formData.bio || ''}
            onChange={(e) => updateFormField('bio', e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Current Location</Label>
            <Input
              id="location"
              placeholder="City, Country"
              value={formData.location || ''}
              onChange={(e) => updateFormField('location', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="country_of_origin">Country of Origin</Label>
            <Input
              id="country_of_origin"
              placeholder="Your country of origin"
              value={formData.country_of_origin || ''}
              onChange={(e) => updateFormField('country_of_origin', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              placeholder="Your current profession"
              value={formData.profession || ''}
              onChange={(e) => updateFormField('profession', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="Technology, Healthcare, Finance, etc."
              value={formData.industry || ''}
              onChange={(e) => updateFormField('industry', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="years_experience">Years of Experience</Label>
            <Input
              id="years_experience"
              type="number"
              placeholder="0"
              value={formData.years_experience || ''}
              onChange={(e) => updateFormField('years_experience', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="education_level">Education Level</Label>
            <Select
              value={formData.education_level || ''}
              onValueChange={(value) => updateFormField('education_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="masters">Master's Degree</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ArrayFieldEditor
          fieldName="skills"
          label="Skills"
          placeholder="Add a skill"
          helperFieldName="newSkill"
        />
      </div>

      {/* Interests & Impact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Interests & Impact Areas</h3>
        
        <ArrayFieldEditor
          fieldName="interests"
          label="Interests"
          placeholder="Add an interest"
          helperFieldName="newInterest"
        />

        <ArrayFieldEditor
          fieldName="impactAreas"
          label="Impact Areas"
          placeholder="Add an impact area"
          helperFieldName="newImpactArea"
        />
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin_url || ''}
              onChange={(e) => updateFormField('linkedin_url', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="twitter_url">Twitter URL</Label>
            <Input
              id="twitter_url"
              placeholder="https://twitter.com/username"
              value={formData.twitter_url || ''}
              onChange={(e) => updateFormField('twitter_url', e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="website_url">Website URL</Label>
          <Input
            id="website_url"
            placeholder="https://yourwebsite.com"
            value={formData.website_url || ''}
            onChange={(e) => updateFormField('website_url', e.target.value)}
          />
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Privacy Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other community members
              </p>
            </div>
            <Switch
              checked={formData.is_public || false}
              onCheckedChange={(checked) => updateFormField('is_public', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about community activities
              </p>
            </div>
            <Switch
              checked={formData.newsletter_emails || false}
              onCheckedChange={(checked) => updateFormField('newsletter_emails', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileFormSections;