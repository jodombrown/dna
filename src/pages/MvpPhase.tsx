
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Home, Rocket, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MvpPhase = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-dna-emerald to-dna-forest">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-white text-dna-emerald">
              Phase 3 of 5
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              MVP Phase
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Launching our Minimum Viable Product with core features, 
              establishing revenue streams, and preparing for market validation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/build-phase')}
                variant="outline"
                className="bg-white text-dna-emerald border-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: Build Phase
              </Button>
              <Button 
                onClick={() => navigate('/customer-discovery-phase')}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                Next: Customer Discovery Phase
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* MVP Focus Areas */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                MVP Launch Strategy
              </h2>
              <p className="text-lg text-gray-600">
                Key components for our market-ready platform
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-dna-emerald">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-emerald rounded-xl flex items-center justify-center mb-4">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Product Launch</CardTitle>
                  <CardDescription>
                    Core platform features and user onboarding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Professional networking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Opportunity marketplace
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Collaboration tools
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-copper">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-copper rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Revenue Streams</CardTitle>
                  <CardDescription>
                    Monetization and sustainability models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Premium memberships ($29.99/month)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Corporate partnerships
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Event monetization
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-gold">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-gold rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Quality Assurance</CardTitle>
                  <CardDescription>
                    Security, privacy, and user safety
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Data protection compliance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      User verification system
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Community moderation
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
              MVP Phase Goals
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-emerald mb-2">2,500</div>
                <div className="text-gray-600">Platform Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-copper mb-2">$75K</div>
                <div className="text-gray-600">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-gold mb-2">25</div>
                <div className="text-gray-600">Partner Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-mint mb-2">95%</div>
                <div className="text-gray-600">Platform Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button 
                onClick={() => navigate('/build-phase')}
                variant="outline"
                className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: Build Phase
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Next Phase</p>
                <Button 
                  onClick={() => navigate('/customer-discovery-phase')}
                  className="bg-dna-copper hover:bg-dna-gold text-white"
                >
                  Customer Discovery Phase
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

export default MvpPhase;
