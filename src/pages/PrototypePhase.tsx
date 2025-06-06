
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Home, Users, Code, Target, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PrototypePhase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-dna-mint to-dna-emerald">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-white text-dna-emerald">
              Phase 1 of 3
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Prototype Phase
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              The foundation stage where we validate our DNA framework concept, 
              gather early community feedback, and establish core functionalities.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="bg-white text-dna-emerald border-white hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Button 
                onClick={() => navigate('/building-phase')}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                Next: Building Phase
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What We're Building Now
              </h2>
              <p className="text-lg text-gray-600">
                Current focus areas and deliverables in the Prototype Phase
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-dna-mint">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-mint rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-dna-forest" />
                  </div>
                  <CardTitle className="text-dna-forest">Community Validation</CardTitle>
                  <CardDescription>
                    Testing our DNA framework with early adopters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Email collection & feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Core concept validation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Early community building
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-copper">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-copper rounded-xl flex items-center justify-center mb-4">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Technical Foundation</CardTitle>
                  <CardDescription>
                    Building core platform infrastructure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Authentication system
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      User profiles & matching
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Basic networking features
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-gold">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-gold rounded-xl flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Market Research</CardTitle>
                  <CardDescription>
                    Understanding our audience and competition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Diaspora needs analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Competitive landscape
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Partnership opportunities
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Prototype Phase Goals
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-emerald mb-2">1,000</div>
                <div className="text-gray-600">Early Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-copper mb-2">50</div>
                <div className="text-gray-600">Beta Testers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-gold mb-2">3</div>
                <div className="text-gray-600">Core Features</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-mint mb-2">85%</div>
                <div className="text-gray-600">User Satisfaction</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Next Phase</p>
                <Button 
                  onClick={() => navigate('/building-phase')}
                  className="bg-dna-copper hover:bg-dna-gold text-white"
                >
                  Building Phase
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrototypePhase;
