import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'veterinarian' | 'cahw' | 'admin';
  locationId?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('vetlink_user');
    const storedToken = localStorage.getItem('vetlink_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const newUser: User = {
        id: data.userId || data.id || Math.random().toString(36).substr(2, 9),
        name: data.name || email.split('@')[0],
        email: data.email || email,
        role: (data.role || role) as any,
        locationId: data.locationId,
      };

      setUser(newUser);
      setToken(data.token || data.accessToken);
      localStorage.setItem('vetlink_user', JSON.stringify(newUser));
      localStorage.setItem('vetlink_token', data.token || data.accessToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Signup failed');
      }

      const data = await response.json();
      const newUser: User = {
        id: data.userId || data.id || Math.random().toString(36).substr(2, 9),
        name: data.name || name,
        email: data.email || email,
        role: (data.role || role) as any,
        locationId: data.locationId,
      };

      setUser(newUser);
      setToken(data.token || data.accessToken);
      localStorage.setItem('vetlink_user', JSON.stringify(newUser));
      localStorage.setItem('vetlink_token', data.token || data.accessToken);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vetlink_user');
    localStorage.removeItem('vetlink_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
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
