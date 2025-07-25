import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface LocationData {
  city: string;
  state_province?: string;
  country: string;
  formatted: string;
}

interface ComprehensiveLocationInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  showLabel?: boolean;
  icon?: boolean;
}

// Comprehensive location data with proper formatting
const COMPREHENSIVE_LOCATIONS: LocationData[] = [
  // United States - Major Cities
  { city: "New York", state_province: "New York", country: "United States", formatted: "New York, NY, United States" },
  { city: "Los Angeles", state_province: "California", country: "United States", formatted: "Los Angeles, CA, United States" },
  { city: "Chicago", state_province: "Illinois", country: "United States", formatted: "Chicago, IL, United States" },
  { city: "Houston", state_province: "Texas", country: "United States", formatted: "Houston, TX, United States" },
  { city: "Phoenix", state_province: "Arizona", country: "United States", formatted: "Phoenix, AZ, United States" },
  { city: "Philadelphia", state_province: "Pennsylvania", country: "United States", formatted: "Philadelphia, PA, United States" },
  { city: "San Antonio", state_province: "Texas", country: "United States", formatted: "San Antonio, TX, United States" },
  { city: "San Diego", state_province: "California", country: "United States", formatted: "San Diego, CA, United States" },
  { city: "Dallas", state_province: "Texas", country: "United States", formatted: "Dallas, TX, United States" },
  { city: "San Jose", state_province: "California", country: "United States", formatted: "San Jose, CA, United States" },
  { city: "Austin", state_province: "Texas", country: "United States", formatted: "Austin, TX, United States" },
  { city: "Jacksonville", state_province: "Florida", country: "United States", formatted: "Jacksonville, FL, United States" },
  { city: "Fort Worth", state_province: "Texas", country: "United States", formatted: "Fort Worth, TX, United States" },
  { city: "Columbus", state_province: "Ohio", country: "United States", formatted: "Columbus, OH, United States" },
  { city: "Charlotte", state_province: "North Carolina", country: "United States", formatted: "Charlotte, NC, United States" },
  { city: "San Francisco", state_province: "California", country: "United States", formatted: "San Francisco, CA, United States" },
  { city: "Indianapolis", state_province: "Indiana", country: "United States", formatted: "Indianapolis, IN, United States" },
  { city: "Seattle", state_province: "Washington", country: "United States", formatted: "Seattle, WA, United States" },
  { city: "Denver", state_province: "Colorado", country: "United States", formatted: "Denver, CO, United States" },
  { city: "Washington", state_province: "District of Columbia", country: "United States", formatted: "Washington, DC, United States" },
  { city: "Boston", state_province: "Massachusetts", country: "United States", formatted: "Boston, MA, United States" },
  { city: "El Paso", state_province: "Texas", country: "United States", formatted: "El Paso, TX, United States" },
  { city: "Detroit", state_province: "Michigan", country: "United States", formatted: "Detroit, MI, United States" },
  { city: "Nashville", state_province: "Tennessee", country: "United States", formatted: "Nashville, TN, United States" },
  { city: "Portland", state_province: "Oregon", country: "United States", formatted: "Portland, OR, United States" },
  { city: "Memphis", state_province: "Tennessee", country: "United States", formatted: "Memphis, TN, United States" },
  { city: "Oklahoma City", state_province: "Oklahoma", country: "United States", formatted: "Oklahoma City, OK, United States" },
  { city: "Las Vegas", state_province: "Nevada", country: "United States", formatted: "Las Vegas, NV, United States" },
  { city: "Louisville", state_province: "Kentucky", country: "United States", formatted: "Louisville, KY, United States" },
  { city: "Baltimore", state_province: "Maryland", country: "United States", formatted: "Baltimore, MD, United States" },
  { city: "Milwaukee", state_province: "Wisconsin", country: "United States", formatted: "Milwaukee, WI, United States" },
  { city: "Albuquerque", state_province: "New Mexico", country: "United States", formatted: "Albuquerque, NM, United States" },
  { city: "Tucson", state_province: "Arizona", country: "United States", formatted: "Tucson, AZ, United States" },
  { city: "Fresno", state_province: "California", country: "United States", formatted: "Fresno, CA, United States" },
  { city: "Mesa", state_province: "Arizona", country: "United States", formatted: "Mesa, AZ, United States" },
  { city: "Sacramento", state_province: "California", country: "United States", formatted: "Sacramento, CA, United States" },
  { city: "Atlanta", state_province: "Georgia", country: "United States", formatted: "Atlanta, GA, United States" },
  { city: "Kansas City", state_province: "Missouri", country: "United States", formatted: "Kansas City, MO, United States" },
  { city: "Colorado Springs", state_province: "Colorado", country: "United States", formatted: "Colorado Springs, CO, United States" },
  { city: "Miami", state_province: "Florida", country: "United States", formatted: "Miami, FL, United States" },
  { city: "Raleigh", state_province: "North Carolina", country: "United States", formatted: "Raleigh, NC, United States" },
  { city: "Omaha", state_province: "Nebraska", country: "United States", formatted: "Omaha, NE, United States" },
  { city: "Long Beach", state_province: "California", country: "United States", formatted: "Long Beach, CA, United States" },
  { city: "Virginia Beach", state_province: "Virginia", country: "United States", formatted: "Virginia Beach, VA, United States" },
  { city: "Oakland", state_province: "California", country: "United States", formatted: "Oakland, CA, United States" },
  { city: "Minneapolis", state_province: "Minnesota", country: "United States", formatted: "Minneapolis, MN, United States" },
  { city: "Tulsa", state_province: "Oklahoma", country: "United States", formatted: "Tulsa, OK, United States" },
  { city: "Arlington", state_province: "Texas", country: "United States", formatted: "Arlington, TX, United States" },
  { city: "Tampa", state_province: "Florida", country: "United States", formatted: "Tampa, FL, United States" },
  { city: "New Orleans", state_province: "Louisiana", country: "United States", formatted: "New Orleans, LA, United States" },
  { city: "Wichita", state_province: "Kansas", country: "United States", formatted: "Wichita, KS, United States" },
  { city: "Cleveland", state_province: "Ohio", country: "United States", formatted: "Cleveland, OH, United States" },

  // Canada - Major Cities
  { city: "Toronto", state_province: "Ontario", country: "Canada", formatted: "Toronto, ON, Canada" },
  { city: "Montreal", state_province: "Quebec", country: "Canada", formatted: "Montreal, QC, Canada" },
  { city: "Vancouver", state_province: "British Columbia", country: "Canada", formatted: "Vancouver, BC, Canada" },
  { city: "Calgary", state_province: "Alberta", country: "Canada", formatted: "Calgary, AB, Canada" },
  { city: "Edmonton", state_province: "Alberta", country: "Canada", formatted: "Edmonton, AB, Canada" },
  { city: "Ottawa", state_province: "Ontario", country: "Canada", formatted: "Ottawa, ON, Canada" },
  { city: "Winnipeg", state_province: "Manitoba", country: "Canada", formatted: "Winnipeg, MB, Canada" },
  { city: "Quebec City", state_province: "Quebec", country: "Canada", formatted: "Quebec City, QC, Canada" },
  { city: "Hamilton", state_province: "Ontario", country: "Canada", formatted: "Hamilton, ON, Canada" },
  { city: "Kitchener", state_province: "Ontario", country: "Canada", formatted: "Kitchener, ON, Canada" },
  { city: "London", state_province: "Ontario", country: "Canada", formatted: "London, ON, Canada" },
  { city: "Victoria", state_province: "British Columbia", country: "Canada", formatted: "Victoria, BC, Canada" },
  { city: "Halifax", state_province: "Nova Scotia", country: "Canada", formatted: "Halifax, NS, Canada" },
  { city: "Oshawa", state_province: "Ontario", country: "Canada", formatted: "Oshawa, ON, Canada" },
  { city: "Windsor", state_province: "Ontario", country: "Canada", formatted: "Windsor, ON, Canada" },
  { city: "Saskatoon", state_province: "Saskatchewan", country: "Canada", formatted: "Saskatoon, SK, Canada" },
  { city: "St. Catharines", state_province: "Ontario", country: "Canada", formatted: "St. Catharines, ON, Canada" },
  { city: "Regina", state_province: "Saskatchewan", country: "Canada", formatted: "Regina, SK, Canada" },
  { city: "Sherbrooke", state_province: "Quebec", country: "Canada", formatted: "Sherbrooke, QC, Canada" },
  { city: "St. John's", state_province: "Newfoundland and Labrador", country: "Canada", formatted: "St. John's, NL, Canada" },

  // United Kingdom - Major Cities
  { city: "London", state_province: "England", country: "United Kingdom", formatted: "London, England, United Kingdom" },
  { city: "Birmingham", state_province: "England", country: "United Kingdom", formatted: "Birmingham, England, United Kingdom" },
  { city: "Manchester", state_province: "England", country: "United Kingdom", formatted: "Manchester, England, United Kingdom" },
  { city: "Glasgow", state_province: "Scotland", country: "United Kingdom", formatted: "Glasgow, Scotland, United Kingdom" },
  { city: "Liverpool", state_province: "England", country: "United Kingdom", formatted: "Liverpool, England, United Kingdom" },
  { city: "Edinburgh", state_province: "Scotland", country: "United Kingdom", formatted: "Edinburgh, Scotland, United Kingdom" },
  { city: "Leeds", state_province: "England", country: "United Kingdom", formatted: "Leeds, England, United Kingdom" },
  { city: "Sheffield", state_province: "England", country: "United Kingdom", formatted: "Sheffield, England, United Kingdom" },
  { city: "Bristol", state_province: "England", country: "United Kingdom", formatted: "Bristol, England, United Kingdom" },
  { city: "Cardiff", state_province: "Wales", country: "United Kingdom", formatted: "Cardiff, Wales, United Kingdom" },
  { city: "Belfast", state_province: "Northern Ireland", country: "United Kingdom", formatted: "Belfast, Northern Ireland, United Kingdom" },
  { city: "Leicester", state_province: "England", country: "United Kingdom", formatted: "Leicester, England, United Kingdom" },
  { city: "Coventry", state_province: "England", country: "United Kingdom", formatted: "Coventry, England, United Kingdom" },
  { city: "Bradford", state_province: "England", country: "United Kingdom", formatted: "Bradford, England, United Kingdom" },
  { city: "Nottingham", state_province: "England", country: "United Kingdom", formatted: "Nottingham, England, United Kingdom" },
  { city: "Newcastle upon Tyne", state_province: "England", country: "United Kingdom", formatted: "Newcastle upon Tyne, England, United Kingdom" },

  // Nigeria - Major Cities
  { city: "Lagos", state_province: "Lagos State", country: "Nigeria", formatted: "Lagos, Lagos State, Nigeria" },
  { city: "Kano", state_province: "Kano State", country: "Nigeria", formatted: "Kano, Kano State, Nigeria" },
  { city: "Ibadan", state_province: "Oyo State", country: "Nigeria", formatted: "Ibadan, Oyo State, Nigeria" },
  { city: "Abuja", state_province: "Federal Capital Territory", country: "Nigeria", formatted: "Abuja, FCT, Nigeria" },
  { city: "Port Harcourt", state_province: "Rivers State", country: "Nigeria", formatted: "Port Harcourt, Rivers State, Nigeria" },
  { city: "Benin City", state_province: "Edo State", country: "Nigeria", formatted: "Benin City, Edo State, Nigeria" },
  { city: "Maiduguri", state_province: "Borno State", country: "Nigeria", formatted: "Maiduguri, Borno State, Nigeria" },
  { city: "Zaria", state_province: "Kaduna State", country: "Nigeria", formatted: "Zaria, Kaduna State, Nigeria" },
  { city: "Aba", state_province: "Abia State", country: "Nigeria", formatted: "Aba, Abia State, Nigeria" },
  { city: "Jos", state_province: "Plateau State", country: "Nigeria", formatted: "Jos, Plateau State, Nigeria" },
  { city: "Ilorin", state_province: "Kwara State", country: "Nigeria", formatted: "Ilorin, Kwara State, Nigeria" },
  { city: "Oyo", state_province: "Oyo State", country: "Nigeria", formatted: "Oyo, Oyo State, Nigeria" },
  { city: "Enugu", state_province: "Enugu State", country: "Nigeria", formatted: "Enugu, Enugu State, Nigeria" },
  { city: "Abeokuta", state_province: "Ogun State", country: "Nigeria", formatted: "Abeokuta, Ogun State, Nigeria" },
  { city: "Kaduna", state_province: "Kaduna State", country: "Nigeria", formatted: "Kaduna, Kaduna State, Nigeria" },

  // Ghana - Major Cities
  { city: "Accra", state_province: "Greater Accra Region", country: "Ghana", formatted: "Accra, Greater Accra Region, Ghana" },
  { city: "Kumasi", state_province: "Ashanti Region", country: "Ghana", formatted: "Kumasi, Ashanti Region, Ghana" },
  { city: "Tamale", state_province: "Northern Region", country: "Ghana", formatted: "Tamale, Northern Region, Ghana" },
  { city: "Takoradi", state_province: "Western Region", country: "Ghana", formatted: "Takoradi, Western Region, Ghana" },
  { city: "Cape Coast", state_province: "Central Region", country: "Ghana", formatted: "Cape Coast, Central Region, Ghana" },
  { city: "Sekondi", state_province: "Western Region", country: "Ghana", formatted: "Sekondi, Western Region, Ghana" },
  { city: "Obuasi", state_province: "Ashanti Region", country: "Ghana", formatted: "Obuasi, Ashanti Region, Ghana" },
  { city: "Medina", state_province: "Greater Accra Region", country: "Ghana", formatted: "Medina, Greater Accra Region, Ghana" },
  { city: "Gbawe", state_province: "Greater Accra Region", country: "Ghana", formatted: "Gbawe, Greater Accra Region, Ghana" },
  { city: "Sunyani", state_province: "Bono Region", country: "Ghana", formatted: "Sunyani, Bono Region, Ghana" },

  // Kenya - Major Cities
  { city: "Nairobi", state_province: "Nairobi County", country: "Kenya", formatted: "Nairobi, Nairobi County, Kenya" },
  { city: "Mombasa", state_province: "Mombasa County", country: "Kenya", formatted: "Mombasa, Mombasa County, Kenya" },
  { city: "Kisumu", state_province: "Kisumu County", country: "Kenya", formatted: "Kisumu, Kisumu County, Kenya" },
  { city: "Nakuru", state_province: "Nakuru County", country: "Kenya", formatted: "Nakuru, Nakuru County, Kenya" },
  { city: "Eldoret", state_province: "Uasin Gishu County", country: "Kenya", formatted: "Eldoret, Uasin Gishu County, Kenya" },
  { city: "Kehancha", state_province: "Migori County", country: "Kenya", formatted: "Kehancha, Migori County, Kenya" },
  { city: "Kitale", state_province: "Trans-Nzoia County", country: "Kenya", formatted: "Kitale, Trans-Nzoia County, Kenya" },
  { city: "Malindi", state_province: "Kilifi County", country: "Kenya", formatted: "Malindi, Kilifi County, Kenya" },
  { city: "Garissa", state_province: "Garissa County", country: "Kenya", formatted: "Garissa, Garissa County, Kenya" },
  { city: "Kakamega", state_province: "Kakamega County", country: "Kenya", formatted: "Kakamega, Kakamega County, Kenya" },

  // South Africa - Major Cities
  { city: "Johannesburg", state_province: "Gauteng", country: "South Africa", formatted: "Johannesburg, Gauteng, South Africa" },
  { city: "Cape Town", state_province: "Western Cape", country: "South Africa", formatted: "Cape Town, Western Cape, South Africa" },
  { city: "Durban", state_province: "KwaZulu-Natal", country: "South Africa", formatted: "Durban, KwaZulu-Natal, South Africa" },
  { city: "Pretoria", state_province: "Gauteng", country: "South Africa", formatted: "Pretoria, Gauteng, South Africa" },
  { city: "Port Elizabeth", state_province: "Eastern Cape", country: "South Africa", formatted: "Port Elizabeth, Eastern Cape, South Africa" },
  { city: "Pietermaritzburg", state_province: "KwaZulu-Natal", country: "South Africa", formatted: "Pietermaritzburg, KwaZulu-Natal, South Africa" },
  { city: "Benoni", state_province: "Gauteng", country: "South Africa", formatted: "Benoni, Gauteng, South Africa" },
  { city: "Tembisa", state_province: "Gauteng", country: "South Africa", formatted: "Tembisa, Gauteng, South Africa" },
  { city: "East London", state_province: "Eastern Cape", country: "South Africa", formatted: "East London, Eastern Cape, South Africa" },
  { city: "Vereeniging", state_province: "Gauteng", country: "South Africa", formatted: "Vereeniging, Gauteng, South Africa" },

  // France - Major Cities
  { city: "Paris", state_province: "Île-de-France", country: "France", formatted: "Paris, Île-de-France, France" },
  { city: "Marseille", state_province: "Provence-Alpes-Côte d'Azur", country: "France", formatted: "Marseille, Provence-Alpes-Côte d'Azur, France" },
  { city: "Lyon", state_province: "Auvergne-Rhône-Alpes", country: "France", formatted: "Lyon, Auvergne-Rhône-Alpes, France" },
  { city: "Toulouse", state_province: "Occitanie", country: "France", formatted: "Toulouse, Occitanie, France" },
  { city: "Nice", state_province: "Provence-Alpes-Côte d'Azur", country: "France", formatted: "Nice, Provence-Alpes-Côte d'Azur, France" },
  { city: "Nantes", state_province: "Pays de la Loire", country: "France", formatted: "Nantes, Pays de la Loire, France" },
  { city: "Strasbourg", state_province: "Grand Est", country: "France", formatted: "Strasbourg, Grand Est, France" },
  { city: "Montpellier", state_province: "Occitanie", country: "France", formatted: "Montpellier, Occitanie, France" },
  { city: "Bordeaux", state_province: "Nouvelle-Aquitaine", country: "France", formatted: "Bordeaux, Nouvelle-Aquitaine, France" },
  { city: "Lille", state_province: "Hauts-de-France", country: "France", formatted: "Lille, Hauts-de-France, France" },

  // Germany - Major Cities
  { city: "Berlin", state_province: "Berlin", country: "Germany", formatted: "Berlin, Berlin, Germany" },
  { city: "Hamburg", state_province: "Hamburg", country: "Germany", formatted: "Hamburg, Hamburg, Germany" },
  { city: "Munich", state_province: "Bavaria", country: "Germany", formatted: "Munich, Bavaria, Germany" },
  { city: "Cologne", state_province: "North Rhine-Westphalia", country: "Germany", formatted: "Cologne, North Rhine-Westphalia, Germany" },
  { city: "Frankfurt am Main", state_province: "Hesse", country: "Germany", formatted: "Frankfurt am Main, Hesse, Germany" },
  { city: "Stuttgart", state_province: "Baden-Württemberg", country: "Germany", formatted: "Stuttgart, Baden-Württemberg, Germany" },
  { city: "Düsseldorf", state_province: "North Rhine-Westphalia", country: "Germany", formatted: "Düsseldorf, North Rhine-Westphalia, Germany" },
  { city: "Dortmund", state_province: "North Rhine-Westphalia", country: "Germany", formatted: "Dortmund, North Rhine-Westphalia, Germany" },
  { city: "Essen", state_province: "North Rhine-Westphalia", country: "Germany", formatted: "Essen, North Rhine-Westphalia, Germany" },
  { city: "Leipzig", state_province: "Saxony", country: "Germany", formatted: "Leipzig, Saxony, Germany" },

  // Additional African Countries
  // Ethiopia
  { city: "Addis Ababa", state_province: "Addis Ababa", country: "Ethiopia", formatted: "Addis Ababa, Addis Ababa, Ethiopia" },
  { city: "Dire Dawa", state_province: "Dire Dawa", country: "Ethiopia", formatted: "Dire Dawa, Dire Dawa, Ethiopia" },
  { city: "Mekelle", state_province: "Tigray Region", country: "Ethiopia", formatted: "Mekelle, Tigray Region, Ethiopia" },
  { city: "Adama", state_province: "Oromia Region", country: "Ethiopia", formatted: "Adama, Oromia Region, Ethiopia" },
  { city: "Awassa", state_province: "Southern Nations, Nationalities, and Peoples' Region", country: "Ethiopia", formatted: "Awassa, SNNPR, Ethiopia" },

  // Egypt
  { city: "Cairo", state_province: "Cairo Governorate", country: "Egypt", formatted: "Cairo, Cairo Governorate, Egypt" },
  { city: "Alexandria", state_province: "Alexandria Governorate", country: "Egypt", formatted: "Alexandria, Alexandria Governorate, Egypt" },
  { city: "Giza", state_province: "Giza Governorate", country: "Egypt", formatted: "Giza, Giza Governorate, Egypt" },
  { city: "Shubra El Kheima", state_province: "Qalyubia Governorate", country: "Egypt", formatted: "Shubra El Kheima, Qalyubia Governorate, Egypt" },
  { city: "Port Said", state_province: "Port Said Governorate", country: "Egypt", formatted: "Port Said, Port Said Governorate, Egypt" },

  // Morocco
  { city: "Casablanca", state_province: "Casablanca-Settat", country: "Morocco", formatted: "Casablanca, Casablanca-Settat, Morocco" },
  { city: "Rabat", state_province: "Rabat-Salé-Kénitra", country: "Morocco", formatted: "Rabat, Rabat-Salé-Kénitra, Morocco" },
  { city: "Fez", state_province: "Fès-Meknès", country: "Morocco", formatted: "Fez, Fès-Meknès, Morocco" },
  { city: "Marrakech", state_province: "Marrakech-Safi", country: "Morocco", formatted: "Marrakech, Marrakech-Safi, Morocco" },
  { city: "Agadir", state_province: "Souss-Massa", country: "Morocco", formatted: "Agadir, Souss-Massa, Morocco" },

  // UAE
  { city: "Dubai", state_province: "Dubai", country: "United Arab Emirates", formatted: "Dubai, Dubai, United Arab Emirates" },
  { city: "Abu Dhabi", state_province: "Abu Dhabi", country: "United Arab Emirates", formatted: "Abu Dhabi, Abu Dhabi, United Arab Emirates" },
  { city: "Sharjah", state_province: "Sharjah", country: "United Arab Emirates", formatted: "Sharjah, Sharjah, United Arab Emirates" },
  { city: "Al Ain", state_province: "Abu Dhabi", country: "United Arab Emirates", formatted: "Al Ain, Abu Dhabi, United Arab Emirates" },

  // Other African Countries samples
  { city: "Kampala", state_province: "Central Region", country: "Uganda", formatted: "Kampala, Central Region, Uganda" },
  { city: "Gulu", state_province: "Northern Region", country: "Uganda", formatted: "Gulu, Northern Region, Uganda" },
  { city: "Mbarara", state_province: "Western Region", country: "Uganda", formatted: "Mbarara, Western Region, Uganda" },

  { city: "Dar es Salaam", state_province: "Dar es Salaam Region", country: "Tanzania", formatted: "Dar es Salaam, Dar es Salaam Region, Tanzania" },
  { city: "Mwanza", state_province: "Mwanza Region", country: "Tanzania", formatted: "Mwanza, Mwanza Region, Tanzania" },
  { city: "Arusha", state_province: "Arusha Region", country: "Tanzania", formatted: "Arusha, Arusha Region, Tanzania" },

  { city: "Kigali", state_province: "Kigali Province", country: "Rwanda", formatted: "Kigali, Kigali Province, Rwanda" },
  { city: "Butare", state_province: "Southern Province", country: "Rwanda", formatted: "Butare, Southern Province, Rwanda" },

  { city: "Lusaka", state_province: "Lusaka Province", country: "Zambia", formatted: "Lusaka, Lusaka Province, Zambia" },
  { city: "Kitwe", state_province: "Copperbelt Province", country: "Zambia", formatted: "Kitwe, Copperbelt Province, Zambia" },

  { city: "Harare", state_province: "Harare Province", country: "Zimbabwe", formatted: "Harare, Harare Province, Zimbabwe" },
  { city: "Bulawayo", state_province: "Bulawayo Province", country: "Zimbabwe", formatted: "Bulawayo, Bulawayo Province, Zimbabwe" },

  { city: "Gaborone", state_province: "South-East District", country: "Botswana", formatted: "Gaborone, South-East District, Botswana" },
  { city: "Francistown", state_province: "North-East District", country: "Botswana", formatted: "Francistown, North-East District, Botswana" },

  { city: "Windhoek", state_province: "Khomas Region", country: "Namibia", formatted: "Windhoek, Khomas Region, Namibia" },
  { city: "Walvis Bay", state_province: "Erongo Region", country: "Namibia", formatted: "Walvis Bay, Erongo Region, Namibia" },

  { city: "Maputo", state_province: "Maputo Province", country: "Mozambique", formatted: "Maputo, Maputo Province, Mozambique" },
  { city: "Matola", state_province: "Maputo Province", country: "Mozambique", formatted: "Matola, Maputo Province, Mozambique" },

  { city: "Lilongwe", state_province: "Central Region", country: "Malawi", formatted: "Lilongwe, Central Region, Malawi" },
  { city: "Blantyre", state_province: "Southern Region", country: "Malawi", formatted: "Blantyre, Southern Region, Malawi" },

  { city: "Mbabane", state_province: "Hhohho Region", country: "Eswatini", formatted: "Mbabane, Hhohho Region, Eswatini" },
  { city: "Manzini", state_province: "Manzini Region", country: "Eswatini", formatted: "Manzini, Manzini Region, Eswatini" },

  { city: "Maseru", state_province: "Maseru District", country: "Lesotho", formatted: "Maseru, Maseru District, Lesotho" },
  { city: "Teyateyaneng", state_province: "Berea District", country: "Lesotho", formatted: "Teyateyaneng, Berea District, Lesotho" },
];

const ComprehensiveLocationInput: React.FC<ComprehensiveLocationInputProps> = ({
  id,
  label = "Location",
  value,
  onChange,
  placeholder = "City, State/Province, Country",
  required = false,
  showLabel = true,
  icon = false,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [filtered, setFiltered] = useState<LocationData[]>([]);
  const [focusIdx, setFocusIdx] = useState(-1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    if (!inputValue || inputValue.length < 2) {
      setFiltered([]);
      setShowOptions(false);
      return;
    }

    const searchTerm = inputValue.toLowerCase();
    const matches = COMPREHENSIVE_LOCATIONS.filter((location) =>
      location.formatted.toLowerCase().includes(searchTerm) ||
      location.city.toLowerCase().includes(searchTerm) ||
      location.country.toLowerCase().includes(searchTerm) ||
      (location.state_province && location.state_province.toLowerCase().includes(searchTerm))
    );

    setFiltered(matches.slice(0, 10)); // Show max 10 suggestions
    setShowOptions(true);
    setFocusIdx(-1);
  };

  const handleOptionClick = (location: LocationData) => {
    onChange(location.formatted);
    setFiltered([]);
    setShowOptions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowOptions(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showOptions || filtered.length === 0) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((idx) => (idx + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((idx) => (idx - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (focusIdx >= 0 && filtered[focusIdx]) {
        e.preventDefault();
        handleOptionClick(filtered[focusIdx]);
      }
    } else if (e.key === "Escape") {
      setShowOptions(false);
      setFocusIdx(-1);
    }
  };

  return (
    <div className="relative">
      {showLabel && (
        <Label htmlFor={id} className="flex items-center gap-2 mb-1">
          {icon && <MapPin className="h-4 w-4 text-dna-emerald" />}
          {label} {required && "*"}
        </Label>
      )}
      <Input
        id={id}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className="w-full"
      />
      {showOptions && filtered.length > 0 && (
        <ul className="absolute z-[999] bg-white border border-gray-200 rounded-md mt-1 left-0 right-0 shadow-lg max-h-60 overflow-auto">
          {filtered.map((location, idx) => (
            <li
              key={`${location.city}-${location.country}-${idx}`}
              className={`px-3 py-2 cursor-pointer hover:bg-dna-emerald/10 border-b border-gray-100 last:border-b-0 ${
                idx === focusIdx ? "bg-dna-emerald/20" : ""
              }`}
              onMouseDown={() => handleOptionClick(location)}
              onMouseEnter={() => setFocusIdx(idx)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm text-gray-900">{location.formatted}</span>
                <span className="text-xs text-gray-500">
                  {location.city} • {location.state_province || location.country}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComprehensiveLocationInput;
