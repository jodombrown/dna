import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CountryCombobox from '@/components/ui/country-combobox';

interface ProfileEditBasicInfoProps {
  fullName: string;
  headline: string;
  bio: string;
  location: string;
  countryOfOrigin: string;
  currentCountry: string;
  onFullNameChange: (value: string) => void;
  onHeadlineChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onCountryOfOriginChange: (value: string) => void;
  onCurrentCountryChange: (value: string) => void;
}

const ProfileEditBasicInfo: React.FC<ProfileEditBasicInfoProps> = ({
  fullName,
  headline,
  bio,
  location,
  countryOfOrigin,
  currentCountry,
  onFullNameChange,
  onHeadlineChange,
  onBioChange,
  onLocationChange,
  onCountryOfOriginChange,
  onCurrentCountryChange,
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
            />
          </div>
          <div>
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              placeholder="e.g., Software Engineer at Tech Company"
              value={headline}
              onChange={(e) => onHeadlineChange(e.target.value)}
            />
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
          />
          <p className="text-xs text-muted-foreground mt-1">
            A good bio helps others understand your story and connect with you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Current Location</Label>
            <Input
              id="location"
              placeholder="City, Country"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>
          <div>
            <Label>Current Country</Label>
            <CountryCombobox
              value={currentCountry}
              onValueChange={onCurrentCountryChange}
              placeholder="Select your current country"
            />
          </div>
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
