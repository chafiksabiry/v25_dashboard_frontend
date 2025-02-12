import { supabase } from './supabaseClient';

export const integrationHandlers = {
  connect: async (integrationId: string) => {
    const { error } = await supabase
      .from('integrations')
      .update({ status: 'connected' })
      .eq('id', integrationId);

    if (error) throw error;
  },

  disconnect: async (integrationId: string) => {
    const { error } = await supabase
      .from('integrations')
      .update({ status: 'pending' })
      .eq('id', integrationId);

    if (error) throw error;
  },

  configure: async (integrationId: string, config: Record<string, string>) => {
    const { error } = await supabase
      .from('integration_connections')
      .upsert({
        integration_id: integrationId,
        config,
        status: 'active'
      });

    if (error) throw error;
  }
};