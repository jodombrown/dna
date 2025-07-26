import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Handshake, Heart, ArrowRight } from 'lucide-react';

const DNAFrameworkSection = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Connect",
      description: "Build meaningful relationships across the global African diaspora and access a network aligned with your skills, interests, and values.",
      icon: Users,
      gradient: "from-dna-emerald to-dna-forest",
      buttonText: "Explore Network",
      route: "/connect"
    },
    {
      title: "Collaborate", 
      description: "Join forces with experts, communities, and builders on mission-aligned initiatives making real impact on the ground.",
      icon: Handshake,
      gradient: "from-dna-copper to-dna-gold",
      buttonText: "View Initiatives",
      route: "/collaborate"
    },
    {
      title: "Contribute",
      description: "Whether it's your time, capital, or knowledge — track your impact and contribute meaningfully to Africa's future.",
      icon: Heart,
      gradient: "from-dna-mint to-dna-emerald",
      buttonText: "Pathways to Impact",
      route: "/contribute"
    }
  ];

  return (
    <section id="dnaFramework" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            How DNA Works
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Built on three powerful actions — Connect, Collaborate, and Contribute — DNA is designed to unlock your potential and maximize our collective impact.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex justify-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed text-center">
                  {feature.description}
                </p>
                
                <div className="text-center">
                  <Button 
                    variant="outline"
                    className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white rounded-full px-6 py-2"
                    onClick={() => navigate(feature.route)}
                  >
                    {feature.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DNAFrameworkSection;