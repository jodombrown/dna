import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Handshake, Briefcase, Network, TrendingUp, ArrowRight, Users, DollarSign, Calendar, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Progress } from '@/components/ui/progress';

const CollaborateSection = () => {
  const navigate = useNavigate();

  return (
    <section id="collaborate-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-1 md:order-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-copper to-dna-gold rounded-xl flex items-center justify-center">
                <Handshake className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Collaborate
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Work together on meaningful projects that drive African development. 
              Pool resources, share knowledge, and amplify collective impact.
            </p>
            
            <div className="space-y-3 mb-8">
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

            <Button 
              onClick={() => navigate('/collaborate')}
              className="bg-dna-copper hover:bg-dna-gold text-white flex items-center gap-2"
            >
              Explore Active Collaborations
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="order-2 md:order-2 px-12">
            <Carousel className="w-full">
              <CarouselContent>
                {/* Active Project Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-copper to-dna-gold rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="bg-gradient-to-r from-dna-copper to-dna-gold text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">Active Projects</h3>
                          <Handshake className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/80">Live collaborations</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="p-4 bg-gradient-to-br from-dna-emerald/5 to-dna-copper/5 rounded-xl border-2 border-dna-emerald/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold">Solar Education Initiative</h4>
                                <Badge className="bg-dna-emerald text-white text-xs">Active</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">Bringing sustainable energy to rural schools across East Africa</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold text-dna-copper">68%</span>
                            </div>
                            <Progress value={68} className="h-2" />
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center p-2 bg-dna-copper/10 rounded-lg">
                              <Users className="w-4 h-4 mx-auto mb-1 text-dna-copper" />
                              <p className="text-xs font-semibold">12</p>
                              <p className="text-xs text-gray-500">Team</p>
                            </div>
                            <div className="text-center p-2 bg-dna-gold/10 rounded-lg">
                              <Target className="w-4 h-4 mx-auto mb-1 text-dna-ochre" />
                              <p className="text-xs font-semibold">6</p>
                              <p className="text-xs text-gray-500">Countries</p>
                            </div>
                            <div className="text-center p-2 bg-dna-emerald/10 rounded-lg">
                              <DollarSign className="w-4 h-4 mx-auto mb-1 text-dna-emerald" />
                              <p className="text-xs font-semibold">$2.3M</p>
                              <p className="text-xs text-gray-500">Pooled</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-full border-2 border-white"></div>
                            <div className="w-7 h-7 bg-gradient-to-br from-dna-copper to-dna-gold rounded-full border-2 border-white -ml-3"></div>
                            <div className="w-7 h-7 bg-gradient-to-br from-dna-sunset to-dna-copper rounded-full border-2 border-white -ml-3"></div>
                            <span className="text-xs text-gray-500 ml-1">+9 collaborators</span>
                          </div>
                          
                          <Button className="w-full bg-dna-copper hover:bg-dna-gold">
                            View Project
                          </Button>
                        </div>
                        
                        <p className="text-center text-xs text-gray-500">Swipe to see more projects →</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Planning Stage Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-gold to-dna-ochre rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="bg-gradient-to-r from-dna-gold to-dna-ochre text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">In Planning</h3>
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/80">Forming teams</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="p-4 bg-gradient-to-br from-dna-mint/5 to-dna-forest/5 rounded-xl border-2 border-dna-mint/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold">HealthTech Platform</h4>
                                <Badge variant="outline" className="border-dna-mint text-dna-forest text-xs">Planning</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">Telemedicine platform connecting diaspora doctors with African communities</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Team Formation</span>
                              <span className="font-semibold text-dna-mint">42%</span>
                            </div>
                            <Progress value={42} className="h-2" />
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center p-2 bg-dna-mint/10 rounded-lg">
                              <Users className="w-4 h-4 mx-auto mb-1 text-dna-forest" />
                              <p className="text-xs font-semibold">8</p>
                              <p className="text-xs text-gray-500">Team</p>
                            </div>
                            <div className="text-center p-2 bg-dna-emerald/10 rounded-lg">
                              <Target className="w-4 h-4 mx-auto mb-1 text-dna-emerald" />
                              <p className="text-xs font-semibold">4</p>
                              <p className="text-xs text-gray-500">Countries</p>
                            </div>
                            <div className="text-center p-2 bg-dna-copper/10 rounded-lg">
                              <DollarSign className="w-4 h-4 mx-auto mb-1 text-dna-copper" />
                              <p className="text-xs font-semibold">$1.8M</p>
                              <p className="text-xs text-gray-500">Committed</p>
                            </div>
                          </div>

                          <div className="p-3 bg-dna-ochre/10 rounded-lg mb-3">
                            <div className="flex items-start gap-2">
                              <Calendar className="w-4 h-4 text-dna-ochre mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-gray-700">Next Milestone</p>
                                <p className="text-xs text-gray-600">Kick-off meeting: March 28, 2025</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-full border-2 border-white"></div>
                            <div className="w-7 h-7 bg-gradient-to-br from-dna-forest to-dna-emerald rounded-full border-2 border-white -ml-3"></div>
                            <span className="text-xs text-gray-500 ml-1">+6 collaborators</span>
                          </div>
                          
                          <Button className="w-full bg-dna-mint hover:bg-dna-emerald">
                            Join Collaboration
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* New Opportunity Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-emerald to-dna-forest rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="bg-gradient-to-r from-dna-emerald to-dna-forest text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">Open Opportunities</h3>
                          <Network className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/80">Join a collaboration</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="p-4 bg-gradient-to-br from-dna-copper/5 to-dna-sunset/5 rounded-xl border-2 border-dna-copper/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold">AgriTech Supply Chain</h4>
                                <Badge className="bg-dna-copper text-white text-xs">Seeking Team</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">Blockchain solution for transparent African agricultural supply chains</p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Looking for:</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-dna-emerald/10 text-dna-emerald text-xs rounded-full">Blockchain Dev</span>
                              <span className="px-2 py-1 bg-dna-copper/10 text-dna-copper text-xs rounded-full">Product Manager</span>
                              <span className="px-2 py-1 bg-dna-gold/10 text-dna-ochre text-xs rounded-full">UX Designer</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-2 bg-dna-sunset/10 rounded-lg">
                              <p className="text-xs text-gray-600">Initial Budget</p>
                              <p className="text-sm font-semibold text-dna-sunset">$850K</p>
                            </div>
                            <div className="p-2 bg-dna-emerald/10 rounded-lg">
                              <p className="text-xs text-gray-600">Timeline</p>
                              <p className="text-sm font-semibold text-dna-emerald">12 months</p>
                            </div>
                          </div>

                          <div className="p-3 bg-dna-gold/10 rounded-lg mb-3">
                            <div className="flex items-start gap-2">
                              <TrendingUp className="w-4 h-4 text-dna-ochre mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-gray-700">Impact Potential</p>
                                <p className="text-xs text-gray-600">50,000+ farmers in 8 countries</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-gradient-to-br from-dna-copper to-dna-gold rounded-full border-2 border-white"></div>
                            <div className="w-7 h-7 bg-gradient-to-br from-dna-sunset to-dna-copper rounded-full border-2 border-white -ml-3"></div>
                            <span className="text-xs text-gray-500 ml-1">+2 founders</span>
                          </div>
                          
                          <Button className="w-full bg-dna-emerald hover:bg-dna-forest">
                            Express Interest
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="text-dna-copper hover:text-dna-gold hover:bg-dna-copper/10" />
              <CarouselNext className="text-dna-copper hover:text-dna-gold hover:bg-dna-copper/10" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollaborateSection;
