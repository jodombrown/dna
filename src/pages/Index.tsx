
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
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
  const impactNumbers = [
    { value: "2000+", label: "Diaspora Professionals Connected", icon: <Users className="w-5 h-5" /> },
    { value: "7", label: "African Countries Represented", icon: <Globe className="w-5 h-5" /> },
    { value: "June 2025", label: "Prototype Launch", icon: <Calendar className="w-5 h-5" /> },
    { value: "Early Stage", label: "Building Together", icon: <TrendingUp className="w-5 h-5" /> }
  ];

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
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative bg-white">
        
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
              I'm{' '}
              <a 
                href="https://www.linkedin.com/in/jaunelamarr/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dna-copper hover:text-dna-gold underline font-semibold"
              >
                Jaune Odombrown
              </a>
              ,ecosystem builder, entrepreneur and investor. I'm excited to invite you to be part of something extraordinary.
            </p>
            
            <p className="text-base md:text-lg mb-6 text-gray-700 leading-relaxed">
              As a visionary leader and passionate advocate for global innovation and entrepreneurship, 
              I've dedicated my career to empowering communities and driving impactful change. I've had the pleasure of building frameworks
              for individuals, organizations and communities through the powerful connectiveness of Capacity Building, Venture Building and 
              Ecosystem Building. My journey has now brought me back to my roots, with a deep commitment to uniting the African Diaspora 
              to help mobilize Africa's progress. This vision led me to create the Diaspora Network of Africa (DNA).
            </p>

            <p className="text-base md:text-lg mb-6 text-gray-700 leading-relaxed">
              We're in the early stages of building a transformative platform designed to elevate the 
              African Diaspora's role in advancing Africa's development. This isn't just about joining 
              a network, it's about co-creating, co-investing, and co-executing the infrastructure that 
              empowers us to connect, collaborate, and contribute meaningful change across Africa and beyond.
            </p>

            <p className="text-base md:text-lg mb-8 text-gray-700 leading-relaxed">
              Your expertise matters. Your voice matters. Together, we'll shape a future where the 
              African Diaspora thrives, and Africa's full potential is realized.
            </p>

            <p className="text-lg md:text-xl font-semibold text-dna-forest mb-8">
              Let's build this together.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <Badge className="bg-dna-copper/10 text-dna-forest border-dna-copper px-4 py-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2 text-dna-copper" />
                Prototype: June 2025
              </Badge>
              <Badge className="bg-dna-emerald/10 text-dna-forest border-dna-emerald px-4 py-2 text-sm font-semibold">
                <Target className="w-4 h-4 mr-2 text-dna-emerald" />
                Building Phase: Now
              </Badge>
            </div>
          </div>

          {/* Email Collection Form */}
          <div className="mb-16">
            <EmailCollectionForm />
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dna-forest mb-4">
              Our Growing <span className="text-dna-copper">Community</span>
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              We're just getting started, but our community is already taking shape. 
              Join us as we build this platform together from the ground up.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactNumbers.map((stat, index) => (
              <Card key={index} className="bg-white border-dna-emerald/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-dna-copper mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 text-dna-forest">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Building Together Section */}
      <section className="py-20 bg-white">
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
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-dna-emerald/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-dna-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-dna-forest mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-dna-forest to-dna-emerald text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Partner With Us to Build Africa's Future
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            This is our invitation to you: Help us build the platform that will become 
            the backbone of African diaspora collaboration. Your insights, expertise, 
            and passion will shape every feature we create.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            <div className="flex items-center text-gray-200">
              <Heart className="w-5 h-5 mr-2 text-dna-gold" />
              <span>Community-Driven</span>
            </div>
            <div className="flex items-center text-gray-200">
              <Target className="w-5 h-5 mr-2 text-dna-gold" />
              <span>Africa-Focused</span>
            </div>
            <div className="flex items-center text-gray-200">
              <Users className="w-5 h-5 mr-2 text-dna-gold" />
              <span>Building Together</span>
            </div>
            <div className="flex items-center text-gray-200">
              <Sparkles className="w-5 h-5 mr-2 text-dna-gold" />
              <span>Innovation-First</span>
            </div>
          </div>

          <div className="mt-12 text-gray-300 text-sm">
            <p>Join us in building the future of African diaspora collaboration – one connection at a time</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
