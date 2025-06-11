
import React from 'react';
import { Button } from '@/components/ui/button';
import SimpleEmailForm from '@/components/SimpleEmailForm';
import HeroIntroduction from '@/components/HeroIntroduction';
import DiasporaStats from '@/components/DiasporaStats';
import PlatformBadges from '@/components/PlatformBadges';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 pt-20">
      {/* Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[90vh] py-12">
          
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <img 
                src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                alt="DNA" 
                className="h-16 w-auto"
              />
            </div>

            {/* Main Headline */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-dna-forest mb-6">
                Welcome to the
                <br />
                <span className="text-dna-copper">Diaspora Network of Africa</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                Connecting Africa's diaspora professionals for meaningful global impact through 
                <span className="font-semibold text-dna-emerald"> capacity building</span>, 
                <span className="font-semibold text-dna-copper"> venture development</span>, and 
                <span className="font-semibold text-dna-forest"> ecosystem building</span>.
              </p>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 text-lg font-semibold rounded-full"
                >
                  Explore Our Platform
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white px-8 py-4 text-lg font-semibold rounded-full"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Platform Development Badges */}
            <div className="flex justify-center lg:justify-start">
              <PlatformBadges />
            </div>
          </div>

          {/* Right Column - Introduction & Stats */}
          <div className="space-y-8">
            {/* Jaune's Introduction */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-dna-mint/20">
              <HeroIntroduction />
            </div>

            {/* Diaspora Statistics */}
            <div className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 rounded-2xl p-8">
              <DiasporaStats />
            </div>
          </div>
        </div>

        {/* Email Collection Form Section */}
        <div className="pb-16">
          <SimpleEmailForm />
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-dna-mint/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-dna-copper/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default HeroSection;
