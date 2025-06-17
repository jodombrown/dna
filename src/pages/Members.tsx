
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Globe, Briefcase, Heart } from 'lucide-react';

const Members = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-dna-mint/10">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-dna-forest to-dna-emerald text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              DNA Global Community
            </h1>
            <p className="text-xl md:text-2xl text-dna-mint/90 mb-6 max-w-3xl mx-auto">
              Connect with African diaspora professionals, entrepreneurs, and changemakers 
              making impact across the globe
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                <span>5,000+ Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6" />
                <span>50+ Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                <span>200+ Industries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="border-dna-copper/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-dna-copper rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dna-forest mb-1">5,247</h3>
                <p className="text-gray-600">Active Members</p>
              </CardContent>
            </Card>
            
            <Card className="border-dna-emerald/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-dna-emerald rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dna-forest mb-1">53</h3>
                <p className="text-gray-600">Countries Represented</p>
              </CardContent>
            </Card>
            
            <Card className="border-dna-gold/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-dna-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dna-forest mb-1">200+</h3>
                <p className="text-gray-600">Professional Sectors</p>
              </CardContent>
            </Card>
            
            <Card className="border-dna-coral/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-dna-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dna-forest mb-1">1,200+</h3>
                <p className="text-gray-600">Active Collaborations</p>
              </CardContent>
            </Card>
          </div>

          {/* Community Guidelines */}
          <Card className="mb-8 border-dna-mint/30 bg-dna-mint/5">
            <CardHeader>
              <CardTitle className="text-dna-forest flex items-center gap-2">
                <Heart className="w-5 h-5 text-dna-coral" />
                Our Community Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-dna-forest mb-2">Ubuntu Philosophy</h4>
                  <p className="text-gray-600 text-sm">
                    "I am because we are" - We believe in collective success and mutual support
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-dna-forest mb-2">Professional Excellence</h4>
                  <p className="text-gray-600 text-sm">
                    Maintaining high standards while fostering growth and learning opportunities
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-dna-forest mb-2">Cultural Pride</h4>
                  <p className="text-gray-600 text-sm">
                    Celebrating our diverse African heritage while building bridges globally
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-dna-forest mb-4">
              Ready to Join Our Global Community?
            </h2>
            <Button className="bg-dna-copper hover:bg-dna-gold text-white px-8 py-3 rounded-lg">
              Create Your Profile
            </Button>
          </div>

          {/* Member Directory Placeholder */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-dna-forest mb-2">
              Meet Our Community Members
            </h2>
            <p className="text-gray-600 mb-6">
              Discover and connect with professionals who share your passion for impact
            </p>
            
            <Card className="border-dna-mint/30 bg-dna-mint/5">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-dna-copper mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-dna-forest mb-2">
                  Member Directory Coming Soon
                </h3>
                <p className="text-gray-600 mb-4">
                  We're building an advanced member directory to help you find and connect with diaspora professionals worldwide.
                </p>
                <Button variant="outline" className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white">
                  Get Notified When Available
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;
