
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useJobMatching } from '@/hooks/useJobMatching';
import JobCard from '@/components/jobs/JobCard';
import JobCreationDialog from '@/components/jobs/JobCreationDialog';
import { Loader2, Target, Briefcase, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const JobsMatched = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { matchedJobs, loading, error } = useJobMatching();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const fetchAllJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleJobCreated = () => {
    fetchAllJobs();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-dna-forest mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-6">Please sign in to view your matched jobs</p>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-dna-copper" />
            <span className="ml-2 text-gray-600">Loading your matched jobs...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600">Error loading jobs: {error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-dna-copper mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-dna-forest">Job Opportunities</h1>
                <p className="text-gray-600">
                  Discover career opportunities in the diaspora network
                </p>
              </div>
            </div>
            {user && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </Button>
            )}
          </div>
        </div>

        {/* Show all jobs for now since matching is still being developed */}
        {jobsLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-dna-copper mx-auto mb-4" />
            <div className="text-gray-600">Loading job opportunities...</div>
          </div>
        ) : allJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Available</h3>
              <p className="text-gray-600 mb-4">
                Be the first to post a job opportunity for the diaspora community
              </p>
              <div className="space-x-2">
                <Button 
                  onClick={() => navigate('/profile/my')}
                  variant="outline"
                >
                  Update Profile
                </Button>
                {user && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-dna-copper hover:bg-dna-gold text-white"
                  >
                    Post a Job
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {allJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isMatched={false}
                showReferButton={true}
              />
            ))}
          </div>
        )}
        
        {/* Job Creation Dialog */}
        <JobCreationDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onJobCreated={handleJobCreated}
        />
      </div>
    </div>
  );
};

export default JobsMatched;
