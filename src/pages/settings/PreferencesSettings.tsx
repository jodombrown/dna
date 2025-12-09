import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useDashboardPreferences, DashboardModule } from '@/hooks/useDashboardPreferences';
import { LayoutGrid, RotateCcw, Sparkles } from 'lucide-react';
import SettingsLayout from './SettingsLayout';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const MODULE_LABELS: Record<string, { label: string; description: string }> = {
  upcoming_events: { label: 'Upcoming Events', description: 'Events you might be interested in' },
  recommended_spaces: { label: 'Recommended Spaces', description: 'Projects and communities for you' },
  open_needs: { label: 'Open Needs', description: 'Ways you can contribute' },
  suggested_people: { label: 'Suggested People', description: 'People to connect with' },
  recent_stories: { label: 'Recent Stories', description: 'Latest updates from the network' },
  resume_section: { label: 'Resume Your Work', description: 'Quick access to your last activity' },
};

export default function PreferencesSettings() {
  const { toast } = useToast();
  const { preferences, updatePreferences, isLoading, isUpdating } = useDashboardPreferences();
  
  const [localDensity, setLocalDensity] = useState<'standard' | 'compact'>('standard');
  const [localModules, setLocalModules] = useState<DashboardModule[]>([]);

  useEffect(() => {
    if (preferences) {
      setLocalDensity(preferences.density);
      setLocalModules(preferences.visible_modules);
    }
  }, [preferences]);

  const handleDensityChange = (density: 'standard' | 'compact') => {
    setLocalDensity(density);
    updatePreferences({ density, visible_modules: localModules });
  };

  const handleModuleToggle = (module: DashboardModule) => {
    if (module === 'resume_section') return; // System module
    
    const newModules = localModules.includes(module)
      ? localModules.filter(m => m !== module)
      : [...localModules, module];
    
    setLocalModules(newModules);
    updatePreferences({ density: localDensity, visible_modules: newModules });
  };

  const handleReset = () => {
    const defaultModules: DashboardModule[] = ['resume_section', 'upcoming_events', 'recommended_spaces', 'suggested_people', 'recent_stories', 'open_needs'];
    setLocalDensity('standard');
    setLocalModules(defaultModules);
    updatePreferences({ density: 'standard', visible_modules: defaultModules });
    toast({
      title: 'Preferences reset',
      description: 'Your display preferences have been reset to defaults.',
    });
  };

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Display & Preferences</h2>
          <p className="text-muted-foreground mt-1">Customize your DNA experience</p>
        </div>

        {/* Display Density */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Display Density
            </CardTitle>
            <CardDescription>
              Choose how compact or spacious your dashboard should be
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={localDensity} 
              onValueChange={(v) => handleDensityChange(v as 'standard' | 'compact')}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="standard" id="standard" />
                <div>
                  <Label htmlFor="standard" className="font-medium cursor-pointer">Standard (Recommended)</Label>
                  <p className="text-sm text-muted-foreground">Comfortable spacing with larger elements</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="compact" id="compact" />
                <div>
                  <Label htmlFor="compact" className="font-medium cursor-pointer">Compact</Label>
                  <p className="text-sm text-muted-foreground">Denser layout to see more content</p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Dashboard Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Dashboard Modules
            </CardTitle>
            <CardDescription>
              Choose which modules appear on your dashboard. Drag to reorder in full settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(MODULE_LABELS) as DashboardModule[]).map((key) => {
              const { label, description } = MODULE_LABELS[key];
              const isSystem = key === 'resume_section';
              const isEnabled = localModules.includes(key);
              
              return (
                <div 
                  key={key}
                  className={`flex items-center justify-between p-4 rounded-lg border ${isSystem ? 'bg-muted/50' : ''}`}
                >
                  <div>
                    <Label className="font-medium">{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleModuleToggle(key)}
                    disabled={isSystem || isUpdating}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Reset */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Reset Preferences
            </CardTitle>
            <CardDescription>
              Restore all display settings to their default values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isUpdating}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset preferences?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your display density and module visibility settings to their defaults. 
                    Your account and privacy settings will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
