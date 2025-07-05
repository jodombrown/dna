
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { localEvents } from './eventData';

const LocalEventsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Explore Local Events</h3>
        <p className="text-gray-600">See what's happening in major cities and diaspora hubs</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {localEvents.map((location) => (
          <Card key={location.city} className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white shadow-md hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <div className={`w-16 h-16 ${location.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-3xl">{location.flag}</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-base mb-2">{location.city}</h4>
              <p className="text-sm text-gray-500">{location.count} Events</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LocalEventsSection;
