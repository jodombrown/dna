import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import AvatarUploader from '@/components/uploader/AvatarUploader';
import LocationTypeahead from '@/components/location/LocationTypeahead';

interface MinimalProfileData {
  first_name: string;
  last_name: string;
  current_country: string;
  avatar_url: string;
  professional_sectors: string[];
  interests: string[];
}

interface MinimalProfileStepProps {
  data: MinimalProfileData;
  updateData: (data: Partial<MinimalProfileData>) => void;
}

const SECTOR_OPTIONS = [
  'Technology & Innovation',
  'Healthcare & Medicine',
  'Education & Research',
  'Finance & Investment',
  'Agriculture & Food Security',
  'Energy & Environment',
  'Infrastructure & Development',
  'Arts & Culture',
  'Media & Communications',
  'Non-profit & Social Impact',
  'Government & Policy',
  'Tourism & Hospitality'
];

const INTEREST_OPTIONS = [
  'Entrepreneurship',
  'Mentorship',
  'Networking',
  'Knowledge Sharing',
  'Cultural Exchange',
  'Innovation',
  'Community Building',
  'Leadership Development',
  'Skills Development',
  'Investment Opportunities',
  'Collaboration',
  'Social Impact'
];

const MinimalProfileStep: React.FC<MinimalProfileStepProps> = ({ data, updateData }) => {
  const [newSector, setNewSector] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const addSector = (sector: string) => {
    if (sector && !data.professional_sectors.includes(sector)) {
      updateData({
        professional_sectors: [...data.professional_sectors, sector]
      });
    }
    setNewSector('');
  };

  const removeSector = (sectorToRemove: string) => {
    updateData({
      professional_sectors: data.professional_sectors.filter(s => s !== sectorToRemove)
    });
  };

  const addInterest = (interest: string) => {
    if (interest && !data.interests.includes(interest)) {
      updateData({
        interests: [...data.interests, interest]
      });
    }
    setNewInterest('');
  };

  const removeInterest = (interestToRemove: string) => {
    updateData({
      interests: data.interests.filter(i => i !== interestToRemove)
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-dna-forest">
          Complete Your DNA Profile
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Just a few essentials to get you connected with the diaspora network
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-2">
          <Label>Profile Photo</Label>
          <AvatarUploader
            value={data.avatar_url}
            onUploaded={(url) => updateData({ avatar_url: url })}
          />
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={data.first_name}
              onChange={(e) => updateData({ first_name: e.target.value })}
              placeholder="Enter your first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={data.last_name}
              onChange={(e) => updateData({ last_name: e.target.value })}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        {/* Country/Region */}
        <div className="space-y-2">
          <Label>Current Country/Region</Label>
          <LocationTypeahead
            value={data.current_country}
            onChange={(value) => updateData({ current_country: value })}
          />
        </div>

        {/* Professional Sectors */}
        <div className="space-y-2">
          <Label>Professional Sectors (Select up to 3)</Label>
          <div className="flex gap-2">
            <Select value={newSector} onValueChange={setNewSector}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTOR_OPTIONS.filter(sector => !data.professional_sectors.includes(sector))
                  .map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={() => addSector(newSector)}
              disabled={!newSector || data.professional_sectors.length >= 3}
              variant="outline"
            >
              Add
            </Button>
          </div>
          {data.professional_sectors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.professional_sectors.map((sector) => (
                <Badge key={sector} variant="secondary" className="flex items-center gap-1">
                  {sector}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeSector(sector)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <Label>Interests (Select up to 5)</Label>
          <div className="flex gap-2">
            <Select value={newInterest} onValueChange={setNewInterest}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select an interest" />
              </SelectTrigger>
              <SelectContent>
                {INTEREST_OPTIONS.filter(interest => !data.interests.includes(interest))
                  .map((interest) => (
                    <SelectItem key={interest} value={interest}>
                      {interest}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={() => addInterest(newInterest)}
              disabled={!newInterest || data.interests.length >= 5}
              variant="outline"
            >
              Add
            </Button>
          </div>
          {data.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.interests.map((interest) => (
                <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MinimalProfileStep;