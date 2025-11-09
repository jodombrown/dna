import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Users, HandHeart, ArrowRight, DollarSign, Zap, BookOpen, Clock, Award, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Progress } from '@/components/ui/progress';

const ContributeSection = () => {
  const navigate = useNavigate();

  return (
    <section id="contribute-section" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-xl flex items-center justify-center">
                <HandHeart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Contribute
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Discover pathways to create lasting impact. Whether through investment, expertise, time, 
              or advocacy, find purposeful ways to advance Africa's progress.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                <Target className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Seven Pathways to Impact</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                <Users className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Skills-Based Contributions</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Real-Time Impact Tracking</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/contribute')}
              className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-2"
            >
              Explore Pathways to Impact
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative md:order-1 px-12">
            <Carousel className="w-full">
              <CarouselContent>
                {/* Financial Contribution Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-emerald to-dna-forest rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="bg-gradient-to-r from-dna-emerald to-dna-forest text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">Financial Impact</h3>
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/80">Invest in Africa's future</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="p-5 bg-gradient-to-br from-dna-mint/10 to-dna-emerald/10 rounded-xl border-2 border-dna-emerald/30">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-lg mb-1">Clean Water Initiative</h4>
                              <p className="text-sm text-gray-600">Rural Kenya Communities</p>
                            </div>
                            <Award className="w-5 h-5 text-dna-gold" />
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Funding Progress</span>
                              <span className="font-semibold text-dna-emerald">$487K / $650K</span>
                            </div>
                            <Progress value={75} className="h-3" />
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 bg-white rounded-lg border border-dna-emerald/20">
                              <p className="text-xs text-gray-600 mb-1">Your Investment</p>
                              <p className="text-lg font-bold text-dna-emerald">$15,000</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-dna-copper/20">
                              <p className="text-xs text-gray-600 mb-1">Impact ROI</p>
                              <p className="text-lg font-bold text-dna-copper">+12%</p>
                            </div>
                          </div>

                          <div className="p-3 bg-dna-gold/10 rounded-lg mb-4">
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-dna-ochre mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold">Lives Impacted</p>
                                <p className="text-sm font-bold text-dna-ochre">8,500 people</p>
                              </div>
                            </div>
                          </div>

                          <Button className="w-full bg-dna-emerald hover:bg-dna-forest">
                            Increase Investment
                          </Button>
                        </div>
                        
                        <p className="text-center text-xs text-gray-500">Swipe to see other pathways →</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Skills/Time Contribution Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-mint to-dna-emerald rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="bg-gradient-to-r from-dna-mint to-dna-emerald text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">Skills & Time</h3>
                          <Zap className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/80">Share your expertise</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="p-5 bg-gradient-to-br from-dna-copper/10 to-dna-gold/10 rounded-xl border-2 border-dna-copper/30">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-lg mb-1">Youth Coding Academy</h4>
                              <p className="text-sm text-gray-600">Mentorship Program</p>
                            </div>
                            <BookOpen className="w-5 h-5 text-dna-copper" />
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 bg-white rounded-lg border border-dna-mint/20">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-dna-mint" />
                                <p className="text-xs text-gray-600">Hours Given</p>
                              </div>
                              <p className="text-lg font-bold text-dna-mint">24 hrs</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-dna-copper/20">
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-dna-copper" />
                                <p className="text-xs text-gray-600">Mentees</p>
                              </div>
                              <p className="text-lg font-bold text-dna-copper">12</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between p-2 bg-dna-emerald/5 rounded">
                              <span className="text-xs text-gray-600">Next Session</span>
                              <span className="text-xs font-semibold text-dna-emerald">March 20, 2025</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-dna-gold/5 rounded">
                              <span className="text-xs text-gray-600">Completion Rate</span>
                              <span className="text-xs font-semibold text-dna-ochre">92%</span>
                            </div>
                          </div>

                          <div className="p-3 bg-dna-sunset/10 rounded-lg mb-4">
                            <div className="flex items-start gap-2">
                              <Heart className="w-4 h-4 text-dna-sunset mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold">Student Feedback</p>
                                <p className="text-xs text-gray-600 italic">"Life-changing mentorship!"</p>
                              </div>
                            </div>
                          </div>

                          <Button className="w-full bg-dna-mint hover:bg-dna-emerald">
                            Schedule Next Session
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Impact Dashboard Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-copper to-dna-gold rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="bg-gradient-to-r from-dna-copper to-dna-gold text-white p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">Your Impact Summary</h3>
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-white/80">Total contribution overview</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="text-center p-5 bg-gradient-to-br from-dna-emerald/10 to-dna-mint/10 rounded-xl border-2 border-dna-emerald/30 mb-4">
                          <p className="text-sm text-gray-600 mb-2">Total Contributions</p>
                          <p className="text-3xl font-bold text-dna-emerald mb-1">$127,500</p>
                          <p className="text-xs text-dna-forest">+$15K this month</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-4 bg-gradient-to-br from-dna-mint/20 to-dna-emerald/20 rounded-xl text-center">
                            <p className="text-2xl font-bold text-dna-emerald mb-1">8,847</p>
                            <p className="text-xs text-gray-600">Lives Impacted</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-dna-copper/20 to-dna-gold/20 rounded-xl text-center">
                            <p className="text-2xl font-bold text-dna-copper mb-1">23</p>
                            <p className="text-xs text-gray-600">Projects Funded</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="p-3 bg-dna-gold/10 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold">Contribution Breakdown</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Financial</span>
                                <span className="font-semibold text-dna-emerald">65%</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Skills/Time</span>
                                <span className="font-semibold text-dna-copper">25%</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Advocacy</span>
                                <span className="font-semibold text-dna-ochre">10%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-dna-sunset/10 to-dna-copper/10 rounded-xl">
                          <p className="text-xs font-semibold mb-2 text-gray-700">Recent Milestone</p>
                          <p className="text-sm font-bold text-dna-sunset mb-1">Solar Education Launch</p>
                          <p className="text-xs text-gray-600">Your $15K helped power 12 schools</p>
                        </div>

                        <Button className="w-full bg-dna-copper hover:bg-dna-gold">
                          Explore More Pathways
                        </Button>
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

export default ContributeSection;
