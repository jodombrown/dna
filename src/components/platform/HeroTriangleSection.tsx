
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Handshake, Heart } from 'lucide-react';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';
import { useBreathingAnimation } from '@/hooks/useBreathingAnimation';

const HeroTriangleSection = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const connectRef = useBreathingAnimation();
  const collaborateRef = useBreathingAnimation();
  const contributeRef = useBreathingAnimation();

  return (
    <>
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              The DNA Framework
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-12 px-4">
              Our framework transforms how Africa's diaspora creates change. 
              Each pillar strengthens the others, multiplying your impact across the continent.
            </p>

            {/* Three Pillars Grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 px-4">
              {/* Connect Pillar */}
               <div ref={connectRef.elementRef} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                 <div className="flex justify-center mb-4 sm:mb-6">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-dna-forest rounded-xl flex items-center justify-center">
                     <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                   </div>
                 </div>
                 <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-dna-forest mb-3 sm:mb-4">Connect</h3>
                 <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                   Forge powerful bonds across the global African Diaspora. Tap into a vibrant ecosystem of innovators, leaders, and changemakers ready to move the continent forward, together.
                 </p>
               </div>

              {/* Collaborate Pillar */}
               <div ref={collaborateRef.elementRef} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                 <div className="flex justify-center mb-4 sm:mb-6">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-dna-copper rounded-xl flex items-center justify-center">
                     <Handshake className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                   </div>
                 </div>
                 <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-dna-copper mb-3 sm:mb-4">Collaborate</h3>
                 <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                   Transform shared vision into action. Partner on high-impact initiatives, co-create solutions, and mobilize talent to build what Africa needs now and next.
                 </p>
               </div>

              {/* Contribute Pillar */}
               <div ref={contributeRef.elementRef} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 sm:col-span-2 md:col-span-1">
                 <div className="flex justify-center mb-4 sm:mb-6">
                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-dna-emerald rounded-xl flex items-center justify-center">
                     <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                   </div>
                 </div>
                 <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-dna-emerald mb-3 sm:mb-4">Contribute</h3>
                 <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                   Step into your role in Africa's future. Invest your skills, capital, or influence in ways that drive tangible change and leave a legacy that matters.
                 </p>
               </div>
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
