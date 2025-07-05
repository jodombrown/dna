
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { eventCategories } from './eventData';

const EventCategoriesSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Browse by Category</h3>
        <p className="text-gray-600">Find events that match your interests</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {eventCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white shadow-md hover:shadow-xl">
            <CardContent className="p-8 text-center">
              <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-3xl">{category.icon}</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-base mb-2">{category.name}</h4>
              <p className="text-sm text-gray-500">{category.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventCategoriesSection;
