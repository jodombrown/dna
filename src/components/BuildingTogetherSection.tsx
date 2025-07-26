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

        {/* Transition Content with Phase Icons */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-6 mb-8">
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
          <h3 className="text-3xl md:text-4xl font-bold text-dna-forest mb-4">
            Join Us in Shaping Africa's Future
          </h3>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            <span className="font-semibold text-dna-forest">Why we're building in the open:</span> We believe openness builds trust. Watch us create the 
            platform, share feedback, and join our community as we grow together.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Share Feedback Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-dna-copper/20 transition-colors">
                <MessageCircle className="w-8 h-8 text-dna-copper" />
              </div>
              <h3 className="text-2xl font-bold text-dna-forest mb-4">Share Feedback</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Help us build better by sharing your thoughts and ideas
              </p>
              <Button 
                className="bg-dna-copper hover:bg-dna-forest text-white rounded-full px-6 py-2 transition-all duration-300"
                onClick={() => window.open('mailto:feedback@diasporanetwork.africa', '_blank')}
              >
                Give Feedback
              </Button>
            </CardContent>
          </Card>

          {/* Track Progress Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-dna-emerald/20 transition-colors">
                <Eye className="w-8 h-8 text-dna-emerald" />
              </div>
              <h3 className="text-2xl font-bold text-dna-forest mb-4">Track Our Progress</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Follow our development journey phase by phase
              </p>
              <Button 
                className="bg-dna-emerald hover:bg-dna-forest text-white rounded-full px-6 py-2 transition-all duration-300"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                View Phases
              </Button>
            </CardContent>
          </Card>

          {/* Learn About DNA Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-dna-forest/20 transition-colors">
                <BookOpen className="w-8 h-8 text-dna-forest" />
              </div>
              <h3 className="text-2xl font-bold text-dna-forest mb-4">Learn About DNA</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Understand our mission, vision, and approach
              </p>
              <Button 
                className="bg-dna-forest hover:bg-dna-emerald text-white rounded-full px-6 py-2 transition-all duration-300"
                onClick={() => window.location.href = '/about'}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BuildingTogetherSection;