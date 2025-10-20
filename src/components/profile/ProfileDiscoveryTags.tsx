import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Globe, Target } from 'lucide-react';

interface ProfileDiscoveryTagsProps {
  focusAreas?: string[];
  regionalExpertise?: string[];
  industries?: string[];
  skills?: string[];
  interests?: string[];
}

export const ProfileDiscoveryTags: React.FC<ProfileDiscoveryTagsProps> = ({
  focusAreas,
  regionalExpertise,
  industries,
  skills,
  interests
}) => {
  const hasAnyTags = 
    (focusAreas && focusAreas.length > 0) ||
    (regionalExpertise && regionalExpertise.length > 0) ||
    (industries && industries.length > 0) ||
    (skills && skills.length > 0) ||
    (interests && interests.length > 0);

  if (!hasAnyTags) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Target className="h-5 w-5 text-dna-emerald" />
        Areas of Focus & Expertise
      </h3>
      
      {focusAreas && focusAreas.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            Focus Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map(area => (
              <Badge 
                key={area} 
                className="bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20 hover:bg-dna-emerald/20"
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {regionalExpertise && regionalExpertise.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Regional Expertise
          </p>
          <div className="flex flex-wrap gap-2">
            {regionalExpertise.map(region => (
              <Badge 
                key={region} 
                className="bg-cultural-terra/10 text-cultural-terra border-cultural-terra/20 hover:bg-cultural-terra/20"
              >
                {region}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {industries && industries.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Industries
          </p>
          <div className="flex flex-wrap gap-2">
            {industries.map(industry => (
              <Badge 
                key={industry} 
                className="bg-cultural-ochre/10 text-cultural-ochre border-cultural-ochre/20 hover:bg-cultural-ochre/20"
              >
                {industry}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {skills && skills.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <Badge 
                key={skill} 
                className="bg-cultural-purple/10 text-cultural-purple border-cultural-purple/20 hover:bg-cultural-purple/20"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {interests && interests.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Interests</p>
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => (
              <Badge 
                key={interest} 
                variant="secondary"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
