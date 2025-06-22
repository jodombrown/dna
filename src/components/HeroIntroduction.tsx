
import React from 'react';

const HeroIntroduction = () => {
  return (
    <div className="max-w-3xl mx-auto mb-12">
      <p className="text-lg md:text-xl mb-6 text-dna-forest leading-relaxed">
        I'm{' '}
        <a 
          href="https://www.linkedin.com/in/jaunelamarr/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-dna-copper hover:text-dna-gold underline font-semibold"
        >
          Jaune Odombrown
        </a>
        , an ecosystem builder and entrepreneur committed to uniting visionary leaders, builders, and changemakers across the African diaspora. These are individuals driven by purpose, rich in talent, and ready to accelerate Africa's transformation.
      </p>
      
      <div className="border-l-4 border-dna-copper pl-6 mb-6">
        <p className="text-lg md:text-xl text-dna-forest leading-relaxed font-medium">
          This is more than a network.
        </p>
      </div>
      
      <p className="text-lg md:text-xl mb-6 text-dna-forest leading-relaxed">
        It is a dynamic platform for co-creation, co-investment, and shared leadership, designed to harness the full potential of the diaspora in shaping the systems that drive scalable, lasting impact.
      </p>
      
      <p className="text-lg md:text-xl text-dna-forest leading-relaxed font-medium">
        We are reimagining how the African diaspora fuels Africa's rise, transforming collective ambition into actionable, systemic change.
      </p>
    </div>
  );
};

export default HeroIntroduction;
