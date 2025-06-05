
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Users, TrendingUp, Network, Target, Briefcase, ArrowRight, Globe, Handshake, Heart } from 'lucide-react';

const PlatformFeatureShowcase = () => {
  return (
    <div className="bg-white">
      {/* Hero Section - DNA Triangle Framework */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-dna-copper text-white text-sm px-4 py-2 rounded-full">
              The DNA Framework
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Connect. Collaborate.
              <br />
              <span className="text-dna-copper">Contribute.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              The triangular framework that powers Africa's diaspora network. 
              Each pillar strengthens the others, creating unstoppable momentum for impact.
            </p>

            {/* DNA Triangle Visual */}
            <div className="relative max-w-md mx-auto mb-12">
              <div className="relative w-64 h-64 mx-auto">
                {/* Triangle outline */}
                <svg className="w-full h-full" viewBox="0 0 200 180">
                  <path
                    d="M100 20 L170 150 L30 150 Z"
                    fill="none"
                    stroke="#B8860B"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>
                
                {/* Connect */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm font-semibold mt-2 text-dna-forest">Connect</p>
                </div>
                
                {/* Collaborate */}
                <div className="absolute bottom-8 left-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-dna-copper to-dna-gold rounded-2xl flex items-center justify-center shadow-lg">
                    <Handshake className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm font-semibold mt-2 text-dna-copper">Collaborate</p>
                </div>
                
                {/* Contribute */}
                <div className="absolute bottom-8 right-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-2xl flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm font-semibold mt-2 text-dna-emerald">Contribute</p>
                </div>
              </div>
            </div>

            <Button className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-8 py-3 flex items-center gap-2 mx-auto">
              <Play className="w-4 h-4" />
              See how it works
            </Button>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Connect
                </h2>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                Build meaningful professional relationships across the diaspora. 
                Discover opportunities, expand your network, and find your tribe.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-dna-mint/10 rounded-lg">
                  <Globe className="w-5 h-5 text-dna-emerald" />
                  <span className="font-medium">Global Network Access</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-dna-mint/10 rounded-lg">
                  <Target className="w-5 h-5 text-dna-emerald" />
                  <span className="font-medium">Smart Opportunity Matching</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-dna-mint/10 rounded-lg">
                  <Network className="w-5 h-5 text-dna-emerald" />
                  <span className="font-medium">Professional Communities</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl">
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="bg-dna-emerald text-white p-4 text-center">
                    <h3 className="font-semibold">Your Professional Network</h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-dna-copper rounded-full"></div>
                      <div>
                        <p className="font-medium">Dr. Amara Okafor</p>
                        <p className="text-sm text-gray-600">FinTech • Lagos → London</p>
                      </div>
                      <Button size="sm" className="ml-auto">Connect</Button>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-dna-gold rounded-full"></div>
                      <div>
                        <p className="font-medium">Prof. Kwame Asante</p>
                        <p className="text-sm text-gray-600">AgriTech • Accra → Toronto</p>
                      </div>
                      <Button size="sm" className="ml-auto">Connect</Button>
                    </div>
                    
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">847 professionals in your network</p>
                      <p className="text-xs text-dna-emerald">+23 new connections this week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaborate Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="md:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-dna-copper to-dna-gold rounded-xl flex items-center justify-center">
                  <Handshake className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Collaborate
                </h2>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                Work together on meaningful projects that drive African development. 
                Pool resources, share knowledge, and amplify collective impact.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-dna-copper/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-dna-copper" />
                  <span className="font-medium">Cross-Border Project Teams</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-dna-copper/10 rounded-lg">
                  <Network className="w-5 h-5 text-dna-copper" />
                  <span className="font-medium">Knowledge Sharing Platforms</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-dna-copper/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-dna-copper" />
                  <span className="font-medium">Resource Pooling Tools</span>
                </div>
              </div>
            </div>
            
            <div className="md:order-1">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-dna-copper text-white p-4">
                  <h3 className="font-semibold">Active Collaborations</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Solar Education Initiative</h4>
                      <Badge className="bg-dna-emerald text-white">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      12 collaborators • 6 countries • $2.3M pooled
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-dna-emerald rounded-full"></div>
                      <div className="w-6 h-6 bg-dna-copper rounded-full -ml-2"></div>
                      <div className="w-6 h-6 bg-dna-gold rounded-full -ml-2"></div>
                      <span className="text-xs text-gray-500 ml-2">+9 more</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">HealthTech Platform</h4>
                      <Badge variant="outline" className="border-dna-copper text-dna-copper">Planning</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      8 collaborators • 4 countries • $1.8M committed
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-dna-mint rounded-full"></div>
                      <div className="w-6 h-6 bg-dna-forest rounded-full -ml-2"></div>
                      <span className="text-xs text-gray-500 ml-2">+6 more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Contribute
                </h2>
              </div>
              <p className="text-xl text-gray-600 mb-8">
                Make your mark on Africa's future. Invest capital, share skills, 
                or contribute time to projects that create lasting impact.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-dna-emerald" />
                  <span className="font-medium">Impact Investment Hub</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                  <Users className="w-5 h-5 text-dna-emerald" />
                  <span className="font-medium">Skills-Based Volunteering</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                  <Target className="w-5 h-5 text-dna-emerald" />
                  <span className="font-medium">Impact Measurement Tools</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h3 className="text-xl font-semibold mb-6 text-center">Your Impact Dashboard</h3>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-dna-emerald mb-2">$127K</div>
                    <div className="text-sm text-gray-600">Total Contributed</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dna-mint/20 rounded-xl p-4 text-center">
                      <div className="text-lg font-bold text-dna-emerald">847</div>
                      <div className="text-xs text-gray-600">Lives Impacted</div>
                    </div>
                    <div className="bg-dna-copper/20 rounded-xl p-4 text-center">
                      <div className="text-lg font-bold text-dna-copper">23</div>
                      <div className="text-xs text-gray-600">Projects Funded</div>
                    </div>
                  </div>
                  
                  <div className="bg-dna-gold/20 rounded-xl p-4">
                    <h4 className="font-medium text-sm mb-2">Recent Contribution</h4>
                    <p className="text-xs text-gray-600 mb-2">Solar Education Initiative</p>
                    <div className="text-sm font-bold text-dna-forest">$15,000 invested</div>
                    <div className="text-xs text-dna-emerald">+12% projected impact ROI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The DNA Cycle - How It All Works Together */}
      <section className="py-20 bg-gradient-to-br from-dna-forest to-dna-emerald text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            The DNA Cycle in Action
          </h2>
          <p className="text-xl text-gray-100 mb-12 max-w-3xl mx-auto">
            See how connecting leads to collaboration, which amplifies contribution, 
            creating a self-reinforcing cycle of impact across Africa.
          </p>

          <div className="relative">
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-semibold">Connect</span>
              </div>
              
              <ArrowRight className="w-6 h-6 text-dna-gold" />
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-semibold">Collaborate</span>
              </div>
              
              <ArrowRight className="w-6 h-6 text-dna-gold" />
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <span className="text-lg font-semibold">Contribute</span>
              </div>
            </div>
            
            <p className="text-lg text-gray-200 mb-8">
              Each successful contribution creates new opportunities to connect, 
              leading to deeper collaborations and greater impact.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to join the DNA Triangle?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Start with any pillar - connect with professionals, join a collaboration, 
            or contribute to a project. Your journey begins here.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              size="lg" 
              className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 rounded-full text-lg"
            >
              Start Connecting
            </Button>
            <Button 
              size="lg" 
              className="bg-dna-copper hover:bg-dna-gold text-white px-8 py-4 rounded-full text-lg"
            >
              Find Collaborations
            </Button>
            <Button 
              size="lg" 
              className="bg-dna-mint hover:bg-dna-emerald text-white px-8 py-4 rounded-full text-lg"
            >
              Make Contributions
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlatformFeatureShowcase;
