import { ReactNode } from "react";

export interface Rep {
  Deal_Name: ReactNode;
  Modified_Time: string | number | Date;
  Contact_Name: any;
  id: string;
  userId: string;
  status: 'in_progress' | string;
  completionSteps: {
    basicInfo: boolean;
    experience: boolean;
    skills: boolean;
    languages: boolean;
    assessment: boolean;
  };
  personalInfo: {
    name: string;
    location: string;
    email: string;
    phone: string;
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
  };
  professionalSummary: {
    yearsOfExperience: string;
    currentRole: string;
    industries: string[];
    keyExpertise: string[];
    notableCompanies: string[];
    generatedSummary: string;
  };
  skills: {
    technical: Array<{
      skill: string;
      level: number;
    }>;
    professional: Array<{
      skill: string;
      level: number;
    }>;
    soft: Array<{
      skill: string;
      level: number;
    }>;
  };
  achievements: Array<{
    description: string;
    impact: string;
    context: string;
    skills: string[];
  }>;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    achievements: string[];
  }>;
  assessments: {
    contactCenter: Array<{
      category: string;
      skill: string;
      score: number;
      strengths: string[];
      improvements: string[];
      feedback: string;
      tips: string[];
      keyMetrics: {
        professionalism: number;
        effectiveness: number;
        customerFocus: number;
      };
      completedAt: string;
    }>;
  };
  availability: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  timezone: string;
  conversionRate: number;
  reliability: number;
  rating: number;
  completedGigs: number;
  region: string;
  lastUpdated: string;
}

// ... rest of the types ... 