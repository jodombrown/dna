import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function useLiveCollaborations() {
  const [data, setData] = useState({
    items: [],
    recommended_people: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCollaborations = async () => {
      setIsLoading(true);
      try {
        // Load opportunities/projects
        const { data: opportunities, error: oppsError } = await supabase
          .from('opportunities')
          .select(`
            id,
            title,
            description,
            tags,
            profiles:created_by (
              full_name,
              username
            )
          `)
          .limit(10);

        if (oppsError) throw oppsError;

        // Load recommended people (simplified - you might want to implement proper matching logic)
        const { data: people, error: peopleError } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, headline, skills')
          .limit(6);

        if (peopleError) throw peopleError;

        setData({
          items: (opportunities || []).map(opp => ({
            id: opp.id,
            title: opp.title,
            name: opp.title,
            owner_name: (opp.profiles as any)?.full_name || (opp.profiles as any)?.username || 'Unknown',
            organization: (opp.profiles as any)?.full_name || (opp.profiles as any)?.username || 'Unknown',
            tags: opp.tags || [],
            sectors: opp.tags || []
          })),
          recommended_people: (people || []).map(person => ({
            id: person.id,
            full_name: person.full_name,
            username: person.username,
            title: person.headline,
            headline: person.headline,
            avatar_url: person.avatar_url,
            skills: person.skills || [],
            tags: person.skills || []
          }))
        });
      } catch (error) {
        console.error('Error loading collaborations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollaborations();
  }, []);

  return {
    ...data,
    data,
    isLoading
  };
}