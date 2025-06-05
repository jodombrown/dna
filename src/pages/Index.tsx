
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
    { value: "500K+", label: "Diaspora Professionals Ready", icon: <Users className="w-5 h-5" /> },
    { value: "54", label: "African Countries Connected", icon: <Globe className="w-5 h-5" /> },
    { value: "June 2025", label: "Prototype Launch", icon: <Calendar className="w-5 h-5" /> },
    { value: "$2.5B+", label: "Impact Potential", icon: <TrendingUp className="w-5 h-5" /> }
  ];

  const buildingTogether = [
    {
      title: "Community-Driven Development",
      description: "We're building this platform WITH the African diaspora community, not just FOR them",
      icon: <Users className="w-6 h-6 text-dna-copper" />
    },
    {
      title: "Continuous Feedback Loop",
      description: "Your insights shape our features. Every voice matters in creating the future of diaspora connection",
      icon: <MessageSquare className="w-6 h-6 text-dna-emerald" />
    },
    {
      title: "Innovation Through Collaboration",
      description: "Together we're creating tools that will transform how the African diaspora connects and contributes",
      icon: <Lightbulb className="w-6 h-6 text-dna-gold" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative max-w-4xl mx-auto text-center text-white">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
              alt="DNA Platform" 
              className="h-24 w-auto mx-auto mb-8"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Welcome to the
            <br />
            <span className="text-dna-gold">Diaspora Network of Africa</span>
          </h1>

          {/* Description */}
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-xl md:text-2xl mb-6 text-gray-100 leading-relaxed">
              The world's most powerful network of African diaspora professionals, connecting talent 
              across continents to drive transformative impact across Africa.
            </p>
            
            <p className="text-lg text-gray-200 mb-8">
              We're not just creating a platform – we're building a movement. A community-driven ecosystem 
              where the African diaspora can connect, collaborate, and channel their expertise toward 
              meaningful projects that advance the continent's development.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <Badge className="bg-dna-gold text-dna-forest px-4 py-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                Prototype: June 2025
              </Badge>
              <Badge className="bg-dna-emerald text-white px-4 py-2 text-sm font-semibold">
                <Target className="w-4 h-4 mr-2" />
                Full Launch: End of 2025
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
      <section className="py-16 bg-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactNumbers.map((stat, index) => (
              <Card key={index} className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardContent className="p-6 text-center text-white">
                  <div className="text-dna-gold mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-200">
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why We're <span className="text-dna-copper">Building Together</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The African diaspora has incredible potential. But scattered across the globe, 
              our collective power remains untapped. We're changing that – with your help.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {buildingTogether.map((item, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
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
      <section className="py-20 bg-gradient-to-r from-dna-emerald to-dna-forest text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Africa's Future?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            This isn't just about joining a network – it's about creating the infrastructure 
            for African diaspora impact. Your expertise, our platform, Africa's transformation.
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
            <p>Building the future of African diaspora collaboration – one connection at a time</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
