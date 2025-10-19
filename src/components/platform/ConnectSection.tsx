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
          
          <div className="relative">
            <div 
              ref={cardRef.elementRef}
              className="bg-gradient-to-br from-dna-emerald to-dna-forest rounded-3xl p-1.5 shadow-2xl cursor-pointer hover:shadow-3xl transition-all hover:scale-[1.02]"
              onClick={() => navigate('/dna/connect')}
            >
              <div className="bg-white rounded-[22px] overflow-hidden p-5">
                <div className="bg-dna-emerald text-white p-4 text-center">
                  <h3 className="font-semibold">Your Professional Network</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-dna-ochre rounded-full"></div>
                    <div>
                      <p className="font-medium">Dr. Amara Okafor</p>
                      <p className="text-sm text-gray-600">FinTech • Lagos → London</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-auto animate-heartbeat bg-dna-forest hover:bg-dna-emerald text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/dna/connect');
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-dna-sunset rounded-full"></div>
                    <div>
                      <p className="font-medium">Prof. Kwame Asante</p>
                      <p className="text-sm text-gray-600">AgriTech • Accra → Toronto</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-auto animate-heartbeat-delayed bg-dna-forest hover:bg-dna-emerald text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/dna/connect');
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">50+ professionals in your network</p>
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
