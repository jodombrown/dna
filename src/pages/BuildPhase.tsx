
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Home, Hammer, Database, Users, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BuildPhase = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-dna-copper to-dna-gold">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-white text-dna-copper">
              Phase 2 of 5
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Build Phase
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Scaling our validated concept into a robust platform with enhanced features, 
              user onboarding systems, and community engagement tools.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/prototyping-phase')}
                variant="outline"
                className="bg-white text-dna-copper border-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: Prototyping Phase
              </Button>
              <Button 
                onClick={() => navigate('/mvp-phase')}
                className="bg-dna-emerald hover:bg-dna-mint text-white"
              >
                Next: MVP Phase
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Build Focus Areas */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Current Build Focus
              </h2>
              <p className="text-lg text-gray-600">
                Expanding platform capabilities and user experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-dna-copper">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-copper rounded-xl flex items-center justify-center mb-4">
                    <Hammer className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Platform Development</CardTitle>
                  <CardDescription>
                    Advanced features and user experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Advanced matching algorithms
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Real-time messaging system
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Opportunity marketplace
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-gold">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-gold rounded-xl flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Data & Analytics</CardTitle>
                  <CardDescription>
                    Insights and performance tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      User behavior analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Connection success metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Platform optimization
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-emerald">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-emerald rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Community Growth</CardTitle>
                  <CardDescription>
                    Expanding our user base and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Regional chapter launches
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Ambassador program
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Partnership development
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
              Build Phase Targets
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-copper mb-2">5,000</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-gold mb-2">500</div>
                <div className="text-gray-600">Daily Connections</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-emerald mb-2">15</div>
                <div className="text-gray-600">Platform Features</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-mint mb-2">90%</div>
                <div className="text-gray-600">User Retention</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button 
                onClick={() => navigate('/prototyping-phase')}
                variant="outline"
                className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: Prototyping Phase
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Next Phase</p>
                <Button 
                  onClick={() => navigate('/mvp-phase')}
                  className="bg-dna-emerald hover:bg-dna-mint text-white"
                >
                  MVP Phase
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

export default BuildPhase;
