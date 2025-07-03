
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  professional_role: string | null;
  current_country: string | null;
  interests: string[] | null;
  bio: string | null;
}

interface UserProfileEditProps {
  profile: ProfileData;
  onSave: (updatedProfile: Partial<ProfileData>) => void;
  onCancel: () => void;
}

const PREDEFINED_INTERESTS = [
  'entrepreneurship', 'technology', 'healthcare', 'education', 'finance',
  'agriculture', 'renewable-energy', 'diaspora-business', 'investment-opportunities',
  'mentorship', 'networking', 'cultural-heritage', 'innovation', 'sustainability',
  'community-building', 'social-impact', 'arts-culture', 'media-communications'
];

const UserProfileEdit: React.FC<UserProfileEditProps> = ({ profile, onSave, onCancel }) => {
  const { user } = useAuth();
  const { uploadImage, uploading } = useImageUpload();
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    avatar_url: profile.avatar_url || '',
    professional_role: profile.professional_role || '',
    current_country: profile.current_country || '',
    interests: profile.interests || [],
    bio: profile.bio || ''
  });
  const [newInterest, setNewInterest] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const imageUrl = await uploadImage(file, 'profile-pictures');
      if (imageUrl) {
        setFormData(prev => ({ ...prev, avatar_url: imageUrl }));
      }
    }
  };

  const addInterest = (interest: string) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-dna-forest">Edit Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.avatar_url} alt={formData.full_name} />
                <AvatarFallback className="bg-dna-mint text-dna-forest text-2xl">
                  {formData.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={uploading}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Camera className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Change Photo'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Professional Role */}
          <div className="space-y-2">
            <Label htmlFor="professional_role">Professional Role / Title</Label>
            <Input
              id="professional_role"
              value={formData.professional_role}
              onChange={(e) => handleInputChange('professional_role', e.target.value)}
              placeholder="e.g., Software Engineer, Entrepreneur, Doctor"
            />
          </div>

          {/* Current Country */}
          <div className="space-y-2">
            <Label htmlFor="current_country">Current Country</Label>
            <Input
              id="current_country"
              value={formData.current_country}
              onChange={(e) => handleInputChange('current_country', e.target.value)}
              placeholder="Enter your current country"
            />
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label>Diaspora Interests</Label>
            <div className="space-y-3">
              {/* Selected Interests */}
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-dna-mint text-dna-forest"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add New Interest */}
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add custom interest"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest(newInterest);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addInterest(newInterest)}
                  disabled={!newInterest}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Predefined Interests */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Or choose from popular interests:</Label>
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_INTERESTS.filter(interest => !formData.interests.includes(interest)).map((interest) => (
                    <Badge
                      key={interest}
                      variant="outline"
                      className="cursor-pointer hover:bg-dna-mint hover:text-dna-forest"
                      onClick={() => addInterest(interest)}
                    >
                      + {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Your Story</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself, your journey, and what drives you..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-dna-copper hover:bg-dna-gold text-white"
              disabled={uploading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileEdit;
