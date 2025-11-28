import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Globe, MapPin, Languages } from 'lucide-react';
import { ProfileV2Data } from '@/types/profileV2';

interface ProfileV2DiasporaProps {
  profile: ProfileV2Data;
  isOwner: boolean;
  onEdit?: () => void;
}

const ProfileV2Diaspora: React.FC<ProfileV2DiasporaProps> = ({
  profile,
  isOwner,
  onEdit,
}) => {
  const hasContent = profile.country_of_origin || profile.current_country || profile.diaspora_origin;

  if (!hasContent && !isOwner) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">Diaspora Story</CardTitle>
        {isOwner && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {hasContent ? (
          <div className="space-y-3">
            {profile.country_of_origin && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">Country of Origin</div>
                  <div className="font-medium">{profile.country_of_origin}</div>
                </div>
              </div>
            )}
            {profile.current_country && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">Current Country</div>
                  <div className="font-medium">{profile.current_country}</div>
                </div>
              </div>
            )}
            {profile.diaspora_origin && (
              <div className="flex items-start gap-3">
                <Languages className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-muted-foreground">Heritage</div>
                  <div className="font-medium">{profile.diaspora_origin}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          isOwner && (
            <p className="text-muted-foreground italic text-sm">
              Share your diaspora identity to connect with others from your heritage.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2Diaspora;
