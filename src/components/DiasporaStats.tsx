
import React from 'react';
import AnimatedStatsSection from './stats/AnimatedStatsSection';
import InteractiveTimeline from './stats/InteractiveTimeline';
import TestimonialsCarousel from './stats/TestimonialsCarousel';
import CallToActionSection from './stats/CallToActionSection';

const DiasporaStats = () => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with Background Image */}
      <AnimatedStatsSection />

      {/* Interactive Timeline */}
      <InteractiveTimeline />

      {/* Real Voices Carousel */}
      <TestimonialsCarousel />

      {/* Call-to-Action Band and Sources */}
      <CallToActionSection />
    </div>
  );
};

export default DiasporaStats;
