import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users2, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBreathingAnimation } from '@/hooks/useBreathingAnimation';

const ConveneSection = () => {
  const navigate = useNavigate();
  const cardRef = useBreathingAnimation();

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
          
          <div className="relative md:order-1">
            <div 
              ref={cardRef.elementRef}
              className="bg-gray-900 rounded-3xl p-6 shadow-2xl cursor-pointer hover:shadow-3xl transition-shadow"
              onClick={() => navigate('/convene')}
            >
              <div className="bg-white rounded-2xl overflow-hidden">
                <div className="bg-dna-sunset text-white p-4 text-center">
                  <h3 className="font-semibold">Upcoming Diaspora Events</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="p-4 border rounded-lg hover:border-dna-sunset/50 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-dna-sunset mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold">African Tech Summit 2025</p>
                        <p className="text-sm text-gray-600">March 15 • Lagos, Nigeria</p>
                      </div>
                    </div>
                    <p className="text-xs text-dna-emerald">250+ attendees registered</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:border-dna-sunset/50 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-dna-sunset mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold">Diaspora Investment Forum</p>
                        <p className="text-sm text-gray-600">March 22 • London, UK</p>
                      </div>
                    </div>
                    <p className="text-xs text-dna-emerald">150+ attendees registered</p>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">50+ events happening this month</p>
                    <p className="text-xs text-dna-sunset">Join the movement</p>
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

export default ConveneSection;
