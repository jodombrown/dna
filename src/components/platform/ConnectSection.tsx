
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Globe, Target, Network } from 'lucide-react';

const ConnectSection = () => {
  return (
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
  );
};

export default ConnectSection;
