/**
 * DNA | Introduction Tone Selector
 *
 * Quick-start tone template pills for the introduction modal.
 * Clicking a pill replaces the message content with a template.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Briefcase, Heart, Calendar } from 'lucide-react';

interface ToneOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  generate: (nameA: string, nameB: string, headlineA?: string, headlineB?: string) => string;
}

const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'professional',
    label: 'Professional',
    icon: <Briefcase className="w-3 h-3" />,
    generate: (a, b, ha, hb) => {
      const aDesc = ha ? ` — ${ha}` : '';
      const bDesc = hb ? ` — ${hb}` : '';
      return `I'd like to introduce you both. ${a}${aDesc}, meet ${b}${bDesc}. I believe there's strong potential for collaboration between you two.`;
    },
  },
  {
    id: 'warm',
    label: 'Warm',
    icon: <Heart className="w-3 h-3" />,
    generate: (a, b, ha, hb) => {
      const aDesc = ha ? `, ${ha}` : '';
      const bDesc = hb ? `, ${hb}` : '';
      return `Hey ${a} and ${b}! I wanted to connect you two — ${a}${aDesc} and ${b}${bDesc}. I think you'd really hit it off!`;
    },
  },
  {
    id: 'context',
    label: 'Contextual',
    icon: <Calendar className="w-3 h-3" />,
    generate: (a, b) => {
      return `${a}, ${b} — I noticed you have a lot in common and thought you should connect. Looking forward to seeing what comes from this!`;
    },
  },
];

interface IntroductionToneSelectorProps {
  personAName: string;
  personBName: string;
  personAHeadline?: string;
  personBHeadline?: string;
  activeTone: string | null;
  onSelectTone: (toneId: string, message: string) => void;
}

export function IntroductionToneSelector({
  personAName,
  personBName,
  personAHeadline,
  personBHeadline,
  activeTone,
  onSelectTone,
}: IntroductionToneSelectorProps) {
  return (
    <div className="flex gap-1.5 justify-center mb-3">
      {TONE_OPTIONS.map(tone => {
        const isActive = activeTone === tone.id;
        return (
          <button
            key={tone.id}
            type="button"
            onClick={() => {
              const msg = tone.generate(
                personAName,
                personBName,
                personAHeadline,
                personBHeadline
              );
              onSelectTone(tone.id, msg);
            }}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium',
              'border transition-all duration-150',
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background/80 text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground'
            )}
          >
            {tone.icon}
            {tone.label}
          </button>
        );
      })}
    </div>
  );
}

export default IntroductionToneSelector;
