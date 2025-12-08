import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Clock, CheckCircle2 } from 'lucide-react';
import { ProfileV2VerificationMeta } from '@/types/profileV2';

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
        borderColor: 'border-primary/20',
        description: 'Confirmed diaspora identity with full platform access',
      };
    case 'soft_verified':
    case 'soft':
      return {
        icon: Shield,
        label: 'Verified Member',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        description: 'Trusted DNA member with verified email and profile',
      };
    default:
      return {
        icon: Clock,
        label: 'Pending',
        color: 'text-muted-foreground',
        bgColor: 'bg-secondary',
        borderColor: 'border-secondary',
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
          <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <IconComponent className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant="secondary" className={`mb-1 text-xs ${config.color}`}>
              {config.label}
            </Badge>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {verificationMeta.improvement_suggestions && verificationMeta.improvement_suggestions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Steps to verify:</p>
            <ul className="space-y-2">
              {verificationMeta.improvement_suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {verificationMeta.updated_at && (
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Last updated: {new Date(verificationMeta.updated_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2Verification;
