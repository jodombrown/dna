import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DemoNavDotsProps {
  sections: string[];
  activeSection: number;
  onNavigate: (index: number) => void;
}

export function DemoNavDots({ sections, activeSection, onNavigate }: DemoNavDotsProps) {
  return (
    <nav 
      className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
      aria-label="Page sections"
    >
      {sections.map((label, index) => (
        <Tooltip key={index} delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onNavigate(index)}
              className={cn(
                "w-3 h-3 md:w-3.5 md:h-3.5 rounded-full transition-all duration-300 ease-out",
                "hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-dna-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activeSection === index
                  ? "bg-dna-emerald scale-130 shadow-[0_0_8px_hsl(var(--dna-emerald)/0.5)]"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Navigate to ${label}`}
              aria-current={activeSection === index ? 'true' : undefined}
            />
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-background text-foreground border-border">
            {label}
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}
