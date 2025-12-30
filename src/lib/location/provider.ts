export type LocationTier = 'local' | 'regional' | 'international' | 'global';

export type LocationOption = { 
  id: string; 
  label: string;
  tier: LocationTier;
  category?: string;
};

export interface LocationProvider {
  search(
    query: string,
    opts?: { limit?: number; language?: string; proximity?: { lng: number; lat: number } }
  ): Promise<LocationOption[]>;
}

// Geocoding API provider using Nominatim (OpenStreetMap)
export const GlobalProvider: LocationProvider = {
  async search(q, { limit = 10 } = {}) {
    const s = (q || '').trim();
    if (!s || s.length < 2) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: s,
          format: 'json',
          addressdetails: '1',
          limit: String(Math.min(limit, 20)),
          'accept-language': 'en'
        }),
        {
          headers: {
            'User-Agent': 'DNA-Platform/1.0'
          }
        }
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      return data.map((item: any, idx: number) => {
        const address = item.address || {};
        const type = item.type || '';
        const placeType = item.class || '';
        
        // Determine tier based on place type
        let tier: LocationTier = 'local';
        let category = 'Place';
        
        if (address.country && !address.state && !address.city) {
          tier = 'international';
          category = 'Country';
        } else if (address.state && !address.city && !address.town && !address.village) {
          tier = 'regional';
          category = 'State/Region';
        } else if (address.city || address.town || address.village) {
          tier = 'local';
          category = address.city ? 'City' : address.town ? 'Town' : 'Village';
        } else if (placeType === 'boundary' && type === 'administrative') {
          tier = 'regional';
          category = 'Region';
        }
        
        // Build a clean display name
        let label = item.display_name;
        
        // Try to create a shorter, cleaner label
        if (address.city || address.town || address.village) {
          const place = address.city || address.town || address.village;
          const state = address.state || '';
          const country = address.country || '';
          
          if (state && country) {
            label = `${place}, ${state}, ${country}`;
          } else if (country) {
            label = `${place}, ${country}`;
          } else {
            label = place;
          }
        } else if (address.state && address.country) {
          label = `${address.state}, ${address.country}`;
        } else if (address.country) {
          label = address.country;
        }
        
        return {
          id: `geo-${item.place_id || idx}`,
          label,
          tier,
          category
        };
      });
    } catch (error) {
      return [];
    }
  }
};

// Keep LocalProvider as fallback
const LOCATION_DATABASE: Array<{ label: string; tier: LocationTier; category?: string }> = [
  // Global
  { label: 'Global', tier: 'global', category: 'Worldwide' },
  { label: 'Africa', tier: 'global', category: 'Continent' },
  { label: 'North America', tier: 'global', category: 'Continent' },
  { label: 'Europe', tier: 'global', category: 'Continent' },
  { label: 'Asia', tier: 'global', category: 'Continent' },
  
  // International - Countries
  { label: 'Nigeria', tier: 'international', category: 'Country' },
  { label: 'Kenya', tier: 'international', category: 'Country' },
  { label: 'Ghana', tier: 'international', category: 'Country' },
  { label: 'South Africa', tier: 'international', category: 'Country' },
  { label: 'Egypt', tier: 'international', category: 'Country' },
  { label: 'Ethiopia', tier: 'international', category: 'Country' },
  { label: 'United States', tier: 'international', category: 'Country' },
  { label: 'United Kingdom', tier: 'international', category: 'Country' },
  { label: 'Canada', tier: 'international', category: 'Country' },
  { label: 'France', tier: 'international', category: 'Country' },
  { label: 'Germany', tier: 'international', category: 'Country' },
  
  // Regional - States/Provinces
  { label: 'California', tier: 'regional', category: 'State' },
  { label: 'New York', tier: 'regional', category: 'State' },
  { label: 'Texas', tier: 'regional', category: 'State' },
  { label: 'Lagos State', tier: 'regional', category: 'State' },
  { label: 'Nairobi County', tier: 'regional', category: 'County' },
  { label: 'Greater Accra', tier: 'regional', category: 'Region' },
  { label: 'Gauteng', tier: 'regional', category: 'Province' },
  { label: 'Ontario', tier: 'regional', category: 'Province' },
  
  // Local - Cities
  { label: 'Lagos', tier: 'local', category: 'City' },
  { label: 'Nairobi', tier: 'local', category: 'City' },
  { label: 'Accra', tier: 'local', category: 'City' },
  { label: 'Johannesburg', tier: 'local', category: 'City' },
  { label: 'Cairo', tier: 'local', category: 'City' },
  { label: 'Addis Ababa', tier: 'local', category: 'City' },
  { label: 'Kigali', tier: 'local', category: 'City' },
  { label: 'Abuja', tier: 'local', category: 'City' },
  { label: 'London', tier: 'local', category: 'City' },
  { label: 'Toronto', tier: 'local', category: 'City' },
  { label: 'New York City', tier: 'local', category: 'City' },
  { label: 'Los Angeles', tier: 'local', category: 'City' },
  { label: 'San Francisco', tier: 'local', category: 'City' },
  { label: 'San Diego', tier: 'local', category: 'City' },
  { label: 'San Jose', tier: 'local', category: 'City' },
  { label: 'San Bernardino', tier: 'local', category: 'City' },
  { label: 'Paris', tier: 'local', category: 'City' },
  { label: 'Berlin', tier: 'local', category: 'City' },
  { label: 'Amsterdam', tier: 'local', category: 'City' },
];

export const LocalProvider: LocationProvider = {
  async search(q, { limit = 10 } = {}) {
    const s = (q || '').trim().toLowerCase();
    if (!s) return [];
    
    // Score and filter matches
    const scored = LOCATION_DATABASE
      .map(loc => {
        const lowerLabel = loc.label.toLowerCase();
        const index = lowerLabel.indexOf(s);
        
        // Boost exact matches and matches at the start
        let score = index;
        if (index === 0) score -= 1000; // Start match
        if (lowerLabel === s) score -= 2000; // Exact match
        
        return { ...loc, score, index };
      })
      .filter(x => x.index >= 0)
      .sort((a, b) => {
        // First sort by score
        if (a.score !== b.score) return a.score - b.score;
        // Then by tier priority (local > regional > international > global)
        const tierOrder = { local: 0, regional: 1, international: 2, global: 3 };
        return tierOrder[a.tier] - tierOrder[b.tier];
      })
      .slice(0, limit)
      .map((x, i) => ({ 
        id: `${x.tier}-${x.label}-${i}`, 
        label: x.label,
        tier: x.tier,
        category: x.category
      }));
    
    return scored;
  }
};
