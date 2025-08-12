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

const presets: Preset[] = [
  { label: 'FinTech in Lagos', searchTerm: 'fintech', tab: 'professionals', filters: { location: 'Lagos' } },
  { label: 'Climate in Nairobi', searchTerm: 'climate', tab: 'communities', filters: { location: 'Nairobi' } },
  { label: 'AI in Accra', searchTerm: 'AI', tab: 'events', filters: { location: 'Accra' } },
  { label: 'Diaspora founders • London', searchTerm: 'founder', tab: 'professionals', filters: { location: 'London' } },
  { label: 'Mentors • Toronto', searchTerm: '', tab: 'professionals', filters: { location: 'Toronto', isMentor: true } },
  { label: 'Investors • Nairobi', searchTerm: '', tab: 'professionals', filters: { location: 'Nairobi', isInvestor: true } },
  { label: 'Remote opportunities', searchTerm: 'remote', tab: 'professionals', filters: { lookingForOpportunities: true } },
  { label: 'Francophone tech • Dakar', searchTerm: 'tech', tab: 'communities', filters: { location: 'Dakar' } },
];

const QuickStartPresets: React.FC<QuickStartPresetsProps> = ({ onApplyPreset }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onApplyPreset(p)}
            className="px-3 py-1.5 rounded-full border border-dna-emerald/30 text-dna-emerald hover:bg-dna-emerald hover:text-white transition-colors text-sm"
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
