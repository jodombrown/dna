import React from 'react';
import { Users, MapPin, Briefcase, ArrowRight, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SwipeableCardStack from './SwipeableCardStack';

const ConnectSection = () => {
  const navigate = useNavigate();

  const professionals = [
    {
      name: 'Amara Okafor',
      title: 'FinTech Product Lead',
      location: 'Lagos, Nigeria',
      interests: ['FinTech', 'Product', 'Payments'],
      mutualConnections: 3,
      gradient: 'from-dna-forest to-dna-emerald',
      initials: 'AO',
      color: 'bg-dna-emerald',
    },
    {
      name: 'Kwame Mensah',
      title: 'Impact Investor',
      location: 'Accra, Ghana',
      interests: ['Climate Tech', 'AgriTech', 'Venture'],
      mutualConnections: 5,
      gradient: 'from-dna-emerald to-dna-copper',
      initials: 'KM',
      color: 'bg-dna-copper',
    },
    {
      name: 'Zainab Hassan',
      title: 'Healthcare Innovation Director',
      location: 'Nairobi, Kenya',
      interests: ['HealthTech', 'AI', 'Innovation'],
      mutualConnections: 2,
      gradient: 'from-dna-copper to-dna-gold',
      initials: 'ZH',
      color: 'bg-dna-gold',
    },
  ];

  const handleCardClick = (index: number) => {
    navigate('/connect');
  };

  return (
    <section id="connect-section" className="mb-16 w-full -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="text-center mb-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-dna-forest to-dna-emerald rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Connect</h2>
        </div>
        <p className="text-xl font-semibold text-gray-900 mb-3">
          Your Network is Your Networth
        </p>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          Build your professional network by discovering diaspora professionals, entrepreneurs, investors, and creatives worldwide who share your interests and goals.
        </p>
        <Button 
          onClick={() => navigate('/connect')}
          className="bg-dna-forest hover:bg-dna-emerald text-white inline-flex items-center gap-2"
        >
          Discover Your People
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 w-full">
        <SwipeableCardStack
          cards={professionals.map((professional) => (
            <div className={`bg-gradient-to-br ${professional.gradient} rounded-3xl p-1.5 shadow-2xl h-full w-full`}>
              <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
                <div className={`bg-gradient-to-r ${professional.gradient} text-white p-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Diaspora Professional</h3>
                    <Network className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-white/80">Expand your network</p>
                </div>
                
                <div className="p-6 space-y-6 flex-1">
                  {/* Profile Section */}
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className={`${professional.color} text-white text-lg font-bold`}>
                        {professional.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-gray-900 mb-1">{professional.name}</h4>
                      <p className="text-sm font-medium text-gray-700 mb-2">{professional.title}</p>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{professional.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {professional.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-dna-emerald/10 text-dna-forest">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Mutual Connections */}
                  <div className="bg-dna-forest/5 rounded-xl p-4 border-2 border-dna-forest/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-dna-forest" />
                      <span className="text-sm font-semibold text-gray-900">
                        {professional.mutualConnections} mutual connections
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Connected through shared communities and interests
                    </p>
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full bg-gradient-to-r from-dna-forest to-dna-emerald hover:from-dna-emerald hover:to-dna-forest text-white font-semibold"
                  >
                    Connect Now
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    After connecting, see their upcoming events →
                  </p>
                </div>
              </div>
            </div>
          ))}
          onCardClick={handleCardClick}
        />
      </div>
    </section>
  );
};

export default ConnectSection;
