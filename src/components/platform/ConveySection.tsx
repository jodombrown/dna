import React from 'react';
import { Button } from '@/components/ui/button';
import { Newspaper, TrendingUp, MessageSquare, Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBreathingAnimation } from '@/hooks/useBreathingAnimation';

const ConveySection = () => {
  const navigate = useNavigate();
  const cardRef = useBreathingAnimation();

  return (
    <section id="convey-section" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <div 
              ref={cardRef.elementRef}
              className="bg-gradient-to-br from-dna-ochre to-dna-gold rounded-3xl p-1.5 shadow-2xl cursor-pointer hover:shadow-3xl transition-all hover:scale-[1.02]"
              onClick={() => navigate('/convey')}
            >
              <div className="bg-white rounded-[22px] overflow-hidden p-5">
                <div className="bg-dna-ochre text-white p-4 text-center">
                  <h3 className="font-semibold">Diaspora Impact Stories</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="p-4 border rounded-lg hover:border-dna-ochre/50 transition-colors">
                    <div className="flex gap-3 mb-2">
                      <div className="w-16 h-16 bg-dna-emerald rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-2">Innovation Hub Empowers 500+ African Entrepreneurs</p>
                        <p className="text-xs text-gray-500 mt-1">Tech & Innovation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> 1.2K
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> 340
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:border-dna-ochre/50 transition-colors">
                    <div className="flex gap-3 mb-2">
                      <div className="w-16 h-16 bg-dna-sunset rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm line-clamp-2">Diaspora Investment Reaches $2B in African Startups</p>
                        <p className="text-xs text-gray-500 mt-1">Finance & Investment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> 890
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> 210
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">200+ new stories this week</p>
                    <p className="text-xs text-dna-ochre">Stay informed & inspired</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-ochre to-dna-gold rounded-xl flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Convey
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Stay connected to the stories that matter. Curated news, impact stories, 
              and diaspora voices shaping Africa's future.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-ochre/10 rounded-lg hover:bg-dna-ochre/15 transition-colors">
                <TrendingUp className="w-5 h-5 text-dna-ochre" />
                <span className="font-medium">Curated Diaspora News</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-ochre/10 rounded-lg hover:bg-dna-ochre/15 transition-colors">
                <Heart className="w-5 h-5 text-dna-ochre" />
                <span className="font-medium">Community Impact Stories</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-ochre/10 rounded-lg hover:bg-dna-ochre/15 transition-colors">
                <MessageSquare className="w-5 h-5 text-dna-ochre" />
                <span className="font-medium">Authentic Diaspora Voices</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/convey')}
              className="bg-dna-ochre hover:bg-dna-gold text-white flex items-center gap-2"
            >
              Read Stories
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConveySection;
