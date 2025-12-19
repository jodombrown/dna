import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImpactProfileLink } from '@/components/profile/ImpactProfileLink';
import { Users } from 'lucide-react';

// Demo component showing how to use Impact Profile links
export const ImpactProfileDemo = () => {
  // Mock data for demonstration
  const sampleProfiles = [
    {
      username: 'kwame-asante',
      fullName: 'Kwame Asante',
      influenceScore: 1250,
      isVerified: true,
    },
    {
      username: 'amara-okonkwo',
      fullName: 'Amara Okonkwo',
      influenceScore: 750,
      isVerified: true,
    },
    {
      username: 'chinwe-okoro',
      fullName: 'Chinwe Okoro',
      influenceScore: 450,
      isVerified: false,
    },
    {
      username: 'grace-mwangi',
      fullName: 'Dr. Grace Mwangi',
      influenceScore: 180,
      isVerified: true,
    },
    {
      username: 'ahmed-hassan',
      fullName: 'Ahmed Hassan',
      influenceScore: 95,
      isVerified: false,
    },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-dna-emerald" />
          <span>Featured Impact Profiles</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sampleProfiles.map((profile) => (
            <ImpactProfileLink
              key={profile.username}
              username={profile.username}
              fullName={profile.fullName}
              influenceScore={profile.influenceScore}
              isVerified={profile.isVerified}
              showActions={true}
            />
          ))}
        </div>
        <div className="mt-4 p-3 bg-dna-mint/10 rounded-lg">
          <p className="text-sm text-dna-forest">
            <strong>Note:</strong> These are demo profiles. In production, these would link to actual user impact profiles with real data from the ADIN system.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};