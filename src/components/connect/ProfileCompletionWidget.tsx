import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfileCompletionWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile-completion', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  if (!profile) return null;

  const completion = profile.profile_completion_percentage || 0;

  // Don't show widget if 100% complete
  if (completion >= 100) return null;

  // Determine missing fields
  const missingFields: string[] = [];
  if (!profile.full_name) missingFields.push('Add your full name');
  if (!profile.headline) missingFields.push('Add a professional headline');
  if (!profile.bio || profile.bio.length < 50) missingFields.push('Write a bio (50+ characters)');
  if (!profile.location) missingFields.push('Add your location');
  if (!profile.country_of_origin) missingFields.push('Specify country of origin');
  if (!profile.profession) missingFields.push('Add your profession');
  if (!profile.company) missingFields.push('Add your company');
  if (!profile.skills || profile.skills.length < 3) missingFields.push('Add at least 3 skills');
  if (!profile.diaspora_status) missingFields.push('Select your diaspora status');
  if (!profile.intentions || profile.intentions.length === 0) missingFields.push('Select at least 1 intention');
  if (!profile.africa_focus_areas || (profile.africa_focus_areas as any[]).length === 0) missingFields.push('Add Africa focus areas');

  // Determine status
  const isUnlocked = completion >= 40;

  return (
    <Card className="border-l-4 border-l-dna-copper">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-dna-copper" />
          Complete Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>

        {/* Unlock Status */}
        <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
          isUnlocked 
            ? 'bg-dna-mint/10 text-dna-forest border border-dna-mint' 
            : 'bg-amber-500/10 text-amber-900 dark:text-amber-100 border border-amber-500/20'
        }`}>
          {isUnlocked ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">All features unlocked!</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Complete {40 - completion}% more to unlock all features</span>
            </>
          )}
        </div>

        {/* Missing Fields */}
        {missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Missing to reach 100%:
            </p>
            <ul className="text-sm space-y-1">
              {missingFields.slice(0, 3).map((field, idx) => (
                <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                  <span>•</span>
                  <span>{field}</span>
                </li>
              ))}
              {missingFields.length > 3 && (
                <li className="text-muted-foreground italic text-xs">
                  +{missingFields.length - 3} more items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <Button 
          onClick={() => navigate('/app/profile/edit')}
          className="w-full"
          variant="default"
        >
          Complete Profile →
        </Button>
      </CardContent>
    </Card>
  );
};
