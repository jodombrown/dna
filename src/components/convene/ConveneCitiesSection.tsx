/**
 * DNA | CONVENE — Cities Section
 * Horizontally scrollable city cards with gradient backgrounds and event counts.
 */

import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const MIN_CITIES_FOR_SECTION = 3;

// Generate a deterministic warm gradient from city name
function cityGradient(city: string): string {
  let hash = 0;
  for (let i = 0; i < city.length; i++) {
    hash = city.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = 20 + (Math.abs(hash) % 30); // warm range: 20-50
  const hue2 = hue1 + 25 + (Math.abs(hash >> 8) % 20);

  return `linear-gradient(135deg, hsl(${hue1} 60% 35%), hsl(${hue2} 55% 25%))`;
}

interface CityData {
  city: string;
  country: string | null;
  count: number;
}

interface ConveneCitiesSectionProps {
  cities: CityData[];
  onCitySelect: (city: string) => void;
  activeCity?: string | null;
}

export function ConveneCitiesSection({
  cities,
  onCitySelect,
  activeCity,
}: ConveneCitiesSectionProps) {
  if (cities.length < MIN_CITIES_FOR_SECTION) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-foreground">Explore Cities</h3>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {cities.slice(0, 12).map((c) => (
          <button
            key={c.city}
            onClick={() => onCitySelect(c.city)}
            className={cn(
              'relative flex-shrink-0 w-[140px] h-[90px] rounded-xl overflow-hidden transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'hover:scale-[1.03] active:scale-[0.97]',
              activeCity?.toLowerCase() === c.city.toLowerCase() &&
                'ring-2 ring-[hsl(var(--module-convene))] ring-offset-2 ring-offset-background',
            )}
            style={{ background: cityGradient(c.city) }}
          >
            {/* Kente micro pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `url('/patterns/kente-pattern.svg')`,
                backgroundSize: '30px 30px',
              }}
            />

            <div className="absolute inset-0 flex flex-col items-start justify-end p-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-white/70" />
                <span className="text-white font-semibold text-sm truncate">{c.city}</span>
              </div>
              <span className="text-white/60 text-xs">
                {c.count} event{c.count !== 1 ? 's' : ''}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
