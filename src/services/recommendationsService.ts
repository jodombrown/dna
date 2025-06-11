
import { supabase } from '@/integrations/supabase/client';

export interface RecommendationProfile {
  id: string;
  full_name: string;
  profession?: string;
  company?: string;
  location?: string;
  country_of_origin?: string;
  skills?: string[];
  avatar_url?: string;
  bio?: string;
  similarity_score: number;
  connection_reason: string;
}

export const getProfileRecommendations = async (userId: string, limit: number = 10): Promise<RecommendationProfile[]> => {
  try {
    // Get current user's profile
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !currentUser) {
      console.error('Error fetching current user:', userError);
      return [];
    }

    // Get all public profiles except current user and already connected users
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .neq('id', userId);

    if (profilesError || !allProfiles) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Get existing connections to exclude them
    const { data: connections } = await supabase
      .from('connections')
      .select('recipient_id, requester_id')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    const connectedUserIds = new Set(
      connections?.flatMap(conn => [conn.recipient_id, conn.requester_id]) || []
    );

    // Filter out connected users
    const availableProfiles = allProfiles.filter(profile => 
      !connectedUserIds.has(profile.id) && profile.full_name
    );

    // Calculate similarity scores and reasons
    const recommendations = availableProfiles.map(profile => {
      let score = 0;
      const reasons: string[] = [];

      // Country of origin match (highest weight)
      if (profile.country_of_origin === currentUser.country_of_origin && profile.country_of_origin) {
        score += 40;
        reasons.push(`Both from ${profile.country_of_origin}`);
      }

      // Current location match
      if (profile.location === currentUser.location && profile.location) {
        score += 30;
        reasons.push(`Both in ${profile.location}`);
      }

      // Profession similarity
      if (profile.profession === currentUser.profession && profile.profession) {
        score += 25;
        reasons.push(`Both work in ${profile.profession}`);
      }

      // Company match
      if (profile.company === currentUser.company && profile.company) {
        score += 20;
        reasons.push(`Both work at ${profile.company}`);
      }

      // Skills overlap
      const userSkills = currentUser.skills || [];
      const profileSkills = profile.skills || [];
      const sharedSkills = userSkills.filter(skill => profileSkills.includes(skill));
      
      if (sharedSkills.length > 0) {
        score += sharedSkills.length * 5;
        if (sharedSkills.length === 1) {
          reasons.push(`Shared expertise in ${sharedSkills[0]}`);
        } else if (sharedSkills.length <= 3) {
          reasons.push(`Shared expertise in ${sharedSkills.join(', ')}`);
        } else {
          reasons.push(`${sharedSkills.length} shared skills`);
        }
      }

      // Professional sectors overlap
      const userSectors = currentUser.professional_sectors || [];
      const profileSectors = profile.professional_sectors || [];
      const sharedSectors = userSectors.filter(sector => profileSectors.includes(sector));
      
      if (sharedSectors.length > 0) {
        score += sharedSectors.length * 8;
        reasons.push(`Both work in ${sharedSectors.join(', ')}`);
      }

      // Mentorship connection
      if (profile.availability_for_mentoring && currentUser.looking_for_opportunities) {
        score += 15;
        reasons.push('Available for mentorship');
      }

      // Language similarity
      if (profile.languages && currentUser.languages) {
        const userLangs = currentUser.languages.toLowerCase().split(',').map((l: string) => l.trim());
        const profileLangs = profile.languages.toLowerCase().split(',').map((l: string) => l.trim());
        const sharedLangs = userLangs.filter(lang => profileLangs.includes(lang));
        
        if (sharedLangs.length > 0) {
          score += sharedLangs.length * 3;
          reasons.push(`Speak ${sharedLangs.join(', ')}`);
        }
      }

      // Default reason if no specific matches
      if (reasons.length === 0) {
        reasons.push('Member of African diaspora community');
        score += 1;
      }

      return {
        id: profile.id,
        full_name: profile.full_name,
        profession: profile.profession,
        company: profile.company,
        location: profile.location,
        country_of_origin: profile.country_of_origin,
        skills: profile.skills,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        similarity_score: score,
        connection_reason: reasons[0] // Use the most relevant reason
      };
    });

    // Sort by similarity score and return top recommendations
    return recommendations
      .filter(rec => rec.similarity_score > 0)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

export const searchProfilesByRelevance = async (
  searchTerm: string, 
  userProfile: any,
  filters: any = {}
): Promise<RecommendationProfile[]> => {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_public', true)
      .neq('id', userProfile.id);

    // Apply search term
    if (searchTerm) {
      query = query.or(
        `full_name.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`
      );
    }

    // Apply filters
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.profession) {
      query = query.eq('profession', filters.profession);
    }

    if (filters.country_of_origin) {
      query = query.eq('country_of_origin', filters.country_of_origin);
    }

    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills);
    }

    const { data: profiles, error } = await query.order('created_at', { ascending: false });

    if (error || !profiles) {
      console.error('Error searching profiles:', error);
      return [];
    }

    // Calculate relevance scores for search results
    const scoredResults = profiles.map(profile => {
      let score = 0;
      const reasons: string[] = [];

      // Exact search term matches get higher scores
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (profile.full_name?.toLowerCase().includes(term)) score += 20;
        if (profile.profession?.toLowerCase().includes(term)) score += 15;
        if (profile.company?.toLowerCase().includes(term)) score += 10;
        if (profile.bio?.toLowerCase().includes(term)) score += 5;
      }

      // Add cultural/professional relevance
      if (profile.country_of_origin === userProfile.country_of_origin && profile.country_of_origin) {
        score += 10;
        reasons.push(`Both from ${profile.country_of_origin}`);
      }

      if (profile.profession === userProfile.profession && profile.profession) {
        score += 8;
        reasons.push(`Both in ${profile.profession}`);
      }

      if (reasons.length === 0) {
        reasons.push('Search result');
      }

      return {
        id: profile.id,
        full_name: profile.full_name,
        profession: profile.profession,
        company: profile.company,
        location: profile.location,
        country_of_origin: profile.country_of_origin,
        skills: profile.skills,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        similarity_score: score,
        connection_reason: reasons[0]
      };
    });

    return scoredResults.sort((a, b) => b.similarity_score - a.similarity_score);

  } catch (error) {
    console.error('Error in relevance search:', error);
    return [];
  }
};
