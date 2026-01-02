// src/pages/dna/collaborate/CollaborateDiscovery.tsx
// Discovery mode for Collaborate hub - full spaces experience

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMySpaces } from '@/hooks/useSpaces';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Sparkles } from 'lucide-react';
import { SpaceWithMembership } from '@/types/spaceTypes';
import { SuggestedSpaces } from '@/components/collaboration/SuggestedSpaces';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { TYPOGRAPHY } from '@/lib/typography.config';

export function CollaborateDiscovery() {
  const navigate = useNavigate();
  const { data: mySpaces, isLoading: mySpacesLoading } = useMySpaces();

  const renderSpaceCard = (space: SpaceWithMembership) => (
    <Card
      key={space.id}
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => navigate(`/dna/collaborate/spaces/${space.slug}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{space.name}</CardTitle>
            {space.tagline && (
              <CardDescription className="mt-1 line-clamp-2">{space.tagline}</CardDescription>
            )}
          </div>
          <Badge variant={space.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
            {space.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {space.focus_areas && space.focus_areas.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {space.focus_areas.slice(0, 3).map((area, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
              {space.focus_areas.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{space.focus_areas.length - 3}
                </Badge>
              )}
            </div>
          )}
          {space.region && (
            <p className="text-sm text-muted-foreground">{space.region}</p>
          )}
          {space.user_role && (
            <Badge variant="secondary" className="text-xs">
              {space.user_role}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 max-w-7xl space-y-6 lg:space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className={TYPOGRAPHY.h1}>COLLABORATE</h1>
          </div>
          <p className={`${TYPOGRAPHY.bodyLarge} text-muted-foreground max-w-2xl mx-auto`}>
            Turn connections and conversations into real projects. Organize collaborative workspaces where ideas become impact.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/dna/collaborate/spaces/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Space
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/dna/collaborate/spaces')}>
              <Search className="mr-2 h-4 w-4" />
              Find Spaces
            </Button>
          </div>
        </div>

        {/* Suggested Spaces */}
        <SuggestedSpaces />

        {/* My Spaces */}
        <div className="space-y-6">
          <h2 className={TYPOGRAPHY.h2}>My Spaces</h2>

          {/* Leading */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-muted-foreground">Leading</h3>
            {mySpacesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading your spaces...</div>
            ) : mySpaces?.leading && mySpaces.leading.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {mySpaces.leading.map(renderSpaceCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You're not leading any spaces yet.</p>
                  <Button size="sm" onClick={() => navigate('/dna/collaborate/spaces/new')}>
                    <Plus className="mr-2 h-3 w-3" />
                    Create your first space
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contributing */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-muted-foreground">Contributing</h3>
            {mySpacesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : mySpaces?.contributing && mySpaces.contributing.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {mySpaces.contributing.map(renderSpaceCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You're not contributing to any spaces yet.</p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/dna/collaborate/spaces')}>
                    <Search className="mr-2 h-3 w-3" />
                    Explore spaces
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default CollaborateDiscovery;
