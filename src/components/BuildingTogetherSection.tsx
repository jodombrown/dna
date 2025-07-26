import React from 'react';
import PlatformBadges from './PlatformBadges';
import { MessageCircle, Eye, BookOpen, Search, Code, Users, Target, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const BuildingTogetherSection = () => {
  // Phase data with proper icons and colors
  const phases = [
    { 
      number: 1, 
      icon: Search, 
      color: 'blue-500',
      bgColor: 'bg-blue-500/10',
      hoverBg: 'hover:bg-blue-500',
      textColor: 'text-blue-500',
      hoverText: 'hover:text-white'
    },
    { 
      number: 2, 
      icon: Code, 
      color: 'dna-emerald',
      bgColor: 'bg-dna-emerald/10',
      hoverBg: 'hover:bg-dna-emerald',
      textColor: 'text-dna-emerald',
      hoverText: 'hover:text-white'
    },
    { 
      number: 3, 
      icon: Users, 
      color: 'green-500',
      bgColor: 'bg-green-500/10',
      hoverBg: 'hover:bg-green-500',
      textColor: 'text-green-500',
      hoverText: 'hover:text-white'
    },
    { 
      number: 4, 
      icon: Target, 
      color: 'dna-copper',
      bgColor: 'bg-dna-copper/10',
      hoverBg: 'hover:bg-dna-copper',
      textColor: 'text-dna-copper',
      hoverText: 'hover:text-white'
    },
    { 
      number: 5, 
      icon: BarChart3, 
      color: 'dna-mint',
      bgColor: 'bg-dna-mint/10',
      hoverBg: 'hover:bg-dna-mint',
      textColor: 'text-dna-mint',
      hoverText: 'hover:text-dna-forest'
    },
    { 
      number: 6, 
      icon: TrendingUp, 
      color: 'dna-gold',
      bgColor: 'bg-dna-gold/10',
      hoverBg: 'hover:bg-dna-gold',
      textColor: 'text-dna-gold',
      hoverText: 'hover:text-dna-forest'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-dna-mint/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Phase Development Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-dna-forest mb-6">
            Building Together: From Idea to Impact
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Follow our open development journey. Each phase shows you exactly what we're building, 
            why we're building it, and how you can get involved.
          </p>
          <PlatformBadges />
        </div>

        {/* Phase Icons */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-6">
            {phases.map((phase) => {
              const IconComponent = phase.icon;
              return (
                <div 
                  key={phase.number}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${phase.bgColor} ${phase.hoverBg} group`}
                >
                  <IconComponent className={`w-6 h-6 transition-colors ${phase.textColor} ${phase.hoverText}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuildingTogetherSection;