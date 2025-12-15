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
  availableFor?: string[];
  industries?: string[];
  interests?: string[];
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
    interestsMatch: number;
    collaborationMatch: number;
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
      culturalMatch: 0,
      interestsMatch: 0,
      collaborationMatch: 0
    };

    // Skills matching (20% weight)
    const skillsWeight = 20;
    maxScore += skillsWeight;
    const skillsScore = this.calculateSkillsMatch(currentUser.skills || [], professional.skills || []);
    details.skillsMatch = skillsScore;
    totalScore += (skillsScore / 100) * skillsWeight;
    if (skillsScore > 40) {
      reasons.push(`${Math.round(skillsScore)}% skills compatibility`);
    }

    // Location proximity (10% weight) - use current_country or current_location field
    const locationWeight = 10;
    maxScore += locationWeight;
    const userLocation = currentUser.current_country || currentUser.current_location || currentUser.location || '';
    const profLocation = professional.current_country || professional.current_location || professional.location || '';
    const locationScore = this.calculateLocationMatch(userLocation, profLocation);
    details.locationMatch = locationScore;
    totalScore += (locationScore / 100) * locationWeight;
    if (locationScore > 50) {
      reasons.push('Same location/region');
    }

    // Profession relevance (15% weight)
    const professionWeight = 15;
    maxScore += professionWeight;
    const professionScore = this.calculateProfessionMatch(currentUser.profession, professional.profession);
    details.professionMatch = professionScore;
    totalScore += (professionScore / 100) * professionWeight;
    if (professionScore > 60) {
      reasons.push('Related profession');
    }

    // Impact areas alignment (10% weight)
    const impactWeight = 10;
    maxScore += impactWeight;
    const impactScore = this.calculateImpactMatch(currentUser.impact_areas || [], professional.impact_areas || []);
    details.impactMatch = impactScore;
    totalScore += (impactScore / 100) * impactWeight;
    if (impactScore > 30) {
      reasons.push('Shared impact focus');
    }

    // Experience level compatibility (5% weight)
    const experienceWeight = 5;
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

    // Interests matching (10% weight)
    const interestsWeight = 10;
    maxScore += interestsWeight;
    const interestsScore = this.calculateInterestsMatch(
      currentUser.interests || currentUser.interest_tags || [],
      professional.interests || professional.interest_tags || []
    );
    details.interestsMatch = interestsScore;
    totalScore += (interestsScore / 100) * interestsWeight;
    if (interestsScore > 40) {
      reasons.push('Shared interests');
    }

    // Collaboration compatibility (15% weight) - matches complementary needs
    const collaborationWeight = 15;
    maxScore += collaborationWeight;
    const collaborationScore = this.calculateCollaborationMatch(
      currentUser.available_for || [],
      professional.available_for || []
    );
    details.collaborationMatch = collaborationScore;
    totalScore += (collaborationScore / 100) * collaborationWeight;
    if (collaborationScore > 60) {
      reasons.push('Complementary collaboration goals');
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

    // Complementary "Open To" matching bonus (hiring <-> job_seeking, investing <-> seeking_investment)
    const userAvailableFor = currentUser.available_for || [];
    const profAvailableFor = professional.available_for || [];

    if ((userAvailableFor.includes('hiring') && profAvailableFor.includes('job_seeking')) ||
        (userAvailableFor.includes('job_seeking') && profAvailableFor.includes('hiring'))) {
      totalScore += 15;
      reasons.push('Career opportunity match');
    }

    if ((userAvailableFor.includes('investing') && profAvailableFor.includes('seeking_investment')) ||
        (userAvailableFor.includes('seeking_investment') && profAvailableFor.includes('investing'))) {
      totalScore += 15;
      reasons.push('Investment opportunity match');
    }

    return {
      professionalId: professional.id,
      score: Math.min(100, (totalScore / maxScore) * 100),
      reasons: reasons.slice(0, 4), // Top 4 reasons
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

  private calculateInterestsMatch(userInterests: string[], profInterests: string[]): number {
    if (!userInterests.length || !profInterests.length) return 20;

    const userInterestsLower = userInterests.map(i => i.toLowerCase());
    const profInterestsLower = profInterests.map(i => i.toLowerCase());

    const commonInterests = userInterestsLower.filter(interest =>
      profInterestsLower.some(pInterest =>
        pInterest.includes(interest) || interest.includes(pInterest)
      )
    );

    return (commonInterests.length / Math.max(userInterestsLower.length, profInterestsLower.length)) * 100;
  }

  private calculateCollaborationMatch(userAvailableFor: string[], profAvailableFor: string[]): number {
    if (!userAvailableFor.length || !profAvailableFor.length) return 30;

    let score = 0;

    // Check for direct matches (both want the same collaboration type)
    const directMatches = userAvailableFor.filter(item => profAvailableFor.includes(item));
    score += (directMatches.length / Math.max(userAvailableFor.length, profAvailableFor.length)) * 50;

    // Check for complementary matches
    const complementaryPairs: [string, string][] = [
      ['hiring', 'job_seeking'],
      ['investing', 'seeking_investment'],
      ['mentoring', 'being_mentored'],
    ];

    for (const [need1, need2] of complementaryPairs) {
      if ((userAvailableFor.includes(need1) && profAvailableFor.includes(need2)) ||
          (userAvailableFor.includes(need2) && profAvailableFor.includes(need1))) {
        score += 25;
      }
    }

    return Math.min(100, score);
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