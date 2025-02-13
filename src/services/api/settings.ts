import api from './index';

export interface CompanySettings {
  company_name: string;
  company_logo?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  industry?: string;
  description?: string;
}

export const settingsApi = {
  getSettings: async () => {
    const response = await api.get<CompanySettings>('/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<CompanySettings>) => {
    const response = await api.put<CompanySettings>('/settings', settings);
    return response.data;
  },

  updateLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.put('/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};