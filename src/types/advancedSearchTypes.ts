
export interface SearchFilters {
  searchTerm: string;
  location: string;
  skills: string[];
  interests: string[];
  profession: string;
  company: string;
  is_mentor: boolean;
  is_investor: boolean;
  looking_for_opportunities: boolean;
}

export interface ResultCounts {
  professionals: number;
  communities: number;
  events: number;
}
