
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TouchFriendlyButton } from '@/components/ui/mobile-optimized';
import { ResponsiveHeading, ResponsiveText } from '@/components/ui/responsive-typography';
import { ExternalLink, Users, Calendar } from 'lucide-react';

const FeaturedCalendarsSection = () => {
  const calendars = [
    {
      name: 'African Tech Innovators',
      description: 'Curating the best tech events across Africa and diaspora communities',
      avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face',
      events: 24,
      followers: 1200,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Diaspora Investment Circle',
      description: 'Investment opportunities and networking events for African investors',
      avatar: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=100&h=100&fit=crop&crop=face',
      events: 18,
      followers: 850,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      name: 'Women Leadership Network',
      description: 'Empowering African women in leadership through mentorship and events',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
      events: 32,
      followers: 2100,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <section className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <ResponsiveHeading level={3} className="mb-1 sm:mb-2">
            Featured Calendars
          </ResponsiveHeading>
          <ResponsiveText size="sm" className="text-gray-600">
            Curated event collections from community leaders
          </ResponsiveText>
        </div>
        <TouchFriendlyButton 
          variant="outline" 
          size="sm"
          className="text-dna-emerald border-dna-emerald hover:bg-dna-emerald hover:text-white transition-all"
        >
          View All
          <ExternalLink className="w-4 h-4 ml-2" />
        </TouchFriendlyButton>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {calendars.map((calendar, index) => (
          <Card 
            key={calendar.name} 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <div className={`h-20 bg-gradient-to-r ${calendar.color} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
            </div>
            
            <CardContent className="p-4 sm:p-6 relative">
              <div className="flex items-start gap-3 -mt-8 mb-4">
                <img
                  src={calendar.avatar}
                  alt={calendar.name}
                  className="w-12 h-12 rounded-xl border-4 border-white shadow-lg object-cover"
                />
                <div className="flex-1 pt-2">
                  <h4 className="font-bold text-gray-900 group-hover:text-dna-forest transition-colors">
                    {calendar.name}
                  </h4>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm leading-relaxed mb-4 group-hover:text-gray-800 transition-colors">
                {calendar.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-dna-copper" />
                  <span className="font-medium">{calendar.events} events</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-dna-emerald" />
                  <span className="font-medium">{calendar.followers} followers</span>
                </div>
              </div>
              
              <TouchFriendlyButton 
                variant="outline"
                size="sm"
                className="w-full border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white transition-all group/button"
              >
                Subscribe
                <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover/button:translate-x-1" />
              </TouchFriendlyButton>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCalendarsSection;
