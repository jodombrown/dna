export interface OpportunityFilters {
  search: string;
  tags: string[];
  regions: string[];
  type: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  type: string;
  location: string | null;
  tags: string[] | null;
  image_url: string | null;
  link: string | null;
  created_by: string;
  space_id: string | null;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
    verified: boolean;
  };
}
