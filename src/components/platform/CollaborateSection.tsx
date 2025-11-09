import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Handshake, Briefcase, Network, TrendingUp, ArrowRight, Users, DollarSign, Calendar, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import FiveCsCardModal from './FiveCsCardModal';

const CollaborateSection = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cards = [
    {
      title: 'Solar Education Initiative',
      status: 'Active',
      gradient: 'from-dna-copper to-dna-gold',
    },
    {
      title: 'HealthTech Platform',
      status: 'Planning',
      gradient: 'from-dna-gold to-dna-ochre',
    },
    {
      title: 'AgriTech Supply Chain',
      status: 'Seeking Team',
      gradient: 'from-dna-emerald to-dna-forest',
    },
  ];

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  return (
    <section id="collaborate-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-1 md:order-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-copper to-dna-gold rounded-xl flex items-center justify-center">
                <Handshake className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Collaborate
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Work together on meaningful projects that drive African development. 
              Pool resources, share knowledge, and amplify collective impact.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-copper/10 rounded-lg">
                <Briefcase className="w-5 h-5 text-dna-copper" />
                <span className="font-medium">Cross-Border Project Teams</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-copper/10 rounded-lg">
                <Network className="w-5 h-5 text-dna-copper" />
                <span className="font-medium">Knowledge Sharing Platforms</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-copper/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-dna-copper" />
                <span className="font-medium">Resource Pooling Tools</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/collaborate')}
              className="bg-dna-copper hover:bg-dna-gold text-white flex items-center gap-2"
            >
              Explore Active Collaborations
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="order-2 md:order-2 w-full -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="bg-white py-8 px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {cards.map((card, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-72 sm:w-80 cursor-pointer animate-fade-in"
                    onClick={() => handleCardClick(card)}
                  >
                    <div className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-1.5 shadow-2xl h-full`}>
                      <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
                        <div className={`bg-gradient-to-r ${card.gradient} text-white p-6`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">Active Projects</h3>
                            <Handshake className="w-5 h-5" />
                          </div>
                          <p className="text-sm text-white/80">Live collaborations</p>
                        </div>
                        
                        <div className="p-6 space-y-4 flex-1">
                          <div className="p-4 bg-gradient-to-br from-dna-emerald/5 to-dna-copper/5 rounded-xl border-2 border-dna-emerald/30">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h4 className="font-bold truncate">{card.title}</h4>
                                  <Badge className="bg-dna-emerald text-white text-xs">{card.status}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">Bringing sustainable energy to rural schools</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-dna-copper">68%</span>
                              </div>
                              <Progress value={68} className="h-2" />
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="text-center p-2 bg-dna-copper/10 rounded-lg">
                                <Users className="w-4 h-4 mx-auto mb-1 text-dna-copper" />
                                <p className="text-xs font-semibold">12</p>
                                <p className="text-xs text-gray-500">Team</p>
                              </div>
                              <div className="text-center p-2 bg-dna-gold/10 rounded-lg">
                                <Target className="w-4 h-4 mx-auto mb-1 text-dna-ochre" />
                                <p className="text-xs font-semibold">6</p>
                                <p className="text-xs text-gray-500">Countries</p>
                              </div>
                              <div className="text-center p-2 bg-dna-emerald/10 rounded-lg">
                                <DollarSign className="w-4 h-4 mx-auto mb-1 text-dna-emerald" />
                                <p className="text-xs font-semibold">$2.3M</p>
                                <p className="text-xs text-gray-500">Pooled</p>
                              </div>
                            </div>

                            <p className="text-center text-xs text-gray-500">Tap to view project →</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">← Scroll to explore projects →</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FiveCsCardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cardType="collaborate"
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

export default CollaborateSection;
