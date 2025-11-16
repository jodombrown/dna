import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMySpaces } from '@/hooks/useSpaces';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Space } from '@/types/spaceTypes';
import { formatDistanceToNow } from 'date-fns';

export default function MySpaces() {
  const { data, isLoading } = useMySpaces();

  if (isLoading) {
    return (
      <LayoutController
        leftColumn={<LeftNav />}
        centerColumn={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
        rightColumn={<RightWidgets />}
      />
    );
  }

  const leading = data?.leading || [];
  const contributing = data?.contributing || [];

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold">My Spaces</h1>
            <p className="text-muted-foreground mt-2">
              Manage your collaboration spaces and contributions
            </p>
          </div>

          <Tabs defaultValue="leading" className="w-full">
            <TabsList>
              <TabsTrigger value="leading">
                Leading ({leading.length})
              </TabsTrigger>
              <TabsTrigger value="contributing">
                Contributing ({contributing.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leading" className="mt-6">
              {leading.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">You're not leading any spaces yet</p>
                    <Link 
                      to="/dna/collaborate/spaces/new" 
                      className="text-primary hover:underline mt-2 inline-block"
                    >
                      Create your first space →
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leading.map((space) => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="contributing" className="mt-6">
              {contributing.length === 0 ? (
                <Card>
                  <CardContent className="pt-12 pb-12 text-center">
                    <p className="text-muted-foreground">You're not contributing to any spaces yet</p>
                    <Link 
                      to="/dna/collaborate/spaces" 
                      className="text-primary hover:underline mt-2 inline-block"
                    >
                      Find spaces to join →
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contributing.map((space) => (
                    <SpaceCard key={space.id} space={space} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      }
      rightColumn={<RightWidgets />}
    />
  );
}

function SpaceCard({ space }: { space: Space & { user_role?: string } }) {
  return (
    <Link to={`/dna/collaborate/spaces/${space.slug}`}>
      <Card className="hover:shadow-lg transition-shadow h-full">
        <CardContent className="pt-6 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">{space.name}</h3>
              <Badge variant={space.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
                {space.status}
              </Badge>
            </div>
            {space.tagline && (
              <p className="text-sm text-muted-foreground line-clamp-2">{space.tagline}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize text-xs">
              {space.space_type.replace('_', ' ')}
            </Badge>
            {space.user_role && (
              <Badge variant="secondary" className="capitalize text-xs">
                {space.user_role}
              </Badge>
            )}
          </div>

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

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            {space.region && <span>📍 {space.region}</span>}
            <span>Updated {formatDistanceToNow(new Date(space.updated_at), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
