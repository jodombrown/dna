import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import PlatformFeatureShowcase from '@/components/PlatformFeatureShowcase';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import HeroIntroduction from '@/components/HeroIntroduction';
import DiasporaStats from '@/components/DiasporaStats';
import PlatformBadges from '@/components/PlatformBadges';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Index = () => {
  useScrollToTop();

  const [openJourney, setOpenJourney] = useState(false);
  const navigate = useNavigate();

  const scrollToDNAFramework = () => {
    const frameworkSection = document.getElementById('dna-framework');
    if (frameworkSection) {
      frameworkSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Header />

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section with improved layout */}
      <section className="relative bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh] py-16">
            {/* Left Column - Main Content */}
            <div className="space-y-8">
              {/* Main Headline */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-dna-forest mb-6">
                  Welcome to the
                  <br />
                  <span className="text-dna-copper">Diaspora Network of Africa</span>
                </h1>
                <p className="text-2xl md:text-3xl text-dna-forest mb-8 font-bold leading-relaxed">
                  <span className="block">
                    <strong>
                      The African Diaspora represents one of the most powerful untapped resources for global development
                    </strong>
                  </span>
                </p>
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
                    onClick={scrollToDNAFramework}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white px-8 py-4 text-lg font-semibold rounded-full"
                    onClick={() => navigate('/about')}
                  >
                    Learn More
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="bg-dna-copper hover:bg-dna-gold text-white px-8 py-3 text-lg font-bold rounded-xl"
                  onClick={() => setOpenJourney(true)}
                >
                  Start Your Journey, Today
                </Button>
              </div>
            </div>
            {/* Right Column - Introduction */}
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-dna-mint/20">
                <HeroIntroduction />
              </div>
            </div>
          </div>
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-dna-mint/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-dna-copper/10 rounded-full blur-3xl"></div>
        </div>
      </section>
      <Dialog open={openJourney} onOpenChange={setOpenJourney}>
        <DialogContent className="max-w-xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-dna-forest text-center">
              Your DNA Journey: What Happens Next?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ol className="list-decimal list-inside text-gray-700 text-lg space-y-2">
              <li><strong>Create Your Profile:</strong> Share your background, skills, and aspirations with the global diaspora network.</li>
              <li><strong>Discover Opportunities:</strong> Explore professional communities, collaborations, and events tailored to your interests.</li>
              <li><strong>Connect & Collaborate:</strong> Build relationships, join impactful projects, and unlock new pathways for personal and collective growth.</li>
              <li><strong>Contribute & Grow:</strong> Empower others and advance your own journey through community-driven engagement.</li>
            </ol>
            <p className="text-center text-dna-copper mt-4">
              We’re committed to making Africa’s diaspora the world’s most connected and impactful community!
            </p>
            <Button
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white rounded-lg"
              onClick={() => { setOpenJourney(false); navigate('/auth'); }}
            >
              Get Started — Create Your Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiasporaStats />
        </div>
      </section>
      {/* Platform Development Section with increased spacing */}
      <section id="dna-framework" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-dna-forest mb-12">
            From Idea to Implementation
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Follow our transparent development process as we build the future of diaspora engagement
          </p>
          <PlatformBadges />
        </div>
      </section>
      {/* Platform Feature Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid md:grid-cols-3 gap-8">
          <Button
            size="lg"
            className="w-full bg-dna-emerald hover:bg-dna-forest text-white px-6 py-5 text-xl font-bold flex flex-col gap-2 rounded-xl mb-8"
            onClick={() => navigate('/connect-example')}
          >
            Explore Network
          </Button>
          <Button
            size="lg"
            className="w-full bg-dna-copper hover:bg-dna-gold text-white px-6 py-5 text-xl font-bold flex flex-col gap-2 rounded-xl mb-8"
            onClick={() => navigate('/collaborate-example')}
          >
            Explore Active Collaborations
          </Button>
          <Button
            size="lg"
            className="w-full bg-dna-gold hover:bg-dna-copper text-dna-forest px-6 py-5 text-xl font-bold flex flex-col gap-2 rounded-xl mb-8"
            onClick={() => navigate('/contribute-example')}
          >
            Contribute
          </Button>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
