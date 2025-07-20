import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Handshake, Briefcase, Zap, Lightbulb, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBreathingAnimation } from '@/hooks/useBreathingAnimation';

const CollaborateSection = () => {
  const navigate = useNavigate();
  const cardRef = useBreathingAnimation();

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          <div className="relative">
            <div 
              ref={cardRef.elementRef}
              className="w-full bg-white p-6 rounded-2xl shadow-2xl hover:shadow-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] touch-manipulation min-h-[420px]"
              onClick={() => navigate('/collaborate')}
            >
              <div className="w-full h-full">
                <div className="bg-dna-copper text-white p-4 text-center rounded-t-xl -m-6 mb-6">
                  <h3 className="font-semibold text-base">Active Collaborations</h3>
                </div>
                
                <div className="space-y-4 text-left">
                  {/* Solar Education Initiative - Enhanced Card */}
                  <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[120px] flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-base text-gray-900">Solar Education Initiative</h4>
                      <Badge className="bg-dna-emerald text-white text-xs px-3 py-1">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">12 collaborators • 6 countries • $2.3M pooled</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center -space-x-2">
                        <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-dna-emerald text-white text-xs"></AvatarFallback>
                        </Avatar>
                        <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-dna-copper text-white text-xs"></AvatarFallback>
                        </Avatar>
                        <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-dna-gold text-white text-xs"></AvatarFallback>
                        </Avatar>
                        <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">+9</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HealthTech Platform - Enhanced Card */}
                  <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 min-h-[120px] flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-base text-gray-900">HealthTech Platform</h4>
                      <Badge variant="outline" className="border-dna-copper text-dna-copper text-xs px-3 py-1">Planning</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">8 collaborators • 4 countries • $1.8M committed</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center -space-x-2">
                        <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-dna-mint text-dna-forest text-xs"></AvatarFallback>
                        </Avatar>
                        <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-dna-forest text-white text-xs"></AvatarFallback>
                        </Avatar>
                        <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">+6</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-4 border-t border-gray-100 mt-6">
                    <p className="text-sm font-medium text-gray-900">47+ active initiatives</p>
                    <p className="text-xs text-dna-copper">New opportunities weekly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-dna-copper to-dna-gold rounded-xl flex items-center justify-center">
                <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Collaborate
              </h2>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Turn ideas into action through strategic partnerships. 
              Co-create solutions that address Africa's greatest challenges.
            </p>
            
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-dna-copper/10 rounded-lg">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-dna-copper flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Cross-Border Project Teams</span>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-dna-copper/10 rounded-lg">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-dna-copper flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Innovation Challenges</span>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-dna-copper/10 rounded-lg">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-dna-copper flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Startup Incubation</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/collaborate')}
              className="bg-dna-copper hover:bg-dna-gold text-white flex items-center gap-2 min-h-[48px] px-6 py-3 text-base font-semibold touch-manipulation"
            >
              Join Collaborations
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollaborateSection;
