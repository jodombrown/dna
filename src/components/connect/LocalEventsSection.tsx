
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResponsiveHeading, ResponsiveText } from '@/components/ui/responsive-typography';
import { MapPin } from 'lucide-react';

const LocalEventsSection = () => {
  const regions = [
    { name: 'North America', active: true },
    { name: 'Europe', active: false },
    { name: 'Africa', active: false },
    { name: 'Asia & Pacific', active: false },
    { name: 'South America', active: false }
  ];

  const cities = [
    { name: 'Lagos', country: 'NG', events: 23, color: 'bg-green-500' },
    { name: 'Nairobi', country: 'KE', events: 18, color: 'bg-red-500' },
    { name: 'Cape Town', country: 'ZA', events: 15, color: 'bg-blue-500' },
    { name: 'Accra', country: 'GH', events: 12, color: 'bg-yellow-500' },
    { name: 'London', country: 'GB', events: 45, color: 'bg-purple-500' },
    { name: 'New York', country: 'US', events: 38, color: 'bg-red-600' },
    { name: 'Toronto', country: 'CA', events: 16, color: 'bg-blue-600' },
    { name: 'Paris', country: 'FR', events: 21, color: 'bg-indigo-500' }
  ];

  return (
    <section className="space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <ResponsiveHeading level={3} className="mb-2 sm:mb-3">
          Explore Local Events
        </ResponsiveHeading>
        <ResponsiveText className="text-gray-600 mb-4 sm:mb-6">
          See what's happening in major cities and diaspora hubs
        </ResponsiveText>
        
        {/* Region filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {regions.map((region) => (
            <Badge
              key={region.name}
              variant={region.active ? "default" : "outline"}
              className={`cursor-pointer transition-all hover-scale ${
                region.active 
                  ? 'bg-dna-emerald hover:bg-dna-forest text-white' 
                  : 'hover:bg-dna-mint hover:text-dna-forest hover:border-dna-mint'
              }`}
            >
              {region.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Cities grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        {cities.map((city, index) => (
          <div 
            key={city.name}
            className="group cursor-pointer animate-fade-in hover-scale"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <div className="text-center space-y-2 p-3 sm:p-4 rounded-xl bg-white hover:shadow-lg transition-all duration-300 border hover:border-gray-200">
              <div className={`w-12 h-12 mx-auto rounded-xl ${city.color} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                <span className="text-white font-bold text-sm">
                  {city.country}
                </span>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 text-sm group-hover:text-dna-forest transition-colors">
                  {city.name}
                </h4>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{city.events} Events</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LocalEventsSection;
