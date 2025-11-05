
import React from 'react';
import ProfessionalsFilters from './ProfessionalsFilters';
import ProfessionalListItem from './ProfessionalListItem';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { MockProfessional, mockProfessionals } from './ProfessionalsMockData';

interface ProfessionalsTabProps {
  searchTerm: string;
}

const ProfessionalsTab: React.FC<ProfessionalsTabProps> = ({ searchTerm }) => {
  const { user } = useAuth();

  const { data: profiles, isLoading } = usePublicProfiles({
    limit: 50,
  });

  // Use mock data if no profiles exist, otherwise transform real profiles
  const realProfiles = profiles
    ?.filter(profile => profile.id !== user?.id)
    ?.map(profile => ({
      id: profile.id,
      name: profile.full_name || 'Unknown',
      title: profile.profession || 'Professional',
      company: profile.company || 'Independent',
      location: profile.location || 'Unknown',
      origin: profile.region || 'Unknown',
      avatar: profile.avatar_url || '',
      followers: 0,
      connections: 0,
      skills: profile.skills || [],
      bio: profile.bio || profile.headline || '',
      connectionStatus: null,
      recentActivity: 'Active on DNA',
      isOnline: false,
      mutualConnections: 0,
    } as MockProfessional));

  // Use mock data as fallback if no real profiles
  const allProfiles = (realProfiles && realProfiles.length > 0) ? realProfiles : mockProfessionals;

  // Filter by search term
  const transformedProfiles = allProfiles?.filter(profile => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      profile.name?.toLowerCase().includes(search) ||
      profile.title?.toLowerCase().includes(search) ||
      profile.bio?.toLowerCase().includes(search) ||
      profile.location?.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-dna-copper" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfessionalsFilters 
        searchTerm={searchTerm}
        professionalsCount={transformedProfiles?.length || 0}
      />

      <div className="grid gap-6">
        {transformedProfiles?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No professionals found. Try adjusting your search.
          </div>
        ) : (
          transformedProfiles?.map((professional) => (
            <ProfessionalListItem 
              key={professional.id} 
              professional={professional} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProfessionalsTab;
