
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
        , an ecosystem builder and entrepreneur dedicated to uniting Africa's diaspora for meaningful impact.
      </p>
    </div>
  );
};

export default HeroIntroduction;
