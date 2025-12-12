import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Mail, Linkedin, Clock } from 'lucide-react';

interface ProfileEditContactProps {
  whatsappNumber: string;
  preferredContactMethod: string;
  timezone: string;
  onWhatsappChange: (value: string) => void;
  onPreferredContactChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

const CONTACT_METHODS = [
  { value: 'platform_message', label: 'DNA Platform Messages', icon: MessageCircle },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
];

const COMMON_TIMEZONES = [
  { value: 'Africa/Lagos', label: 'West Africa (Lagos) - WAT' },
  { value: 'Africa/Nairobi', label: 'East Africa (Nairobi) - EAT' },
  { value: 'Africa/Johannesburg', label: 'South Africa (Johannesburg) - SAST' },
  { value: 'Africa/Cairo', label: 'Egypt (Cairo) - EET' },
  { value: 'Africa/Casablanca', label: 'Morocco (Casablanca) - WET' },
  { value: 'America/New_York', label: 'US Eastern (New York) - EST/EDT' },
  { value: 'America/Chicago', label: 'US Central (Chicago) - CST/CDT' },
  { value: 'America/Denver', label: 'US Mountain (Denver) - MST/MDT' },
  { value: 'America/Los_Angeles', label: 'US Pacific (Los Angeles) - PST/PDT' },
  { value: 'Europe/London', label: 'UK (London) - GMT/BST' },
  { value: 'Europe/Paris', label: 'Central Europe (Paris) - CET/CEST' },
  { value: 'Europe/Berlin', label: 'Germany (Berlin) - CET/CEST' },
  { value: 'Asia/Dubai', label: 'UAE (Dubai) - GST' },
  { value: 'Asia/Singapore', label: 'Singapore - SGT' },
  { value: 'Australia/Sydney', label: 'Australia (Sydney) - AEST/AEDT' },
  { value: 'America/Toronto', label: 'Canada (Toronto) - EST/EDT' },
  { value: 'America/Sao_Paulo', label: 'Brazil (São Paulo) - BRT' },
];

const ProfileEditContact: React.FC<ProfileEditContactProps> = ({
  whatsappNumber,
  preferredContactMethod,
  timezone,
  onWhatsappChange,
  onPreferredContactChange,
  onTimezoneChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Contact Preferences
        </CardTitle>
        <CardDescription>
          Help others know how to best reach you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preferred Contact Method */}
          <div>
            <Label>Preferred Contact Method</Label>
            <Select value={preferredContactMethod} onValueChange={onPreferredContactChange}>
              <SelectTrigger>
                <SelectValue placeholder="How would you like to be contacted?" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <span className="flex items-center gap-2">
                      <method.icon className="h-4 w-4" />
                      {method.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              This helps others know the best way to reach you
            </p>
          </div>

          {/* WhatsApp Number */}
          <div>
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              placeholder="+1 555 123 4567"
              value={whatsappNumber}
              onChange={(e) => onWhatsappChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Include country code (e.g., +1, +44, +234)
            </p>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Your Timezone
          </Label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Helps with scheduling meetings and knowing your availability
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditContact;
