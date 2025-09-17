import React from 'react';
import { Card } from '@/components/ui/card';

interface NorthAfricaMapProps {
  onCountrySelect: (country: string) => void;
  selectedCountry: string | null;
}

const NorthAfricaMap: React.FC<NorthAfricaMapProps> = ({ onCountrySelect, selectedCountry }) => {
  const countries = [
    { name: 'Morocco', code: 'MA', color: 'hover:fill-primary/80' },
    { name: 'Algeria', code: 'DZ', color: 'hover:fill-secondary/80' },
    { name: 'Tunisia', code: 'TN', color: 'hover:fill-accent/80' },
    { name: 'Libya', code: 'LY', color: 'hover:fill-primary/60' },
    { name: 'Egypt', code: 'EG', color: 'hover:fill-secondary/60' },
    { name: 'Sudan', code: 'SD', color: 'hover:fill-accent/60' }
  ];

  return (
    <Card className="p-6">
      <div className="relative">
        <h3 className="text-xl font-semibold mb-4 text-center">Interactive North Africa Map</h3>
        
        {/* Simplified SVG Map Placeholder */}
        <div className="bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-md">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => onCountrySelect(country.name)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-300 text-left
                  ${selectedCountry === country.name 
                    ? 'border-primary bg-primary/20 shadow-lg scale-105' 
                    : 'border-border hover:border-primary/50 hover:bg-primary/10'
                  }
                `}
              >
                <div className="font-semibold text-sm mb-1">{country.name}</div>
                <div className="text-xs text-muted-foreground">{country.code}</div>
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