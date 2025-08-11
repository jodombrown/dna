export type LocationOption = { id: string; label: string };

export interface LocationProvider {
  search(
    query: string,
    opts?: { limit?: number; language?: string; proximity?: { lng: number; lat: number } }
  ): Promise<LocationOption[]>;
}

// Local fallback provider (works offline)
const BASE: string[] = [
  'Lagos, Nigeria','Nairobi, Kenya','Accra, Ghana','Johannesburg, South Africa',
  'Cairo, Egypt','Addis Ababa, Ethiopia','Kigali, Rwanda','Abuja, Nigeria',
  'London, United Kingdom','Toronto, Canada','New York, USA','Los Angeles, USA'
];

export const LocalProvider: LocationProvider = {
  async search(q, { limit = 5 } = {}) {
    const s = (q || '').trim().toLowerCase();
    if (!s) return [];
    const scored = BASE
      .map(label => ({ label, score: label.toLowerCase().indexOf(s) }))
      .filter(x => x.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map((x, i) => ({ id: `${x.label}-${i}`, label: x.label }));
    return scored;
  }
};
