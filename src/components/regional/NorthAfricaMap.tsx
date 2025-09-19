import React from 'react';
import { Card } from '@/components/ui/card';

interface NorthAfricaMapProps {
  onCountrySelect: (country: string) => void;
  selectedCountry: string | null;
  compareMode?: boolean;
  selectedCountries?: string[];
}

const NorthAfricaMap: React.FC<NorthAfricaMapProps> = ({ 
  onCountrySelect, 
  selectedCountry, 
  compareMode = false, 
  selectedCountries = [] 
}) => {
  const countries = [
    { name: 'Morocco', code: 'MA', color: 'hover:bg-morocco-red/20', flagColors: 'bg-gradient-to-r from-morocco-red to-morocco-green', flag: '🇲🇦' },
    { name: 'Algeria', code: 'DZ', color: 'hover:bg-algeria-green/20', flagColors: 'bg-gradient-to-r from-algeria-green to-white', flag: '🇩🇿' },
    { name: 'Tunisia', code: 'TN', color: 'hover:bg-tunisia-red/20', flagColors: 'bg-gradient-to-r from-tunisia-red to-white', flag: '🇹🇳' },
    { name: 'Libya', code: 'LY', color: 'hover:bg-libya-green/20', flagColors: 'bg-gradient-to-r from-libya-green via-libya-black to-libya-green', flag: '🇱🇾' },
    { name: 'Egypt', code: 'EG', color: 'hover:bg-egypt-red/20', flagColors: 'bg-gradient-to-b from-egypt-red via-egypt-white to-egypt-black', flag: '🇪🇬' },
    { name: 'Sudan', code: 'SD', color: 'hover:bg-sudan-red/20', flagColors: 'bg-gradient-to-b from-sudan-red via-sudan-white to-sudan-black', flag: '🇸🇩' }
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-north-africa-sand/10 border-dna-emerald/20">
      <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-2 w-2 rounded-full bg-gradient-to-r from-morocco-red to-egypt-red`} />
          <h3 className="text-xl font-semibold text-center bg-gradient-to-r from-dna-forest to-dna-emerald bg-clip-text text-transparent">
            Interactive North Africa Map
          </h3>
          <div className={`h-2 w-2 rounded-full bg-gradient-to-r from-algeria-green to-libya-green`} />
        </div>
        
        {/* Enhanced Country Grid */}
        <div className="bg-gradient-to-br from-north-africa-sand/20 to-dna-mint/10 rounded-xl p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-8 h-8 bg-dna-emerald rounded-full animate-pulse" />
            <div className="absolute bottom-4 right-4 w-6 h-6 bg-dna-copper rounded-full animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-north-africa-terracotta rounded-full animate-pulse delay-500" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl relative z-10">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => onCountrySelect(country.name)}
                className={`
                  group relative p-4 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden
                  ${selectedCountry === country.name 
                    ? 'border-dna-emerald bg-white shadow-xl scale-105 ring-2 ring-dna-emerald/30' 
                    : 'border-border hover:border-dna-emerald/50 bg-white/80 hover:bg-white hover:shadow-lg'
                  }
                `}
              >
                {/* Flag Color Strip */}
                <div className={`absolute top-0 left-0 w-full h-1 ${country.flagColors}`} />
                
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <div className="font-semibold text-sm text-dna-forest group-hover:text-dna-emerald transition-colors">
                    {country.name}
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${country.color} rounded-xl`} />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {selectedCountry 
              ? `Selected: ${selectedCountry}` 
              : 'Click on a country to explore detailed data'
            }
          </p>
        </div>
      </div>
    </Card>
  );
};

export default NorthAfricaMap;