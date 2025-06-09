
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, Lightbulb, Heart, Target, Zap } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-dna-copper text-white mb-4">Our Story</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-dna-copper">DNA Platform</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering the African diaspora to create meaningful connections, drive innovation, 
              and contribute to Africa's sustainable development through technology and collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-dna-emerald">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-dna-emerald" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  To create a unified platform that connects African diaspora professionals, 
                  entrepreneurs, and innovators worldwide, enabling them to collaborate on 
                  impactful projects that drive sustainable development across Africa.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-dna-copper">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Lightbulb className="w-6 h-6 text-dna-copper" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  A thriving ecosystem where the African diaspora's collective knowledge, 
                  resources, and passion transform into tangible solutions that address 
                  Africa's most pressing challenges and unlock its vast potential.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and shape our platform's culture
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-dna-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Unity</h3>
                <p className="text-gray-600">
                  Bringing together diverse voices and perspectives to create stronger, 
                  more innovative solutions for Africa's future.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-dna-copper" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  Fostering creativity and technological advancement to solve complex 
                  challenges with cutting-edge solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-dna-forest" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Impact</h3>
                <p className="text-gray-600">
                  Measuring success by the positive change we create in communities 
                  across Africa and the diaspora.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How DNA Platform Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our three-pillar approach creates a comprehensive ecosystem for diaspora engagement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dna-emerald to-dna-copper"></div>
              <CardHeader>
                <CardTitle className="text-xl text-dna-emerald">Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Build meaningful relationships with fellow diaspora professionals, 
                  entrepreneurs, and thought leaders across industries.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Professional networking</li>
                  <li>• Mentorship opportunities</li>
                  <li>• Community events</li>
                  <li>• Knowledge sharing</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dna-copper to-dna-gold"></div>
              <CardHeader>
                <CardTitle className="text-xl text-dna-copper">Collaborate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Work together on innovative projects that address real challenges 
                  across Africa with collective expertise and resources.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Project partnerships</li>
                  <li>• Resource pooling</li>
                  <li>• Cross-border initiatives</li>
                  <li>• Innovation labs</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dna-gold to-dna-forest"></div>
              <CardHeader>
                <CardTitle className="text-xl text-dna-forest">Contribute</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Make tangible contributions to Africa's development through 
                  skills, knowledge, funding, and strategic partnerships.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Skills volunteering</li>
                  <li>• Investment opportunities</li>
                  <li>• Knowledge transfer</li>
                  <li>• Social impact projects</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Be Part of the Movement?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of diaspora professionals who are already making a difference. 
            Together, we can unlock Africa's potential and create lasting change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/auth'}
              className="bg-dna-copper hover:bg-dna-gold text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Join the Platform
            </button>
            <button 
              onClick={() => window.location.href = '/contact'}
              className="border border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
