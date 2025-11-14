import { FeedLayout } from '@/components/layout/FeedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'react-router-dom';
import { useSpaceBySlug } from '@/hooks/useSpaces';
import { Loader2 } from 'lucide-react';

export default function SpaceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: space, isLoading } = useSpaceBySlug(slug || '');

  if (isLoading) {
    return (
      <FeedLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </FeedLayout>
    );
  }

  if (!space) {
    return (
      <FeedLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground">Space not found</p>
            </CardContent>
          </Card>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{space.name}</h1>
              {space.tagline && (
                <p className="text-xl text-muted-foreground mt-2">{space.tagline}</p>
              )}
            </div>
            <Badge variant={space.status === 'active' ? 'default' : 'secondary'} className="text-sm">
              {space.status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {space.space_type.replace('_', ' ')}
            </Badge>
            {space.visibility === 'invite_only' && (
              <Badge variant="outline">Invite Only</Badge>
            )}
            {space.region && (
              <Badge variant="outline">📍 {space.region}</Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {space.description && (
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{space.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Focus Areas */}
        {space.focus_areas && space.focus_areas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Focus Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {space.focus_areas.map((area, idx) => (
                  <Badge key={idx} variant="outline">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder for future sections */}
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-sm text-muted-foreground">
              Full space details, tasks, and collaboration tools coming in M2
            </p>
          </CardContent>
        </Card>
      </div>
    </FeedLayout>
  );
}
