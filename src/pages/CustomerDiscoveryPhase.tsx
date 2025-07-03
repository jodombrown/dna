
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, MessageCircle, Users, Target, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerDiscoveryPhase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/20 via-white to-dna-gold/10">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-dna-gold/90 to-dna-forest/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-white text-dna-gold mb-6 text-lg px-6 py-2">
            Phase 3 • Customer Discovery
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
            Customer Discovery Phase
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-12">
            Deep engagement with our diaspora community to validate prototypes, gather feedback, 
            and refine our understanding of user needs and preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => navigate('/phase/prototyping')}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-dna-gold px-8 py-4 text-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous: Prototyping
            </Button>
            <Button 
              onClick={() => navigate('/phase/mvp')}
              className="bg-white text-dna-gold hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Next Phase: MVP Build
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Discovery Focus Areas */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Discovery Focus Areas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding our community through direct engagement and feedback
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-dna-emerald" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">User Interviews</h3>
                <p className="text-gray-600">
                  In-depth conversations with diaspora professionals about their needs and challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-dna-copper" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Focus Groups</h3>
                <p className="text-gray-600">
                  Collaborative sessions to test concepts and gather collective feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-dna-gold" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Prototype Testing</h3>
                <p className="text-gray-600">
                  Hands-on testing of our prototypes with real users in realistic scenarios.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-dna-forest" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Building</h3>
                <p className="text-gray-600">
                  Establishing early adopter communities and building platform advocates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Discovery Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Discovery Timeline</h2>
            <p className="text-xl text-gray-600">January - February 2026</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <Badge className="bg-dna-gold text-white mt-1">Jan 2026</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Outreach & Recruitment</h3>
                <p className="text-gray-600">Identifying and engaging with diaspora professionals across different regions and industries.</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <Badge className="bg-dna-forest text-white mt-1">Feb 2026</Badge>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Feedback Collection & Analysis</h3>
                <p className="text-gray-600">Systematic gathering and analysis of user feedback to inform final platform design.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CustomerDiscoveryPhase;
