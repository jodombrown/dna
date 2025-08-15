import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ChevronRight, Target, Users, Lightbulb, Link, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NudgeItem {
  id: string;
  title: string;
  description: string;
  category: 'profile' | 'connect' | 'contribute' | 'settings';
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  action: () => void;
  dismissible: boolean;
}

const DashboardNudges: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [dismissedNudges, setDismissedNudges] = useState<string[]>([]);

  const dismissNudge = (nudgeId: string) => {
    setDismissedNudges(prev => [...prev, nudgeId]);
  };

  const nudges: NudgeItem[] = [
    {
      id: 'complete-bio',
      title: 'Add your professional bio',
      description: 'Share your story and what you\'re passionate about to help others connect with you.',
      category: 'profile',
      priority: 'high',
      icon: <Settings className="w-4 h-4" />,
      action: () => navigate('/settings/profile'),
      dismissible: true
    },
    {
      id: 'select-pillars',
      title: 'Customize Your DNA Experience',
      description: 'Select the areas where you want to make an impact: Connect, Collaborate, or Contribute.',
      category: 'profile',
      priority: 'high',
      icon: <Target className="w-4 h-4" />,
      action: () => navigate('/settings/dna-experience'),
      dismissible: true
    },
    {
      id: 'add-skills',
      title: 'Showcase your expertise',
      description: 'Add your professional skills to help others find you for collaboration opportunities.',
      category: 'profile',
      priority: 'medium',
      icon: <Lightbulb className="w-4 h-4" />,
      action: () => navigate('/settings/experience'),
      dismissible: true
    },
    {
      id: 'connect-social',
      title: 'Link your social profiles',
      description: 'Connect your LinkedIn, Twitter, and website to make it easier for people to learn about you.',
      category: 'profile',
      priority: 'medium',
      icon: <Link className="w-4 h-4" />,
      action: () => navigate('/settings/links'),
      dismissible: true
    },
    // Temporarily disabled until platform goes live
    // {
    //   id: 'find-connections',
    //   title: 'Discover your network',
    //   description: 'Browse DNA members who share your interests and professional background.',
    //   category: 'connect',
    //   priority: 'medium',
    //   icon: <Users className="w-4 h-4" />,
    //   action: () => navigate('/app/connect'),
    //   dismissible: true
    // }
  ];

  // Filter based on profile completeness and dismissed nudges
  const activeNudges = nudges.filter(nudge => {
    if (dismissedNudges.includes(nudge.id)) return false;
    
    // Check if nudge is relevant based on profile state
    switch (nudge.id) {
      case 'complete-bio':
        return !profile?.bio || profile.bio.length < 50;
      case 'select-pillars':
        return !profile?.selected_pillars || profile.selected_pillars.length === 0;
      case 'add-skills':
        return !profile?.skills || profile.skills.length < 3;
      case 'connect-social':
        return !profile?.linkedin_url && !profile?.website_url;
      case 'find-connections':
        return true; // Always show for engagement
      default:
        return true;
    }
  });

  if (activeNudges.length === 0) return null;

  const completionPercentage = Math.round(
    ((5 - activeNudges.length) / 5) * 100
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-dna-forest">Complete Your DNA Journey</CardTitle>
          <Badge variant="outline">{completionPercentage}% Complete</Badge>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {activeNudges.slice(0, 3).map((nudge) => (
          <div
            key={nudge.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                {nudge.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm text-foreground">{nudge.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{nudge.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={nudge.action}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
              {nudge.dismissible && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissNudge(nudge.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {activeNudges.length > 3 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              +{activeNudges.length - 3} more suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardNudges;