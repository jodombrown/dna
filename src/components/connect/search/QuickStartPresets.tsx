import React from 'react';

interface Preset {
  label: string;
  searchTerm: string;
  tab?: 'professionals' | 'communities' | 'events';
  filters?: {
    location?: string;
    skills?: string[];
    isMentor?: boolean;
    isInvestor?: boolean;
    lookingForOpportunities?: boolean;
  };
}

interface QuickStartPresetsProps {
  onApplyPreset: (preset: Preset) => void;
}

// Presets chosen to align with available demo data for reliable results
const presets: Preset[] = [
  { label: 'FinTech • London', searchTerm: 'fintech', tab: 'professionals', filters: { location: 'London' } },
  { label: 'Climate • Boston', searchTerm: 'climate', tab: 'professionals', filters: { location: 'Boston' } },
  { label: 'AI • London', searchTerm: 'ai', tab: 'professionals', filters: { location: 'London' } },
  { label: 'Founders • San Francisco', searchTerm: 'founder', tab: 'professionals', filters: { location: 'San Francisco' } },
  { label: 'Mobile money • Nairobi', searchTerm: 'mobile', tab: 'professionals', filters: { location: 'Nairobi' } },
  { label: 'Renewable energy • Johannesburg', searchTerm: 'energy', tab: 'professionals', filters: { location: 'Johannesburg' } },
  { label: 'Blockchain • Remote (Ghana)', searchTerm: 'blockchain', tab: 'professionals', filters: { location: 'Ghana' } },
  { label: 'Francophone tech • Paris', searchTerm: 'tech', tab: 'communities', filters: { location: 'Paris' } },
];

const QuickStartPresets: React.FC<QuickStartPresetsProps> = ({ onApplyPreset }) => {
  return (
    <div className="max-w-5xl mx-auto hidden sm:block">
      <div className="flex flex-wrap gap-2 items-center">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onApplyPreset(p)}
            className="px-2.5 py-1 rounded-full border border-dna-emerald/30 text-dna-emerald hover:bg-dna-emerald hover:text-white transition-colors text-xs sm:text-sm"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export type { Preset };
export default QuickStartPresets;
