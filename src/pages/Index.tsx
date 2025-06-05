
import React from 'react';
import { 
  Users, 
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';

const Index = () => {
  const buildingTogether = [
    {
      title: "Connect",
      description: "Join a growing community of African diaspora professionals ready to collaborate and make impact across the continent",
      icon: <Users className="w-6 h-6 text-dna-copper" />
    },
    {
      title: "Collaborate", 
      description: "Work together with fellow diaspora members during our prototyping phase to shape the future of our platform",
      icon: <MessageSquare className="w-6 h-6 text-dna-emerald" />
    },
    {
      title: "Contribute",
      description: "Be part of building the tools and infrastructure that will transform how the African diaspora creates meaningful impact",
      icon: <Lightbulb className="w-6 h-6 text-dna-forest" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Building Together Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-4">
              Ready to <span className="text-dna-copper">Connect, Collaborate & Contribute?</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              The African diaspora has incredible potential. Scattered across the globe, 
              our collective power remains untapped. We're changing that – and we need your help to build it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {buildingTogether.map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-dna-emerald/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-dna-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-dna-forest mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
