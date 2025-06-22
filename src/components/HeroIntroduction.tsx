
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
      
      <p className="text-lg md:text-xl mb-6 text-dna-forest leading-relaxed">
        We are building the infrastructure for actionable, systemic change by mobilizing talent, capital, and expertise. We turn collective ambition into coordinated efforts that reshape systems, unlock opportunity, and drive sustainable development.
      </p>
    </div>
  );
};

export default HeroIntroduction;
