import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoalsBioStepProps {
  data: any;
  updateData: (data: any) => void;
}

const GoalsBioStep: React.FC<GoalsBioStepProps> = ({ data, updateData }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage and get URL
      const url = URL.createObjectURL(file);
      updateData({ avatar_url: url });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-dna-forest mb-2">Connect Your Identity</h3>
        <p className="text-gray-600">Link your professional presence and upload your photo</p>
      </div>

      {/* LinkedIn URL */}
      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
        <Input
          id="linkedin_url"
          type="url"
          value={data.linkedin_url || ''}
          onChange={(e) => updateData({ linkedin_url: e.target.value })}
          placeholder="https://linkedin.com/in/yourprofile"
          className="w-full"
        />
      </div>

      {/* Twitter URL */}
      <div className="space-y-2">
        <Label htmlFor="twitter_url">Twitter Profile</Label>
        <Input
          id="twitter_url"
          type="url"
          value={data.twitter_url || ''}
          onChange={(e) => updateData({ twitter_url: e.target.value })}
          placeholder="https://twitter.com/yourusername"
          className="w-full"
        />
      </div>

      {/* Website URL */}
      <div className="space-y-2">
        <Label htmlFor="website_url">Personal Website</Label>
        <Input
          id="website_url"
          type="url"
          value={data.website_url || ''}
          onChange={(e) => updateData({ website_url: e.target.value })}
          placeholder="https://yourwebsite.com"
          className="w-full"
        />
      </div>

      {/* Profile Image */}
      <div className="space-y-3">
        <Label>Profile Image</Label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {data.avatar_url ? (
              <img src={data.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 text-sm">No image</div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="avatar-upload"
            />
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="px-4 py-2 bg-dna-mint text-dna-forest rounded-lg hover:bg-dna-mint/80 transition-colors">
                Upload Photo
              </div>
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsBioStep;