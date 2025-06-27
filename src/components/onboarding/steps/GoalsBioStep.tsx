
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface GoalsBioStepProps {
  data: any;
  updateData: (data: any) => void;
}

const GoalsBioStep: React.FC<GoalsBioStepProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-dna-forest mb-2">Tell Your Story</h3>
        <p className="text-gray-600">Help others understand who you are and what drives you</p>
      </div>

      {/* Headline */}
      <div>
        <Label htmlFor="headline">Personal Headline *</Label>
        <Input
          id="headline"
          value={data.headline}
          onChange={(e) => updateData({ headline: e.target.value })}
          placeholder="e.g., Passionate tech leader connecting diaspora entrepreneurs"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">{data.headline?.length || 0}/100 characters</p>
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">Bio *</Label>
        <Textarea
          id="bio"
          value={data.bio}
          onChange={(e) => updateData({ bio: e.target.value })}
          placeholder="Tell us about yourself, your background, and what brings you to the DNA community..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{data.bio?.length || 0}/500 characters</p>
      </div>

      {/* Personal Goals */}
      <div>
        <Label htmlFor="personal-goals">Your Goals in Joining DNA</Label>
        <Textarea
          id="personal-goals"
          value={data.personal_goals}
          onChange={(e) => updateData({ personal_goals: e.target.value })}
          placeholder="What do you hope to achieve through this network? What impact do you want to make?"
          rows={3}
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1">{data.personal_goals?.length || 0}/300 characters</p>
      </div>

      <div className="bg-dna-emerald/10 p-4 rounded-lg">
        <p className="text-sm text-dna-forest">
          <strong>Almost done!</strong> Once you complete this step, you'll be part of the DNA community and can start connecting with fellow diaspora professionals.
        </p>
      </div>
    </div>
  );
};

export default GoalsBioStep;
