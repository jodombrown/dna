import React from 'react';
import { Button } from '@/components/ui/button';
import { Newspaper, TrendingUp, MessageSquare, Heart, ArrowRight, Share2, Bookmark, Eye, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const ConveySection = () => {
  const navigate = useNavigate();

  return (
    <section id="convey-section" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-ochre to-dna-gold rounded-xl flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Convey
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Stay connected to the stories that matter. Curated news, impact stories, 
              and diaspora voices shaping Africa's future.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-ochre/10 rounded-lg hover:bg-dna-ochre/15 transition-colors">
                <TrendingUp className="w-5 h-5 text-dna-ochre" />
                <span className="font-medium">Curated Diaspora News</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-ochre/10 rounded-lg hover:bg-dna-ochre/15 transition-colors">
                <Heart className="w-5 h-5 text-dna-ochre" />
                <span className="font-medium">Community Impact Stories</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-ochre/10 rounded-lg hover:bg-dna-ochre/15 transition-colors">
                <MessageSquare className="w-5 h-5 text-dna-ochre" />
                <span className="font-medium">Authentic Diaspora Voices</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/convey')}
              className="bg-dna-ochre hover:bg-dna-gold text-white flex items-center gap-2"
            >
              Read Stories
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="order-1 md:order-2 px-12">
            <Carousel className="w-full">
              <CarouselContent>
                {/* Featured Story Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-ochre to-dna-gold rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="relative">
                        <div className="h-40 bg-gradient-to-br from-dna-emerald via-dna-mint to-dna-forest"></div>
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur text-dna-ochre text-xs font-semibold rounded-full flex items-center gap-1">
                            <Award className="w-3 h-3" /> Featured
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-dna-emerald/10 text-dna-emerald text-xs rounded-full">Tech & Innovation</span>
                          <span className="text-xs text-gray-500">• 5 min read</span>
                        </div>

                        <h3 className="font-bold text-lg mb-2 line-clamp-2">Innovation Hub Empowers 500+ African Entrepreneurs</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          How diaspora-funded incubator is transforming startup ecosystem across West Africa with mentorship and capital.
                        </p>

                        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                          <div className="flex items-center gap-1 text-sm">
                            <Heart className="w-4 h-4 text-dna-sunset" />
                            <span className="font-semibold">1.2K</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <MessageSquare className="w-4 h-4 text-dna-copper" />
                            <span className="font-semibold">340</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Eye className="w-4 h-4 text-dna-ochre" />
                            <span className="font-semibold">15.3K</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-dna-ochre to-dna-gold rounded-full"></div>
                            <div>
                              <p className="text-xs font-semibold">Adaeze Nwosu</p>
                              <p className="text-xs text-gray-500">Tech Reporter</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              <Bookmark className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-center text-xs text-gray-500 mt-4">Swipe for more stories →</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Finance News Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-gold to-dna-copper rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="relative">
                        <div className="h-40 bg-gradient-to-br from-dna-sunset via-dna-copper to-dna-gold"></div>
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur text-dna-sunset text-xs font-semibold rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Trending
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-dna-copper/10 text-dna-copper text-xs rounded-full">Finance & Investment</span>
                          <span className="text-xs text-gray-500">• 7 min read</span>
                        </div>

                        <h3 className="font-bold text-lg mb-2 line-clamp-2">Diaspora Investment Reaches $2B in African Startups</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          Record-breaking year as African diaspora investors fuel innovation across fintech, agritech, and healthtech sectors.
                        </p>

                        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                          <div className="flex items-center gap-1 text-sm">
                            <Heart className="w-4 h-4 text-dna-sunset" />
                            <span className="font-semibold">890</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <MessageSquare className="w-4 h-4 text-dna-copper" />
                            <span className="font-semibold">210</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Eye className="w-4 h-4 text-dna-ochre" />
                            <span className="font-semibold">8.7K</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-dna-sunset to-dna-copper rounded-full"></div>
                            <div>
                              <p className="text-xs font-semibold">Kofi Mensah</p>
                              <p className="text-xs text-gray-500">Finance Analyst</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              <Bookmark className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Community Story Card */}
                <CarouselItem>
                  <div className="bg-gradient-to-br from-dna-sunset to-dna-ochre rounded-3xl p-1.5 shadow-2xl">
                    <div className="bg-white rounded-[22px] overflow-hidden">
                      <div className="relative">
                        <div className="h-40 bg-gradient-to-br from-dna-mint via-dna-emerald to-dna-forest"></div>
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur text-dna-emerald text-xs font-semibold rounded-full flex items-center gap-1">
                            <Heart className="w-3 h-3" /> Community
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-dna-emerald/10 text-dna-emerald text-xs rounded-full">Community Impact</span>
                          <span className="text-xs text-gray-500">• 4 min read</span>
                        </div>

                        <h3 className="font-bold text-lg mb-2 line-clamp-2">From Brooklyn to Kigali: A Developer's Journey Home</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          Software engineer leaves Silicon Valley to build Rwanda's next generation of tech talent through coding bootcamp.
                        </p>

                        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                          <div className="flex items-center gap-1 text-sm">
                            <Heart className="w-4 h-4 text-dna-sunset" />
                            <span className="font-semibold">2.1K</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <MessageSquare className="w-4 h-4 text-dna-copper" />
                            <span className="font-semibold">567</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Eye className="w-4 h-4 text-dna-ochre" />
                            <span className="font-semibold">23.5K</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-full"></div>
                            <div>
                              <p className="text-xs font-semibold">Grace Uwimana</p>
                              <p className="text-xs text-gray-500">Staff Writer</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              <Bookmark className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="text-dna-ochre hover:text-dna-gold hover:bg-dna-ochre/10" />
              <CarouselNext className="text-dna-ochre hover:text-dna-gold hover:bg-dna-ochre/10" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConveySection;
