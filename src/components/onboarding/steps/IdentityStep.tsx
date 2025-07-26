
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

const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 
  'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Democratic Republic of the Congo', 
  'Republic of the Congo', 'Côte d\'Ivoire', 'Djibouti', 'Egypt', 'Equatorial Guinea', 
  'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 
  'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 
  'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 
  'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 
  'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
];

const DIASPORA_COMMUNITIES = [
  // North America
  'African American (United States)',
  'Black Canadian',
  'Afro-Mexican',
  
  // Caribbean
  'Afro-Caribbean - Bahamas',
  'Afro-Caribbean - Barbados', 
  'Afro-Caribbean - Cuba',
  'Afro-Caribbean - Dominican Republic',
  'Afro-Caribbean - Haiti',
  'Afro-Caribbean - Jamaica',
  'Afro-Caribbean - Puerto Rico',
  'Afro-Caribbean - Trinidad and Tobago',
  'Afro-Caribbean - Other',
  
  // South America
  'Afro-Brazilian',
  'Afro-Colombian',
  'Afro-Venezuelan',
  'Afro-Argentinian',
  'Afro-Peruvian',
  'Afro-Ecuadorian',
  'Afro-Uruguayan',
  'Afro-Guyanese',
  'Afro-Surinamese',
  
  // Europe
  'Afro-British (United Kingdom)',
  'Afro-French',
  'Afro-German',
  'Afro-Italian',
  'Afro-Spanish',
  'Afro-Portuguese',
  'Afro-Dutch',
  'Afro-Belgian',
  'Afro-Swedish',
  'Afro-Norwegian',
  'Black European - Other',
  
  // Asia & Oceania
  'Afro-Australian',
  'Black New Zealander',
  'Afro-Asian',
  
  // Middle East
  'Afro-Arab',
  'Black Middle Eastern'
];

const DIASPORA_ORIGINS = [
  ...AFRICAN_COUNTRIES.sort(),
  { label: '--- Diaspora Communities ---', value: 'section-diaspora', disabled: true },
  ...DIASPORA_COMMUNITIES.sort(),
  { label: '--- Other ---', value: 'section-other', disabled: true },
  'Mixed African Heritage',
  'Prefer not to specify',
  'Other'
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
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select your origin or diaspora community" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-[300px]">
            {DIASPORA_ORIGINS.map((origin, index) => {
              if (typeof origin === 'object') {
                return (
                  <SelectItem 
                    key={index} 
                    value={origin.value} 
                    disabled={origin.disabled}
                    className="font-semibold text-gray-500 bg-gray-50 cursor-default"
                  >
                    {origin.label}
                  </SelectItem>
                );
              }
              return (
                <SelectItem key={origin} value={origin} className="hover:bg-dna-mint/20">
                  {origin}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Gender */}
      <div>
        <Label>Gender *</Label>
        <Select value={data.gender} onValueChange={(value) => updateData({ gender: value })}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {GENDERS.map((gender) => (
              <SelectItem key={gender} value={gender} className="hover:bg-dna-mint/20">
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
