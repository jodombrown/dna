// src/components/hubs/shared/AspirationMode.tsx
// Reusable aspiration mode template for hub marketing pages

import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, ArrowRight } from 'lucide-react';
import { ComingSoonList } from './ComingSoonList';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { HubType } from '@/hooks/useHubMode';

export interface AspirationModeProps {
  hub: HubType;
  illustration: React.ReactNode;
  title: string;
  tagline: string;
  description: string;
  primaryCTA: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryCTA: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  comingSoon: string[];
  earlyContent?: React.ReactNode;
  pattern?: string;
}

// African pattern backgrounds for each hub
const HUB_PATTERNS: Record<HubType, string> = {
  convene: 'kente',
  collaborate: 'ndebele',
  contribute: 'mudcloth',
  convey: 'adinkra'
};

export function AspirationMode({
  hub,
  illustration,
  title,
  tagline,
  description,
  primaryCTA,
  secondaryCTA,
  comingSoon,
  earlyContent,
  pattern
}: AspirationModeProps) {
  const patternName = pattern || HUB_PATTERNS[hub];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="relative px-4 sm:px-6 pt-6 sm:pt-8 pb-6">
        {/* African pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url('/patterns/${patternName}-pattern.svg')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px'
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* Illustration */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 mb-6 flex items-center justify-center">
            {illustration}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            {title}
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl font-serif italic text-dna-copper mb-4">
            "{tagline}"
          </p>

          {/* Description */}
          <p className="text-base text-muted-foreground max-w-md leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-4 sm:px-6 space-y-3 max-w-md mx-auto w-full">
        <Button
          onClick={primaryCTA.onClick}
          className="w-full h-12 bg-dna-emerald hover:bg-dna-emerald/90 text-white text-base"
          size="lg"
        >
          {primaryCTA.icon || <Bell className="w-4 h-4 mr-2" />}
          {primaryCTA.label}
        </Button>

        <Button
          onClick={secondaryCTA.onClick}
          variant="outline"
          className="w-full h-12 border-dna-emerald text-dna-emerald hover:bg-dna-emerald/5 text-base"
          size="lg"
        >
          {secondaryCTA.label}
          {secondaryCTA.icon || <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      {/* Coming Soon Section */}
      <div className="px-4 sm:px-6 py-8 max-w-md mx-auto w-full">
        <ComingSoonList items={comingSoon} />
      </div>

      {/* Early Content Preview (Hybrid Mode) */}
      {earlyContent && (
        <div className="px-4 sm:px-6 pb-8 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 bg-border" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Early Access
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          {earlyContent}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Be among the first to explore
          </p>
        </div>
      )}

      <MobileBottomNav />
    </div>
  );
}

export default AspirationMode;
