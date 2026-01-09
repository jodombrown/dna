import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Users, 
  Target, 
  Filter,
  GraduationCap,
  TrendingUp,
  Calendar,
  BookOpen,
  Megaphone,
  Loader2
} from 'lucide-react';
import { usePublicSpaces } from '@/hooks/useSpaces';
import { SpaceCreationWizard } from './SpaceCreationWizard';
import type { TemplateCategory } from '@/types/collaborate';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const CATEGORY_OPTIONS: { value: TemplateCategory | 'all'; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Categories', icon: Filter },
  { value: 'learning', label: 'Learning', icon: BookOpen },
  { value: 'investment', label: 'Investment', icon: TrendingUp },
  { value: 'community', label: 'Community', icon: Calendar },
  { value: 'advocacy', label: 'Advocacy', icon: Megaphone },
  { value: 'professional', label: 'Professional', icon: GraduationCap },
];

const SPACE_TYPE_ICONS: Record<string, React.ElementType> = {
  'project': Target,
  'working_group': Users,
  'initiative': TrendingUp,
  'program': BookOpen,
};

export function SpaceDirectory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const { data: spaces, isLoading } = usePublicSpaces();

  // Filter spaces by search query
  const filteredSpaces = spaces?.filter(space => 
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Space Directory</h1>
          <p className="text-muted-foreground mt-1">
            Discover collaboration spaces and join initiatives
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateWizard(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Space
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search spaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as TemplateCategory | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Space Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredSpaces && filteredSpaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpaces.map((space) => {
            const Icon = SPACE_TYPE_ICONS[space.space_type] || Users;
            
            return (
              <button
                key={space.id}
                onClick={() => navigate(`/dna/collaborate/spaces/${space.slug}`)}
                className="p-4 bg-card rounded-lg border hover:border-primary hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{space.name}</h3>
                    {space.tagline && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {space.tagline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                  {space.region && (
                    <span className="flex items-center gap-1">
                      📍 {space.region}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {space.focus_areas && space.focus_areas.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {space.focus_areas[0]}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs capitalize">
                    {space.space_type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {space.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-foreground">No spaces found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a collaboration space'
            }
          </p>
          <Button 
            onClick={() => setShowCreateWizard(true)}
            className="mt-4 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Space
          </Button>
        </div>
      )}

      <SpaceCreationWizard
        open={showCreateWizard}
        onOpenChange={setShowCreateWizard}
      />
    </div>
  );
}
