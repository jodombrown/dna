import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users2, Sparkles, ArrowRight, Clock, Globe, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FiveCsCardModal from './FiveCsCardModal';

const ConveneSection = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cards = [
    {
      title: 'African Tech Summit 2025',
      subtitle: 'The Future of Innovation',
      category: 'Conference',
      readTime: '3 day event',
      gradient: 'from-dna-sunset to-dna-copper',
    },
    {
      title: 'Diaspora Investment Forum',
      subtitle: 'Connect with Investors',
      category: 'Investment',
      readTime: 'Evening event',
      gradient: 'from-dna-copper to-dna-gold',
    },
    {
      title: 'Pan-African Cultural Festival',
      subtitle: 'Celebrate Our Heritage',
      category: 'Cultural',
      readTime: 'All day',
      gradient: 'from-dna-ochre to-dna-sunset',
    },
  ];

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  return (
    <section id="convene-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-sunset to-dna-copper rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Convene
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Discover and create meaningful gatherings across the diaspora. 
              From tech meetups to cultural celebrations, find your community events.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-sunset/10 rounded-lg hover:bg-dna-sunset/15 transition-colors">
                <MapPin className="w-5 h-5 text-dna-sunset" />
                <span className="font-medium">Diaspora Event Discovery</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-sunset/10 rounded-lg hover:bg-dna-sunset/15 transition-colors">
                <Users2 className="w-5 h-5 text-dna-sunset" />
                <span className="font-medium">Community Gatherings</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-sunset/10 rounded-lg hover:bg-dna-sunset/15 transition-colors">
                <Sparkles className="w-5 h-5 text-dna-sunset" />
                <span className="font-medium">Cultural Celebrations</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/convene')}
              className="bg-dna-sunset hover:bg-dna-copper text-white flex items-center gap-2"
            >
              Explore Events
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
                        <div className={`h-32 bg-gradient-to-br ${card.gradient} relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur text-dna-sunset text-xs font-semibold rounded-full">
                              {card.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6 flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                              <p className="text-sm text-gray-600">{card.subtitle}</p>
                            </div>
                            <Calendar className="w-5 h-5 text-dna-sunset mt-1 flex-shrink-0" />
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-dna-copper flex-shrink-0" />
                              <span className="text-gray-700">Lagos, Nigeria</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-dna-copper flex-shrink-0" />
                              <span className="text-gray-700">March 15-17, 2025</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users2 className="w-4 h-4 text-dna-copper flex-shrink-0" />
                              <span className="text-gray-700">250+ attending</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span className="px-2 py-1 bg-dna-sunset/10 text-dna-sunset text-xs rounded-full">Conference</span>
                            <span className="px-2 py-1 bg-dna-copper/10 text-dna-copper text-xs rounded-full">Tech</span>
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
        cardType="convene"
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

export default ConveneSection;
