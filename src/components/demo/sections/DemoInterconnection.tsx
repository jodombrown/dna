import { forwardRef, useState } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { Users, Calendar, Layers, Gift, PenTool } from 'lucide-react';

interface DemoInterconnectionProps {
  id: string;
}

const C_STYLES: Record<string, { bg: string; text: string; ringColor: string }> = {
  CONNECT: { bg: 'bg-dna-emerald/15', text: 'text-dna-emerald', ringColor: 'ring-dna-emerald' },
  CONVENE: { bg: 'bg-dna-terra/15', text: 'text-dna-terra', ringColor: 'ring-dna-terra' },
  COLLABORATE: { bg: 'bg-dna-ocean/15', text: 'text-dna-ocean', ringColor: 'ring-dna-ocean' },
  CONTRIBUTE: { bg: 'bg-dna-purple/15', text: 'text-dna-purple', ringColor: 'ring-dna-purple' },
  CONVEY: { bg: 'bg-dna-ochre/15', text: 'text-dna-ochre', ringColor: 'ring-dna-ochre' },
};

const C_ICONS: Record<string, React.ReactNode> = {
  CONNECT: <Users className="w-5 h-5" />,
  CONVENE: <Calendar className="w-5 h-5" />,
  COLLABORATE: <Layers className="w-5 h-5" />,
  CONTRIBUTE: <Gift className="w-5 h-5" />,
  CONVEY: <PenTool className="w-5 h-5" />,
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
    const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
    const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.1 });
    const [hoveredC, setHoveredC] = useState<string | null>(null);

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen py-16 md:py-24 bg-dna-pearl"
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          {/* Header */}
          <div 
            ref={headerRef}
            className={cn(
              "text-center mb-12 transition-all duration-700",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12"
            )}
          >
            <KenteBorder width="80px" height="3px" className="mb-8" />

            <h2 
              className="font-display font-semibold text-foreground mb-4"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
            >
              Not Five Features. <span className="text-dna-emerald">One System.</span>
            </h2>

            <p className="font-body font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
              DNA's magic is in the connections between the Five C's. Each action in one dimension 
              creates value in others. This is what makes DNA an operating system, not just an app.
            </p>
          </div>

          {/* Two Column Layout */}
          <div 
            ref={contentRef}
            className={cn(
              "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 delay-200",
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            )}
          >
            {/* Visualization */}
            <div className="relative aspect-square max-w-md mx-auto w-full">
              {/* Center DNA Hub */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center z-10 bg-gradient-to-br from-dna-emerald to-dna-forest shadow-lg"
              >
                <span className="font-display font-bold text-white text-lg md:text-xl">DNA</span>
              </div>

              {/* C Nodes */}
              {C_POSITIONS.map((c) => {
                const radius = 40;
                const x = 50 + radius * Math.cos((c.angle * Math.PI) / 180);
                const y = 50 + radius * Math.sin((c.angle * Math.PI) / 180);
                const styles = C_STYLES[c.name];
                const isHovered = hoveredC === c.name;

                return (
                  <div
                    key={c.name}
                    className={cn(
                      "absolute transition-all duration-300",
                      isHovered && "scale-110"
                    )}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onMouseEnter={() => setHoveredC(c.name)}
                    onMouseLeave={() => setHoveredC(null)}
                  >
                    <div 
                      className={cn(
                        "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center cursor-pointer border-2 bg-background shadow-sm",
                        styles.bg,
                        isHovered && "ring-2",
                        styles.ringColor
                      )}
                    >
                      <span className={styles.text}>{C_ICONS[c.name]}</span>
                    </div>
                    <div className={cn("text-center text-xs font-body mt-1 font-medium", styles.text)}>
                      {c.name}
                    </div>
                  </div>
                );
              })}

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                {C_POSITIONS.map((c) => {
                  const radius = 40;
                  const x = 50 + radius * Math.cos((c.angle * Math.PI) / 180);
                  const y = 50 + radius * Math.sin((c.angle * Math.PI) / 180);
                  return (
                    <line
                      key={c.name}
                      x1="50"
                      y1="50"
                      x2={x}
                      y2={y}
                      stroke="hsl(var(--dna-emerald))"
                      strokeWidth="0.3"
                      strokeDasharray="2,2"
                      opacity="0.3"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Connection Examples */}
            <div className="space-y-3">
              {CONNECTIONS.map((conn, index) => {
                const fromStyles = C_STYLES[conn.from];
                const toStyles = C_STYLES[conn.to];
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "bg-background border border-border rounded-lg p-4 flex items-start gap-4 transition-all duration-500",
                      "hover:shadow-md hover:border-dna-emerald/30",
                      contentVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                    )}
                    style={{ transitionDelay: contentVisible ? `${300 + index * 100}ms` : '0ms' }}
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("w-8 h-8 rounded-full flex items-center justify-center", fromStyles.bg)}>
                        <span className={fromStyles.text}>{C_ICONS[conn.from]}</span>
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className={cn("w-8 h-8 rounded-full flex items-center justify-center", toStyles.bg)}>
                        <span className={toStyles.text}>{C_ICONS[conn.to]}</span>
                      </span>
                    </div>
                    <p className="font-body text-muted-foreground text-sm leading-relaxed">
                      {conn.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flywheel Box */}
          <div 
            className={cn(
              "mt-12 p-6 rounded-xl border bg-dna-emerald/5 border-dna-emerald/20 transition-all duration-700 delay-500",
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            )}
          >
            <h3 className="font-display font-semibold text-dna-emerald text-lg mb-2">
              The Flywheel Effect
            </h3>
            <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed">
              Every connection made leads to events discovered. Events spark collaborations. 
              Collaborations generate contributions. Contributions become stories. 
              Stories attract new connections.
            </p>
          </div>
        </div>
      </section>
    );
  }
);

DemoInterconnection.displayName = 'DemoInterconnection';
