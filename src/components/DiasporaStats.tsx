
import React from 'react';
import AnimatedStatsSection from './stats/AnimatedStatsSection';
import InteractiveTimeline from './stats/InteractiveTimeline';
import TestimonialsCarousel from './stats/TestimonialsCarousel';
import CallToActionSection from './stats/CallToActionSection';

const DiasporaStats = () => {
  return (
    <div>
      {/* Hero Section with Background Image */}
      <div className="max-w-7xl mx-auto">
        <AnimatedStatsSection />
      </div>

      {/* Interactive Timeline - Full Width */}
      <InteractiveTimeline />

      {/* Real Voices Carousel */}
      <div className="max-w-7xl mx-auto">
        <TestimonialsCarousel />
      </div>

      {/* Call-to-Action Band and Sources */}
      <div className="max-w-7xl mx-auto">
        <CallToActionSection />
      </div>
    </div>
  );
};

export default DiasporaStats;
