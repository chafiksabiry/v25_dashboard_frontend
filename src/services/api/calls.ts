import api from './index';

export interface Call {
  id: string;
  agent_id: string;
  customer_id?: string;
  phone_number: string;
  direction: 'inbound' | 'outbound';
  status: 'active' | 'completed' | 'missed' | 'failed';
  duration: number;
  recording_url?: string;
  notes?: string;
  tags?: string[];
  quality_score?: number;
  created_at: string;
  updated_at: string;
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