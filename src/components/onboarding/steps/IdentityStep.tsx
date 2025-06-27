
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';

interface IdentityStepProps {
  data: any;
  updateData: (data: any) => void;
}

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Egypt', 'Morocco',
  'Tanzania', 'Uganda', 'Senegal', 'Rwanda', 'Botswana', 'Zimbabwe', 'Other'
];

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const IdentityStep: React.FC<IdentityStepProps> = ({ data, updateData }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({ profile_photo: file });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-dna-forest mb-2">Tell us about yourself</h3>
        <p className="text-gray-600">Let's start with the basics</p>
      </div>

      {/* Profile Photo */}
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage 
            src={data.profile_photo ? URL.createObjectURL(data.profile_photo) : ''} 
            alt="Profile" 
          />
          <AvatarFallback className="bg-dna-mint text-dna-forest text-xl">
            {data.full_name ? data.full_name.charAt(0) : <Upload className="w-8 h-8" />}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <Label htmlFor="profile-photo" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 bg-dna-mint text-dna-forest rounded-lg hover:bg-dna-mint/80 transition-colors">
              <Upload className="w-4 h-4" />
              Upload Photo
            </div>
          </Label>
          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Full Name */}
      <div>
        <Label htmlFor="full-name">Full Name *</Label>
        <Input
          id="full-name"
          value={data.full_name}
          onChange={(e) => updateData({ full_name: e.target.value })}
          placeholder="Enter your full name"
        />
      </div>

      {/* Display Name */}
      <div>
        <Label htmlFor="display-name">Display Name *</Label>
        <Input
          id="display-name"
          value={data.display_name}
          onChange={(e) => updateData({ display_name: e.target.value })}
          placeholder="How you'd like to be addressed"
        />
      </div>

      {/* Diaspora Origin */}
      <div>
        <Label>Diaspora Origin *</Label>
        <Select value={data.diaspora_origin} onValueChange={(value) => updateData({ diaspora_origin: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your country of origin" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender */}
      <div>
        <Label>Gender *</Label>
        <Select value={data.gender} onValueChange={(value) => updateData({ gender: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {GENDERS.map((gender) => (
              <SelectItem key={gender} value={gender}>
                {gender}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default IdentityStep;
