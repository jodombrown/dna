
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';

interface MentorshipSectionProps {
  formData: {
    availability_for_mentoring: boolean;
    looking_for_opportunities: boolean;
    is_public: boolean;
  };
  mentorshipAreas: string[];
  newMentorshipArea: string;
  onInputChange: (field: string, value: boolean) => void;
  onMentorshipAreaChange: (value: string) => void;
  onAddMentorshipArea: () => void;
  onRemoveMentorshipArea: (area: string) => void;
}

const MentorshipSection: React.FC<MentorshipSectionProps> = ({
  formData,
  mentorshipAreas,
  newMentorshipArea,
  onInputChange,
  onMentorshipAreaChange,
  onAddMentorshipArea,
  onRemoveMentorshipArea,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Mentorship & Opportunities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Mentorship Areas</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newMentorshipArea}
              onChange={(e) => onMentorshipAreaChange(e.target.value)}
              placeholder="Career development, entrepreneurship, cultural adaptation..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddMentorshipArea())}
            />
            <Button type="button" onClick={onAddMentorshipArea} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {mentorshipAreas.map((area, index) => (
              <Badge key={index} variant="outline" className="text-dna-crimson border-dna-crimson">
                {area}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => onRemoveMentorshipArea(area)}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Available for Mentoring</Label>
            <p className="text-sm text-gray-600">Let other diaspora members know you're available to mentor</p>
          </div>
          <Switch
            checked={formData.availability_for_mentoring}
            onCheckedChange={(checked) => onInputChange('availability_for_mentoring', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Looking for Opportunities</Label>
            <p className="text-sm text-gray-600">Show that you're open to new opportunities</p>
          </div>
          <Switch
            checked={formData.looking_for_opportunities}
            onCheckedChange={(checked) => onInputChange('looking_for_opportunities', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Public Profile</Label>
            <p className="text-sm text-gray-600">Make your profile visible to other diaspora members</p>
          </div>
          <Switch
            checked={formData.is_public}
            onCheckedChange={(checked) => onInputChange('is_public', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorshipSection;
