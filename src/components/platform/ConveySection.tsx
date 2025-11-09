import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Newspaper, TrendingUp, MessageSquare, Heart, ArrowRight, Eye, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FiveCsCardModal from './FiveCsCardModal';

const ConveySection = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cards = [
    {
      title: 'Innovation Hub Empowers 500+ African Entrepreneurs',
      category: 'Tech & Innovation',
      readTime: '5 min read',
      gradient: 'from-dna-ochre to-dna-gold',
    },
    {
      title: 'Diaspora Investment Reaches $2B in African Startups',
      category: 'Finance & Investment',
      readTime: '7 min read',
      gradient: 'from-dna-gold to-dna-copper',
    },
    {
      title: 'From Brooklyn to Kigali: A Developer\'s Journey Home',
      category: 'Community Impact',
      readTime: '4 min read',
      gradient: 'from-dna-sunset to-dna-ochre',
    },
  ];

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  return (
    <section id="convey-section" className="mb-16 w-full -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="text-center mb-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-dna-ochre to-dna-gold rounded-xl flex items-center justify-center">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Convey</h2>
        </div>
        <p className="text-lg text-gray-600">
          Stay connected to the stories that matter. Curated news, impact stories,
          and diaspora voices shaping Africa's future.
        </p>
        <div className="mt-6">
          <Button 
            onClick={() => navigate('/convey')}
            className="bg-dna-ochre hover:bg-dna-gold text-white inline-flex items-center gap-2"
          >
            Read Stories
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {cards.map((card, index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-72 sm:w-80 cursor-pointer animate-fade-in"
              onClick={() => handleCardClick(card)}
            >
              <div className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-1.5 shadow-2xl h-full`}>
                <div className="bg-white rounded-[22px] overflow-hidden h-full flex flex-col">
                  <div className="relative">
                    <div className="h-40 bg-gradient-to-br from-dna-emerald via-dna-mint to-dna-forest"></div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur text-dna-ochre text-xs font-semibold rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" /> Featured
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-dna-emerald/10 text-dna-emerald text-xs rounded-full">{card.category}</span>
                      <span className="text-xs text-gray-500">• {card.readTime}</span>
                    </div>

                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{card.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      How diaspora-funded incubator is transforming startup ecosystem across West Africa.
                    </p>

                    <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-1 text-sm">
                        <Heart className="w-4 h-4 text-dna-sunset" />
                        <span className="font-semibold">1.2K</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <MessageSquare className="w-4 h-4 text-dna-copper" />
                        <span className="font-semibold">340</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="w-4 h-4 text-dna-ochre" />
                        <span className="font-semibold">15.3K</span>
                      </div>
                    </div>

                    <p className="text-center text-xs text-gray-500">Tap to read full story →</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">← Scroll to explore stories →</p>
        </div>
      </div>

      <FiveCsCardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cardType="convey"
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

export default ConveySection;
