
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, BarChart3, Users, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MarketResearchPhase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-emerald/10">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-dna-emerald/90 to-dna-copper/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white text-dna-emerald mb-6 text-lg px-6 py-2">
            Phase 1 • Market Research
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Market Research Phase
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
            Deep market analysis and validation of the African diaspora network opportunity. 
            Understanding our community, their needs, and building the foundation for DNA Platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => navigate('/phase/prototyping')}
              className="bg-white text-dna-emerald hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Next Phase: Prototyping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-dna-emerald px-8 py-4 text-lg"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </section>

      {/* Research Focus Areas */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Research Focus Areas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive analysis of the African diaspora landscape and market opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-dna-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Analysis</h3>
                <p className="text-gray-600">
                  Mapping the global African diaspora community, their demographics, and engagement patterns.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-dna-copper" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Needs Assessment</h3>
                <p className="text-gray-600">
                  Understanding the challenges and opportunities faced by diaspora professionals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-dna-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Sizing</h3>
                <p className="text-gray-600">
                  Quantifying the total addressable market and platform opportunity.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-dna-forest" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Competitive Landscape</h3>
                <p className="text-gray-600">
                  Analyzing existing solutions and identifying market gaps and opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Findings */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Key Research Findings</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Critical insights that shaped our platform strategy
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-dna-emerald">Market Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Global African Diaspora</span>
                  <span className="font-bold text-dna-emerald">200M+ People</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Combined Economic Power</span>
                  <span className="font-bold text-dna-emerald">$2.5 Trillion</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Professional Networks</span>
                  <span className="font-bold text-dna-emerald">Fragmented</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Collaboration Platforms</span>
                  <span className="font-bold text-dna-emerald">Limited</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-dna-copper">Community Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Want to Contribute to Africa</span>
                  <span className="font-bold text-dna-copper">85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Lack Clear Pathways</span>
                  <span className="font-bold text-dna-copper">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Seek Professional Networks</span>
                  <span className="font-bold text-dna-copper">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Ready for Collaboration</span>
                  <span className="font-bold text-dna-copper">89%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Research Timeline</h2>
            <p className="text-xl text-gray-600">June - September 2025</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <Badge className="bg-dna-emerald text-white mt-1">Jun 2025</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Mapping & Demographics</h3>
                <p className="text-gray-600">Comprehensive analysis of global African diaspora distribution and characteristics.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-copper text-white mt-1">Jul 2025</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Needs Assessment & Pain Points</h3>
                <p className="text-gray-600">In-depth surveys and interviews to understand community challenges and aspirations.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-gold text-white mt-1">Aug 2025</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Competitive Analysis & Market Gaps</h3>
                <p className="text-gray-600">Evaluation of existing platforms and identification of unique opportunities.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-forest text-white mt-1">Sep 2025</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Strategy Formulation & Validation</h3>
                <p className="text-gray-600">Synthesis of findings and development of platform strategy framework.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MarketResearchPhase;
