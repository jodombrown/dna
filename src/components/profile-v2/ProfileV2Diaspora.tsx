import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Globe, MapPin, Languages, Heart } from 'lucide-react';
import { ProfileV2Data } from '@/types/profileV2';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const hasContent = profile.country_of_origin || profile.current_country || profile.diaspora_origin || (profile.languages && profile.languages.length > 0);

  // Hide empty section for public viewers
  if (!hasContent && !isOwner) {
    return null;
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate('/app/profile/edit');
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Diaspora Story
        </CardTitle>
        {isOwner && (
          <Button variant="ghost" size="sm" onClick={handleEdit} className="h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
            <span className="sr-only">Edit diaspora story</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {hasContent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.country_of_origin && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Origin</div>
                  <div className="font-medium text-sm truncate">{profile.country_of_origin}</div>
                </div>
              </div>
            )}
            {profile.current_country && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Based in</div>
                  <div className="font-medium text-sm truncate">{profile.current_country}</div>
                </div>
              </div>
            )}
            {profile.diaspora_origin && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Heritage</div>
                  <div className="font-medium text-sm truncate">{profile.diaspora_origin}</div>
                </div>
              </div>
            )}
            {profile.languages && profile.languages.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Languages className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Languages</div>
                  <div className="font-medium text-sm truncate">{profile.languages.join(', ')}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          isOwner && (
            <button
              onClick={handleEdit}
              className="w-full text-left p-4 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors"
            >
              <p className="text-muted-foreground italic text-sm">
                🌍 Share your diaspora story to connect with others from your heritage.
              </p>
            </button>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileV2Diaspora;
