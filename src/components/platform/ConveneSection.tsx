import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users2, Sparkles, ArrowRight, Clock, Globe, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const ConveneSection = () => {
  const navigate = useNavigate();

  return (
    <section id="convene-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-sunset to-dna-copper rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Convene
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Discover and create meaningful gatherings across the diaspora. 
              From tech meetups to cultural celebrations, find your community events.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-sunset/10 rounded-lg hover:bg-dna-sunset/15 transition-colors">
                <MapPin className="w-5 h-5 text-dna-sunset" />
                <span className="font-medium">Diaspora Event Discovery</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-sunset/10 rounded-lg hover:bg-dna-sunset/15 transition-colors">
                <Users2 className="w-5 h-5 text-dna-sunset" />
                <span className="font-medium">Community Gatherings</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-sunset/10 rounded-lg hover:bg-dna-sunset/15 transition-colors">
                <Sparkles className="w-5 h-5 text-dna-sunset" />
                <span className="font-medium">Cultural Celebrations</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/convene')}
              className="bg-dna-sunset hover:bg-dna-copper text-white flex items-center gap-2"
            >
              Explore Events
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative md:order-1 px-12">
            <Carousel className="w-full">
              <CarouselContent>
                {/* Featured Event Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-sunset to-dna-copper rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-dna-sunset via-dna-copper to-dna-gold relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur text-dna-sunset text-xs font-semibold rounded-full">Featured</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg mb-1">African Tech Summit 2025</h3>
                            <p className="text-sm text-gray-600">The Future of Innovation</p>
                          </div>
                          <Calendar className="w-5 h-5 text-dna-sunset mt-1" />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-dna-copper" />
                            <span className="text-gray-700">Lagos, Nigeria</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-dna-copper" />
                            <span className="text-gray-700">March 15-17, 2025</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users2 className="w-4 h-4 text-dna-copper" />
                            <span className="text-gray-700">250+ attendees registered</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-1 bg-dna-sunset/10 text-dna-sunset text-xs rounded-full">Conference</span>
                          <span className="px-2 py-1 bg-dna-copper/10 text-dna-copper text-xs rounded-full">Technology</span>
                          <span className="px-2 py-1 bg-dna-gold/10 text-dna-ochre text-xs rounded-full">Networking</span>
                        </div>
                        
                        <Button className="w-full bg-dna-sunset hover:bg-dna-copper">
                          <Ticket className="w-4 h-4 mr-2" />
                          Register Now
                        </Button>
                        
                        <p className="text-center text-xs text-gray-500 mt-3">Swipe to see more events →</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Community Gathering Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-copper to-dna-gold rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-dna-copper via-dna-gold to-dna-ochre relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur text-dna-copper text-xs font-semibold rounded-full">This Week</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg mb-1">Diaspora Investment Forum</h3>
                            <p className="text-sm text-gray-600">Connect with Investors</p>
                          </div>
                          <Globe className="w-5 h-5 text-dna-copper mt-1" />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-dna-gold" />
                            <span className="text-gray-700">London, United Kingdom</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-dna-gold" />
                            <span className="text-gray-700">March 22, 2025 • 6:00 PM GMT</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users2 className="w-4 h-4 text-dna-gold" />
                            <span className="text-gray-700">150+ attendees registered</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-1 bg-dna-copper/10 text-dna-copper text-xs rounded-full">Investment</span>
                          <span className="px-2 py-1 bg-dna-gold/10 text-dna-ochre text-xs rounded-full">Business</span>
                          <span className="px-2 py-1 bg-dna-emerald/10 text-dna-emerald text-xs rounded-full">Finance</span>
                        </div>
                        
                        <Button className="w-full bg-dna-copper hover:bg-dna-gold">
                          <Ticket className="w-4 h-4 mr-2" />
                          RSVP Free
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Cultural Event Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-ochre to-dna-sunset rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-dna-ochre via-dna-gold to-dna-sunset relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur text-dna-ochre text-xs font-semibold rounded-full">Cultural</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg mb-1">Pan-African Cultural Festival</h3>
                            <p className="text-sm text-gray-600">Celebrate Our Heritage</p>
                          </div>
                          <Sparkles className="w-5 h-5 text-dna-ochre mt-1" />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-dna-sunset" />
                            <span className="text-gray-700">New York, USA</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-dna-sunset" />
                            <span className="text-gray-700">April 5, 2025 • All Day</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users2 className="w-4 h-4 text-dna-sunset" />
                            <span className="text-gray-700">500+ expected attendees</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-1 bg-dna-ochre/10 text-dna-ochre text-xs rounded-full">Cultural</span>
                          <span className="px-2 py-1 bg-dna-sunset/10 text-dna-sunset text-xs rounded-full">Music</span>
                          <span className="px-2 py-1 bg-dna-copper/10 text-dna-copper text-xs rounded-full">Arts</span>
                        </div>
                        
                        <Button className="w-full bg-dna-ochre hover:bg-dna-sunset">
                          <Ticket className="w-4 h-4 mr-2" />
                          Get Tickets
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="text-dna-sunset hover:text-dna-copper hover:bg-dna-sunset/10" />
              <CarouselNext className="text-dna-sunset hover:text-dna-copper hover:bg-dna-sunset/10" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConveneSection;
