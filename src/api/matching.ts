import { Rep, Gig, Match, MatchResponse, MatchingWeights, GigAgentRequest } from '../types/matching';

// URLs des APIs - utilise les mêmes que le projet matching
const MATCHING_API_URL = import.meta.env.VITE_MATCHING_API_URL || 'http://localhost:5011/api';
const GIGS_API_URL = import.meta.env.VITE_API_URL_GIGS || 'http://localhost:5012/api';

// ===== REPS API =====
export const getReps = async (): Promise<Rep[]> => {
  console.log('getReps called');
  try {
    const response = await fetch(`${MATCHING_API_URL}/reps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch reps');
    }

    const data = await response.json();
    console.log('Parsed getReps response:', data);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array of reps');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getReps:', error);
    throw error;
  }
};

// ===== GIGS API =====
export const getGigs = async (): Promise<Gig[]> => {
  console.log('getGigs called');
  try {
    const response = await fetch(`${MATCHING_API_URL}/gigs`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch gigs');
    }
    
    const data = await response.json();
    console.log('Parsed getGigs response:', data);
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array of gigs');
    }
    
    return data;
  } catch (error) {
    console.error('Error in getGigs:', error);
    throw error;
  }
};

export const getGigsByCompanyId = async (companyId: string): Promise<Gig[]> => {
  console.log('getGigsByCompanyId called with:', companyId);
  try {
    const response = await fetch(`${GIGS_API_URL}/gigs/company/${companyId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch gigs by company');
    }
    
    const result = await response.json();
    console.log('Parsed getGigsByCompanyId response:', result);
    
    return result.data || [];
  } catch (error) {
    console.error('Error in getGigsByCompanyId:', error);
    throw error;
  }
};

// ===== MATCHING API =====
export const findMatchesForGig = async (gigId: string, weights: MatchingWeights): Promise<MatchResponse> => {
  console.log('findMatchesForGig called with:', { gigId, weights });
  try {
    const response = await fetch(`${MATCHING_API_URL}/matches/gig/${gigId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weights }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to find matches for gig');
    }
    
    const data = await response.json();
    console.log('Parsed findMatchesForGig response:', data);
    
    // Vérifier la structure de la réponse
    if (data.preferedmatches) {
      return data as MatchResponse;
    } else {
      // Fallback pour l'ancienne structure
      return {
        totalMatches: data.matches?.length || 0,
        perfectMatches: 0,
        partialMatches: 0,
        noMatches: 0,
        preferedmatches: data.matches || [],
        matches: data.matches || []
      } as MatchResponse;
    }
  } catch (error) {
    console.error('Error in findMatchesForGig:', error);
    throw error;
  }
};

export const findGigsForRep = async (agentId: string, weights: MatchingWeights): Promise<{ matches: Match[] }> => {
  console.log('findGigsForRep called with:', { agentId, weights });
  try {
    const response = await fetch(`${MATCHING_API_URL}/matches/agent/${agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weights }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to find gigs for rep');
    }
    
    const data = await response.json();
    console.log('Parsed findGigsForRep response:', data);
    
    return {
      matches: data.matches || []
    };
  } catch (error) {
    console.error('Error in findGigsForRep:', error);
    throw error;
  }
};

export const generateOptimalMatches = async (weights: MatchingWeights): Promise<{ matches: Match[] }> => {
  console.log('generateOptimalMatches called with weights:', weights);
  try {
    const response = await fetch(`${MATCHING_API_URL}/matches/optimal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ weights }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate optimal matches');
    }
    
    const data = await response.json();
    console.log('Parsed generateOptimalMatches response:', data);
    
    return {
      matches: data.matches || []
    };
  } catch (error) {
    console.error('Error in generateOptimalMatches:', error);
    throw error;
  }
};

// ===== GIG-AGENT API =====
export const createGigAgent = async (request: GigAgentRequest) => {
  console.log('createGigAgent called with:', request);
  try {
    const response = await fetch(`${MATCHING_API_URL}/gig-agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create gig-agent');
    }
    
    const data = await response.json();
    console.log('Parsed createGigAgent response:', data);
    
    return data;
  } catch (error) {
    console.error('Error in createGigAgent:', error);
    throw error;
  }
};

export const getGigAgentsForGig = async (gigId: string): Promise<any[]> => {
  console.log('getGigAgentsForGig called with:', gigId);
  try {
    const response = await fetch(`${MATCHING_API_URL}/gig-agents/gig/${gigId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch gig agents');
    }
    
    const data = await response.json();
    console.log('Parsed getGigAgentsForGig response:', data);
    
    return data || [];
  } catch (error) {
    console.error('Error in getGigAgentsForGig:', error);
    throw error;
  }
};

// ===== SKILLS & LANGUAGES API =====
export interface Skill {
  _id: string;
  name: string;
  category?: string;
}

export interface Language {
  _id: string;
  name: string;
  code: string;
}

export const getAllSkills = async (): Promise<{
  professional: Skill[];
  technical: Skill[];
  soft: Skill[];
}> => {
  console.log('getAllSkills called');
  try {
    const response = await fetch(`${MATCHING_API_URL}/skills`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }
    
    const data = await response.json();
    console.log('Parsed getAllSkills response:', data);
    
    return {
      professional: data.professional || [],
      technical: data.technical || [],
      soft: data.soft || []
    };
  } catch (error) {
    console.error('Error in getAllSkills:', error);
    return {
      professional: [],
      technical: [],
      soft: []
    };
  }
};

export const getLanguages = async (): Promise<Language[]> => {
  console.log('getLanguages called');
  try {
    const response = await fetch(`${MATCHING_API_URL}/languages`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch languages');
    }
    
    const data = await response.json();
    console.log('Parsed getLanguages response:', data);
    
    return data || [];
  } catch (error) {
    console.error('Error in getLanguages:', error);
    return [];
  }
};
