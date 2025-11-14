import { FeedLayout } from '@/components/layout/FeedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePublicSpaces } from '@/hooks/useSpaces';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { Space } from '@/types/spaceTypes';

export default function SpacesIndex() {
  const navigate = useNavigate();
  const { data: spaces, isLoading } = usePublicSpaces();

  const renderSpaceCard = (space: Space) => (
    <Card 
      key={space.id} 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => navigate(`/dna/collaborate/spaces/${space.slug}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
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
        <div className="space-y-3">
          {space.focus_areas && space.focus_areas.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {space.focus_areas.map((area, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          )}
          {space.region && (
            <p className="text-sm text-muted-foreground">📍 {space.region}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs capitalize">
              {space.space_type.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <FeedLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Spaces</h1>
            <p className="text-muted-foreground mt-1">
              Explore collaborative workspaces and join projects
            </p>
          </div>
          <Button onClick={() => navigate('/dna/collaborate/spaces/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Space
          </Button>
        </div>

        {/* Spaces Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : spaces && spaces.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spaces.map(renderSpaceCard)}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">
                No public spaces yet. Be the first to create one!
              </p>
              <Button onClick={() => navigate('/dna/collaborate/spaces/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Space
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </FeedLayout>
  );
}
