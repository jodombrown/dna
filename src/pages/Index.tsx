
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Heart,
  Globe,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Target,
  Calendar
} from 'lucide-react';
import EmailCollectionForm from '@/components/EmailCollectionForm';
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
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative bg-white pt-16">
        
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

            <p className="text-base md:text-lg mb-6 text-gray-700 leading-relaxed">
              The African Diaspora is a formidable force:
            </p>

            <ul className="text-base md:text-lg mb-6 text-gray-700 leading-relaxed list-disc list-inside space-y-2 text-left max-w-2xl mx-auto">
              <li>Over 200 million people of African descent live outside the continent, poised to comprise more than 25% of the global population.</li>
              <li>In 2024, remittances from the African Diaspora are projected to exceed $100 billion, fueling economic growth and providing vital support to families across Africa.</li>
              <li>Highly educated diaspora members are already significantly contributing to Africa's development, enhancing human capital and driving innovation.</li>
            </ul>

            <p className="text-base md:text-lg mb-6 text-gray-700 leading-relaxed">
              Yet, despite this immense potential, the full power of the African Diaspora remains untapped. DNA is here to change that.
            </p>

            <p className="text-base md:text-lg mb-6 text-gray-700 leading-relaxed">
              We're in the early stages of building a transformative platform designed to elevate the African Diaspora's role in Africa's development. This isn't just about joining a network, it's about co-creating, co-investing, and co-executing the infrastructure that empowers us to connect, collaborate, and contribute meaningful change across Africa and beyond.
            </p>

            <p className="text-base md:text-lg mb-6 text-gray-700 leading-relaxed">
              Your expertise matters. Your voice matters. Let's build a future where the African Diaspora thrives and where Africa's potential is fully realized.
            </p>

            <p className="text-lg md:text-xl font-semibold text-dna-forest mb-8">
              Join me on this journey. Let's build this together.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <Badge className="bg-dna-copper/10 text-dna-forest border-dna-copper px-4 py-2 text-sm font-semibold hover:bg-dna-copper/20">
                <Sparkles className="w-4 h-4 mr-2 text-dna-copper" />
                Prototype: June 2025
              </Badge>
              <Badge className="bg-dna-emerald/10 text-dna-forest border-dna-emerald px-4 py-2 text-sm font-semibold hover:bg-dna-emerald/20">
                <Target className="w-4 h-4 mr-2 text-dna-emerald" />
                Building Phase: Now
              </Badge>
              <Badge className="bg-dna-mint/20 text-dna-forest border-dna-mint px-4 py-2 text-sm font-semibold hover:bg-dna-mint/30">
                <Calendar className="w-4 h-4 mr-2 text-dna-forest" />
                MVP Phase Launch: November 2025
              </Badge>
            </div>
          </div>

          {/* Email Collection Form */}
          <div className="mb-16">
            <EmailCollectionForm />
          </div>
        </div>
      </section>

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
