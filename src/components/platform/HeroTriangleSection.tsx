import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Handshake, Heart, ArrowDown } from 'lucide-react';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';

const HeroTriangleSection = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              The DNA Framework
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Our framework transforms how Africa's diaspora creates change. 
              Each pillar strengthens the others, multiplying your impact across the continent.
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
                  Forge powerful bonds across the global African diaspora.
                </p>
                <div className="flex items-center justify-center text-dna-emerald group-hover:text-dna-forest transition-colors">
                  <span className="text-sm font-medium mr-2">Learn More</span>
                  <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
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
                  Transform shared vision into action through partnerships.
                </p>
                <div className="flex items-center justify-center text-dna-copper group-hover:text-dna-gold transition-colors">
                  <span className="text-sm font-medium mr-2">Learn More</span>
                  <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
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
                  Step into your role in Africa's future with tangible impact.
                </p>
                <div className="flex items-center justify-center text-dna-emerald group-hover:text-dna-mint transition-colors">
                  <span className="text-sm font-medium mr-2">Learn More</span>
                  <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
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