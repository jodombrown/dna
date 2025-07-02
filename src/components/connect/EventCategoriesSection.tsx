
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ResponsiveHeading, ResponsiveText } from '@/components/ui/responsive-typography';
import { 
  Laptop, 
  DollarSign,
  Palette,
  Heart,
  GraduationCap,
  Leaf,
  Users,
  Briefcase
} from 'lucide-react';

const EventCategoriesSection = () => {
  const categories = [
    {
      name: 'Technology',
      icon: Laptop,
      count: 145,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Tech meetups, hackathons, and innovation summits'
    },
    {
      name: 'Business & Finance',
      icon: DollarSign,
      count: 89,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      description: 'Investment forums, startup events, and business networking'
    },
    {
      name: 'Arts & Culture',
      icon: Palette,
      count: 67,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Cultural celebrations, art exhibitions, and creative workshops'
    },
    {
      name: 'Health & Wellness',
      icon: Heart,
      count: 45,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Healthcare innovation, wellness retreats, and fitness events'
    },
    {
      name: 'Education',
      icon: GraduationCap,
      count: 78,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'Skill development, workshops, and academic conferences'
    },
    {
      name: 'Climate & Environment',
      icon: Leaf,
      count: 34,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Sustainability forums, climate action, and green tech'
    }
  ];

  return (
    <section className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="text-center">
        <ResponsiveHeading level={3} className="mb-2 sm:mb-3">
          Browse by Category
        </ResponsiveHeading>
        <ResponsiveText className="text-gray-600">
          Find events that match your interests and professional focus
        </ResponsiveText>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <div 
              key={category.name}
              className="group cursor-pointer animate-fade-in hover-scale"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center space-y-3 p-4 rounded-xl bg-white hover:shadow-lg transition-all duration-300 border hover:border-gray-200">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${category.color} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 group-hover:text-dna-forest transition-colors">
                    {category.name}
                  </h4>
                  <Badge 
                    variant="outline" 
                    className="text-xs hover:bg-dna-mint hover:text-dna-forest hover:border-dna-mint transition-all"
                  >
                    {category.count} Events
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 group-hover:text-gray-600 transition-colors">
                  {category.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default EventCategoriesSection;
