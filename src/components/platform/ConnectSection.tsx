import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Globe, Target, Network, ArrowRight, MapPin, Briefcase, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const ConnectSection = () => {
  const navigate = useNavigate();

  return (
    <section id="connect-section" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Connect
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Build meaningful professional relationships across the diaspora. 
              Discover opportunities, expand your network, and find your tribe.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg hover:bg-dna-emerald/15 transition-colors">
                <Globe className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Global Network Access</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg hover:bg-dna-emerald/15 transition-colors">
                <Target className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Smart Opportunity Matching</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg hover:bg-dna-emerald/15 transition-colors">
                <Network className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Professional Communities</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/dna/connect')}
              className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-2"
            >
              Explore Network
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative px-12">
            <Carousel className="w-full">
              <CarouselContent>
                {/* Professional Network Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-emerald to-dna-forest rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="bg-gradient-to-r from-dna-emerald to-dna-forest text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">Suggested Connections</h3>
                          <Users className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/80">People in your network</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-dna-emerald/5 to-transparent rounded-xl border border-dna-emerald/20">
                          <div className="w-14 h-14 bg-gradient-to-br from-dna-ochre to-dna-gold rounded-full flex items-center justify-center text-white font-bold">AO</div>
                          <div className="flex-1">
                            <p className="font-semibold">Dr. Amara Okafor</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> FinTech Entrepreneur
                            </p>
                            <p className="text-xs text-dna-emerald flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Lagos → London
                            </p>
                          </div>
                          <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest">
                            Connect
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-dna-mint/5 to-transparent rounded-xl border border-dna-mint/20">
                          <div className="w-14 h-14 bg-gradient-to-br from-dna-sunset to-dna-copper rounded-full flex items-center justify-center text-white font-bold">KA</div>
                          <div className="flex-1">
                            <p className="font-semibold">Prof. Kwame Asante</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> AgriTech Innovator
                            </p>
                            <p className="text-xs text-dna-emerald flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Accra → Toronto
                            </p>
                          </div>
                          <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest">
                            Connect
                          </Button>
                        </div>
                        
                        <div className="text-center pt-2">
                          <p className="text-sm font-medium text-dna-forest">50+ professionals in your network</p>
                          <p className="text-xs text-gray-500">Swipe to see more →</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Communities Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-forest to-dna-emerald rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="bg-gradient-to-r from-dna-forest to-dna-emerald text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">Your Communities</h3>
                          <Network className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/80">Groups you might like</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="p-4 bg-gradient-to-br from-dna-emerald/10 to-dna-mint/10 rounded-xl border border-dna-emerald/30">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-lg flex items-center justify-center">
                              <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">African Tech Founders</h4>
                              <p className="text-xs text-gray-600 mb-2">2,847 members • 156 online</p>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-dna-emerald/20 text-dna-forest text-xs rounded-full">Technology</span>
                                <span className="px-2 py-1 bg-dna-mint/20 text-dna-forest text-xs rounded-full">Startups</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3 bg-dna-emerald hover:bg-dna-forest">
                            Join Community
                          </Button>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-dna-mint/10 to-dna-emerald/10 rounded-xl border border-dna-mint/30">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-lg flex items-center justify-center">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">Diaspora Investors Network</h4>
                              <p className="text-xs text-gray-600 mb-2">1,523 members • 89 online</p>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-dna-copper/20 text-dna-copper text-xs rounded-full">Investment</span>
                                <span className="px-2 py-1 bg-dna-gold/20 text-dna-ochre text-xs rounded-full">Finance</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3 bg-dna-mint hover:bg-dna-emerald">
                            Join Community
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Opportunities Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-mint to-dna-emerald rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="bg-gradient-to-r from-dna-mint to-dna-emerald text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">Opportunities For You</h3>
                          <Star className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/80">Matched to your profile</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="p-4 bg-gradient-to-r from-dna-gold/10 to-dna-copper/10 rounded-xl border border-dna-gold/30">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">Senior Product Designer</h4>
                              <p className="text-sm text-gray-600">Flutterwave • Remote</p>
                            </div>
                            <span className="px-2 py-1 bg-dna-emerald/20 text-dna-forest text-xs rounded-full">95% Match</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">Leading payment infrastructure for Africa. Join us in building the future of African commerce.</p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">$120K-$150K</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Full-time</span>
                          </div>
                          <Button size="sm" className="w-full bg-dna-gold hover:bg-dna-copper">
                            Apply Now
                          </Button>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-dna-copper/10 to-dna-sunset/10 rounded-xl border border-dna-copper/30">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">Tech Advisor Needed</h4>
                              <p className="text-sm text-gray-600">AgriTech Startup • Advisory</p>
                            </div>
                            <span className="px-2 py-1 bg-dna-sunset/20 text-dna-sunset text-xs rounded-full">88% Match</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">Early-stage startup revolutionizing farming in East Africa seeks technical guidance.</p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Equity</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Part-time</span>
                          </div>
                          <Button size="sm" className="w-full bg-dna-copper hover:bg-dna-gold">
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="text-dna-emerald hover:text-dna-forest hover:bg-dna-emerald/10" />
              <CarouselNext className="text-dna-emerald hover:text-dna-forest hover:bg-dna-emerald/10" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectSection;
