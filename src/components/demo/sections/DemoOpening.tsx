import { forwardRef } from 'react';
import { KenteBorder } from '../KenteBorder';
import { StatBox } from '../StatBox';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface DemoOpeningProps {
  id: string;
}

export const DemoOpening = forwardRef<HTMLElement, DemoOpeningProps>(
  ({ id }, ref) => {
    const { ref: animationRef, isVisible } = useScrollAnimation();

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, #1a2332 0%, #0D1117 70%)',
        }}
      >
        {/* Decorative geometric patterns */}
        <div className="absolute top-8 left-8 text-white/5 text-4xl md:text-6xl font-light">
          ◇◆◇
        </div>
        <div className="absolute bottom-8 right-8 text-white/5 text-4xl md:text-6xl font-light">
          ◇◆◇
        </div>

        <div 
          ref={animationRef}
          className={cn(
            "max-w-[1200px] mx-auto px-4 md:px-6 text-center transition-all duration-800 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Kente Border */}
          <KenteBorder width="120px" height="4px" className="mb-10" />

          {/* Main Headline */}
          <h1 
            className="font-display font-semibold mb-8 leading-tight"
            style={{ fontSize: 'clamp(32px, 8vw, 72px)' }}
          >
            What if <span className="text-[#4A8D77]">200 million people</span> moved as one?
          </h1>

          {/* Subheadline */}
          <p 
            className="font-body font-light text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed"
            style={{ fontSize: 'clamp(18px, 3vw, 24px)' }}
          >
            The African diaspora is the world's most untapped economic force.<br />
            Scattered across continents. Connected by heritage.<br />
            Ready to build together.
          </p>

          {/* Statistics Row */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
            <StatBox value="200M+" label="Global Diaspora" />
            <StatBox value="$800B" label="Annual Remittances" />
            <StatBox value="54" label="African Nations" />
          </div>

          {/* Brand Box */}
          <div className="inline-block">
            <div className="text-2xl md:text-3xl font-display font-semibold text-[#4A8D77] mb-2">
              DNA
            </div>
            <div className="text-sm md:text-base text-white/50 font-body">
              Diaspora Network of Africa
            </div>
          </div>

          {/* Tagline */}
          <p className="text-white/60 font-body text-sm md:text-base mt-8 italic">
            The Operating System for the Global African Diaspora
          </p>
        </div>
      </section>
    );
  }
);

DemoOpening.displayName = 'DemoOpening';
