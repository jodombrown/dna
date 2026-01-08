import { forwardRef } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { Search, Bell, BarChart3, Target } from 'lucide-react';

interface DemoDIAProps {
  id: string;
}

const DIA_FEATURES = [
  { icon: Search, label: 'Smart Discovery', description: 'Find the right people, events, and opportunities' },
  { icon: Bell, label: 'Proactive Nudges', description: 'Never let important tasks fall through' },
  { icon: BarChart3, label: 'Network Intelligence', description: 'Understand your diaspora connections' },
  { icon: Target, label: 'Opportunity Matching', description: 'Surface relevant contributions and content' },
];

const CHAT_MESSAGES = [
  {
    from: 'dia',
    message: "Based on your mentorship interests and the event you attended last week, I found 3 educators in Accra who are building similar programs. Would you like me to introduce you?",
  },
  {
    from: 'user',
    message: "Yes! Can you also check if any of them attended the Tech Summit?",
  },
  {
    from: 'dia',
    message: "Two of them did! Kwame Asante actually asked a question during the same panel you were inspired by. He's also looking for diaspora collaborators. Perfect match. 🎯",
  },
];

export const DemoDIA = forwardRef<HTMLElement, DemoDIAProps>(
  ({ id }, ref) => {
    const { ref: animationRef, isVisible } = useScrollAnimation();

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen py-16 md:py-20"
        style={{ background: '#0D1117' }}
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

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left - Explanation */}
              <div>
                <h2 
                  className="font-display font-semibold mb-2"
                  style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
                >
                  Meet <span className="text-[#4A8D77]">DIA</span>
                </h2>
                <p className="font-body text-white/50 text-lg mb-6">
                  Diaspora Intelligence Agent
                </p>

                <p className="font-body text-white/70 leading-relaxed mb-6">
                  DIA is DNA's intelligence layer—woven through every C, anticipating needs, 
                  surfacing opportunities, and keeping the diaspora coordinated.
                </p>

                <p className="font-body text-[#4A8D77] italic mb-8">
                  Not an assistant that waits for commands. An agent that operates with intention.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DIA_FEATURES.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#4A8D77]/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-[#4A8D77]" />
                      </div>
                      <div>
                        <h4 className="font-body font-medium text-white/90 text-sm">
                          {feature.label}
                        </h4>
                        <p className="font-body text-white/50 text-xs">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Chat Mockup */}
              <div className="bg-[#131920] border border-white/10 rounded-xl p-4 md:p-6">
                {/* DIA Avatar Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{
                      background: 'linear-gradient(135deg, #4A8D77 0%, #3D5A80 100%)',
                    }}
                  >
                    🧠
                  </div>
                  <div>
                    <h4 className="font-body font-medium text-white">DIA</h4>
                    <p className="font-body text-white/50 text-xs">Diaspora Intelligence Agent</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="space-y-4">
                  {CHAT_MESSAGES.map((msg, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "max-w-[85%]",
                        msg.from === 'user' ? "ml-auto" : ""
                      )}
                    >
                      <div 
                        className={cn(
                          "p-3 rounded-2xl font-body text-sm leading-relaxed",
                          msg.from === 'dia' 
                            ? "bg-[#4A8D77]/20 rounded-bl-sm text-white/90" 
                            : "bg-white/10 rounded-br-sm text-white/80"
                        )}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

DemoDIA.displayName = 'DemoDIA';
