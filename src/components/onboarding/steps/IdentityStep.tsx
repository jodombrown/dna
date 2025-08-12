
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CountrySelect from '@/components/ui/CountrySelect';
import UsernameManager from '@/components/profile/UsernameManager';

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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-dna-forest mb-2">Tell us about yourself</h3>
        <p className="text-gray-600">Your identity connects you to the diaspora community</p>
      </div>

      {/* Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first-name">First Name *</Label>
          <Input
            id="first-name"
            value={data.first_name || ''}
            onChange={(e) => updateData({ first_name: e.target.value })}
            placeholder="First Name"
          />
        </div>
        <div>
          <Label htmlFor="last-name">Last Name *</Label>
          <Input
            id="last-name"
            value={data.last_name || ''}
            onChange={(e) => updateData({ last_name: e.target.value })}
            placeholder="Last Name"
          />
        </div>
      </div>

      {/* Username */}
      <div>
        <UsernameManager
          currentUsername={data.username || ''}
          changesLeft={2}
          onUsernameChange={(username) => updateData({ username })}
        />
      </div>

      {/* Country of Origin */}
      <div>
        <Label>Country of Origin *</Label>
        <Select value={data.country_of_origin || ''} onValueChange={(value) => updateData({ country_of_origin: value })}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select your country of origin" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 max-h-[300px]">
            {AFRICAN_COUNTRIES.map((country) => (
              <SelectItem key={country} value={country} className="hover:bg-dna-mint/20">
                {country}
              </SelectItem>
            ))}
            <SelectItem value="other" className="hover:bg-dna-mint/20">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current Country */}
      <div>
        <Label>Current Country *</Label>
        <CountrySelect
          value={data.current_country_code || ''}
          onChange={(code, name) => updateData({ current_country_code: code, current_country_name: name })}
        />
      </div>
    </div>
  );
};

export default IdentityStep;
