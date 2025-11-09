import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Globe, Target, Network, ArrowRight, MapPin, Briefcase, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FiveCsCardModal from './FiveCsCardModal';

const ConnectSection = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cards = [
    {
      type: 'professionals',
      title: 'Suggested Connections',
      subtitle: 'People in your network',
      gradient: 'from-dna-emerald to-dna-forest',
    },
    {
      type: 'communities',
      title: 'Your Communities',
      subtitle: 'Groups you might like',
      gradient: 'from-dna-forest to-dna-emerald',
    },
    {
      type: 'opportunities',
      title: 'Opportunities For You',
      subtitle: 'Matched to your profile',
      gradient: 'from-dna-mint to-dna-emerald',
    },
  ];

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  return (
    <section id="connect-section" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Connect
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Build meaningful professional relationships across the diaspora. 
              Discover opportunities, expand your network, and find your tribe.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg hover:bg-dna-emerald/15 transition-colors">
                <Globe className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Global Network Access</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg hover:bg-dna-emerald/15 transition-colors">
                <Target className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Smart Opportunity Matching</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg hover:bg-dna-emerald/15 transition-colors">
                <Network className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Professional Communities</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/dna/connect')}
              className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-2"
            >
              Explore Network
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Horizontal scroll for mobile, carousel for desktop */}
          <div className="relative -mx-4 md:mx-0">
            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
              <div className="flex gap-4 pl-4 pr-4"
                style={{
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {cards.map((card, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-[85vw] max-w-sm cursor-pointer snap-center animate-fade-in"
                    onClick={() => handleCardClick(card)}
                  >
                    {card.type === 'professionals' && (
                      <div className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-1.5 shadow-2xl h-full`}>
                        <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
                          <div className={`bg-gradient-to-r ${card.gradient} text-white p-6`}>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{card.title}</h3>
                              <Users className="w-5 h-5" />
                            </div>
                            <p className="text-sm text-white/80">{card.subtitle}</p>
                          </div>
                          
                          <div className="p-6 space-y-4 flex-1">
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-dna-emerald/5 to-transparent rounded-xl border border-dna-emerald/20">
                              <div className="w-14 h-14 bg-gradient-to-br from-dna-ochre to-dna-gold rounded-full flex items-center justify-center text-white font-bold">AO</div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">Dr. Amara Okafor</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1 truncate">
                                  <Briefcase className="w-3 h-3 flex-shrink-0" /> FinTech Entrepreneur
                                </p>
                                <p className="text-xs text-dna-emerald flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 flex-shrink-0" /> Lagos → London
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-dna-mint/5 to-transparent rounded-xl border border-dna-mint/20">
                              <div className="w-14 h-14 bg-gradient-to-br from-dna-sunset to-dna-copper rounded-full flex items-center justify-center text-white font-bold">KA</div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">Prof. Kwame Asante</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1 truncate">
                                  <Briefcase className="w-3 h-3 flex-shrink-0" /> AgriTech Innovator
                                </p>
                                <p className="text-xs text-dna-emerald flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 flex-shrink-0" /> Accra → Toronto
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-center pt-2">
                              <p className="text-sm font-medium text-dna-forest">50+ professionals</p>
                              <p className="text-xs text-gray-500">Tap to view all →</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.type === 'communities' && (
                      <div className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-1.5 shadow-2xl h-full`}>
                        <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
                          <div className={`bg-gradient-to-r ${card.gradient} text-white p-6`}>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{card.title}</h3>
                              <Network className="w-5 h-5" />
                            </div>
                            <p className="text-sm text-white/80">{card.subtitle}</p>
                          </div>
                          
                          <div className="p-6 space-y-4 flex-1">
                            <div className="p-4 bg-gradient-to-br from-dna-emerald/10 to-dna-mint/10 rounded-xl border border-dna-emerald/30">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Globe className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold mb-1 truncate">African Tech Founders</h4>
                                  <p className="text-xs text-gray-600 mb-2">2,847 members</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-1 bg-dna-emerald/20 text-dna-forest text-xs rounded-full">Technology</span>
                                    <span className="px-2 py-1 bg-dna-mint/20 text-dna-forest text-xs rounded-full">Startups</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-br from-dna-mint/10 to-dna-emerald/10 rounded-xl border border-dna-mint/30">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Target className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold mb-1 truncate">Diaspora Investors</h4>
                                  <p className="text-xs text-gray-600 mb-2">1,523 members</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2 py-1 bg-dna-copper/20 text-dna-copper text-xs rounded-full">Investment</span>
                                    <span className="px-2 py-1 bg-dna-gold/20 text-dna-ochre text-xs rounded-full">Finance</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-center text-xs text-gray-500">Tap to view all →</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.type === 'opportunities' && (
                      <div className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-1.5 shadow-2xl h-full`}>
                        <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
                          <div className={`bg-gradient-to-r ${card.gradient} text-white p-6`}>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg">{card.title}</h3>
                              <Star className="w-5 h-5" />
                            </div>
                            <p className="text-sm text-white/80">{card.subtitle}</p>
                          </div>
                          
                          <div className="p-6 space-y-4 flex-1">
                            <div className="p-4 bg-gradient-to-r from-dna-gold/10 to-dna-copper/10 rounded-xl border border-dna-gold/30">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold truncate">Senior Product Designer</h4>
                                  <p className="text-sm text-gray-600 truncate">Flutterwave • Remote</p>
                                </div>
                                <span className="px-2 py-1 bg-dna-emerald/20 text-dna-forest text-xs rounded-full whitespace-nowrap ml-2">95% Match</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-3 line-clamp-2">Leading payment infrastructure for Africa. Join us in building the future.</p>
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">$120K-$150K</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Full-time</span>
                              </div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-dna-copper/10 to-dna-sunset/10 rounded-xl border border-dna-copper/30">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold truncate">Tech Advisor Needed</h4>
                                  <p className="text-sm text-gray-600 truncate">AgriTech Startup</p>
                                </div>
                                <span className="px-2 py-1 bg-dna-sunset/20 text-dna-sunset text-xs rounded-full whitespace-nowrap ml-2">88% Match</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-3 line-clamp-2">Early-stage startup revolutionizing farming in East Africa.</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Equity</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Part-time</span>
                              </div>
                            </div>
                            
                            <p className="text-center text-xs text-gray-500">Tap to view all →</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FiveCsCardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cardType="connect"
        cardData={selectedCard}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default ConnectSection;
