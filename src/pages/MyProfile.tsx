
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyProfile = () => {
  useScrollToTop();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dna-mint/10 via-white to-dna-emerald/5">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-dna-forest mb-4">
            Profile Creation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for your interest in joining the DNA community!
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Badge className="bg-dna-copper text-white px-4 py-2">
                Coming Soon
              </Badge>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Profile Creation Not Yet Available
            </CardTitle>
            <CardDescription className="text-base text-gray-600 leading-relaxed">
              We're excited about your interest in creating a profile and joining our community! 
              However, profile creation is currently in development and will be available during our MVP phase.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-dna-emerald/5 to-dna-copper/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-dna-emerald" />
                When Will Profile Creation Be Available?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-dna-emerald text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">MVP Development Phase</p>
                    <p className="text-gray-600 text-sm">Profile creation will launch during our MVP phase (March 2026)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-dna-copper text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alpha Testing</p>
                    <p className="text-gray-600 text-sm">Early community members will get first access to test the platform</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-dna-forest text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Full Launch</p>
                    <p className="text-gray-600 text-sm">Complete profile functionality will be available at public launch</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dna-mint/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-dna-copper" />
                Stay Connected Until Then
              </h3>
              <p className="text-gray-600 mb-4">
                While you wait for profile creation to become available, here's how you can stay engaged with our community:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-dna-emerald">•</span>
                  <span>Explore our development phases to see our progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-dna-emerald">•</span>
                  <span>Join our alpha testing program to get early access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-dna-emerald">•</span>
                  <span>Provide feedback to help shape the platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-dna-emerald">•</span>
                  <span>Stay notified about major updates and launch dates</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => navigate('/mvp-phase')}
                className="flex-1 bg-dna-emerald hover:bg-dna-forest text-white"
              >
                Learn About MVP Development
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyProfile;
