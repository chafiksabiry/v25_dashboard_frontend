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
  },
  initiateCall: async (to: string) => {
    const response = await api.post('/api/calls/outgoing', {to});
    console.log("response from iniatitecall",response);
    return response.data;
  },
  trackCallStatus: async (callSid: string) => {
    const response = await api.get(`/api/calls/status/${callSid}`);
    console.log("response from trackCallStatus",response);
    return response.data;
  },
   hangUpCall: async (callSid: string) => {
    const response = await api.post(`/api/calls/hangup/${callSid}`);
    console.log("Response from hangUpCall:", response);
    return response.data;
},
generateTwilioToken: async () => {
  const response = await api.get('/api/calls/token');
  console.log("response for token",response);
  return response.data;
},
saveCallToDB:async (callSid: string, agentId: string, leadId: string) => {
  const response = await api.post('/api/calls/store-call', {
    CallSid: callSid,     // CallSid dans le body
    agentId: agentId,     // agentId dans le body
    leadId: leadId,  });
  console.log("response for getcallDetails from backend",response.data);
  return response.data;
},

};