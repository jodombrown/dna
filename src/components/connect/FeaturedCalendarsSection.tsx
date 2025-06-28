
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { featuredCalendars } from './eventData';

const FeaturedCalendarsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Featured Calendars</h3>
          <p className="text-gray-600">Curated event collections from community leaders</p>
        </div>
        <Button variant="ghost" className="text-dna-emerald hover:text-dna-forest">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredCalendars.map((calendar) => (
          <Card key={calendar.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={calendar.logo}
                    alt={`${calendar.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 mb-2 truncate">{calendar.name}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{calendar.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="font-medium">{calendar.eventCount} events</span>
                    <span>{calendar.followers} followers</span>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
                Subscribe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCalendarsSection;
