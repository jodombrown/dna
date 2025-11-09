import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Users, HandHeart, ArrowRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import FiveCsCardModal from './FiveCsCardModal';

const ContributeSection = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cards = [
    {
      title: 'Financial Impact',
      subtitle: 'Invest in Africa\'s future',
      gradient: 'from-dna-emerald to-dna-forest',
    },
    {
      title: 'Skills & Time',
      subtitle: 'Share your expertise',
      gradient: 'from-dna-mint to-dna-emerald',
    },
    {
      title: 'Your Impact Summary',
      subtitle: 'Total contribution overview',
      gradient: 'from-dna-copper to-dna-gold',
    },
  ];

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  return (
    <section id="contribute-section" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-xl flex items-center justify-center">
                <HandHeart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Contribute
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Discover pathways to create lasting impact. Whether through investment, expertise, time, 
              or advocacy, find purposeful ways to advance Africa's progress.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                <Target className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Seven Pathways to Impact</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                <Users className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Skills-Based Contributions</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Real-Time Impact Tracking</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/contribute')}
              className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-2"
            >
              Explore Pathways to Impact
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative md:order-1">
            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden overflow-x-auto pb-4 hide-scrollbar">
              <div className="flex gap-4 px-4"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {cards.map((card, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-[85vw] cursor-pointer"
                    style={{ scrollSnapAlign: 'center' }}
                    onClick={() => handleCardClick(card)}
                  >
                    <div className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-1.5 shadow-2xl h-full`}>
                      <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
                        <div className={`bg-gradient-to-r ${card.gradient} text-white p-6`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{card.title}</h3>
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <p className="text-sm text-white/80">{card.subtitle}</p>
                        </div>
                        
                        <div className="p-6 space-y-4 flex-1">
                          <div className="text-center p-5 bg-gradient-to-br from-dna-emerald/10 to-dna-mint/10 rounded-xl border-2 border-dna-emerald/30 mb-4">
                            <p className="text-sm text-gray-600 mb-2">Total Contributions</p>
                            <p className="text-3xl font-bold text-dna-emerald mb-1">$127,500</p>
                            <p className="text-xs text-dna-forest">+$15K this month</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-4 bg-gradient-to-br from-dna-mint/20 to-dna-emerald/20 rounded-xl text-center">
                              <p className="text-2xl font-bold text-dna-emerald mb-1">8,847</p>
                              <p className="text-xs text-gray-600">Lives Impacted</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-dna-copper/20 to-dna-gold/20 rounded-xl text-center">
                              <p className="text-2xl font-bold text-dna-copper mb-1">23</p>
                              <p className="text-xs text-gray-600">Projects Funded</p>
                            </div>
                          </div>

                          <p className="text-center text-xs text-gray-500">Tap to view details →</p>
                        </div>
                      </div>
                    </div>
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
        cardType="contribute"
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

export default ContributeSection;
