import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/types/search';

export interface MatchingCriteria {
  skills?: string[];
  location?: string;
  profession?: string;
  countryOfOrigin?: string;
  impactAreas?: string[];
  isLookingForMentor?: boolean;
  isLookingForInvestor?: boolean;
  yearsExperienceMin?: number;
  yearsExperienceMax?: number;
}

export interface MatchScore {
  professionalId: string;
  score: number;
  reasons: string[];
  details: {
    skillsMatch: number;
    locationMatch: number;
    professionMatch: number;
    impactMatch: number;
    experienceMatch: number;
    culturalMatch: number;
  };
}

class MatchingService {
  // Advanced AI-powered matching algorithm
  async findMatches(currentUserId: string, criteria: MatchingCriteria): Promise<MatchScore[]> {
    try {
      // Get current user's profile for comparison
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (!currentUser) return [];

      // Get all potential matches
      const { data: professionals } = await supabase
        .rpc('rpc_public_profiles', {
          p_location: criteria.location || null,
          p_profession: criteria.profession || null,
          p_skills: criteria.skills || null,
          p_limit: 100
        });

      if (!professionals) return [];

      // Calculate match scores for each professional
      const matches = professionals
        .filter((prof: any) => prof.id !== currentUserId)
        .map((prof: any) => this.calculateMatchScore(currentUser, prof, criteria))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20); // Return top 20 matches

      return matches;
    } catch (error) {
      console.error('Error finding matches:', error);
      return [];
    }
  }

  private calculateMatchScore(currentUser: any, professional: any, criteria: MatchingCriteria): MatchScore {
    let totalScore = 0;
    let maxScore = 0;
    const reasons: string[] = [];
    const details = {
      skillsMatch: 0,
      locationMatch: 0,
      professionMatch: 0,
      impactMatch: 0,
      experienceMatch: 0,
      culturalMatch: 0
    };

    // Skills matching (25% weight)
    const skillsWeight = 25;
    maxScore += skillsWeight;
    const skillsScore = this.calculateSkillsMatch(currentUser.skills || [], professional.skills || []);
    details.skillsMatch = skillsScore;
    totalScore += (skillsScore / 100) * skillsWeight;
    if (skillsScore > 40) {
      reasons.push(`${Math.round(skillsScore)}% skills compatibility`);
    }

    // Location proximity (15% weight)
    const locationWeight = 15;
    maxScore += locationWeight;
    const locationScore = this.calculateLocationMatch(currentUser.location, professional.location);
    details.locationMatch = locationScore;
    totalScore += (locationScore / 100) * locationWeight;
    if (locationScore > 50) {
      reasons.push('Same location/region');
    }

    // Profession relevance (20% weight)
    const professionWeight = 20;
    maxScore += professionWeight;
    const professionScore = this.calculateProfessionMatch(currentUser.profession, professional.profession);
    details.professionMatch = professionScore;
    totalScore += (professionScore / 100) * professionWeight;
    if (professionScore > 60) {
      reasons.push('Related profession');
    }

    // Impact areas alignment (15% weight)
    const impactWeight = 15;
    maxScore += impactWeight;
    const impactScore = this.calculateImpactMatch(currentUser.impact_areas || [], professional.impact_areas || []);
    details.impactMatch = impactScore;
    totalScore += (impactScore / 100) * impactWeight;
    if (impactScore > 30) {
      reasons.push('Shared impact focus');
    }

    // Experience level compatibility (10% weight)
    const experienceWeight = 10;
    maxScore += experienceWeight;
    const experienceScore = this.calculateExperienceMatch(currentUser.years_experience, professional.years_experience);
    details.experienceMatch = experienceScore;
    totalScore += (experienceScore / 100) * experienceWeight;

    // Cultural background (15% weight)
    const culturalWeight = 15;
    maxScore += culturalWeight;
    const culturalScore = this.calculateCulturalMatch(currentUser.country_of_origin, professional.country_of_origin);
    details.culturalMatch = culturalScore;
    totalScore += (culturalScore / 100) * culturalWeight;
    if (culturalScore > 70) {
      reasons.push('Shared cultural background');
    }

    // Mentor/Investor matching bonus
    if (criteria.isLookingForMentor && professional.is_mentor) {
      totalScore += 10;
      reasons.push('Available for mentoring');
    }
    if (criteria.isLookingForInvestor && professional.is_investor) {
      totalScore += 10;
      reasons.push('Active investor');
    }

    return {
      professionalId: professional.id,
      score: Math.min(100, (totalScore / maxScore) * 100),
      reasons: reasons.slice(0, 3), // Top 3 reasons
      details
    };
  }

  private calculateSkillsMatch(userSkills: string[], profSkills: string[]): number {
    if (!userSkills.length || !profSkills.length) return 0;
    
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const profSkillsLower = profSkills.map(s => s.toLowerCase());
    
    const commonSkills = userSkillsLower.filter(skill => 
      profSkillsLower.some(pSkill => 
        pSkill.includes(skill) || skill.includes(pSkill)
      )
    );
    
    return (commonSkills.length / Math.max(userSkillsLower.length, profSkillsLower.length)) * 100;
  }

  private calculateLocationMatch(userLocation: string, profLocation: string): number {
    if (!userLocation || !profLocation) return 20;
    
    const userLoc = userLocation.toLowerCase();
    const profLoc = profLocation.toLowerCase();
    
    if (userLoc === profLoc) return 100;
    
    // Check for same country/region
    const userParts = userLoc.split(',').map(p => p.trim());
    const profParts = profLoc.split(',').map(p => p.trim());
    
    if (userParts.some(part => profParts.includes(part))) return 70;
    
    return 30;
  }

  private calculateProfessionMatch(userProf: string, profProf: string): number {
    if (!userProf || !profProf) return 30;
    
    const userProfLower = userProf.toLowerCase();
    const profProfLower = profProf.toLowerCase();
    
    if (userProfLower === profProfLower) return 100;
    
    // Check for related professions
    const techFields = ['engineer', 'developer', 'programmer', 'software', 'tech', 'data', 'ai', 'ml'];
    const businessFields = ['manager', 'consultant', 'analyst', 'business', 'marketing', 'sales'];
    const financeFields = ['finance', 'investment', 'banking', 'financial', 'accounting'];
    
    const isUserTech = techFields.some(field => userProfLower.includes(field));
    const isProfTech = techFields.some(field => profProfLower.includes(field));
    
    const isUserBusiness = businessFields.some(field => userProfLower.includes(field));
    const isProfBusiness = businessFields.some(field => profProfLower.includes(field));
    
    const isUserFinance = financeFields.some(field => userProfLower.includes(field));
    const isProfFinance = financeFields.some(field => profProfLower.includes(field));
    
    if ((isUserTech && isProfTech) || (isUserBusiness && isProfBusiness) || (isUserFinance && isProfFinance)) {
      return 70;
    }
    
    return 40;
  }

  private calculateImpactMatch(userImpact: string[], profImpact: string[]): number {
    if (!userImpact.length || !profImpact.length) return 20;
    
    const userImpactLower = userImpact.map(i => i.toLowerCase());
    const profImpactLower = profImpact.map(i => i.toLowerCase());
    
    const commonImpact = userImpactLower.filter(impact => 
      profImpactLower.some(pImpact => 
        pImpact.includes(impact) || impact.includes(pImpact)
      )
    );
    
    return (commonImpact.length / Math.max(userImpactLower.length, profImpactLower.length)) * 100;
  }

  private calculateExperienceMatch(userExp: number, profExp: number): number {
    if (!userExp || !profExp) return 50;
    
    const diff = Math.abs(userExp - profExp);
    
    if (diff <= 2) return 100;
    if (diff <= 5) return 80;
    if (diff <= 10) return 60;
    
    return 40;
  }

  private calculateCulturalMatch(userCountry: string, profCountry: string): number {
    if (!userCountry || !profCountry) return 30;
    
    if (userCountry.toLowerCase() === profCountry.toLowerCase()) return 100;
    
    // African countries get higher match scores
    const africanCountries = [
      'nigeria', 'kenya', 'south africa', 'ghana', 'ethiopia', 'uganda', 'tanzania',
      'morocco', 'algeria', 'egypt', 'cameroon', 'ivory coast', 'senegal', 'zambia',
      'zimbabwe', 'botswana', 'namibia', 'rwanda', 'mali', 'burkina faso'
    ];
    
    const userIsAfrican = africanCountries.some(country => 
      userCountry.toLowerCase().includes(country)
    );
    const profIsAfrican = africanCountries.some(country => 
      profCountry.toLowerCase().includes(country)
    );
    
    if (userIsAfrican && profIsAfrican) return 80;
    
    return 50;
  }

  // Get recommended connections based on user activity
  async getSmartRecommendations(userId: string): Promise<Professional[]> {
    try {
      const criteria: MatchingCriteria = {
        isLookingForMentor: true,
        isLookingForInvestor: true
      };

      const matches = await this.findMatches(userId, criteria);
      
      // Get full profile data for top matches
      const topMatchIds = matches.slice(0, 10).map(m => m.professionalId);
      
      const { data: profiles } = await supabase
        .rpc('rpc_public_profiles', { p_limit: 50 });

      if (!profiles) return [];

      // Map to Professional type with required fields
      return profiles
        .filter((p: any) => topMatchIds.includes(p.id))
        .map((p: any): Professional => ({
          id: p.id,
          username: p.username,
          full_name: p.full_name,
          headline: p.headline,
          profession: p.profession,
          company: p.company,
          location: p.location,
          country_of_origin: p.country_of_origin,
          expertise: p.skills,
          bio: p.bio,
          years_experience: p.years_experience,
          education: p.education,
          languages: p.languages,
          availability_for: p.available_for,
          linkedin_url: p.linkedin_url,
          website_url: p.website_url,
          avatar_url: p.avatar_url,
          skills: p.skills,
          impact_areas: p.impact_areas,
          is_mentor: p.is_mentor || false,
          is_investor: p.is_investor || false,
          looking_for_opportunities: p.looking_for_opportunities || false,
          created_at: p.created_at,
          updated_at: p.updated_at || p.created_at
        }));
    } catch (error) {
      console.error('Error getting smart recommendations:', error);
      return [];
    }
  }
}

export const matchingService = new MatchingService();