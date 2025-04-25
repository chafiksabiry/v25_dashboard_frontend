import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
  currentUser: { id: string } | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set current user based on userId cookie
  useEffect(() => {
    const userId = import.meta.env.VITE_ENV === 'test' 
      ? '6807abfc2c1ca099fe2b13c5'
      : Cookies.get('userId');
    console.log('Stored userId:', userId);
    
    if (userId) {
      setCurrentUser({ id: userId });
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      currentUser,
      loading,
      error
    }}>
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