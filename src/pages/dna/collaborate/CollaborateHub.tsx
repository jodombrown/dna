import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMySpaces, usePublicSpaces } from '@/hooks/useSpaces';
import { Link, useNavigate } from 'react-router-dom';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { Plus, Search, Calendar, Sparkles } from 'lucide-react';
import { SpaceWithMembership } from '@/types/spaceTypes';

export default function CollaborateHub() {
  const navigate = useNavigate();
  const { data: mySpaces, isLoading: mySpacesLoading } = useMySpaces();
  const { data: publicSpaces, isLoading: publicSpacesLoading } = usePublicSpaces();

  const suggestedSpaces = publicSpaces?.slice(0, 3) || [];

  const renderSpaceCard = (space: SpaceWithMembership) => (
    <Card 
      key={space.id} 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => navigate(`/dna/collaborate/spaces/${space.slug}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{space.name}</CardTitle>
            {space.tagline && (
              <CardDescription className="mt-1">{space.tagline}</CardDescription>
            )}
          </div>
          <Badge variant={space.status === 'active' ? 'default' : 'secondary'}>
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
    <FeedLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">COLLABORATE</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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

          {/* Optional: Turn event into space CTA */}
          <div className="pt-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dna/collaborate/spaces/new?from_event=true')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Turn an event into a project space
            </Button>
          </div>
        </div>

        {/* My Spaces */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">My Spaces</h2>
          
          {/* Leading */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-muted-foreground">Leading</h3>
            {mySpacesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : mySpaces?.leading && mySpaces.leading.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mySpaces.leading.map(renderSpaceCard)}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    You're not leading any spaces yet.
                  </p>
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
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : mySpaces?.contributing && mySpaces.contributing.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mySpaces.contributing.map(renderSpaceCard)}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    You're not contributing to any spaces yet.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => navigate('/dna/collaborate/spaces')}>
                    <Search className="mr-2 h-3 w-3" />
                    Explore spaces
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Suggested Spaces */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Suggested Spaces</h2>
          {publicSpacesLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : suggestedSpaces.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suggestedSpaces.map(renderSpaceCard)}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No public spaces available yet. Be the first to create one!
                </p>
              </CardContent>
            </Card>
          )}
          {suggestedSpaces.length > 0 && (
            <div className="text-center pt-2">
              <Button variant="link" asChild>
                <Link to="/dna/collaborate/spaces">View all spaces →</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </FeedLayout>
  );
}
