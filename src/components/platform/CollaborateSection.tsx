
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Handshake, Briefcase, Network, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CollaborateSection = () => {
  const navigate = useNavigate();

  return (
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
            
            <div className="space-y-4 mb-8">
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
          
          <div className="md:order-1">
            <div 
              className="bg-white rounded-3xl shadow-2xl overflow-hidden cursor-pointer hover:shadow-3xl transition-shadow"
              onClick={() => navigate('/collaborate')}
            >
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
  );
};

export default CollaborateSection;
