import { forwardRef, useState } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface DemoInterconnectionProps {
  id: string;
}

const C_COLORS: Record<string, string> = {
  CONNECT: '#4A8D77',
  CONVENE: '#E07A5F',
  COLLABORATE: '#3D5A80',
  CONTRIBUTE: '#9B5DE5',
  CONVEY: '#F4A261',
};

const C_ICONS: Record<string, string> = {
  CONNECT: '🤝',
  CONVENE: '🎪',
  COLLABORATE: '⚡',
  CONTRIBUTE: '💎',
  CONVEY: '📢',
};

const CONNECTIONS = [
  { from: 'CONNECT', to: 'COLLABORATE', description: 'Your connections become collaborators. Invite them to Spaces.' },
  { from: 'CONVENE', to: 'COLLABORATE', description: 'Events spark ideas that become Spaces. Continue the conversation.' },
  { from: 'COLLABORATE', to: 'CONTRIBUTE', description: 'Spaces generate needs. Post opportunities directly from your project.' },
  { from: 'COLLABORATE', to: 'CONVEY', description: 'Completed work becomes shareable stories. Document your impact.' },
  { from: 'CONVEY', to: 'CONNECT', description: 'Your content attracts like-minded connections.' },
  { from: 'CONTRIBUTE', to: 'COLLABORATE', description: 'Contributions lead to deeper involvement. Helpers become members.' },
];

const C_POSITIONS = [
  { name: 'CONNECT', angle: -90 },
  { name: 'CONVENE', angle: -18 },
  { name: 'COLLABORATE', angle: 54 },
  { name: 'CONTRIBUTE', angle: 126 },
  { name: 'CONVEY', angle: 198 },
];

export const DemoInterconnection = forwardRef<HTMLElement, DemoInterconnectionProps>(
  ({ id }, ref) => {
    const { ref: animationRef, isVisible } = useScrollAnimation();
    const [hoveredC, setHoveredC] = useState<string | null>(null);

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen py-16 md:py-20"
        style={{ background: '#131920' }}
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div 
            ref={animationRef}
            className={cn(
              "transition-all duration-800 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Kente Border */}
            <KenteBorder width="80px" height="3px" className="mb-8" />

            {/* Headline */}
            <h2 
              className="font-display font-semibold text-center mb-4"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
            >
              Not Five Features. <span className="text-[#4A8D77]">One System.</span>
            </h2>

            {/* Supporting Text */}
            <p className="font-body font-light text-white/70 text-center max-w-2xl mx-auto mb-12 leading-relaxed text-base md:text-lg">
              DNA's magic is in the connections between the Five C's. Each action in one dimension 
              creates value in others. This is what makes DNA an operating system, not just an app.
            </p>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Visualization */}
              <div className="relative aspect-square max-w-md mx-auto w-full">
                {/* Center DNA Hub */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: 'linear-gradient(135deg, #4A8D77 0%, #3D5A80 100%)',
                    boxShadow: '0 0 30px rgba(74, 141, 119, 0.4)',
                  }}
                >
                  <span className="font-display font-bold text-white text-xl">DNA</span>
                </div>

                {/* C Nodes */}
                {C_POSITIONS.map((c) => {
                  const radius = 42; // percentage from center
                  const x = 50 + radius * Math.cos((c.angle * Math.PI) / 180);
                  const y = 50 + radius * Math.sin((c.angle * Math.PI) / 180);
                  const color = C_COLORS[c.name];
                  const isHovered = hoveredC === c.name;

                  return (
                    <div
                      key={c.name}
                      className="absolute transition-transform duration-300"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.15)' : 'scale(1)'}`,
                      }}
                      onMouseEnter={() => setHoveredC(c.name)}
                      onMouseLeave={() => setHoveredC(null)}
                    >
                      <div 
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center cursor-pointer border-2"
                        style={{
                          backgroundColor: `${color}20`,
                          borderColor: color,
                        }}
                      >
                        <span className="text-2xl md:text-3xl">{C_ICONS[c.name]}</span>
                      </div>
                      <div 
                        className="text-center text-xs font-body mt-1"
                        style={{ color }}
                      >
                        {c.name}
                      </div>
                    </div>
                  );
                })}

                {/* Dashed Lines to Center */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  {C_POSITIONS.map((c) => {
                    const radius = 42;
                    const x = 50 + radius * Math.cos((c.angle * Math.PI) / 180);
                    const y = 50 + radius * Math.sin((c.angle * Math.PI) / 180);
                    return (
                      <line
                        key={c.name}
                        x1="50"
                        y1="50"
                        x2={x}
                        y2={y}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="0.3"
                        strokeDasharray="2,2"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Connection Examples */}
              <div className="space-y-4">
                {CONNECTIONS.map((conn, index) => (
                  <div 
                    key={index}
                    className="bg-[#0D1117] border border-white/10 rounded-lg p-4 flex items-start gap-4"
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: `${C_COLORS[conn.from]}30` }}
                      >
                        {C_ICONS[conn.from]}
                      </span>
                      <span className="text-white/40">→</span>
                      <span 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: `${C_COLORS[conn.to]}30` }}
                      >
                        {C_ICONS[conn.to]}
                      </span>
                    </div>
                    <p className="font-body text-white/70 text-sm leading-relaxed">
                      {conn.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flywheel Box */}
            <div 
              className="mt-12 p-6 rounded-xl border"
              style={{ 
                backgroundColor: 'rgba(74, 141, 119, 0.1)',
                borderColor: 'rgba(74, 141, 119, 0.3)',
              }}
            >
              <h3 className="font-display font-semibold text-[#4A8D77] text-lg mb-2">
                The Flywheel Effect
              </h3>
              <p className="font-body text-white/70 text-sm md:text-base leading-relaxed">
                Every connection made leads to events discovered. Events spark collaborations. 
                Collaborations generate contributions. Contributions become stories. 
                Stories attract new connections.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

DemoInterconnection.displayName = 'DemoInterconnection';
