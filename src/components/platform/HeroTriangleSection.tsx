
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Handshake, Heart, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';

const HeroTriangleSection = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <section id="dnaFramework" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              How DNA Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Built on three powerful actions — Connect, Collaborate, and Contribute — DNA is designed to unlock your potential and maximize our collective impact.
            </p>

            {/* Three Pillars Navigation */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Connect Navigation Button */}
              <button 
                onClick={() => scrollToSection('connect-section')}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:scale-105"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-dna-forest mb-3">Connect</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Build meaningful relationships across the global African diaspora and access a network aligned with your skills, interests, and values.
                </p>
                <div className="flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                    onClick={() => navigate('/connect')}
                  >
                    Explore Network
                  </Button>
                </div>
              </button>

              {/* Collaborate Navigation Button */}
              <button 
                onClick={() => scrollToSection('collaborate-section')}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:scale-105"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-dna-copper to-dna-gold rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Handshake className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-dna-copper mb-3">Collaborate</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Join forces with experts, communities, and builders on mission-aligned initiatives making real impact on the ground.
                </p>
                <div className="flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
                    onClick={() => navigate('/collaborate')}
                  >
                    View Initiatives
                  </Button>
                </div>
              </button>

              {/* Contribute Navigation Button */}
              <button 
                onClick={() => scrollToSection('contribute-section')}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:scale-105"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-dna-emerald mb-3">Contribute</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Whether it's your time, capital, or knowledge — track your impact and contribute meaningfully to Africa's future.
                </p>
                <div className="flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                    onClick={() => navigate('/contribute')}
                  >
                    Pathways to Impact
                  </Button>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <MainPageFeedbackPanel 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};

export default HeroTriangleSection;
