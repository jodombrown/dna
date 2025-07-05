import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StayNotifiedPanel from '@/components/StayNotifiedPanel';
import { MessageCircle, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBreathingAnimation } from '@/hooks/useBreathingAnimation';

const CTASection = () => {
  const [isStayNotifiedOpen, setIsStayNotifiedOpen] = useState(false);
  const navigate = useNavigate();
  const card1Ref = useBreathingAnimation();
  const card2Ref = useBreathingAnimation();
  const card3Ref = useBreathingAnimation();

  return (
    <>
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main CTA */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Join Us in Shaping Africa's Future
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              <strong>Why we're building in the open:</strong> We believe openness builds trust. 
              Watch us create the platform, share feedback, and join our community as we grow together.
            </p>
          </div>

          {/* Engagement Options */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card ref={card1Ref.elementRef} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/contact')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-dna-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-dna-copper" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Share Feedback</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Help us build better by sharing your thoughts and ideas
                </p>
                <Button variant="ghost" size="sm" className="text-dna-copper">
                  Get Involved <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card ref={card2Ref.elementRef} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/phase/market-research')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-dna-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-dna-emerald" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Track Our Progress</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Follow our development journey phase by phase
                </p>
                <Button variant="ghost" size="sm" className="text-dna-emerald">
                  View Phases <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card ref={card3Ref.elementRef} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/about')}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-dna-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-dna-forest" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Learn About DNA</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Understand our mission, vision, and approach
                </p>
                <Button variant="ghost" size="sm" className="text-dna-forest">
                  Read More <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <StayNotifiedPanel 
        isOpen={isStayNotifiedOpen} 
        onClose={() => setIsStayNotifiedOpen(false)} 
      />
    </>
  );
};

export default CTASection;
