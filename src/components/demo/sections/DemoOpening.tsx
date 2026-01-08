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
    const { ref: animationRef, isVisible } = useScrollAnimation({ threshold: 0.2 });

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background"
      >
        {/* Subtle pattern background */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234A8D77' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div 
          ref={animationRef}
          className={cn(
            "max-w-[1200px] mx-auto px-4 md:px-6 text-center transition-all duration-1000 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12"
          )}
        >
          {/* Kente Border */}
          <div className={cn(
            "transition-all duration-700 delay-100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          )}>
            <KenteBorder width="120px" height="4px" className="mb-10" />
          </div>

          {/* Main Headline */}
          <h1 
            className={cn(
              "font-display font-semibold mb-8 leading-tight text-foreground transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            )}
            style={{ fontSize: 'clamp(32px, 8vw, 72px)' }}
          >
            What if <span className="text-dna-emerald">200 million people</span> moved as one?
          </h1>

          {/* Subheadline */}
          <p 
            className={cn(
              "font-body font-light text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            )}
            style={{ fontSize: 'clamp(18px, 3vw, 24px)' }}
          >
            The African diaspora is the world's most untapped economic force.<br />
            Scattered across continents. Connected by heritage.<br />
            Ready to build together.
          </p>

          {/* Statistics Row */}
          <div className={cn(
            "flex flex-wrap justify-center gap-8 md:gap-16 mb-12 transition-all duration-700 delay-400",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          )}>
            <StatBox value="200M+" label="Global Diaspora" />
            <StatBox value="$800B" label="Annual Remittances" />
            <StatBox value="54" label="African Nations" />
          </div>

          {/* Brand Box */}
          <div className={cn(
            "inline-block transition-all duration-700 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          )}>
            <div className="text-2xl md:text-3xl font-display font-semibold text-dna-emerald mb-2">
              DNA
            </div>
            <div className="text-sm md:text-base text-muted-foreground font-body">
              Diaspora Network of Africa
            </div>
          </div>

          {/* Tagline */}
          <p className={cn(
            "text-muted-foreground font-body text-sm md:text-base mt-8 italic transition-all duration-700 delay-600",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
          )}>
            The Operating System for the Global African Diaspora
          </p>
        </div>

        {/* Scroll indicator */}
        <div className={cn(
          "absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 delay-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-xs text-muted-foreground font-body">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-dna-emerald/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-dna-emerald rounded-full animate-bounce" />
          </div>
        </div>
      </section>
    );
  }
);

DemoOpening.displayName = 'DemoOpening';
