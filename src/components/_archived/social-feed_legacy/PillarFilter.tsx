import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PillarFilterProps {
  selectedPillar: string;
  onPillarChange: (pillar: string) => void;
}

const pillars = [
  { value: 'feed', label: 'All Posts', description: 'View all posts across pillars' },
  { value: 'connect', label: 'Connect', description: 'Networking and community building' },
  { value: 'collaborate', label: 'Collaborate', description: 'Partnership and project opportunities' },
  { value: 'contribute', label: 'Contribute', description: 'Give back and make impact' },
];

const getPillarColor = (pillar: string) => {
  switch (pillar) {
    case 'connect': return 'bg-dna-emerald text-white hover:bg-dna-emerald/80';
    case 'collaborate': return 'bg-dna-copper text-white hover:bg-dna-copper/80';
    case 'contribute': return 'bg-dna-gold text-black hover:bg-dna-gold/80';
    default: return 'bg-dna-forest text-white hover:bg-dna-forest/80';
  }
};

export const PillarFilter: React.FC<PillarFilterProps> = ({
  selectedPillar,
  onPillarChange
}) => {
  return (
    <div 
      className="space-y-3"
      role="tablist"
      aria-label="Filter posts by pillar"
    >
      <h3 className="font-medium text-foreground">Filter by Pillar</h3>
      
      <div className="flex flex-wrap gap-2">
        {pillars.map((pillar) => {
          const isSelected = selectedPillar === pillar.value;
          
          return (
            <Button
              key={pillar.value}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onPillarChange(pillar.value)}
              className={`transition-all ${
                isSelected 
                  ? getPillarColor(pillar.value)
                  : 'hover:bg-accent'
              }`}
              role="tab"
              aria-selected={isSelected}
              aria-label={`${pillar.label}: ${pillar.description}`}
              title={pillar.description}
            >
              {pillar.label}
              {isSelected && pillar.value !== 'feed' && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-white/20 text-current border-0"
                >
                  Active
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};