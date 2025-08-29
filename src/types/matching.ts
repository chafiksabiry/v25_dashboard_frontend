// Types pour l'intégration avec le backend de matching
export interface Rep {
  _id?: string;
  userId: string;
  status: string;
  personalInfo: {
    name: string;
    location: string;
    email: string;
    phone: string;
    languages: Array<{
      language: string;
      proficiency: string;
      _id: string;
    }>;
  };
  professionalSummary: {
    yearsOfExperience: string;
    currentRole: string;
    industries: string[];
    activities: string[];
    keyExpertise: string[];
    notableCompanies: string[];
    profileDescription: string;
  };
  skills: {
    technical: Array<{
      skill: string;
      level: number;
      details: string;
      _id: string;
    }>;
    professional: Array<{
      skill: string;
      level: number;
      details: string;
      _id: string;
    }>;
    soft: Array<{
      skill: string;
      level: number;
      details: string;
      _id: string;
    }>;
  };
  availability: {
    days: string[];
    timeZones: string[];
    flexibility: string[];
    hours: {
      start: string;
      end: string;
    };
  };
}

export interface Gig {
  _id?: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: any[];
  preferredLanguages: any[];
  requiredExperience: number;
  expectedConversionRate: number;
  seniority?: {
    yearsExperience: number;
  };
  targetRegion?: string;
  duration: {
    startDate: string;
    endDate: string;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchingWeights {
  experience: number;
  skills: number;
  industry: number;
  languages: number;
  availability: number;
  timezone: number;
  activities: number;
  region: number;
}

export interface Match {
  agentId: string;
  gigId: string;
  overallScore: number;
  isInvited?: boolean;
  agentInfo?: {
    name: string;
    email: string;
    photo?: string;
    timezone?: {
      timezoneName: string;
      gmtDisplay: string;
      countryName: string;
    };
    languages?: Array<{
      language: string;
      proficiency?: string;
    }>;
  };
  skillsMatch?: {
    score: number;
    details: {
      matchingSkills: Array<{
        skill: string;
        skillName: string;
        type: string;
      }>;
    };
  };
  industryMatch?: {
    score: number;
    details: {
      matchingIndustries: Array<{
        industryName: string;
      }>;
    };
  };
  activityMatch?: {
    score: number;
    details: {
      matchingActivities: Array<{
        activityName: string;
      }>;
    };
  };
  languageMatch?: {
    score: number;
    details: any;
  };
  experienceMatch?: {
    score: number;
    details: {
      agentExperience: number;
      gigRequiredExperience: number;
    };
  };
  availabilityMatch?: {
    score: number;
    details: {
      matchingDays: string[];
    };
  };
  timezoneMatch?: {
    score: number;
    details: any;
  };
  regionMatch?: {
    score: number;
    details: any;
  };
}

export interface MatchResponse {
  totalMatches: number;
  perfectMatches: number;
  partialMatches: number;
  noMatches: number;
  preferedmatches: Match[];
  matches: Match[];
  languageStats?: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
  };
  skillsStats?: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
  };
  industryStats?: {
    perfectMatches: number;
    partialMatches: number;
    neutralMatches: number;
    noMatches: number;
    totalMatches: number;
  };
  activityStats?: {
    perfectMatches: number;
    partialMatches: number;
    neutralMatches: number;
    noMatches: number;
    totalMatches: number;
  };
  experienceStats?: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
  };
  timezoneStats?: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
  };
  regionStats?: {
    perfectMatches: number;
    partialMatches: number;
    noMatches: number;
    totalMatches: number;
  };
}

export interface GigAgentRequest {
  agentId: string;
  gigId: string;
  matchDetails?: Match;
}
