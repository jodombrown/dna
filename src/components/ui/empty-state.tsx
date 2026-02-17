import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PatternBackground } from '@/components/ui/PatternBackground';
import { LucideIcon } from 'lucide-react';

interface EmptyStateCTA {
  label: string;
  route?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

interface EmptyStateProps {
  headline: string;
  body: string;
  cta?: EmptyStateCTA | null;
  icon?: LucideIcon;
  className?: string;
}

/**
 * EmptyState — PRD §16
 *
 * Uses Adinkra watermark at "prominent" opacity (0.10),
 * Lora (heritage) for headline, Inter for body, and a primary CTA.
 */
export function EmptyState({
  headline,
  body,
  cta,
  icon: Icon,
  className,
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleCTA = () => {
    if (cta?.onClick) cta.onClick();
    else if (cta?.route) navigate(cta.route);
  };

  return (
    <PatternBackground
      pattern="adinkra"
      intensity="prominent"
      overlay
      overlayClassName="bg-background/80"
      className={cn(
        'rounded-dna-lg border border-dashed border-dna-stone',
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {Icon && (
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Icon className="h-10 w-10 text-primary" />
          </div>
        )}
        <h3 className="font-heritage text-xl font-semibold mb-2 text-foreground">
          {headline}
        </h3>
        <p className="text-muted-foreground max-w-md mb-6">{body}</p>
        {cta && (
          <Button onClick={handleCTA} size="lg">
            {cta.icon && <cta.icon className="mr-2 h-4 w-4" />}
            {cta.label}
          </Button>
        )}
      </div>
    </PatternBackground>
  );
}
