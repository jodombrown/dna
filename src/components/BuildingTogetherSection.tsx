import React from 'react';
import { MessageCircle, Eye, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const BuildingTogetherSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-dna-pearl-light via-white to-dna-terra-light/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-dna-forest mb-4">
            Join Us in Shaping Africa's Future
          </h3>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            <span className="font-semibold text-dna-forest">Why we're building in the open:</span> We believe openness builds trust. Watch us create the 
            platform, share feedback, and join our community as we grow together.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Share Feedback Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-dna-ochre/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-dna-ochre/20 transition-colors">
                <MessageCircle className="w-8 h-8 text-dna-ochre" />
              </div>
              <h3 className="text-2xl font-bold text-dna-forest mb-4">Share Feedback</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Help us build better by sharing your thoughts and ideas
              </p>
              <Button 
                className="bg-dna-ochre hover:bg-dna-ochre-dark text-white rounded-full px-6 py-2 transition-all duration-300"
                onClick={() => window.open('mailto:feedback@diasporanetwork.africa', '_blank')}
              >
                Give Feedback
              </Button>
            </CardContent>
          </Card>

          {/* Track Progress Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-dna-emerald/20 transition-colors">
                <Eye className="w-8 h-8 text-dna-emerald" />
              </div>
              <h3 className="text-2xl font-bold text-dna-forest mb-4">Track Our Progress</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Follow our development journey phase by phase
              </p>
              <Button 
                className="bg-dna-emerald hover:bg-dna-forest text-white rounded-full px-6 py-2 transition-all duration-300"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                View Phases
              </Button>
            </CardContent>
          </Card>

          {/* Learn About DNA Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-dna-forest/20 transition-colors">
                <BookOpen className="w-8 h-8 text-dna-forest" />
              </div>
              <h3 className="text-2xl font-bold text-dna-forest mb-4">Learn About DNA</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Understand our mission, vision, and approach
              </p>
              <Button 
                className="bg-dna-forest hover:bg-dna-emerald text-white rounded-full px-6 py-2 transition-all duration-300"
                onClick={() => window.location.href = '/about'}
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BuildingTogetherSection;