
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProfileCard from './ProfileCard';
import { useNavigate } from 'react-router-dom';
import { sanitizeText } from '@/utils/securityValidation';

const MemberDirectory = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, profiles]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    if (!searchTerm) {
      setFilteredProfiles(profiles);
      return;
    }

    // Sanitize search term to prevent injection attacks
    const sanitizedSearchTerm = sanitizeText(searchTerm);

    const filtered = profiles.filter(profile => 
      profile.full_name?.toLowerCase().includes(sanitizedSearchTerm.toLowerCase()) ||
      profile.profession?.toLowerCase().includes(sanitizedSearchTerm.toLowerCase()) ||
      profile.company?.toLowerCase().includes(sanitizedSearchTerm.toLowerCase()) ||
      profile.location?.toLowerCase().includes(sanitizedSearchTerm.toLowerCase())
    );
    
    setFilteredProfiles(filtered);
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Limit search term length to prevent abuse
    if (value.length <= 100) {
      setSearchTerm(value);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by name, profession, company, or location..."
            value={searchTerm}
            onChange={handleSearchChange}
            maxLength={100}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredProfiles.length} of {profiles.length} members
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onClick={() => handleProfileClick(profile.id)}
          />
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No members found matching your search.</p>
          <p className="text-gray-400 mt-2">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default MemberDirectory;
