// Service pour gérer les intégrations Zoho à travers l'application

// Configuration de l'URL de base depuis les variables d'environnement
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Classe singleton pour gérer la configuration Zoho
class ZohoService {
  private static instance: ZohoService;
  private config: {
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiry: number | null;
    isConfigured: boolean;
  } = {
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
    isConfigured: false
  };

  private constructor() {
    // Initialisation silencieuse
    this.initializeFromServer().catch(error => {
      console.debug('ZohoService: Initial configuration not found', error);
    });
  }

  public static getInstance(): ZohoService {
    if (!ZohoService.instance) {
      ZohoService.instance = new ZohoService();
    }
    return ZohoService.instance;
  }

  private async initializeFromServer() {
    try {
      // Récupérer le userId depuis localStorage ou cookies
      const userId = localStorage.getItem('userId') || this.getUserIdFromCookies();
      if (!userId) {
        console.debug('ZohoService: No userId found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/zoho/config/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const config = await response.json();
        this.config.accessToken = config.access_token;
        this.config.refreshToken = config.refresh_token;
        this.config.tokenExpiry = Date.now() + (config.expires_in * 1000);
        this.config.isConfigured = true;
        console.debug('ZohoService: Configuration loaded successfully from database');
      } else if (response.status === 404) {
        console.debug('ZohoService: No configuration found in database for user');
        this.config.isConfigured = false;
      } else {
        console.debug('ZohoService: Failed to load configuration', response.status);
      }
    } catch (error) {
      console.debug('ZohoService: Error initializing from server', error);
    }
  }

  private getUserIdFromCookies(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'userId') {
        return value;
      }
    }
    return null;
  }

  public async refreshToken() {
    try {
      const userId = localStorage.getItem('userId') || this.getUserIdFromCookies();
      if (!userId) {
        console.debug('ZohoService: No userId found for token refresh');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/zoho/config/user/${userId}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.config.accessToken = data.access_token;
        this.config.refreshToken = data.refresh_token;
        this.config.tokenExpiry = Date.now() + (data.expires_in * 1000);
        console.debug('ZohoService: Token refreshed successfully');
        return true;
      } else {
        console.debug('ZohoService: Failed to refresh token', response.status);
        return false;
      }
    } catch (error) {
      console.debug('ZohoService: Error refreshing token', error);
      return false;
    }
  }

  public async checkConfiguration(): Promise<boolean> {
    await this.initializeFromServer();
    return this.config.isConfigured;
  }

  public isConfigured(): boolean {
    return this.config.isConfigured;
  }

  public getAccessToken(): string | null {
    return this.config.accessToken;
  }

  public async getValidAccessToken(): Promise<string | null> {
    try {
      if (!this.config.accessToken || !this.config.tokenExpiry || Date.now() >= this.config.tokenExpiry) {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          console.debug('ZohoService: Failed to get valid access token');
          return null;
        }
      }
      return this.config.accessToken;
    } catch (error) {
      console.debug('ZohoService: Error getting valid access token', error);
      return null;
    }
  }

  public resetConfiguration(): void {
    this.config = {
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      isConfigured: false
    };
    console.debug('ZohoService: Configuration reset');
  }
}

// Créer le service global pour gérer le token Zoho (compatibilité avec l'ancien code)
export const ZohoTokenService = {
  getToken: (): string | null => {
    const service = ZohoService.getInstance();
    return service.getAccessToken();
  },
  
  setToken: (token: string): void => {
    // Deprecated - maintenant géré par la base de données
    console.warn('ZohoTokenService.setToken is deprecated. Use database configuration instead.');
  },
  
  removeToken: (): void => {
    const service = ZohoService.getInstance();
    service.resetConfiguration();
  },
  
  isTokenValid: async (): Promise<boolean> => {
    const service = ZohoService.getInstance();
    return await service.checkConfiguration();
  }
};

// Vérifier si l'utilisateur est connecté à Zoho (vérifie dans la base de données)
export const isConnectedToZoho = async (): Promise<boolean> => {
  const service = ZohoService.getInstance();
  return await service.checkConfiguration();
};

// Vérifier la validité du token Zoho
export const checkZohoTokenValidity = async (): Promise<boolean> => {
  return await ZohoTokenService.isTokenValid();
};

// Exporter le service singleton
export default ZohoService;

// Fonction générique pour les appels API à Zoho
export const zohoApiCall = async <T,>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const token = ZohoTokenService.getToken();
    if (!token) {
      return {
        success: false,
        error: 'Zoho token not found. Please connect to Zoho first.'
      };
    }

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || 'Failed to make Zoho API call',
        data: responseData
      };
    }

    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// API spécifiques pour SalesInbox
export const getSalesInboxMessages = async (): Promise<any> => {
  return zohoApiCall<any>('salesinbox/messages');
};

export const sendSalesInboxMessage = async (message: any): Promise<any> => {
  return zohoApiCall<any>('salesinbox/send', 'POST', message);
};

export const getSalesInboxContacts = async (): Promise<any> => {
  return zohoApiCall<any>('salesinbox/contacts');
};

export const getSalesInboxChannels = async (): Promise<any> => {
  return zohoApiCall<any>('salesinbox/channels');
};

// API spécifiques pour CRM
export const getCRMContacts = async (): Promise<any> => {
  return zohoApiCall<any>('crm/contacts');
};

export const getCRMLeads = async (): Promise<any> => {
  return zohoApiCall<any>('crm/leads');
};

export const getCRMDeals = async (): Promise<any> => {
  return zohoApiCall<any>('crm/deals');
};

// Ajout des nouvelles fonctions pour configurer Zoho
export const configureZoho = async (config: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/configure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    const data = await response.json();
    if (data.success && data.accessToken) {
      ZohoTokenService.setToken(data.accessToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Configuration error:', error);
    return false;
  }
};

// Mise à jour de la fonction de déconnexion
export const disconnectZoho = async (): Promise<boolean> => {
  try {
    const token = ZohoTokenService.getToken();
    if (!token) return true;

    const response = await fetch(`${API_BASE_URL}/disconnect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      ZohoTokenService.removeToken();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Disconnect error:', error);
    return false;
  }
}; 