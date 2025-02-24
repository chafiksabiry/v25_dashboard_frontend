import api from './index';
import { Lead } from './leads';
import { Agent } from './agents';


export interface Call {
  _id: string;
  agent: Agent;
  lead: Lead;
  phone_number: string;
  direction: "inbound" | "outbound";
  status: "active" | "completed" | "missed" | "failed";
  duration: number;
  recording_url: string;
  notes: string;
  tags: string[];
  quality_score: number;
  ai_call_score: {
    "Agent fluency": {
      score: number; // 0-100 range enforced in logic
      feedback: string;
    };
    "Sentiment analysis": {
      score: number;
      feedback: string;
    };
    "Fraud detection": {
      score: number;
      feedback: string;
    };
    "overall": {
      score: number;
      feedback: string;
    };
  };
  createdAt: string;
  updatedAt: string;

}

export const callsApi = {
  getAll: async () => {
    const response = await api.get<Call[]>('/calls');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Call>(`/calls/${id}`);
    return response.data;
  },

  create: async (data: Partial<Call>) => {
    const response = await api.post('/calls', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Call>) => {
    const response = await api.put(`/calls/${id}`, data);
    return response.data;
  },

  end: async (id: string) => {
    const response = await api.post(`/calls/${id}/end`);
    return response.data;
  },

  addNote: async (id: string, note: string) => {
    const response = await api.post(`/calls/${id}/notes`, { note });
    return response.data;
  },

  updateQualityScore: async (id: string, score: number) => {
    const response = await api.put(`/calls/${id}/quality-score`, { score });
    return response.data;
  }
};