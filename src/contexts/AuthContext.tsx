import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, we'll use a mock user
    const mockUser: User = {
      id: "65d2b8f4e45a3c5a12e8f123", // This matches the static user ID used in the app
      organizationId: "org123",
      name: "Test User",
      email: "test@example.com",
      role: "admin"
    };

    setCurrentUser(mockUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock login - in reality, this would make an API call
      const mockUser: User = {
        id: "65d2b8f4e45a3c5a12e8f123",
        organizationId: "org123",
        name: "Test User",
        email: email,
        role: "admin"
      };
      setCurrentUser(mockUser);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Mock logout - in reality, this would make an API call
      setCurrentUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 