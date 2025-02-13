import { useState, useCallback } from 'react';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  value?: number;
  probability?: number;
  metadata?: {
    ai_analysis?: {
      score?: number;
      sentiment?: string;
    };
  };
  updated_at: string;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'John Smith',
      company: 'Tech Solutions Inc',
      email: 'john@techsolutions.com',
      status: 'new',
      value: 50000,
      probability: 75,
      metadata: {
        ai_analysis: {
          score: 85,
          sentiment: 'Positive'
        }
      },
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'Global Industries',
      email: 'sarah@globalind.com',
      status: 'contacted',
      value: 75000,
      probability: 60,
      metadata: {
        ai_analysis: {
          score: 72,
          sentiment: 'Neutral'
        }
      },
      updated_at: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeLead = useCallback(async (lead: Lead) => {
    try {
      setLoading(true);
      // Simulated API call for AI analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedLead = {
        ...lead,
        metadata: {
          ...lead.metadata,
          ai_analysis: {
            score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
            sentiment: Math.random() > 0.5 ? 'Positive' : 'Neutral'
          }
        }
      };

      setLeads(prevLeads => 
        prevLeads.map(l => l.id === lead.id ? updatedLead : l)
      );
    } catch (err) {
      setError('Failed to analyze lead');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateScript = useCallback(async (lead: Lead, type: 'email' | 'call') => {
    try {
      setLoading(true);
      // Simulated API call for script generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would call an AI service to generate a script
    } catch (err) {
      setError('Failed to generate script');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateResponse = useCallback(async (lead: Lead, context: string) => {
    try {
      setLoading(true);
      // Simulated API call for response generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real app, this would call an AI service to generate a response
    } catch (err) {
      setError('Failed to generate response');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    leads,
    loading,
    error,
    analyzeLead,
    generateScript,
    generateResponse
  };
}