/**
 * Shared country flag emoji map and diaspora region helpers.
 */

export const COUNTRY_FLAGS: Record<string, string> = {
  'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Kenya': '🇰🇪', 'South Africa': '🇿🇦',
  'Ethiopia': '🇪🇹', 'Tanzania': '🇹🇿', 'Uganda': '🇺🇬', 'Rwanda': '🇷🇼',
  'Cameroon': '🇨🇲', 'Senegal': '🇸🇳', "Côte d'Ivoire": '🇨🇮', 'Mali': '🇲🇱',
  'Democratic Republic of the Congo': '🇨🇩', 'Angola': '🇦🇴', 'Mozambique': '🇲🇿',
  'Madagascar': '🇲🇬', 'Zimbabwe': '🇿🇼', 'Zambia': '🇿🇲', 'Botswana': '🇧🇼',
  'Namibia': '🇳🇦', 'Malawi': '🇲🇼', 'Benin': '🇧🇯', 'Togo': '🇹🇬',
  'Sierra Leone': '🇸🇱', 'Liberia': '🇱🇷', 'Gambia': '🇬🇲', 'Guinea': '🇬🇳',
  'Burkina Faso': '🇧🇫', 'Niger': '🇳🇪', 'Chad': '🇹🇩', 'Somalia': '🇸🇴',
  'Eritrea': '🇪🇷', 'Djibouti': '🇩🇯', 'Sudan': '🇸🇩', 'South Sudan': '🇸🇸',
  'Egypt': '🇪🇬', 'Morocco': '🇲🇦', 'Tunisia': '🇹🇳', 'Algeria': '🇩🇿', 'Libya': '🇱🇾',
  'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦', 'France': '🇫🇷',
  'Germany': '🇩🇪', 'Brazil': '🇧🇷', 'Jamaica': '🇯🇲', 'Trinidad and Tobago': '🇹🇹',
  'Barbados': '🇧🇧', 'Haiti': '🇭🇹', 'Australia': '🇦🇺', 'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪', 'Portugal': '🇵🇹', 'Italy': '🇮🇹', 'Spain': '🇪🇸',
  'Sweden': '🇸🇪', 'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Switzerland': '🇨🇭',
  'UAE': '🇦🇪', 'Saudi Arabia': '🇸🇦', 'India': '🇮🇳', 'China': '🇨🇳', 'Japan': '🇯🇵',
};

export function getFlag(country: string | null | undefined): string {
  if (!country) return '';
  return COUNTRY_FLAGS[country] || '🌍';
}

/** Map a country of origin to its African diaspora region label */
const AFRICAN_REGIONS: Record<string, string> = {
  'Nigeria': 'West African', 'Ghana': 'West African', 'Senegal': 'West African',
  'Mali': 'West African', "Côte d'Ivoire": 'West African', 'Benin': 'West African',
  'Togo': 'West African', 'Sierra Leone': 'West African', 'Liberia': 'West African',
  'Gambia': 'West African', 'Guinea': 'West African', 'Burkina Faso': 'West African',
  'Niger': 'West African', 'Cameroon': 'Central African',
  'Democratic Republic of the Congo': 'Central African', 'Chad': 'Central African',
  'Kenya': 'East African', 'Ethiopia': 'East African', 'Tanzania': 'East African',
  'Uganda': 'East African', 'Rwanda': 'East African', 'Somalia': 'East African',
  'Eritrea': 'East African', 'Djibouti': 'East African', 'Sudan': 'East African',
  'South Sudan': 'East African',
  'South Africa': 'Southern African', 'Zimbabwe': 'Southern African',
  'Zambia': 'Southern African', 'Botswana': 'Southern African',
  'Namibia': 'Southern African', 'Malawi': 'Southern African',
  'Mozambique': 'Southern African', 'Angola': 'Southern African',
  'Madagascar': 'Southern African',
  'Egypt': 'North African', 'Morocco': 'North African', 'Tunisia': 'North African',
  'Algeria': 'North African', 'Libya': 'North African',
};

const CURRENT_COUNTRY_REGIONS: Record<string, string> = {
  'United States': 'North America', 'Canada': 'North America',
  'United Kingdom': 'Europe', 'France': 'Europe', 'Germany': 'Europe',
  'Netherlands': 'Europe', 'Belgium': 'Europe', 'Portugal': 'Europe',
  'Italy': 'Europe', 'Spain': 'Europe', 'Sweden': 'Europe',
  'Norway': 'Europe', 'Denmark': 'Europe', 'Switzerland': 'Europe',
  'Brazil': 'South America',
  'Jamaica': 'Caribbean', 'Trinidad and Tobago': 'Caribbean',
  'Barbados': 'Caribbean', 'Haiti': 'Caribbean',
  'Australia': 'Oceania',
  'UAE': 'Middle East', 'Saudi Arabia': 'Middle East',
  'India': 'Asia', 'China': 'Asia', 'Japan': 'Asia',
};

/**
 * Get diaspora region tag like "West African Diaspora · North America"
 */
export function getDiasporaRegionTag(
  countryOfOrigin: string | null | undefined,
  currentCountry: string | null | undefined,
): string | null {
  const originRegion = countryOfOrigin ? AFRICAN_REGIONS[countryOfOrigin] : null;
  const currentRegion = currentCountry ? CURRENT_COUNTRY_REGIONS[currentCountry] : null;

  if (!originRegion && !currentRegion) return null;

  const parts: string[] = [];
  if (originRegion) parts.push(`${originRegion} Diaspora`);
  if (currentRegion) parts.push(currentRegion);

  return parts.join(' · ') || null;
}
