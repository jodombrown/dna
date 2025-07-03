
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Zap, Lightbulb, Code, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrototypingPhase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-copper/10">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-dna-copper/90 to-dna-gold/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white text-dna-copper mb-6 text-lg px-6 py-2">
            Phase 2 • Prototyping
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Prototyping Phase
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
            Transforming research insights into tangible prototypes. Building the first iterations 
            of DNA Platform features and testing core concepts with real users.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => navigate('/phase/market-research')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-dna-copper px-8 py-4 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous: Market Research
            </Button>
            <Button 
              onClick={() => navigate('/phase/customer-discovery')}
              className="bg-white text-dna-copper hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Next Phase: Customer Discovery
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Prototype Focus Areas */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Prototype Development Focus</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Building and testing core platform features through rapid prototyping
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-dna-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Features</h3>
                <p className="text-gray-600">
                  Professional networking and community connection prototypes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-dna-copper" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Collaborate Tools</h3>
                <p className="text-gray-600">
                  Project collaboration and partnership formation interfaces.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-dna-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contribute Platform</h3>
                <p className="text-gray-600">
                  Investment and contribution opportunity discovery systems.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-dna-forest" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Foundation</h3>
                <p className="text-gray-600">
                  Core platform architecture and scalability frameworks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prototype Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Development Timeline</h2>
            <p className="text-xl text-gray-600">October - December 2025</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <Badge className="bg-dna-copper text-white mt-1">Oct 2025</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Wireframes & User Flow Design</h3>
                <p className="text-gray-600">Creating detailed user experience maps and interface wireframes for all three pillars.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-gold text-white mt-1">Nov 2025</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Prototype Development</h3>
                <p className="text-gray-600">Building clickable prototypes for core Connect, Collaborate, and Contribute features.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-forest text-white mt-1">Dec 2025</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">User Testing & Iteration</h3>
                <p className="text-gray-600">Conducting user testing sessions and refining prototypes based on feedback.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrototypingPhase;
