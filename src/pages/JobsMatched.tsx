
import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useJobMatching } from '@/hooks/useJobMatching';
import JobCard from '@/components/jobs/JobCard';
import { Loader2, Target, Briefcase } from 'lucide-react';

const JobsMatched = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { matchedJobs, loading, error } = useJobMatching();

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
          <div className="flex items-center mb-4">
            <Target className="h-8 w-8 text-dna-copper mr-3" />
            <h1 className="text-3xl font-bold text-dna-forest">
              Your Matched Jobs
            </h1>
          </div>
          <p className="text-gray-600">
            Jobs that match your skills, interests, and location preferences
          </p>
        </div>

        {matchedJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matched Jobs Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete your profile with skills and interests to get better job matches
              </p>
              <Button 
                onClick={() => navigate('/profile/my')}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {matchedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isMatched={true}
                showReferButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsMatched;
