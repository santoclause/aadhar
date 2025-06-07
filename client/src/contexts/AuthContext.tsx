import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Admin } from '../../shared/types';

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  userType: 'voter' | 'admin' | null;
  login: (credentials: any, type: 'voter' | 'admin') => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const userType = user ? 'voter' : admin ? 'admin' : null;
  const isAuthenticated = !!(user || admin);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      if (data.success && data.data.authenticated) {
        if (data.data.userType === 'voter') {
          setUser(data.data.user);
        } else if (data.data.userType === 'admin') {
          setAdmin(data.data.admin);
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any, type: 'voter' | 'admin'): Promise<boolean> => {
    try {
      const endpoint = type === 'voter' ? '/api/auth/verify-aadhar' : '/api/auth/admin-login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        if (type === 'voter') {
          setUser(data.data.user);
        } else {
          setAdmin(data.data.admin);
        }
        return true;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      admin,
      isAuthenticated,
      userType,
      login,
      logout,
      loading,
    }}>
      {children}
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