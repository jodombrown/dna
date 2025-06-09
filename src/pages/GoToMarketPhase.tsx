
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Megaphone, Globe, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const GoToMarketPhase = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-dna-gold via-dna-copper to-dna-emerald">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-white text-dna-gold">
              Phase 5 of 5
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Go-to-Market Phase
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Full market launch with comprehensive marketing campaigns, 
              strategic partnerships, and global expansion to reach diaspora communities worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/customer-discovery-phase')}
                variant="outline"
                className="bg-white text-dna-gold border-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: Customer Discovery Phase
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="bg-dna-forest hover:bg-dna-emerald text-white"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </section>

        {/* Launch Strategy */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Market Launch Strategy
              </h2>
              <p className="text-lg text-gray-600">
                Comprehensive approach to global market penetration
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-dna-gold">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-gold rounded-xl flex items-center justify-center mb-4">
                    <Megaphone className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Marketing Campaign</CardTitle>
                  <CardDescription>
                    Multi-channel marketing and brand awareness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Digital marketing campaigns
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Influencer partnerships
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      PR & media outreach
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-copper">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-copper rounded-xl flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Global Expansion</CardTitle>
                  <CardDescription>
                    Worldwide reach to diaspora communities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Regional market entry
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Local partnership network
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Cultural adaptation strategy
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-emerald">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-emerald rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Growth Optimization</CardTitle>
                  <CardDescription>
                    Scaling and performance optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Conversion optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Customer acquisition cost
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald" />
                      Lifetime value maximization
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Go-to-Market Targets
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-gold mb-2">100K</div>
                <div className="text-gray-600">Global Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-copper mb-2">50</div>
                <div className="text-gray-600">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-emerald mb-2">$1M</div>
                <div className="text-gray-600">Annual Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-forest mb-2">500</div>
                <div className="text-gray-600">Corporate Partners</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button 
                onClick={() => navigate('/customer-discovery-phase')}
                variant="outline"
                className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: Customer Discovery Phase
              </Button>
              <div className="text-center">
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-dna-forest hover:bg-dna-emerald text-white"
                >
                  Back to Home
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

export default GoToMarketPhase;
