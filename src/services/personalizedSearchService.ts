import { supabase } from '@/integrations/supabase/client';
import { SearchResult } from '@/services/searchService';

export interface UserContext {
  id: string;
  communities: string[];
  interests: string[];
  location?: string;
  industry?: string;
  connections: string[];
  recentSearches: string[];
  savedSearches: string[];
}

export interface PersonalizationWeights {
  communityMatch: number;
  interestMatch: number;
  locationMatch: number;
  industryMatch: number;
  connectionMatch: number;
  recentActivity: number;
  userEngagement: number;
}

const DEFAULT_WEIGHTS: PersonalizationWeights = {
  communityMatch: 0.3,
  interestMatch: 0.25,
  locationMatch: 0.15,
  industryMatch: 0.2,
  connectionMatch: 0.4,
  recentActivity: 0.1,
  userEngagement: 0.2
};

export class PersonalizedSearchService {
  private userContext: UserContext | null = null;
  private weights: PersonalizationWeights = DEFAULT_WEIGHTS;

  async initializeUserContext(userId: string): Promise<void> {
    try {
      // Fetch user profile and preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, location, industry, professional_role, skills')
        .eq('id', userId)
        .single();

      if (!profile) return;

      // Fetch user's communities
      const { data: communities } = await supabase
        .from('community_memberships')
        .select('community_id, communities(name, category)')
        .eq('user_id', userId)
        .eq('status', 'approved');

      // Fetch user's connections
      const { data: connections } = await supabase
        .from('contact_requests')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted');

      // Get recent searches (you would store these in user preferences or a searches table)
      const recentSearches = await this.getRecentSearches(userId);

      this.userContext = {
        id: userId,
        communities: communities?.map(c => c.community_id) || [],
        interests: profile.skills || [],
        location: profile.location,
        industry: profile.industry,
        connections: connections?.map(c => 
          c.sender_id === userId ? c.receiver_id : c.sender_id
        ) || [],
        recentSearches,
        savedSearches: []
      };
    } catch (error) {
      console.error('Error initializing user context:', error);
    }
  }

  async personalizeResults(
    results: SearchResult[], 
    query: string, 
    userId?: string
  ): Promise<SearchResult[]> {
    if (!userId || !this.userContext) {
      return results;
    }

    // Calculate personalization scores for each result
    const personalizedResults = results.map(result => ({
      ...result,
      personalizedScore: this.calculatePersonalizationScore(result, query)
    }));

    // Sort by combined relevance and personalization score
    return personalizedResults.sort((a, b) => {
      const scoreA = (a.personalizedScore || 0) * 0.4 + 0.6; // Base relevance weight
      const scoreB = (b.personalizedScore || 0) * 0.4 + 0.6;
      return scoreB - scoreA;
    });
  }

  private calculatePersonalizationScore(result: SearchResult, query: string): number {
    if (!this.userContext) return 0;

    let score = 0;

    // Community match boost
    if (result.type === 'profile' && result.metadata?.communities) {
      const communityMatches = result.metadata.communities.filter((c: string) => 
        this.userContext!.communities.includes(c)
      ).length;
      score += communityMatches * this.weights.communityMatch;
    }

    // Interest/skill match
    if (result.metadata?.skills || result.metadata?.categories) {
      const userInterests = this.userContext.interests.map(i => i.toLowerCase());
      const resultInterests = [
        ...(result.metadata.skills || []),
        ...(result.metadata.categories || [])
      ].map(i => i.toLowerCase());
      
      const interestMatches = resultInterests.filter(interest => 
        userInterests.some(userInterest => 
          userInterest.includes(interest) || interest.includes(userInterest)
        )
      ).length;
      
      score += interestMatches * this.weights.interestMatch;
    }

    // Location proximity boost
    if (this.userContext.location && result.metadata?.location) {
      const userLocation = this.userContext.location.toLowerCase();
      const resultLocation = result.metadata.location.toLowerCase();
      
      if (resultLocation.includes(userLocation) || userLocation.includes(resultLocation)) {
        score += this.weights.locationMatch;
      }
    }

    // Industry match
    if (this.userContext.industry && result.metadata?.industry) {
      if (this.userContext.industry.toLowerCase() === result.metadata.industry.toLowerCase()) {
        score += this.weights.industryMatch;
      }
    }

    // Connection network boost
    if (result.type === 'profile' && this.userContext.connections.includes(result.id)) {
      score += this.weights.connectionMatch;
    }

    // Recent activity boost
    if (result.created_at) {
      const daysSinceCreated = Math.max(0, 
        (Date.now() - new Date(result.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      const recencyBoost = Math.max(0, 1 - daysSinceCreated / 30); // Decay over 30 days
      score += recencyBoost * this.weights.recentActivity;
    }

    return Math.min(score, 1); // Cap at 1.0
  }

  async generatePersonalizedSuggestions(userId: string, currentQuery?: string): Promise<string[]> {
    if (!this.userContext) {
      await this.initializeUserContext(userId);
    }

    if (!this.userContext) return [];

    const suggestions: string[] = [];

    // Recent searches
    suggestions.push(...this.userContext.recentSearches.slice(0, 3));

    // Interest-based suggestions
    this.userContext.interests.forEach(interest => {
      suggestions.push(`${interest} professionals`);
      suggestions.push(`${interest} events`);
    });

    // Location-based suggestions
    if (this.userContext.location) {
      suggestions.push(`professionals in ${this.userContext.location}`);
      suggestions.push(`events in ${this.userContext.location}`);
    }

    // Community-based suggestions
    if (this.userContext.communities.length > 0) {
      suggestions.push('updates from my communities');
      suggestions.push('events from my communities');
    }

    // Industry-specific suggestions
    if (this.userContext.industry) {
      suggestions.push(`${this.userContext.industry} opportunities`);
      suggestions.push(`${this.userContext.industry} startups`);
    }

    // Remove duplicates and filter by current query if provided
    const uniqueSuggestions = [...new Set(suggestions)];
    
    if (currentQuery) {
      return uniqueSuggestions.filter(s => 
        s.toLowerCase().includes(currentQuery.toLowerCase())
      ).slice(0, 8);
    }

    return uniqueSuggestions.slice(0, 8);
  }

  async saveSearch(userId: string, query: string): Promise<void> {
    try {
      // In a real implementation, you'd save this to a user_searches table
      const recentSearches = await this.getRecentSearches(userId);
      const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      
      // Store in user preferences or dedicated searches table
      await supabase
        .from('profiles')
        .update({ 
          recent_searches: updatedSearches
        })
        .eq('id', userId);

      // Update local context
      if (this.userContext) {
        this.userContext.recentSearches = updatedSearches;
      }
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }

  private async getRecentSearches(userId: string): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('recent_searches')
        .eq('id', userId)
        .single();

      return data?.recent_searches || [];
    } catch (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }
  }

  async getSearchAnalytics(userId: string): Promise<{
    popularTerms: string[];
    searchFrequency: { [key: string]: number };
    noResultsQueries: string[];
  }> {
    try {
      // In a real implementation, you'd have a search_analytics table
      // For now, return mock data based on user context
      return {
        popularTerms: this.userContext?.recentSearches || [],
        searchFrequency: {},
        noResultsQueries: []
      };
    } catch (error) {
      console.error('Error fetching search analytics:', error);
      return {
        popularTerms: [],
        searchFrequency: {},
        noResultsQueries: []
      };
    }
  }

  setPersonalizationWeights(newWeights: Partial<PersonalizationWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  clearUserContext(): void {
    this.userContext = null;
  }
}

// Export singleton instance
export const personalizedSearchService = new PersonalizedSearchService();