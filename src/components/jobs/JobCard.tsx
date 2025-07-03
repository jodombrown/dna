
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Building, ExternalLink, Users } from 'lucide-react';
import { format } from 'date-fns';
import ReferralDialog from './ReferralDialog';

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

interface JobCardProps {
  job: JobPost;
  isMatched?: boolean;
  showReferButton?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, isMatched = false, showReferButton = true }) => {
  const [showReferralDialog, setShowReferralDialog] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return 'bg-dna-copper text-white';
      case 'part-time': return 'bg-dna-gold text-white';
      case 'contract': return 'bg-dna-emerald text-white';
      case 'internship': return 'bg-purple-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const handleApply = () => {
    if (job.application_url) {
      window.open(job.application_url, '_blank');
    } else if (job.application_email) {
      window.open(`mailto:${job.application_email}`, '_blank');
    }
  };

  return (
    <>
      <Card className={`hover:shadow-lg transition-shadow ${isMatched ? 'ring-2 ring-dna-copper' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl text-dna-forest mb-2">
                {job.title}
                {isMatched && <Badge className="ml-2 bg-dna-copper text-white">Matched</Badge>}
              </CardTitle>
              <CardDescription className="flex items-center space-x-4 text-base">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  {job.company}
                </div>
                {job.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(job.created_at), 'MMM dd, yyyy')}
                </div>
              </CardDescription>
            </div>
            <Badge className={getTypeColor(job.job_type)}>
              {job.job_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
          
          {job.salary_range && (
            <p className="text-sm text-gray-600 mb-3">
              <strong>Salary:</strong> {job.salary_range}
            </p>
          )}
          
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-dna-forest border-dna-forest">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(job.application_url || job.application_email) && (
                <Button 
                  onClick={handleApply}
                  className="bg-dna-copper hover:bg-dna-gold text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
              )}
              {showReferButton && (
                <Button 
                  variant="outline"
                  onClick={() => setShowReferralDialog(true)}
                  className="border-dna-forest text-dna-forest hover:bg-dna-forest hover:text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Refer Someone
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ReferralDialog
        isOpen={showReferralDialog}
        onClose={() => setShowReferralDialog(false)}
        jobId={job.id}
        jobTitle={job.title}
        company={job.company}
      />
    </>
  );
};

export default JobCard;
