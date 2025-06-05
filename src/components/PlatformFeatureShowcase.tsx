
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Users, TrendingUp, Network, Target, Briefcase } from 'lucide-react';

const PlatformFeatureShowcase = () => {
  return (
    <div className="bg-white">
      {/* Hero Feature Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-dna-copper text-white text-sm px-4 py-2 rounded-full">
              2025 Platform Release
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Now you can DNA
              <br />
              more than a network
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional connections were just the start. Introducing DNA Investment Hub 
              and DNA Impact Tracker in an all-new platform.
            </p>
          </div>

          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-dna-copper to-dna-gold rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 bg-dna-emerald text-white text-xs px-2 py-1">
                      NEW
                    </Badge>
                  </div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 bg-dna-emerald text-white text-xs px-2 py-1">
                      NEW
                    </Badge>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Investment Hub</h3>
                <p className="text-lg text-gray-600 mb-4 underline">Impact Tracker</p>
                
                <Button className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-8 py-3 w-fit flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Watch the announcement
                </Button>
              </div>
              
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                  alt="DNA Platform Preview"
                  className="w-full h-80 object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Introducing
                <br />
                DNA Investment Hub
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Connect with vetted investment opportunities across Africa, 
                from early-stage startups to infrastructure projects.
              </p>
            </div>
            
            <div className="relative">
              <div className="bg-gray-100 rounded-3xl p-8 shadow-lg">
                <div className="bg-white rounded-2xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-dna-emerald rounded-full"></div>
                    <div>
                      <h4 className="font-semibold">AgriTech Expansion</h4>
                      <p className="text-sm text-gray-600">Series A • $2.5M target</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Sustainable farming solutions across West Africa. 
                    ROI projections show 25% annual returns.
                  </p>
                  <div className="text-xs text-gray-500">
                    📍 Lagos, Nigeria • ⭐ Verified opportunity
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-dna-copper rounded-full"></div>
                    <div>
                      <h4 className="font-semibold">FinTech Infrastructure</h4>
                      <p className="text-sm text-gray-600">Growth stage • $5M target</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Digital payment platform serving 50M+ users. 
                    Expanding to 15 new markets in 2025.
                  </p>
                  <div className="text-xs text-gray-500">
                    📍 Nairobi, Kenya • ⭐ High growth potential
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Tracker Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Make your impact more measurable
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Track real outcomes from your investments and collaborations 
              with our comprehensive impact measurement tools.
            </p>
          </div>

          <div className="relative max-w-md mx-auto">
            <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
              <div className="bg-white rounded-[2.5rem] overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 text-center">
                  <div className="text-xs font-medium text-gray-600">9:41</div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Impact Dashboard</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-dna-mint/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-dna-emerald rounded-lg"></div>
                        <div>
                          <div className="font-medium text-sm">Jobs Created</div>
                          <div className="text-lg font-bold text-dna-emerald">2,847</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">+12% this quarter</div>
                    </div>
                    
                    <div className="bg-dna-copper/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-dna-copper rounded-lg"></div>
                        <div>
                          <div className="font-medium text-sm">Communities Reached</div>
                          <div className="text-lg font-bold text-dna-copper">156K</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">Across 23 countries</div>
                    </div>
                    
                    <div className="bg-dna-gold/20 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-dna-gold rounded-lg"></div>
                        <div>
                          <div className="font-medium text-sm">Capital Deployed</div>
                          <div className="text-lg font-bold text-dna-forest">$12.4M</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">89% to local businesses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              A platform of opportunities, at your service
            </h2>
            <p className="text-xl text-gray-600">
              Choose from thousands of vetted opportunities across 
              54 countries—powered by diaspora expertise.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Professional Network</h3>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-dna-copper to-dna-gold rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Investment Hub</h3>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Network className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Collaboration Tools</h3>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-dna-forest to-dna-emerald rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Impact Tracking</h3>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-dna-gold to-dna-copper rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Business Services</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-dna-gold rounded-full flex items-center justify-center mx-auto mb-8">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-dna-gold rounded-full"></div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Opportunities on DNA are
            <br />
            vetted for quality
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            All investments and partnerships are evaluated for 
            viability, impact potential, and alignment with diaspora values.
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Due diligence completed</span>
                <div className="w-6 h-6 bg-dna-emerald rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Impact metrics verified</span>
                <div className="w-6 h-6 bg-dna-emerald rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Community-endorsed projects</span>
                <div className="w-6 h-6 bg-dna-emerald rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            We make it easy to create impact
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            It's simple to discover and join meaningful projects, 
            whether you're investing, collaborating, or contributing skills.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full text-lg"
            >
              Explore DNA Platform
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-full text-lg"
            >
              Learn about joining
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlatformFeatureShowcase;
