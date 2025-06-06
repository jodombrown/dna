
import React from 'react';
import { Users, Handshake, Heart, ArrowRight } from 'lucide-react';

const DNACycleSection = () => {
  return (
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
  );
};

export default DNACycleSection;
