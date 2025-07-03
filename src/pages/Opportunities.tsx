
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useJobMatching } from '@/hooks/useJobMatching';
import JobCard from '@/components/jobs/JobCard';
import { Search, Briefcase, Users, Target } from 'lucide-react';

const Opportunities = () => {
  const navigate = useNavigate();
  const { allJobs, matchedJobs, loading, error } = useJobMatching();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || job.job_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const jobTypes = [...new Set(allJobs.map(job => job.job_type))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="text-lg">Loading opportunities...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-dna-copper mr-3" />
              <h1 className="text-3xl font-bold text-dna-forest">
                Opportunities
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/jobs/matched')}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                <Target className="w-4 h-4 mr-2" />
                View Matched Jobs ({matchedJobs.length})
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            Discover career, investment, and volunteer opportunities across the African diaspora
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs by title, company, location, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={`cursor-pointer ${
                    selectedType === 'all' 
                      ? 'bg-dna-copper text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectedType('all')}
                >
                  All ({allJobs.length})
                </Badge>
                {jobTypes.map(type => (
                  <Badge
                    key={type}
                    className={`cursor-pointer ${
                      selectedType === type 
                        ? 'bg-dna-copper text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type} ({allJobs.filter(job => job.job_type === type).length})
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600">Error loading opportunities: {error}</p>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Opportunities Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new opportunities'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => {
              const isMatched = matchedJobs.some(matched => matched.id === job.id);
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  isMatched={isMatched}
                  showReferButton={true}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
