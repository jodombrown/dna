
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Search, Users, BarChart, CheckCircle, MessageSquare, TrendingUp, Target, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CustomerDiscoveryPhase = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-dna-forest to-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-white text-dna-forest">
              Phase 4 of 5 • 4 months • Q1-Q2 2025
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Customer Discovery Phase
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Deep market validation, comprehensive user feedback analysis, and systematic product-market fit optimization 
              to ensure we're building exactly what our diaspora community needs for maximum impact and engagement.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => navigate('/mvp-phase')}
                variant="outline"
                className="bg-white text-dna-forest border-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: MVP Phase
              </Button>
              <Button 
                onClick={() => navigate('/go-to-market-phase')}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                Next: Go-to-Market Phase
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Phase Overview */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Customer Discovery Matters
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                This phase is crucial for achieving true product-market fit. We'll systematically validate our assumptions, 
                understand user behavior patterns, and optimize our platform based on real-world usage and feedback from 
                our growing diaspora community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center border-dna-forest">
                <CardContent className="pt-6">
                  <Brain className="w-12 h-12 text-dna-forest mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Deep Insights</h3>
                  <p className="text-sm text-gray-600">Understanding user motivations and pain points</p>
                </CardContent>
              </Card>

              <Card className="text-center border-dna-emerald">
                <CardContent className="pt-6">
                  <Target className="w-12 h-12 text-dna-emerald mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Market Validation</h3>
                  <p className="text-sm text-gray-600">Confirming product-market fit across regions</p>
                </CardContent>
              </Card>

              <Card className="text-center border-dna-copper">
                <CardContent className="pt-6">
                  <TrendingUp className="w-12 h-12 text-dna-copper mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Growth Strategy</h3>
                  <p className="text-sm text-gray-600">Data-driven scaling and expansion plans</p>
                </CardContent>
              </Card>

              <Card className="text-center border-dna-gold">
                <CardContent className="pt-6">
                  <MessageSquare className="w-12 h-12 text-dna-gold mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Continuous Feedback</h3>
                  <p className="text-sm text-gray-600">Ongoing dialogue with our community</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Discovery Focus Areas */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Research & Validation Strategy
              </h2>
              <p className="text-lg text-gray-600">
                Comprehensive approach to understanding our users and optimizing for market fit
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-dna-forest">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-forest rounded-xl flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Market Research</CardTitle>
                  <CardDescription>
                    Comprehensive analysis of user needs and market dynamics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>500+ in-depth user interviews across 25 countries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Quarterly surveys with 2,000+ participants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Competitive landscape analysis and positioning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>African diaspora demographics and trend analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Partnership opportunity assessment</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-emerald">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-emerald rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">User Experience Research</CardTitle>
                  <CardDescription>
                    Deep dive into user behavior and platform optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>User journey mapping and pain point identification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>A/B testing on key features and workflows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Focus groups in major diaspora hubs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Beta user advisory council establishment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Cultural sensitivity and localization research</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-copper">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-copper rounded-xl flex items-center justify-center mb-4">
                    <BarChart className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Data-Driven Optimization</CardTitle>
                  <CardDescription>
                    Analytics and metrics-driven product improvements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Advanced analytics dashboard implementation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Conversion funnel analysis and optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>User retention and engagement metrics tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Cohort analysis and lifetime value calculations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Predictive modeling for growth forecasting</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Research Methodology */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Discovery Timeline & Milestones
              </h2>
              <p className="text-lg text-gray-600">
                Systematic approach to customer discovery over 4 months
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-dna-forest">Month 1: Research Foundation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Launch comprehensive user survey (target: 2,000 responses)</li>
                    <li>• Begin structured user interview program</li>
                    <li>• Establish user advisory council (20 active members)</li>
                    <li>• Implement advanced analytics tracking</li>
                    <li>• Conduct competitive analysis deep dive</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-dna-emerald">Month 2: Data Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Complete 200+ user interviews</li>
                    <li>• Launch A/B testing framework</li>
                    <li>• Analyze user behavior patterns</li>
                    <li>• Identify key user personas and segments</li>
                    <li>• Test market messaging and positioning</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-dna-copper">Month 3: Analysis & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Synthesize research findings into actionable insights</li>
                    <li>• Identify product-market fit indicators</li>
                    <li>• Develop user journey optimization plan</li>
                    <li>• Create growth strategy framework</li>
                    <li>• Test pricing models and value propositions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-dna-gold">Month 4: Optimization & Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Implement product optimizations based on findings</li>
                    <li>• Validate go-to-market strategy with beta users</li>
                    <li>• Finalize market expansion priorities</li>
                    <li>• Prepare comprehensive market entry plan</li>
                    <li>• Establish success metrics for launch phase</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Discovery Phase Success Metrics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-forest mb-2">15,000</div>
                <div className="text-gray-600 font-medium">Active Users</div>
                <div className="text-sm text-gray-500 mt-1">Platform Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-emerald mb-2">500+</div>
                <div className="text-gray-600 font-medium">User Interviews</div>
                <div className="text-sm text-gray-500 mt-1">Deep Insights Gathered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-copper mb-2">80%</div>
                <div className="text-gray-600 font-medium">Product-Market Fit</div>
                <div className="text-sm text-gray-500 mt-1">Validation Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-gold mb-2">$750K</div>
                <div className="text-gray-600 font-medium">ARR Target</div>
                <div className="text-sm text-gray-500 mt-1">Revenue Milestone</div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Outcomes */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Expected Outcomes
              </h2>
              <p className="text-lg text-gray-600">
                What we'll achieve by the end of the Customer Discovery Phase
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold text-dna-forest mb-3">Market Validation</h3>
                  <p className="text-gray-600">
                    Confirmed product-market fit across key diaspora markets with clear evidence of user demand, 
                    validated pricing models, and proven value propositions for our core user segments.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold text-dna-emerald mb-3">Optimized User Experience</h3>
                  <p className="text-gray-600">
                    Refined platform experience based on extensive user feedback, with optimized conversion funnels, 
                    improved engagement metrics, and streamlined user journeys that drive meaningful connections.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold text-dna-copper mb-3">Growth Strategy</h3>
                  <p className="text-gray-600">
                    Data-driven go-to-market strategy with identified growth channels, partnership opportunities, 
                    and expansion priorities for scaling across global diaspora communities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button 
                onClick={() => navigate('/mvp-phase')}
                variant="outline"
                className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: MVP Phase
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Next Phase</p>
                <Button 
                  onClick={() => navigate('/go-to-market-phase')}
                  className="bg-dna-copper hover:bg-dna-gold text-white"
                >
                  Go-to-Market Phase
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

export default CustomerDiscoveryPhase;
