import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Globe, Target, Network, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBreathingAnimation } from '@/hooks/useBreathingAnimation';

const ConnectSection = () => {
  const navigate = useNavigate();
  const cardRef = useBreathingAnimation();

  return (
    <section id="connect-section" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Connect
              </h2>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Build meaningful professional relationships across the diaspora. 
              Discover opportunities, expand your network, and find your tribe.
            </p>
            
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-dna-mint/10 rounded-lg">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-dna-emerald flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Global Network Access</span>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-dna-mint/10 rounded-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-dna-emerald flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Smart Opportunity Matching</span>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-dna-mint/10 rounded-lg">
                <Network className="w-4 h-4 sm:w-5 sm:h-5 text-dna-emerald flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Professional Communities</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/connect')}
              className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-2 min-h-[48px] px-6 py-3 text-base font-semibold touch-manipulation"
            >
              Explore Network
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative order-1 md:order-2">
            <div 
              ref={cardRef.elementRef}
              className="bg-white rounded-2xl shadow-2xl hover:shadow-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] p-6 touch-manipulation min-h-[420px]"
              onClick={() => navigate('/connect')}
            >
              <div className="w-full h-full">
                <div className="bg-dna-emerald text-white p-4 text-center rounded-t-xl -m-6 mb-6">
                  <h3 className="font-semibold text-base">Your Professional Network</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[80px] flex items-center gap-3">
                    <div className="w-12 h-12 bg-dna-copper rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base truncate">Dr. Amara Okafor</p>
                      <p className="text-sm text-gray-600 truncate">FinTech • Lagos → London</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-auto bg-dna-forest hover:bg-dna-emerald text-white text-sm px-4 py-2 min-h-[36px] touch-manipulation flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/connect');
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[80px] flex items-center gap-3">
                    <div className="w-12 h-12 bg-dna-gold rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base truncate">Prof. Kwame Asante</p>
                      <p className="text-sm text-gray-600 truncate">AgriTech • Accra → Toronto</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-auto bg-dna-forest hover:bg-dna-emerald text-white text-sm px-4 py-2 min-h-[36px] touch-manipulation flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/connect');
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                  
                  <div className="text-center py-4 border-t border-gray-100 mt-6">
                    <p className="text-sm font-medium text-gray-900">50+ professionals in your network</p>
                    <p className="text-xs text-dna-emerald">New connections available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectSection;
