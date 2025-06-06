
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Home, Trophy, DollarSign, TrendingUp, Target, CheckCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const MvpPhase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-dna-forest to-dna-emerald">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-white text-dna-forest">
              Phase 3 of 3
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              MVP Phase
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              The launch stage where we deliver our Minimum Viable Product, 
              achieve market validation, and establish sustainable growth.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/building-phase')}
                variant="outline"
                className="bg-white text-dna-forest border-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: Building Phase
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="bg-white text-dna-forest border-white hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </section>

        {/* MVP Features */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete DNA Platform
              </h2>
              <p className="text-lg text-gray-600">
                Full-featured platform ready for market launch and scale
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-dna-emerald">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-emerald rounded-xl flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Market Ready</CardTitle>
                  <CardDescription>
                    Production-ready platform with all core features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Full DNA Triangle workflow
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Enterprise-grade security
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      99.9% uptime guarantee
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-copper">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-copper rounded-xl flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Revenue Model</CardTitle>
                  <CardDescription>
                    Sustainable monetization strategy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Premium memberships
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Enterprise solutions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Partnership commissions
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-gold">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-gold rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Growth Engine</CardTitle>
                  <CardDescription>
                    Scalable acquisition and retention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Viral referral system
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Content marketing engine
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Community-driven growth
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              MVP Success Indicators
            </h2>
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold text-dna-forest mb-6">Product Market Fit</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-dna-emerald rounded-full flex items-center justify-center mt-1">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">High User Engagement</p>
                      <p className="text-sm text-gray-600">Daily active users > 40% of monthly actives</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-dna-emerald rounded-full flex items-center justify-center mt-1">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Strong Retention</p>
                      <p className="text-sm text-gray-600">6-month retention rate > 70%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-dna-emerald rounded-full flex items-center justify-center mt-1">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Organic Growth</p>
                      <p className="text-sm text-gray-600">50%+ new users from referrals</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-dna-forest mb-6">Business Validation</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-dna-copper rounded-full flex items-center justify-center mt-1">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Revenue Generation</p>
                      <p className="text-sm text-gray-600">$50K+ monthly recurring revenue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-dna-copper rounded-full flex items-center justify-center mt-1">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Partnership Success</p>
                      <p className="text-sm text-gray-600">10+ strategic partnerships active</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-dna-copper rounded-full flex items-center justify-center mt-1">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Impact Measurement</p>
                      <p className="text-sm text-gray-600">$1M+ in project funding facilitated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Launch Targets */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              MVP Launch Targets
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-emerald mb-2">50K+</div>
                <div className="text-gray-600">Registered Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-copper mb-2">2K+</div>
                <div className="text-gray-600">Daily Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-gold mb-2">1K+</div>
                <div className="text-gray-600">Successful Connections</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-mint mb-2">$50K</div>
                <div className="text-gray-600">Monthly Revenue</div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline to Success */}
        <section className="py-16 bg-gradient-to-br from-dna-mint/20 to-dna-emerald/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Your Journey with DNA
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              From prototype to market leader, we're building the platform that will transform 
              how Africa's diaspora creates impact together. Join us on this journey.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3"
            >
              Start Your Journey Today
            </Button>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button 
                onClick={() => navigate('/building-phase')}
                variant="outline"
                className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: Building Phase
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="bg-dna-forest hover:bg-dna-emerald text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MvpPhase;
