
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';
import { Users, Target, Heart, Globe, TrendingUp, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const EnhancedAbout = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const coreValues = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Unity in Diversity",
      description: "Celebrating the rich tapestry of African diaspora experiences while building bridges that strengthen our collective impact."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Purpose-Driven Action",
      description: "Every connection, collaboration, and contribution is guided by our commitment to Africa's sustainable development."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Authentic Relationships",
      description: "Building genuine, trust-based connections that go beyond networking to create lasting partnerships for change."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Perspective",
      description: "Leveraging diaspora knowledge, resources, and networks to address Africa's challenges with world-class solutions."
    }
  ];

  const impactAreas = [
    { area: "Education & Skills Development", projects: 47, funding: "$2.3M" },
    { area: "Healthcare Innovation", projects: 23, funding: "$1.8M" },
    { area: "Financial Inclusion", projects: 31, funding: "$4.1M" },
    { area: "Agricultural Technology", projects: 18, funding: "$1.2M" },
    { area: "Clean Energy Solutions", projects: 15, funding: "$3.7M" },
    { area: "Digital Infrastructure", projects: 29, funding: "$2.9M" }
  ];

  const teamMembers = [
    {
      name: "Dr. Amara Okafor",
      role: "Founder & CEO",
      image: "/lovable-uploads/c1ba44bd-c5a7-432e-8341-3ce5576c120f.png",
      background: "Former World Bank economist, Harvard MBA"
    },
    {
      name: "Prof. Kwame Asante",
      role: "Head of Partnerships",
      image: "/lovable-uploads/dea2fe8e-c718-403d-b6be-24cd5152c4a4.png",
      background: "MIT Professor, Tech entrepreneur"
    },
    {
      name: "Dr. Zara Mwangi",
      role: "Impact Director",
      image: "/lovable-uploads/2768ac69-7468-4ee5-a1aa-3f241d1b7b25.png",
      background: "Former UN Development Programme lead"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-dna-copper/10 text-dna-copper border-dna-copper/20 mb-6">
              About DNA
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-dna-forest mb-6">
              Mobilizing Africa's Diaspora
              <br />
              <span className="text-dna-copper">for Transformative Impact</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              We are building the world's most comprehensive platform to connect, empower, and mobilize 
              Africa's global diaspora community toward sustainable development and shared prosperity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/connect-example')}
                className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Users className="w-5 h-5 mr-2" />
                Join Our Network
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsFeedbackOpen(true)}
                className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                Share Feedback
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-dna-mint/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-dna-copper/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-dna-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-gray-200 mb-6 leading-relaxed">
                To create the definitive platform where Africa's diaspora can meaningfully connect, 
                collaborate on high-impact initiatives, and contribute to the continent's sustainable development.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                We believe that Africa's greatest resource is its people - those on the continent and 
                around the world. By harnessing the collective power of knowledge, capital, and networks, 
                we can accelerate Africa's transformation.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Our Vision</h3>
              <p className="text-gray-200 text-lg leading-relaxed mb-6">
                An Africa where every diaspora member can easily find their place in the continent's 
                development story, creating lasting impact through purposeful collaboration.
              </p>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-dna-gold" />
                <span className="text-dna-gold font-semibold">Building the future together</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-6">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we build community across the diaspora.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4 text-dna-emerald">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-dna-forest mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Areas */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-6">Where We Create Impact</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our community is actively working across key sectors to drive Africa's development forward.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactAreas.map((area, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-dna-forest">{area.area}</h3>
                    <TrendingUp className="w-5 h-5 text-dna-emerald" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Projects</span>
                      <span className="font-semibold text-dna-copper">{area.projects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Funding</span>
                      <span className="font-semibold text-dna-emerald">{area.funding}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-6">Leadership Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the visionaries building the infrastructure for Africa's diaspora-driven development.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-gray-200">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-dna-forest mb-1">{member.name}</h3>
                  <p className="text-dna-copper font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.background}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-dna-emerald to-dna-forest text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-16 h-16 text-dna-gold mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Movement?</h2>
          <p className="text-xl text-gray-100 mb-8 leading-relaxed">
            Whether you're looking to connect with like-minded professionals, collaborate on meaningful projects, 
            or contribute to Africa's development, your journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/connect-example')}
              className="bg-white text-dna-forest hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              Explore the Platform
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/contact')}
              className="border-white text-white hover:bg-white hover:text-dna-forest px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      <MainPageFeedbackPanel 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </div>
  );
};

export default EnhancedAbout;
