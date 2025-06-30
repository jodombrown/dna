
export interface SearchFilters {
  location: string;
  skills: string[];
  isMentor: boolean;
  isInvestor: boolean;
  lookingForOpportunities: boolean;
}

export interface ResultCounts {
  professionals: number;
  communities: number;
  events: number;
}
