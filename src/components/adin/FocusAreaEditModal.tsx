import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Edit3, 
  Save, 
  Globe, 
  Briefcase,
  X
} from 'lucide-react';

const REGION_OPTIONS = [
  'West Africa',
  'East Africa', 
  'North Africa',
  'Central Africa',
  'Southern Africa',
  'North America',
  'Europe',
  'Caribbean',
  'Asia-Pacific'
];

const SECTOR_OPTIONS = [
  'Fintech',
  'Health',
  'Climate',
  'Creative',
  'Education',
  'AI',
  'Agriculture',
  'Energy',
  'Infrastructure',
  'Media'
];

interface FocusAreaEditModalProps {
  currentRegions?: string[];
  currentSectors?: string[];
  userId?: string;
  trigger?: React.ReactNode;
}

const FocusAreaEditModal: React.FC<FocusAreaEditModalProps> = ({
  currentRegions = [],
  currentSectors = [],
  userId,
  trigger
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;
  
  const [open, setOpen] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(currentRegions);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(currentSectors);

  useEffect(() => {
    setSelectedRegions(currentRegions);
    setSelectedSectors(currentSectors);
  }, [currentRegions, currentSectors]);

  const updateFocusAreasMutation = useMutation({
    mutationFn: async ({ regions, sectors }: { regions: string[]; sectors: string[] }) => {
      if (!targetUserId) throw new Error('User ID is required');

      // First check if ADIN profile exists
      const { data: existingProfile } = await supabase
        .from('adin_profiles')
        .select('id')
        .eq('id', targetUserId)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('adin_profiles')
          .update({
            region_focus: regions,
            sector_focus: sectors,
            last_updated: new Date().toISOString()
          })
          .eq('id', targetUserId);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('adin_profiles')
          .insert({
            id: targetUserId,
            region_focus: regions,
            sector_focus: sectors,
            influence_score: 0,
            verified: false
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Focus Areas Updated",
        description: "Your focus areas have been updated successfully.",
      });
      
      setOpen(false);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['adin-profile'] });
      queryClient.invalidateQueries({ queryKey: ['adin-matches'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update focus areas. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleRegionChange = (region: string, checked: boolean) => {
    setSelectedRegions(prev => 
      checked 
        ? [...prev, region]
        : prev.filter(r => r !== region)
    );
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    setSelectedSectors(prev => 
      checked 
        ? [...prev, sector]
        : prev.filter(s => s !== sector)
    );
  };

  const handleSave = () => {
    updateFocusAreasMutation.mutate({
      regions: selectedRegions,
      sectors: selectedSectors
    });
  };

  const removeRegion = (region: string) => {
    setSelectedRegions(prev => prev.filter(r => r !== region));
  };

  const removeSector = (sector: string) => {
    setSelectedSectors(prev => prev.filter(s => s !== sector));
  };

  const DefaultTrigger = (
    <Button variant="outline" size="sm">
      <Edit3 className="w-4 h-4 mr-2" />
      Edit Focus Areas
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || DefaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Edit Focus Areas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Selections Preview */}
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Selected Regions ({selectedRegions.length})
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 rounded-lg">
                {selectedRegions.length > 0 ? (
                  selectedRegions.map(region => (
                    <Badge
                      key={region}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {region}
                      <button
                        type="button"
                        onClick={() => removeRegion(region)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No regions selected</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Selected Sectors ({selectedSectors.length})
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 rounded-lg">
                {selectedSectors.length > 0 ? (
                  selectedSectors.map(sector => (
                    <Badge
                      key={sector}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {sector}
                      <button
                        type="button"
                        onClick={() => removeSector(sector)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No sectors selected</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Region Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-dna-emerald" />
                Regional Focus
              </h3>
              <div className="space-y-3">
                {REGION_OPTIONS.map(region => (
                  <div key={region} className="flex items-center space-x-3">
                    <Checkbox
                      id={`region-${region}`}
                      checked={selectedRegions.includes(region)}
                      onCheckedChange={(checked) => handleRegionChange(region, checked as boolean)}
                    />
                    <label
                      htmlFor={`region-${region}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {region}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-dna-copper" />
                Sector Focus
              </h3>
              <div className="space-y-3">
                {SECTOR_OPTIONS.map(sector => (
                  <div key={sector} className="flex items-center space-x-3">
                    <Checkbox
                      id={`sector-${sector}`}
                      checked={selectedSectors.includes(sector)}
                      onCheckedChange={(checked) => handleSectorChange(sector, checked as boolean)}
                    />
                    <label
                      htmlFor={`sector-${sector}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {sector}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateFocusAreasMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateFocusAreasMutation.isPending}
            >
              {updateFocusAreasMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FocusAreaEditModal;