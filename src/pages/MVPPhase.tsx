
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Rocket, Code, Database, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MVPPhase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-forest/10">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-dna-forest/90 to-dna-emerald/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white text-dna-forest mb-6 text-lg px-6 py-2">
            Phase 4 • MVP Build
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
            MVP Build Phase
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
            Building the Minimum Viable Product (MVP) of DNA Platform. Creating a fully functional 
            platform ready for real-world testing and user engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => navigate('/phase/customer-discovery')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-dna-forest px-8 py-4 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous: Customer Discovery
            </Button>
            <Button 
              onClick={() => navigate('/phase/beta-validation')}
              className="bg-white text-dna-forest hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Next Phase: Beta Validation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* MVP Components */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">MVP Core Components</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Essential features and systems for the DNA Platform launch
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-dna-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Development</h3>
                <p className="text-gray-600">
                  Full-stack development of web and mobile applications with all core features.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-dna-copper" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Database Architecture</h3>
                <p className="text-gray-600">
                  Scalable database design to handle user data, connections, and collaborations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-dna-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Privacy</h3>
                <p className="text-gray-600">
                  Robust security measures and privacy controls for user protection.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-dna-forest" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Deployment Infrastructure</h3>
                <p className="text-gray-600">
                  Cloud infrastructure setup for reliable, scalable platform hosting.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Development Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Development Timeline</h2>
            <p className="text-xl text-gray-600">March - July 2026</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <Badge className="bg-dna-forest text-white mt-1">Mar 2026</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Architecture & Foundation</h3>
                <p className="text-gray-600">Setting up development environment, database design, and core platform architecture.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-emerald text-white mt-1">Apr 2026</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Core Feature Development</h3>
                <p className="text-gray-600">Building essential Connect, Collaborate, and Contribute features and workflows.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-copper text-white mt-1">May 2026</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Integration & Testing</h3>
                <p className="text-gray-600">System integration, comprehensive testing, and quality assurance processes.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-gold text-white mt-1">Jun 2026</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Optimization</h3>
                <p className="text-gray-600">Platform optimization, security hardening, and scalability improvements.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-mint text-white mt-1">Jul 2026</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pre-Launch Preparation</h3>
                <p className="text-gray-600">Final testing, deployment preparation, and beta user recruitment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MVPPhase;
