import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Clock } from 'lucide-react';
import { ProfileV2VerificationMeta, VerificationStatus } from '@/types/profileV2';

interface ProfileV2VerificationProps {
  verificationMeta: ProfileV2VerificationMeta;
}

const getVerificationConfig = (tier: string | undefined) => {
  switch (tier) {
    case 'fully_verified':
    case 'full':
      return {
        icon: Award,
        label: 'Fully Verified',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        description: 'Confirmed diaspora identity with full platform access',
      };
    case 'soft_verified':
    case 'soft':
      return {
        icon: Shield,
        label: 'Soft Verified',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        description: 'Trusted DNA member with verified email and profile',
      };
    default:
      return {
        icon: Clock,
        label: 'Pending Verification',
        color: 'text-muted-foreground',
        bgColor: 'bg-secondary',
        description: 'Complete your profile to unlock verification',
      };
  }
};

const ProfileV2Verification: React.FC<ProfileV2VerificationProps> = ({
  verificationMeta,
}) => {
  const config = getVerificationConfig(verificationMeta.tier || verificationMeta.status);
  const IconComponent = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <IconComponent className={`w-5 h-5 ${config.color}`} />
          Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bgColor}`}>
          <IconComponent className={`w-6 h-6 ${config.color}`} />
          <div className="flex-1">
            <Badge variant="secondary" className="mb-1">
              {config.label}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>

        {verificationMeta.improvement_suggestions && verificationMeta.improvement_suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">To improve verification:</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {verificationMeta.improvement_suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {verificationMeta.updated_at && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(verificationMeta.updated_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2Verification;
