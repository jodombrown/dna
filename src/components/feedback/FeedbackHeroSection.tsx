import React from 'react';
import { Bug, Lightbulb, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { UserTag } from '@/types/feedback';

interface FeedbackHeroSectionProps {
  onCardClick: (tag: UserTag | null) => void;
}

const HERO_CARDS = [
  {
    icon: Bug,
    title: 'Report Bugs',
    description: 'Found something broken? Let us know and we\'ll fix it.',
    tag: 'bug' as UserTag,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
  },
  {
    icon: Lightbulb,
    title: 'Suggest Features',
    description: 'Have an idea to make DNA better? We\'re all ears.',
    tag: 'suggestion' as UserTag,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: MessageCircle,
    title: 'Share Ideas',
    description: 'Tell us what\'s working and what\'s missing.',
    tag: null,
    iconColor: 'text-dna-emerald',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
];

export function FeedbackHeroSection({ onCardClick }: FeedbackHeroSectionProps) {
  return (
    <div className="relative px-4 py-8 overflow-hidden">
      {/* Subtle African-inspired geometric pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B87333' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-24 h-24 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full text-dna-copper">
          <polygon fill="currentColor" points="0,0 100,0 0,100" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 opacity-10 rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full text-dna-copper">
          <polygon fill="currentColor" points="0,0 100,0 0,100" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Your Voice Matters
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Help us build DNA together
        </p>

        {/* Quick-tip cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HERO_CARDS.map((card) => (
            <Card
              key={card.title}
              onClick={() => onCardClick(card.tag)}
              className="cursor-pointer group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-5 text-center">
                <div className={`inline-flex p-3 rounded-full ${card.bgColor} mb-3 group-hover:scale-110 transition-transform`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
