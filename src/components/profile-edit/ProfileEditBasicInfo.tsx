import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CountryCombobox from '@/components/ui/country-combobox';

interface ProfileEditBasicInfoProps {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  countryOfOrigin: string;
  currentCountry: string;
  pronouns: string;
  onFullNameChange: (value: string) => void;
  onHeadlineChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCountryOfOriginChange: (value: string) => void;
  onCurrentCountryChange: (value: string) => void;
  onPronounsChange: (value: string) => void;
}

const PRONOUN_OPTIONS = [
  { value: 'he/him', label: 'He/Him' },
  { value: 'she/her', label: 'She/Her' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'he/they', label: 'He/They' },
  { value: 'she/they', label: 'She/They' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const ProfileEditBasicInfo: React.FC<ProfileEditBasicInfoProps> = ({
  fullName,
  headline,
  bio,
  location,
  countryOfOrigin,
  currentCountry,
  pronouns,
  onFullNameChange,
  onHeadlineChange,
  onBioChange,
  onLocationChange,
  onCountryOfOriginChange,
  onCurrentCountryChange,
  onPronounsChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder="Your full name"
              required
              maxLength={100}
            />
            {!fullName.trim() && (
              <p className="text-xs text-destructive mt-1">Full name is required</p>
            )}
          </div>
          <div>
            <Label>Pronouns</Label>
            <Select value={pronouns} onValueChange={onPronounsChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select pronouns (optional)" />
              </SelectTrigger>
              <SelectContent>
                {PRONOUN_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="headline">Professional Headline</Label>
          <Input
            id="headline"
            placeholder="e.g., Software Engineer at Tech Company"
            value={headline}
            onChange={(e) => onHeadlineChange(e.target.value)}
            maxLength={150}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              A short description of what you do
            </p>
            <p className="text-xs text-muted-foreground">
              {headline.length}/150
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself, your background, and what you're passionate about..."
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            rows={4}
            maxLength={2000}
          />
          <div className="flex justify-between mt-1">
            <p className={`text-xs ${bio.length > 0 && bio.length < 50 ? 'text-amber-500' : 'text-muted-foreground'}`}>
              {bio.length > 0 && bio.length < 50
                ? `Add ${50 - bio.length} more characters for a complete bio`
                : 'A good bio helps others understand your story and connect with you'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {bio.length}/2000
            </p>
          </div>
        </div>

        <div>
          <Label>Current Location</Label>
          <CountryCombobox
            value={currentCountry}
            onValueChange={(value) => {
              onCurrentCountryChange(value);
              // Also update location to keep them in sync
              onLocationChange(value);
            }}
            placeholder="Select your current country"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Where you currently live — helps connect you with nearby diaspora.
          </p>
        </div>

        <div>
          <Label>Country of Origin *</Label>
          <CountryCombobox
            value={countryOfOrigin}
            onValueChange={onCountryOfOriginChange}
            placeholder="Select your country of origin"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your heritage country — this helps connect you with the diaspora community.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditBasicInfo;
