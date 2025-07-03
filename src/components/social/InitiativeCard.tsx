
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target } from 'lucide-react';

interface InitiativeData {
  id: string;
  title: string;
  description: string | null;
  impact_area: string | null;
  created_at: string;
}

interface InitiativeCardProps {
  initiative: InitiativeData;
  showInFeed?: boolean;
}

const InitiativeCard: React.FC<InitiativeCardProps> = ({ initiative, showInFeed = false }) => {
  return (
    <Card className={`${showInFeed ? 'border-l-4 border-l-dna-emerald' : ''} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-dna-emerald" />
          <span className="font-semibold text-dna-emerald">Initiative</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{initiative.title}</h3>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {initiative.description && (
          <p className="text-gray-700 text-sm leading-relaxed">{initiative.description}</p>
        )}
        
        {initiative.impact_area && (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-dna-emerald" />
            <Badge
              variant="secondary"
              className="bg-dna-emerald/10 text-dna-emerald hover:bg-dna-emerald hover:text-white"
            >
              {initiative.impact_area}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InitiativeCard;
