import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Send,
  Target,
  Globe,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle
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

const SIGNAL_TYPES = [
  { value: 'collaboration', label: 'Collaboration Opportunity', icon: Users },
  { value: 'funding_opportunity', label: 'Funding Opportunity', icon: Target },
  { value: 'event', label: 'Event Invitation', icon: Globe }
];

const AdinSignalAuthoring = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    signal_type: '',
    description: '',
    region_focus: [] as string[],
    sector_focus: [] as string[],
    link: '',
    cta: ''
  });
  
  const [matchingUsers, setMatchingUsers] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState(false);

  // Calculate potential matches as user selects criteria
  const calculateMatches = async (regions: string[], sectors: string[]) => {
    if (regions.length === 0 && sectors.length === 0) {
      setMatchingUsers(0);
      return;
    }

    try {
      const { count } = await supabase
        .from('adin_profiles')
        .select('*', { count: 'exact', head: true })
        .or(`region_focus.cs.{${regions.join(',')}},sector_focus.cs.{${sectors.join(',')}}`);
      
      setMatchingUsers(count || 0);
    } catch (error) {
      console.error('Error calculating matches:', error);
      setMatchingUsers(0);
    }
  };

  // Create signal mutation
  const createSignalMutation = useMutation({
    mutationFn: async (signalData: any) => {
      // First, find matching users
      const { data: matchedProfiles, error: matchError } = await supabase
        .from('adin_profiles')
        .select('id')
        .or(`region_focus.cs.{${signalData.region_focus.join(',')}},sector_focus.cs.{${signalData.sector_focus.join(',')}}`);

      if (matchError) throw matchError;

      // Create signals for each matched user
      const signals = matchedProfiles?.map(profile => ({
        user_id: profile.id,
        signal_type: signalData.signal_type,
        description: signalData.description,
        region_focus: signalData.region_focus,
        sector_focus: signalData.sector_focus,
        link: signalData.link,
        cta: signalData.cta,
        created_by: user?.id,
        signal_data: {
          created_by_admin: true,
          targeted_regions: signalData.region_focus,
          targeted_sectors: signalData.sector_focus
        }
      })) || [];

      if (signals.length === 0) {
        throw new Error('No matching users found for the selected criteria');
      }

      const { error: insertError } = await supabase
        .from('adin_signals')
        .insert(signals);

      if (insertError) throw insertError;

      return { sent_count: signals.length };
    },
    onSuccess: (result) => {
      toast({
        title: "Signals Sent Successfully!",
        description: `${result.sent_count} signals have been sent to matching users.`,
      });
      
      // Reset form
      setFormData({
        signal_type: '',
        description: '',
        region_focus: [],
        sector_focus: [],
        link: '',
        cta: ''
      });
      setMatchingUsers(0);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['signal-analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Signals",
        description: error.message || "Failed to send signals. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleRegionChange = (region: string, checked: boolean) => {
    const newRegions = checked 
      ? [...formData.region_focus, region]
      : formData.region_focus.filter(r => r !== region);
    
    setFormData(prev => ({ ...prev, region_focus: newRegions }));
    calculateMatches(newRegions, formData.sector_focus);
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    const newSectors = checked 
      ? [...formData.sector_focus, sector]
      : formData.sector_focus.filter(s => s !== sector);
    
    setFormData(prev => ({ ...prev, sector_focus: newSectors }));
    calculateMatches(formData.region_focus, newSectors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.signal_type || !formData.description) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in the signal type and description.",
        variant: "destructive"
      });
      return;
    }

    if (formData.region_focus.length === 0 && formData.sector_focus.length === 0) {
      toast({
        title: "No Targeting Criteria",
        description: "Please select at least one region or sector to target.",
        variant: "destructive"
      });
      return;
    }

    createSignalMutation.mutate(formData);
  };

  const selectedSignalType = SIGNAL_TYPES.find(type => type.value === formData.signal_type);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dna-forest mb-2">ADIN Signal Authoring</h1>
        <p className="text-gray-600">Create and send targeted signals to the ADIN network</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Create New Signal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Signal Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Signal Type *</label>
                  <Select value={formData.signal_type} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, signal_type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select signal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIGNAL_TYPES.map(type => {
                        const IconComponent = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the opportunity or event..."
                    rows={4}
                    required
                  />
                </div>

                {/* Region Focus */}
                <div>
                  <label className="block text-sm font-medium mb-2">Target Regions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {REGION_OPTIONS.map(region => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox
                          id={`region-${region}`}
                          checked={formData.region_focus.includes(region)}
                          onCheckedChange={(checked) => handleRegionChange(region, checked as boolean)}
                        />
                        <label htmlFor={`region-${region}`} className="text-sm">
                          {region}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sector Focus */}
                <div>
                  <label className="block text-sm font-medium mb-2">Target Sectors</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTOR_OPTIONS.map(sector => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sector-${sector}`}
                          checked={formData.sector_focus.includes(sector)}
                          onCheckedChange={(checked) => handleSectorChange(sector, checked as boolean)}
                        />
                        <label htmlFor={`sector-${sector}`} className="text-sm">
                          {sector}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Link (Optional)</label>
                    <Input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Call to Action (Optional)</label>
                    <Input
                      value={formData.cta}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
                      placeholder="e.g., Apply Now, Learn More"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createSignalMutation.isPending}
                >
                  {createSignalMutation.isPending ? 'Sending Signals...' : `Send Signal to ${matchingUsers} Users`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Target Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Targeting Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-dna-emerald">
                    {matchingUsers}
                  </div>
                  <div className="text-sm text-gray-600">Matching Users</div>
                </div>

                {formData.region_focus.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Target Regions
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {formData.region_focus.map(region => (
                        <Badge key={region} variant="secondary" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.sector_focus.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      Target Sectors
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {formData.sector_focus.map(sector => (
                        <Badge key={sector} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Signal Preview */}
          {selectedSignalType && formData.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signal Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <selectedSignalType.icon className="w-4 h-4 text-dna-emerald" />
                    <span className="font-medium text-sm">{selectedSignalType.label}</span>
                  </div>
                  <p className="text-sm text-gray-700">{formData.description}</p>
                  {formData.link && (
                    <a href={formData.link} className="text-sm text-blue-600 hover:underline">
                      {formData.cta || 'Learn More'}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdinSignalAuthoring;