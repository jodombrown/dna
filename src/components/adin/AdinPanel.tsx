import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import AdinSearch from './AdinSearch';

interface AdinPanelProps {
  className?: string;
}

export function AdinPanel({ className }: AdinPanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">ADIN Intelligence</h2>
            <p className="text-sm font-normal text-gray-500">
              African Diaspora Intelligence Network
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AdinSearch source="dashboard" compact />
      </CardContent>
    </Card>
  );
}

export default AdinPanel;
