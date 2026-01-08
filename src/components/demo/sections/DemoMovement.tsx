import { forwardRef } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DemoMovementProps {
  id: string;
}

const C_ICONS = ['🤝', '🎪', '⚡', '💎', '📢'];

export const DemoMovement = forwardRef<HTMLElement, DemoMovementProps>(
  ({ id }, ref) => {
    const { ref: animationRef, isVisible } = useScrollAnimation();
    const navigate = useNavigate();

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, #1a2332 0%, #0D1117 70%)',
        }}
      >
        <div 
          ref={animationRef}
          className={cn(
            "max-w-[1200px] mx-auto px-4 md:px-6 text-center transition-all duration-800 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Kente Border */}
          <KenteBorder width="120px" height="4px" className="mb-10" />

          {/* Headline */}
          <h2 
            className="font-display font-semibold mb-6"
            style={{ fontSize: 'clamp(28px, 6vw, 56px)' }}
          >
            From Scattered To <span className="text-[#4A8D77]">Coordinated</span>
          </h2>

          {/* Description */}
          <p className="font-body font-light text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed text-base md:text-lg">
            DNA isn't just a platform. It's infrastructure for a movement. 
            The operating system that transforms diaspora potential into Africa's economic transformation.
          </p>

          {/* Mission & Vision */}
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 mb-10">
            <div className="bg-[#131920]/50 border border-white/10 rounded-xl px-6 py-4">
              <p className="font-body text-white/50 text-xs uppercase tracking-wider mb-1">Mission</p>
              <p className="font-display font-medium text-white text-lg">Mobilize the Global African Diaspora</p>
            </div>
            <div className="bg-[#131920]/50 border border-white/10 rounded-xl px-6 py-4">
              <p className="font-body text-white/50 text-xs uppercase tracking-wider mb-1">Vision</p>
              <p className="font-display font-medium text-white text-lg">Africa's Economic Transformation</p>
            </div>
          </div>

          {/* Ubuntu Quote Box */}
          <div 
            className="max-w-md mx-auto p-6 rounded-xl border mb-10"
            style={{ 
              backgroundColor: 'rgba(74, 141, 119, 0.1)',
              borderColor: 'rgba(74, 141, 119, 0.3)',
            }}
          >
            <blockquote className="font-display text-xl md:text-2xl italic text-white/90 mb-2">
              "I am because we are."
            </blockquote>
            <p className="font-body text-white/50 text-sm">
              Ubuntu Philosophy • The Foundation of DNA
            </p>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-[#4A8D77] hover:bg-[#3d7562] text-white font-body font-medium px-8 py-6 text-lg rounded-xl mb-10"
          >
            Join the Movement
          </Button>

          {/* C Icons Row */}
          <div className="flex justify-center gap-4 mb-8 opacity-50">
            {C_ICONS.map((icon, index) => (
              <span key={index} className="text-2xl">
                {icon}
              </span>
            ))}
          </div>

          {/* Footer */}
          <p className="font-body text-white/30 text-sm">
            DNA • Diaspora Network of Africa • {new Date().getFullYear()}
          </p>
        </div>
      </section>
    );
  }
);

DemoMovement.displayName = 'DemoMovement';
