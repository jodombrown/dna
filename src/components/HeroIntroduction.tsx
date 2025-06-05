
import React from 'react';

const HeroIntroduction = () => {
  return (
    <div className="max-w-3xl mx-auto mb-12">
      <p className="text-lg md:text-xl mb-6 text-dna-forest leading-relaxed">
        Welcome! I'm{' '}
        <a 
          href="https://www.linkedin.com/in/jaunelamarr/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-dna-copper hover:text-dna-gold underline font-semibold"
        >
          Jaune Odombrown
        </a>
        , and I'm excited to invite you to be part of something extraordinary.
      </p>
      
      <p className="text-base md:text-lg mb-6 text-gray-700 leading-relaxed">
        As an ecosystem builder, entrepreneur, and investor, I've dedicated my career to empowering communities and driving meaningful change. Through capacity building, venture development, and ecosystem creation, I've had the privilege of helping individuals, organizations, and communities realize their full potential.
      </p>

      <p className="text-base md:text-lg mb-6 text-gray-700 leading-relaxed">
        Now, my journey has come full circle—rooted in a deep commitment to uniting the African Diaspora to help mobilize Africa's progress. This vision led me to create the Diaspora Network of Africa (DNA).
      </p>
    </div>
  );
};

export default HeroIntroduction;
