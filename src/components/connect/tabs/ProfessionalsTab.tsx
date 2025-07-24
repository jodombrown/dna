
import React from 'react';
import ProfessionalsFilters from './ProfessionalsFilters';
import ProfessionalListItem from './ProfessionalListItem';
import { demoProfessionals } from '@/data/demoSearchData';

interface ProfessionalsTabProps {
  searchTerm: string;
}

const ProfessionalsTab: React.FC<ProfessionalsTabProps> = ({ searchTerm }) => {
  return (
    <div className="space-y-6">
      <ProfessionalsFilters 
        searchTerm={searchTerm}
        professionalsCount={demoProfessionals.length}
      />

      <div className="grid gap-6">
        {demoProfessionals.map((professional) => (
          <ProfessionalListItem 
            key={professional.id} 
            professional={professional} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProfessionalsTab;
