import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageCircle, Mail, Linkedin, Clock, Phone, Globe } from 'lucide-react';

export type ContactNumberVisibility = 'none' | 'phone' | 'whatsapp';
export type PreferredContactMethod = 'platform_message' | 'email' | 'whatsapp' | 'linkedin';

interface ProfileEditContactPreferencesProps {
  preferredContactMethod: string;
  contactNumberVisibility: string;
  phoneNumber: string;
  whatsappNumber: string;
  timezone: string;
  onPreferredContactChange: (value: string) => void;
  onContactNumberVisibilityChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onWhatsappNumberChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

const CONTACT_METHODS = [
  { value: 'platform_message', label: 'DNA Platform Messages', icon: Globe, description: 'Messages within the DNA platform' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Direct email communication' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'WhatsApp messaging' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, description: 'LinkedIn messages' },
];

const VISIBILITY_OPTIONS = [
  { value: 'none', label: 'Neither', description: 'Don\'t show any contact number' },
  { value: 'phone', label: 'Phone number', description: 'Show your phone number' },
  { value: 'whatsapp', label: 'WhatsApp number', description: 'Show your WhatsApp number' },
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

const ProfileEditContactPreferences: React.FC<ProfileEditContactPreferencesProps> = ({
  preferredContactMethod,
  contactNumberVisibility,
  phoneNumber,
  whatsappNumber,
  timezone,
  onPreferredContactChange,
  onContactNumberVisibilityChange,
  onPhoneNumberChange,
  onWhatsappNumberChange,
  onTimezoneChange,
}) => {
  // E.164-ish validation: must start with + and have at least 8 digits
  const validateE164ish = (value: string): boolean => {
    if (!value) return true; // Empty is valid (optional)
    const digits = value.replace(/\D/g, ''); // Count only digits
    return value.trim().startsWith('+') && digits.length >= 8;
  };

  // Only validate the currently visible field
  const shouldValidatePhone = contactNumberVisibility === 'phone';
  const shouldValidateWhatsapp = contactNumberVisibility === 'whatsapp';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Contact Preferences
        </CardTitle>
        <CardDescription>
          Help others know the best way to reach you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 1. Preferred Contact Method */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Preferred Contact Method</Label>
          <RadioGroup
            value={preferredContactMethod || 'platform_message'}
            onValueChange={onPreferredContactChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {CONTACT_METHODS.map((method) => (
              <div key={method.value} className="relative">
                <RadioGroupItem
                  value={method.value}
                  id={`contact-${method.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`contact-${method.value}`}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                >
                  <method.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* 2. Contact Number Visibility */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Show a contact number on my profile</Label>
          <RadioGroup
            value={contactNumberVisibility || 'none'}
            onValueChange={onContactNumberVisibilityChange}
            className="space-y-2"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={`visibility-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`visibility-${option.value}`}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50"
                >
                  {option.value === 'none' && <Globe className="h-5 w-5 text-muted-foreground" />}
                  {option.value === 'phone' && <Phone className="h-5 w-5 text-muted-foreground" />}
                  {option.value === 'whatsapp' && <MessageCircle className="h-5 w-5 text-muted-foreground" />}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* 3. Phone Number (conditional) */}
        {contactNumberVisibility === 'phone' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label htmlFor="phone-number" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone-number"
              placeholder="+1 555 123 4567"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              className={shouldValidatePhone && !validateE164ish(phoneNumber) && phoneNumber ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1, +44, +234)
            </p>
            {shouldValidatePhone && !validateE164ish(phoneNumber) && phoneNumber && (
              <p className="text-xs text-destructive">
                Please enter a valid phone number starting with + and at least 8 digits
              </p>
            )}
          </div>
        )}

        {/* 4. WhatsApp Number (conditional) */}
        {contactNumberVisibility === 'whatsapp' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label htmlFor="whatsapp-number" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp Number
            </Label>
            <Input
              id="whatsapp-number"
              placeholder="+1 555 123 4567"
              value={whatsappNumber}
              onChange={(e) => onWhatsappNumberChange(e.target.value)}
              className={shouldValidateWhatsapp && !validateE164ish(whatsappNumber) && whatsappNumber ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1, +44, +234)
            </p>
            {shouldValidateWhatsapp && !validateE164ish(whatsappNumber) && whatsappNumber && (
              <p className="text-xs text-destructive">
                Please enter a valid WhatsApp number starting with + and at least 8 digits
              </p>
            )}
          </div>
        )}

        {/* 5. Timezone */}
        <div className="space-y-2">
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
          <p className="text-xs text-muted-foreground">
            Helps with scheduling meetings and knowing your availability
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditContactPreferences;
