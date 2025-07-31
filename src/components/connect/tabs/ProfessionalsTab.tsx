
import React from 'react';
import ProfessionalsFilters from './ProfessionalsFilters';
import ProfessionalListItem from './ProfessionalListItem';
import { useProfiles } from '@/hooks/useProfiles';
import { Loader2 } from 'lucide-react';

interface ProfessionalsTabProps {
  searchTerm: string;
}

const ProfessionalsTab: React.FC<ProfessionalsTabProps> = ({ searchTerm }) => {
  const { data: professionals = [], isLoading, error } = useProfiles({
    limit: 50
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-dna-forest" />
        <span className="ml-2 text-gray-600">Loading professionals...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading professionals. Please try again.</p>
      </div>
    );
  }

  const filteredProfessionals = professionals.filter(professional => 
    !searchTerm || 
    professional.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ProfessionalsFilters 
        searchTerm={searchTerm}
        professionalsCount={filteredProfessionals.length}
      />

      <div className="grid gap-6">
        {filteredProfessionals.map((professional) => (
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
