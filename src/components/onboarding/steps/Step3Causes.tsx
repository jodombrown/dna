import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Step3Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Causes: React.FC<Step3Props> = ({ data, onChange, onNext, onBack }) => {
  const { data: causes = [] } = useQuery({
    queryKey: ['causes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('causes')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const toggleCause = (causeId: string) => {
    const current = data.selected_causes || [];
    onChange({
      ...data,
      selected_causes: current.includes(causeId)
        ? current.filter((id: string) => id !== causeId)
        : [...current, causeId]
    });
  };

  const canProceed = data.selected_causes?.length >= 1 && data.why_contribute?.length >= 50;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <p className="text-lg italic text-muted-foreground">
          "Every member of the Diaspora carries a piece of Africa's progress within them."
        </p>
        <h2 className="text-2xl font-bold">Your Contribution Pathways</h2>
        <p className="text-muted-foreground">
          Which of these ways feels most natural for you to give back or get involved?<br />
          <span className="text-sm">(Select all that apply)</span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {causes.map((cause: any) => (
              <div
                key={cause.id}
                onClick={() => toggleCause(cause.id)}
                className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                  data.selected_causes?.includes(cause.id)
                    ? 'border-primary bg-primary/10 shadow-md scale-105'
                    : 'border-border hover:border-primary/50 hover:shadow-sm'
                }`}
              >
                <div className="text-4xl mb-3">{cause.icon}</div>
                <div className="font-bold text-lg mb-2">{cause.name}</div>
                <div className="text-sm text-muted-foreground italic">
                  {cause.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Label>Why do you want to contribute? * (min 50 characters)</Label>
          <Textarea
            value={data.why_contribute || ''}
            onChange={(e) => onChange({ ...data, why_contribute: e.target.value })}
            placeholder="Share your motivation... What drives your passion for contributing? What impact do you hope to make through these pathways?"
            className="min-h-[120px] mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {data.why_contribute?.length || 0} / 50 characters
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="flex-1">
          Continue to Availability
        </Button>
      </div>
    </div>
  );
};
