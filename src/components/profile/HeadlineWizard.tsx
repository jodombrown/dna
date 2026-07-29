/**
 * DNA | Headline Wizard — Sprint 13B
 *
 * Structured 3-step headline builder for the DNA profile format:
 * [Role/Title] | [Focus/Industry] | [Location <> Heritage Connection]
 */

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PenLine, Eye } from 'lucide-react';
import { MateMasie } from '@/components/icons/adinkra';
import { getCountryNameByAlpha3 } from '@/lib/dna-place';

// The two ends of a corridor must speak one vocabulary. A saved headline may
// hold an alpha-3 code on one side and a display name on the other, which
// hides a degenerate corridor from the equality guard in buildHeadline.
const resolveCountryLabel = (value: string): string => {
  const raw = value.trim();
  if (!raw) return '';
  return getCountryNameByAlpha3(raw.toUpperCase()) ?? raw;
};

interface HeadlineWizardProps {
  headline: string;
  currentCountry: string;
  countryOfOrigin: string;
  skills: string[];
  professionalSectors: string[];
  onHeadlineChange: (headline: string) => void;
}

const ROLE_SUGGESTIONS = [
  'Software Engineer',
  'Creative Director',
  'Student',
  'Community Builder',
  'Investor',
  'Entrepreneur',
  'Consultant',
  'Researcher',
  'Product Manager',
  'Designer',
];

const HeadlineWizard: React.FC<HeadlineWizardProps> = ({
  headline,
  currentCountry,
  countryOfOrigin,
  skills,
  professionalSectors,
  onHeadlineChange,
}) => {
  const [useWizard, setUseWizard] = useState(true);
  const [role, setRole] = useState('');
  const [focus, setFocus] = useState('');
  const [locationFrom, setLocationFrom] = useState('');
  const [locationTo, setLocationTo] = useState('');

  // BD276: The saved headline arrives asynchronously - the prop is transiently
  // empty on the first render before it hydrates. `hydrated` marks the single
  // moment we have parsed that saved headline into wizard parts, so we never
  // re-parse (which would fight the user's typing) and never emit a partial
  // headline back over the saved one before we have read it.
  const hydrated = useRef(false);

  // Parse existing headline into wizard parts once the async headline arrives.
  // Runs exactly once, on the first non-empty headline.
  useEffect(() => {
    if (hydrated.current) return;
    if (!headline) return; // wait for the saved headline to load before parsing
    hydrated.current = true;

    const parts = headline.split('|').map(p => p.trim());
    if (parts.length >= 2) {
      setRole(parts[0] || '');
      setFocus(parts[1] || '');
      // Parse location part if exists
      if (parts.length >= 3) {
        const locParts = parts[2].split('\u2194').map(p => p.trim());
        if (locParts.length === 2) {
          setLocationFrom(resolveCountryLabel(locParts[0]));
          setLocationTo(resolveCountryLabel(locParts[1]));
        }
      }
    } else {
      // Freeform headline that doesn't follow wizard format
      setUseWizard(false);
    }
  }, [headline]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fill location from profile
  useEffect(() => {
    if (!locationFrom && currentCountry) setLocationFrom(currentCountry);
    if (!locationTo && countryOfOrigin) setLocationTo(countryOfOrigin);
  }, [currentCountry, countryOfOrigin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build headline from parts
  const buildHeadline = () => {
    const parts = [role];
    if (focus) parts.push(focus);
    if (locationFrom && locationTo && locationFrom !== locationTo) {
      parts.push(`${locationFrom} \u2194 ${locationTo}`);
    }
    return parts.filter(Boolean).join(' | ');
  };

  // Update parent when wizard fields change.
  // BD276: Do not emit while a saved headline is still waiting to be parsed —
  // otherwise the first keystroke would overwrite the saved headline with a
  // partial one (live data loss). Once hydrated (or when there was no saved
  // headline to protect), emit normally.
  useEffect(() => {
    if (!hydrated.current && headline) return;
    if (useWizard && role) {
      onHeadlineChange(buildHeadline());
    }
  }, [role, focus, locationFrom, locationTo, useWizard]); // eslint-disable-line react-hooks/exhaustive-deps

  // The far end is degenerate when it matches where the Member already is, or
  // when there is no inherited far end at all.
  const sameOrEmptyCorridor = !locationTo || locationFrom === locationTo;

  const focusSuggestions = professionalSectors.length > 0
    ? professionalSectors
    : skills.slice(0, 4);

  if (!useWizard) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="headline">Professional Headline</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUseWizard(true)}
            className="text-xs h-7"
          >
            <MateMasie className="w-3 h-3 mr-1" />
            Use Wizard
          </Button>
        </div>
        <Input
          id="headline"
          placeholder="e.g., FinTech Founder | Building for the diaspora | London \u2194 Lagos"
          value={headline}
          onChange={(e) => onHeadlineChange(e.target.value)}
          maxLength={150}
        />
        <div className="flex justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            A short description of what you do
          </p>
          <p className="text-xs text-muted-foreground">
            {headline.length}/150
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Professional Headline</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setUseWizard(false)}
          className="text-xs h-7"
        >
          <PenLine className="w-3 h-3 mr-1" />
          Write your own
        </Button>
      </div>

      {/* Step 1: Role */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Step 1: What's your role?</Label>
        <Input
          placeholder="e.g., FinTech Founder"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          maxLength={60}
        />
        <div className="flex flex-wrap gap-1.5">
          {ROLE_SUGGESTIONS.map((suggestion) => (
            <Badge
              key={suggestion}
              variant="outline"
              className="cursor-pointer text-xs hover:bg-primary/10 transition-colors"
              onClick={() => setRole(suggestion)}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Step 2: Focus */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Step 2: What's your focus?</Label>
        <Input
          placeholder="e.g., Building for the diaspora"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          maxLength={60}
        />
        {focusSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground self-center">Based on your profile:</span>
            {focusSuggestions.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="cursor-pointer text-xs hover:bg-primary/10 transition-colors"
                onClick={() => setFocus(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Your corridor. Always rendered: for many members the line back
          was severed, so the far end must be choosable rather than absent. */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          {sameOrEmptyCorridor ? 'Step 3: Your corridor (optional)' : 'Step 3: Your connection (optional)'}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Current location"
            value={locationFrom}
            onChange={(e) => setLocationFrom(e.target.value)}
            maxLength={30}
            className="flex-1"
          />
          <span className="text-muted-foreground text-sm shrink-0">↔</span>
          <Input
            placeholder={sameOrEmptyCorridor ? 'Where you are building toward' : 'Heritage'}
            value={sameOrEmptyCorridor ? '' : locationTo}
            onChange={(e) => setLocationTo(e.target.value)}
            maxLength={30}
            className="flex-1"
          />
        </div>
      </div>

      {/* Preview */}
      {role && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Preview</span>
          </div>
          <p className="text-sm font-medium text-foreground">
            &ldquo;{buildHeadline()}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};

export default HeadlineWizard;
