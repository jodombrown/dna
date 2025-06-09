
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

// Hook for animated counting
const useAnimatedCounter = (targetValue: number, duration: number = 2000, isPercentage: boolean = false) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newValue = startValue + (targetValue - startValue) * easeOutQuart;
      
      setCurrentValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, targetValue, duration]);

  return { currentValue, ref };
};

const DiasporaStats = () => {
  const { currentValue: peopleCount, ref: peopleRef } = useAnimatedCounter(200);
  const { currentValue: remittanceCount, ref: remittanceRef } = useAnimatedCounter(100);
  const { currentValue: educationCount, ref: educationRef } = useAnimatedCounter(60, 2000, true);

  const handleConnect = () => {
    console.log('Connect clicked - navigating to connect page');
    window.open('/connect', '_blank');
  };

  const handleMessage = () => {
    console.log('Message clicked - opening contact form');
    // Scroll to the email form on the page
    const emailForm = document.querySelector('[data-email-form]');
    if (emailForm) {
      emailForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <p className="text-base md:text-lg mb-8 text-gray-700 leading-relaxed">
        The African Diaspora represents one of the most powerful untapped resources for global development:
      </p>

      {/* Statistics Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div ref={peopleRef} className="bg-gradient-to-br from-dna-emerald/10 to-dna-forest/10 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-dna-forest mb-2">
            {Math.floor(peopleCount).toLocaleString()}M+
          </div>
          <div className="text-sm font-medium text-gray-700 mb-1">People of African Descent</div>
          <div className="text-xs text-gray-600">Living outside Africa, projected to comprise 25% of global population</div>
        </div>
        
        <div ref={remittanceRef} className="bg-gradient-to-br from-dna-copper/10 to-dna-gold/10 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-dna-copper mb-2">
            ${Math.floor(remittanceCount).toLocaleString()}B+
          </div>
          <div className="text-sm font-medium text-gray-700 mb-1">Annual Remittances (2024)</div>
          <div className="text-xs text-gray-600">Fueling economic growth across African nations</div>
        </div>
        
        <div ref={educationRef} className="bg-gradient-to-br from-dna-mint/10 to-dna-emerald/10 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-dna-emerald mb-2">
            {Math.floor(educationCount)}%
          </div>
          <div className="text-sm font-medium text-gray-700 mb-1">Highly Educated</div>
          <div className="text-xs text-gray-600">Advanced degrees and specialized skills driving innovation</div>
        </div>
      </div>

      {/* Historical Context */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Historical Impact & Growth</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Past Decade (2014-2024)</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Remittances grew from $71B to $100B+ annually</li>
              <li>• Diaspora-led startups raised $3.2B in funding</li>
              <li>• 40% increase in diaspora professionals returning to Africa</li>
              <li>• 250+ diaspora-founded organizations created</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Current Challenges</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Fragmented networks limit collaboration</li>
              <li>• Skills and capital underutilized</li>
              <li>• Limited platforms for meaningful connection</li>
              <li>• Difficulty accessing Africa-focused opportunities</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center space-y-6">
        <p className="text-base md:text-lg text-gray-700 leading-relaxed">
          Yet, despite this immense potential, the full power of the African Diaspora remains untapped. DNA is here to change that.
        </p>

        <p className="text-base md:text-lg text-gray-700 leading-relaxed">
          We're in the early stages of building a transformative platform designed to elevate the African Diaspora's role in Africa's development. This isn't just about joining a network—it's about co-creating, co-investing, and co-executing the infrastructure that empowers us to connect, collaborate, and contribute meaningful change across Africa and beyond.
        </p>

        <div className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 rounded-xl p-6">
          <p className="text-base md:text-lg font-medium text-dna-forest mb-2">
            Your expertise matters. Your voice matters.
          </p>
          <p className="text-sm md:text-base text-gray-700">
            Let's build a future where the African Diaspora thrives and where Africa's potential is fully realized.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={handleConnect}
            className="bg-dna-emerald hover:bg-dna-forest hover:text-white text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            Connect
          </Button>
          
          <Button 
            onClick={handleMessage}
            variant="outline"
            className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
        </div>

        <p className="text-lg md:text-xl font-semibold text-dna-forest">
          Join me on this journey. Let's build this together.
        </p>
      </div>
    </div>
  );
};

export default DiasporaStats;
