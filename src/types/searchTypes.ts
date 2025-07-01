
export interface SearchResult {
  id: string;
  full_name: string;
  profession?: string;
  company?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  skills?: string[];
  is_mentor?: boolean;
  is_investor?: boolean;
  looking_for_opportunities?: boolean;
  years_experience?: number;
  country_of_origin?: string;
}

export interface SearchFilters {
  searchTerm: string;
  location: string;
  profession: string;
  skills: string[];
  interests: string[];
  company: string;
  experience: string;
  is_mentor: boolean;
  is_investor: boolean;
  looking_for_opportunities: boolean;
  countryOfOrigin: string;
}

export interface SearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}
