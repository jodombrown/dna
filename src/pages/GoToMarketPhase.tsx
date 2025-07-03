
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, Globe, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GoToMarketPhase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-copper/10">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-dna-copper/90 via-dna-gold/90 to-dna-emerald/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white text-dna-copper mb-6 text-lg px-6 py-2">
            Phase 6 • Go-to-Market
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Go-to-Market Phase
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
            The official launch of DNA Platform to the global African diaspora community. 
            Scaling our user base, building strategic partnerships, and establishing market presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => navigate('/phase/beta-validation')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-dna-copper px-8 py-4 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous: Beta Validation
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="bg-white text-dna-copper hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </section>

      {/* Launch Strategy */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Launch Strategy</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multi-channel approach to reaching and engaging the global African diaspora
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-dna-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Activation</h3>
                <p className="text-gray-600">
                  Engaging existing diaspora networks and community leaders as platform ambassadors.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-dna-copper" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Marketing Campaigns</h3>
                <p className="text-gray-600">
                  Targeted digital marketing across social media, professional networks, and diaspora media.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-dna-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Strategic Partnerships</h3>
                <p className="text-gray-600">
                  Collaborations with diaspora organizations, African institutions, and development partners.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-dna-forest" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth Optimization</h3>
                <p className="text-gray-600">
                  Data-driven growth strategies and continuous platform improvement based on user feedback.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Launch Metrics */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Launch Success Metrics</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key performance indicators for measuring platform success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-dna-emerald mb-2">10K+</div>
                <div className="text-gray-600">Active Users (Month 1)</div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-dna-copper mb-2">50+</div>
                <div className="text-gray-600">Countries Represented</div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-dna-gold mb-2">100+</div>
                <div className="text-gray-600">Active Projects</div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-dna-forest mb-2">25+</div>
                <div className="text-gray-600">Strategic Partners</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Launch Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Launch Timeline</h2>
            <p className="text-xl text-gray-600">September 2026 & Beyond</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <Badge className="bg-dna-copper text-white mt-1">Sep 2026</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Official Platform Launch</h3>
                <p className="text-gray-600">Public launch of DNA Platform with full marketing campaign and community activation.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-gold text-white mt-1">Q4 2026</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth & Optimization</h3>
                <p className="text-gray-600">Scaling user base, optimizing platform performance, and expanding feature set.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-emerald text-white mt-1">2027+</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Expansion</h3>
                <p className="text-gray-600">International expansion, advanced features, and ecosystem development.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GoToMarketPhase;
