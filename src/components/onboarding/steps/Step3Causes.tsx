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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Causes you care about</h2>
        <p className="text-muted-foreground mt-2">
          Select the impact areas where you want to make a difference
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Impact Areas * (select at least 1)</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {causes.map((cause: any) => (
              <div
                key={cause.id}
                onClick={() => toggleCause(cause.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  data.selected_causes?.includes(cause.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-2">{cause.icon}</div>
                <div className="font-medium">{cause.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {cause.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Why do you want to contribute? * (min 50 characters)</Label>
          <Textarea
            value={data.why_contribute || ''}
            onChange={(e) => onChange({ ...data, why_contribute: e.target.value })}
            placeholder="Share your motivation... What drives your passion for these causes? What impact do you hope to make?"
            className="min-h-[100px]"
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
