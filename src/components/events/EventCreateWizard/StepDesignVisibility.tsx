import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Globe, Lock, Users, Calendar, Settings, Palette, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventData } from './index';

interface StepDesignVisibilityProps {
  eventData: EventData;
  updateEventData: (field: keyof EventData, value: any) => void;
}

interface FormData {
  theme?: string;
  visibility: "public" | "private" | "members";
  slug?: string;
  capacity?: number;
  waitlist_enabled: boolean;
}

const StepDesignVisibility: React.FC<StepDesignVisibilityProps> = ({ eventData, updateEventData }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const themes = [
    { id: 'default', name: 'Default', primary: '#2563eb', bg: '#f8fafc' },
    { id: 'green', name: 'Green', primary: '#059669', bg: '#f0fdf4' },
    { id: 'purple', name: 'Purple', primary: '#7c3aed', bg: '#faf5ff' },
    { id: 'orange', name: 'Orange', primary: '#ea580c', bg: '#fff7ed' },
    { id: 'pink', name: 'Pink', primary: '#db2777', bg: '#fdf2f8' },
  ];

  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can see and register for this event',
      icon: Globe,
    },
    {
      value: 'members',
      label: 'Members Only', 
      description: 'Only DNA platform members can see and register',
      icon: Users,
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Invite only - not visible in listings',
      icon: Lock,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Event Images */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Event Images</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="image_url">Event Image URL</Label>
            <Input
              id="image_url"
              value={eventData.image_url || ''}
              onChange={(e) => updateEventData('image_url', e.target.value)}
              placeholder="https://example.com/event-image.jpg"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 400x300px or larger
            </p>
          </div>
          
          <div>
            <Label htmlFor="banner_url">Banner Image URL (Optional)</Label>
            <Input
              id="banner_url"
              value={eventData.banner_url || ''}
              onChange={(e) => updateEventData('banner_url', e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended: 1200x400px for hero banner
            </p>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Theme</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {themes.map((theme) => (
            <Card
              key={theme.id}
              className={`p-3 cursor-pointer transition-all ${
                eventData.theme === theme.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              onClick={() => updateEventData('theme', theme.id)}
            >
              <div className="space-y-2">
                <div
                  className="w-full h-8 rounded"
                  style={{ backgroundColor: theme.bg }}
                >
                  <div
                    className="w-1/3 h-full rounded"
                    style={{ backgroundColor: theme.primary }}
                  />
                </div>
                <p className="text-sm font-medium text-center">{theme.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Visibility Settings */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Visibility & Access</h3>
        </div>
        
        <div className="space-y-3">
          {visibilityOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.value}
                className={`p-4 cursor-pointer transition-all ${
                  eventData.visibility === option.value ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                }`}
                onClick={() => updateEventData('visibility', option.value)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    eventData.visibility === option.value ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Capacity & Settings */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Capacity & Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="capacity">Event Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={eventData.capacity || ''}
              onChange={(e) => updateEventData('capacity', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Leave empty for unlimited"
              className="mt-1"
            />
          </div>
          
          <div className="flex items-center justify-between pt-6">
            <Label htmlFor="waitlist_enabled">Enable Waitlist</Label>
            <Switch
              id="waitlist_enabled"
              checked={eventData.waitlist_enabled || false}
              onCheckedChange={(checked) => updateEventData('waitlist_enabled', checked)}
            />
          </div>
        </div>
      </div>

      {/* URL Slug */}
      <div>
        <Label htmlFor="slug">Event URL Slug</Label>
        <Input
          id="slug"
          value={eventData.slug || ''}
          onChange={(e) => updateEventData('slug', e.target.value)}
          placeholder="your-event-slug"
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Your event will be accessible at: <span className="font-mono">/events/{eventData.slug || 'your-slug'}</span>
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
        <h4 className="font-medium mb-2">Ready to Launch!</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Your event is ready to be created. You can always edit these settings later.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Visibility:</span> {eventData.visibility || 'public'}
          </div>
          <div>
            <span className="text-muted-foreground">Theme:</span> {themes.find(t => t.id === eventData.theme)?.name || 'Default'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepDesignVisibility;