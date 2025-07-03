
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';

interface JobPost {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  tags: string[];
  requirements: string;
  application_url: string;
  application_email: string;
  created_at: string;
}

export const useJobMatching = () => {
  const { user } = useAuth();
  const [matchedJobs, setMatchedJobs] = useState<JobPost[]>([]);
  const [allJobs, setAllJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Fetch all active job posts
      const { data: jobs, error: jobsError } = await supabase
        .from('job_posts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      setAllJobs(jobs || []);

      // If user is authenticated, get their profile for matching
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('interests, skills, current_country')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Simple matching logic based on interests, skills, and location
        const userTags = [
          ...(profile?.interests || []),
          ...(profile?.skills || [])
        ].map(tag => tag.toLowerCase());

        const matched = jobs?.filter(job => {
          const jobTags = job.tags?.map(tag => tag.toLowerCase()) || [];
          const hasTagMatch = jobTags.some(tag => userTags.includes(tag));
          const hasLocationMatch = profile?.current_country && 
            job.location?.toLowerCase().includes(profile.current_country.toLowerCase());
          
          return hasTagMatch || hasLocationMatch;
        }) || [];

        setMatchedJobs(matched);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  return {
    matchedJobs,
    allJobs,
    loading,
    error,
    refetch: fetchJobs,
  };
};
