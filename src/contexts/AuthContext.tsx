import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  accessTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  userToken: UserConfig | null;
  setUserToken: (token: UserConfig | null) => void;
  getValidAccessToken: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<UserConfig | null>(() => {
    // Initialize from localStorage
    const savedConfig = localStorage.getItem('user_config');
    return savedConfig ? JSON.parse(savedConfig) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update localStorage when token changes
  useEffect(() => {
    if (userToken) {
      localStorage.setItem('user_config', JSON.stringify(userToken));
    } else {
      localStorage.removeItem('user_config');
    }
  }, [userToken]);

  const refreshAccessToken = async (config: UserConfig): Promise<{ accessToken: string, expiresIn: number } | null> => {
    try {
      const response = await fetch('http://localhost:5005/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          refreshToken: config.refreshToken
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh access token');
      return null;
    }
  };

  const getValidAccessToken = async (): Promise<string | null> => {
    if (!userToken) return null;

    try {
      setIsLoading(true);
      setError(null);

      // Check if current access token is still valid
      if (userToken.accessToken && userToken.accessTokenExpiry) {
        const now = new Date();
        if (new Date(userToken.accessTokenExpiry) > now) {
          return userToken.accessToken;
        }
      }

      // If not valid, refresh the token
      const refreshResult = await refreshAccessToken(userToken);
      if (refreshResult) {
        const newExpiry = new Date();
        newExpiry.setSeconds(newExpiry.getSeconds() + refreshResult.expiresIn);

        const updatedConfig = {
          ...userToken,
          accessToken: refreshResult.accessToken,
          accessTokenExpiry: newExpiry,
          updatedAt: new Date()
        };
        setUserToken(updatedConfig);
        return refreshResult.accessToken;
      }

      return null;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get valid access token');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, setUserToken, getValidAccessToken, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 