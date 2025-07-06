import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search, MapPin, X } from 'lucide-react';

// Comprehensive countries list
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark',
  'Djibouti', 'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
  'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
  'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali',
  'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia',
  'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
  'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain',
  'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

// Sample states/provinces data for major countries
const STATES_PROVINCES = {
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ],
  'Canada': [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
    'Quebec', 'Saskatchewan', 'Yukon'
  ],
  'United Kingdom': [
    'England', 'Scotland', 'Wales', 'Northern Ireland'
  ],
  'Australia': [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
    'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
  ],
  'Nigeria': [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
    'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ],
  'South Africa': [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga',
    'Northern Cape', 'North West', 'Western Cape'
  ],
  'Kenya': [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
    'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
    'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
    'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
    'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
    'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ],
  'Ghana': [
    'Ashanti', 'Brong-Ahafo', 'Central', 'Eastern', 'Greater Accra', 'Northern', 'Upper East',
    'Upper West', 'Volta', 'Western'
  ],
  'Germany': [
    'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse',
    'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate',
    'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'
  ],
  'France': [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire',
    'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine',
    'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'
  ]
};

// Sample cities data for major states/provinces
const CITIES = {
  'California': [
    'Los Angeles', 'San Francisco', 'San Diego', 'Sacramento', 'Oakland', 'Fresno', 'Long Beach',
    'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine', 'Fremont', 'San Jose'
  ],
  'New York': [
    'New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle',
    'Mount Vernon', 'Schenectady', 'Utica', 'White Plains', 'Troy', 'Niagara Falls'
  ],
  'Texas': [
    'Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi',
    'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie'
  ],
  'Ontario': [
    'Toronto', 'Ottawa', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor',
    'Richmond Hill', 'Oakville', 'Burlington', 'Sudbury', 'Oshawa', 'Barrie', 'St. Catharines'
  ],
  'Lagos': [
    'Lagos Island', 'Ikeja', 'Surulere', 'Yaba', 'Victoria Island', 'Ikoyi', 'Mushin', 'Shomolu',
    'Alimosho', 'Agege', 'Ifako-Ijaiye', 'Kosofe', 'Oshodi-Isolo', 'Ojo', 'Amuwo-Odofin'
  ],
  'Gauteng': [
    'Johannesburg', 'Pretoria', 'Soweto', 'Sandton', 'Randburg', 'Roodepoort', 'Benoni',
    'Boksburg', 'Germiston', 'Krugersdorp', 'Springs', 'Alberton', 'Edenvale'
  ],
  'Nairobi': [
    'Nairobi Central', 'Westlands', 'Karen', 'Kileleshwa', 'Kilimani', 'Lavington', 'Runda',
    'Muthaiga', 'Parklands', 'Eastleigh', 'South B', 'South C', 'Langata', 'Kasarani'
  ],
  'England': [
    'London', 'Birmingham', 'Manchester', 'Liverpool', 'Sheffield', 'Bristol', 'Newcastle',
    'Leeds', 'Leicester', 'Coventry', 'Bradford', 'Nottingham', 'Southampton', 'Brighton'
  ]
};

interface LocationSelectorProps {
  value: {
    country: string;
    state: string;
    city: string;
  };
  onChange: (location: { country: string; state: string; city: string }) => void;
  required?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ value, onChange, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);
  const [filteredStates, setFilteredStates] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  useEffect(() => {
    const filtered = COUNTRIES.filter(country =>
      country.toLowerCase().includes(countrySearch.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [countrySearch]);

  useEffect(() => {
    if (value.country && STATES_PROVINCES[value.country as keyof typeof STATES_PROVINCES]) {
      const states = STATES_PROVINCES[value.country as keyof typeof STATES_PROVINCES];
      const filtered = states.filter(state =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
      );
      setFilteredStates(filtered);
    } else {
      setFilteredStates([]);
    }
  }, [value.country, stateSearch]);

  useEffect(() => {
    if (value.state && CITIES[value.state as keyof typeof CITIES]) {
      const cities = CITIES[value.state as keyof typeof CITIES];
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(citySearch.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [value.state, citySearch]);

  const handleCountrySelect = (country: string) => {
    onChange({ country, state: '', city: '' });
    setCountrySearch('');
    setStateSearch('');
    setCitySearch('');
  };

  const handleStateSelect = (state: string) => {
    onChange({ ...value, state, city: '' });
    setStateSearch('');
    setCitySearch('');
  };

  const handleCitySelect = (city: string) => {
    onChange({ ...value, city });
    setCitySearch('');
  };

  const clearLocation = () => {
    onChange({ country: '', state: '', city: '' });
    setCountrySearch('');
    setStateSearch('');
    setCitySearch('');
  };

  const getDisplayValue = () => {
    const parts = [value.city, value.state, value.country].filter(Boolean);
    return parts.join(', ') || 'Select location...';
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-medium mb-3 text-gray-900 hover:text-gray-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location {required && '*'}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-4">
          {/* Current Selection Display */}
          {(value.country || value.state || value.city) && (
            <div className="p-3 bg-dna-emerald/5 border border-dna-emerald/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dna-forest font-medium">
                  Selected: {getDisplayValue()}
                </span>
                <button
                  type="button"
                  onClick={clearLocation}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Unified Location Selection Flow */}
          <div className="space-y-4">
            {/* Step 1: Country Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 bg-dna-emerald text-white text-xs rounded-full">1</span>
                Country {required && '*'}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {(countrySearch || !value.country) && (
                <div className="max-h-40 overflow-y-auto border rounded-lg bg-white shadow-sm">
                  {filteredCountries.slice(0, 10).map((country) => (
                    <div
                      key={country}
                      className={`p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0 ${
                        value.country === country ? 'bg-dna-emerald/10 text-dna-forest font-medium' : ''
                      }`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      {country}
                    </div>
                  ))}
                  {filteredCountries.length === 0 && countrySearch && (
                    <div className="p-2 text-sm text-gray-500 italic">
                      No countries found for "{countrySearch}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: State/Province Selection */}
            {value.country && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 bg-dna-emerald text-white text-xs rounded-full">2</span>
                  State/Province
                  {filteredStates.length === 0 && (
                    <span className="text-xs text-gray-500">(Optional - will skip to city)</span>
                  )}
                </Label>
                
                {filteredStates.length > 0 ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search states/provinces..."
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {(stateSearch || !value.state) && (
                      <div className="max-h-40 overflow-y-auto border rounded-lg bg-white shadow-sm">
                        {filteredStates.slice(0, 10).map((state) => (
                          <div
                            key={state}
                            className={`p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0 ${
                              value.state === state ? 'bg-dna-emerald/10 text-dna-forest font-medium' : ''
                            }`}
                            onClick={() => handleStateSelect(state)}
                          >
                            {state}
                          </div>
                        ))}
                        {filteredStates.length === 0 && stateSearch && (
                          <div className="p-2 text-sm text-gray-500 italic">
                            No states/provinces found for "{stateSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    No states/provinces available for {value.country}. You can proceed to enter your city directly.
                  </div>
                )}
              </div>
            )}

            {/* Step 3: City Selection */}
            {value.country && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 bg-dna-emerald text-white text-xs rounded-full">3</span>
                  City
                </Label>
                
                {value.state && filteredCities.length > 0 ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search cities..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {(citySearch || !value.city) && (
                      <div className="max-h-40 overflow-y-auto border rounded-lg bg-white shadow-sm">
                        {filteredCities.slice(0, 10).map((city) => (
                          <div
                            key={city}
                            className={`p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0 ${
                              value.city === city ? 'bg-dna-emerald/10 text-dna-forest font-medium' : ''
                            }`}
                            onClick={() => handleCitySelect(city)}
                          >
                            {city}
                          </div>
                        ))}
                        {filteredCities.length === 0 && citySearch && (
                          <div className="p-2 text-sm text-gray-500 italic">
                            No cities found for "{citySearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <Input
                    placeholder="Enter your city..."
                    value={value.city}
                    onChange={(e) => onChange({ ...value, city: e.target.value })}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;