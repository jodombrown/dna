
import React from 'react';
import EmailCollectionForm from '@/components/EmailCollectionForm';
import HeroIntroduction from '@/components/HeroIntroduction';
import DiasporaStats from '@/components/DiasporaStats';
import PlatformBadges from '@/components/PlatformBadges';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative bg-white pt-24">
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
            alt="DNA Platform" 
            className="h-24 w-auto mx-auto mb-8"
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-dna-forest">
          Welcome to the
          <br />
          <span className="text-dna-copper">Diaspora Network of Africa</span>
        </h1>

        {/* Jaune's Introduction */}
        <HeroIntroduction />

        {/* Diaspora Statistics and Mission */}
        <DiasporaStats />

        {/* Platform Development Badges */}
        <PlatformBadges />

        {/* Email Collection Form */}
        <div className="mb-16">
          <EmailCollectionForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
