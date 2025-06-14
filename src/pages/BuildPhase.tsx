import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Hammer, Database, Users, CheckCircle, Code, Zap, Globe, Settings } from 'lucide-react';
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
            <Badge className="mb-4 bg-dna-copper text-white text-base px-6 py-2 rounded-full shadow">
              Build Phase
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Build Phase
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              This stage focuses on transforming our validated ideas into a real, scalable platform with robust architecture.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Button
                onClick={() => navigate('/prototyping-phase')}
                variant="outline"
                className="bg-white text-dna-copper border-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous: Prototyping
              </Button>
              <Button
                onClick={() => navigate('/mvp-phase')}
                className="bg-dna-gold hover:bg-dna-copper text-white"
              >
                Next: MVP Phase
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
                What We're Building
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Taking our successful prototype and transforming it into a scalable, secure, and feature-rich platform 
                that can handle significant user growth while maintaining excellent performance and user experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center border-dna-copper">
                <CardContent className="pt-6">
                  <Code className="w-12 h-12 text-dna-copper mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Full-Stack Development</h3>
                  <p className="text-sm text-gray-600">Complete platform architecture with scalable backend</p>
                </CardContent>
              </Card>

              <Card className="text-center border-dna-gold">
                <CardContent className="pt-6">
                  <Users className="w-12 h-12 text-dna-gold mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
                  <p className="text-sm text-gray-600">Advanced profiles, authentication & authorization</p>
                </CardContent>
              </Card>

              <Card className="text-center border-dna-emerald">
                <CardContent className="pt-6">
                  <Zap className="w-12 h-12 text-dna-emerald mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Features</h3>
                  <p className="text-sm text-gray-600">Live messaging, notifications & collaboration tools</p>
                </CardContent>
              </Card>

              <Card className="text-center border-dna-forest">
                <CardContent className="pt-6">
                  <Settings className="w-12 h-12 text-dna-forest mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Admin Systems</h3>
                  <p className="text-sm text-gray-600">Content management, moderation & analytics</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Build Focus Areas */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Core Development Areas
              </h2>
              <p className="text-lg text-gray-600">
                Key technical and product development focus areas for this phase
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-dna-copper">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-copper rounded-xl flex items-center justify-center mb-4">
                    <Hammer className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Platform Architecture</CardTitle>
                  <CardDescription>
                    Scalable infrastructure and advanced features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Microservices architecture with Docker containers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Advanced matching algorithms using AI/ML</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Real-time messaging with WebSocket technology</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Video conferencing integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Mobile-responsive progressive web app</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-gold">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-gold rounded-xl flex items-center justify-center mb-4">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Data & Security</CardTitle>
                  <CardDescription>
                    Robust data management and security systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Advanced analytics and reporting dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>GDPR-compliant data protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Multi-factor authentication system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Automated backup and disaster recovery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Performance monitoring and optimization</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-dna-emerald">
                <CardHeader>
                  <div className="w-12 h-12 bg-dna-emerald rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-dna-forest">Community Features</CardTitle>
                  <CardDescription>
                    Enhanced engagement and collaboration tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Project collaboration workspaces</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Event management and virtual meetups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Mentorship matching and tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Regional chapter management system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-dna-emerald mt-0.5" />
                      <span>Ambassador and leadership programs</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technical Milestones */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Development Milestones
              </h2>
              <p className="text-lg text-gray-600">
                Key deliverables and timeline for the Build Phase
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-dna-copper">Month 1-2: Foundation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Complete backend API development</li>
                    <li>• Implement user authentication & authorization</li>
                    <li>• Set up production infrastructure on AWS/Azure</li>
                    <li>• Develop advanced search and filtering</li>
                    <li>• Launch alpha testing with 100 users</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-dna-gold">Month 3-4: Core Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Build messaging and notification systems</li>
                    <li>• Implement project collaboration tools</li>
                    <li>• Develop event management features</li>
                    <li>• Create admin dashboard and moderation tools</li>
                    <li>• Launch beta testing with 500 users</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-dna-emerald">Month 5: Enhancement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Integrate AI-powered matching algorithms</li>
                    <li>• Add video conferencing capabilities</li>
                    <li>• Implement analytics and reporting</li>
                    <li>• Optimize for mobile devices</li>
                    <li>• Conduct comprehensive security audits</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-dna-forest">Month 6: Preparation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Final testing and bug fixes</li>
                    <li>• Performance optimization and scaling</li>
                    <li>• Complete documentation and training</li>
                    <li>• Prepare for MVP launch marketing</li>
                    <li>• Build customer support systems</li>
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
              Build Phase Success Metrics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-copper mb-2">5,000</div>
                <div className="text-gray-600 font-medium">Beta Users</div>
                <div className="text-sm text-gray-500 mt-1">Registered & Active</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-gold mb-2">15+</div>
                <div className="text-gray-600 font-medium">Core Features</div>
                <div className="text-sm text-gray-500 mt-1">Fully Functional</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-emerald mb-2">95%</div>
                <div className="text-gray-600 font-medium">Uptime</div>
                <div className="text-sm text-gray-500 mt-1">Platform Reliability</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-mint mb-2">85%</div>
                <div className="text-gray-600 font-medium">User Satisfaction</div>
                <div className="text-sm text-gray-500 mt-1">Beta Feedback Score</div>
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
