import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from './apiConfig';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'farmer' | 'veterinarian' | 'cahw' | 'admin';
  locationId?: number;
  status?: string;
}

export interface SignupResult {
  requiresApproval: boolean;
  message: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string, locationId?: number, sector?: string, district?: string, phone?: string, specialization?: string, licenseNumber?: string) => Promise<SignupResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function readErrorMessage(response: Response, fallback: string) {
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const errorJson = await response.json();
      return errorJson.message || fallback;
    }

    const errorText = await response.text();
    return errorText || fallback;
  } catch {
    return fallback;
  }
}

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
        console.log('Login failed with status:', response.status);
        throw new Error(await readErrorMessage(response, 'Login failed'));
      }

      const data = await response.json();
      const newUser: User = {
        id: Number(data.userId || data.id),
        name: data.name || email.split('@')[0],
        email: data.email || email,
        role: (data.role || role) as any,
        locationId: data.locationId,
        status: data.status,
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

  const loginWithPhone = async (phone: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to send OTP'));
      }
    } catch (error) {
      console.error('OTP Send error:', error);
      throw error;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, otp }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'OTP Verification failed'));
      }

      const data = await response.json();
      const newUser: User = {
        id: Number(data.userId || data.id),
        name: data.name || phone || 'User',
        email: data.email || phone,
        role: (data.role || 'farmer') as any,
        locationId: data.locationId,
        status: data.status,
      };

      setUser(newUser);
      setToken(data.token || data.accessToken);
      localStorage.setItem('vetlink_user', JSON.stringify(newUser));
      localStorage.setItem('vetlink_token', data.token || data.accessToken);
    } catch (error) {
      console.error('OTP Verify error:', error);
      throw error;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string,
    locationId?: number,
    sector?: string,
    district?: string,
    phone?: string,
    specialization?: string,
    licenseNumber?: string
  ): Promise<SignupResult> => {
    try {
      const signupData: any = { name, email, password, role, locationId };
      if (sector) signupData.sector = sector;
      if (district) signupData.district = district;
      if (phone) signupData.phone = phone;
      if (specialization) signupData.specialization = specialization;
      if (licenseNumber) signupData.licenseNumber = licenseNumber;

      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Signup failed'));
      }

      const data = await response.json();
      const newUser: User = {
        id: Number(data.userId || data.id),
        name: data.name || name,
        email: data.email || email,
        role: (data.role || role) as any,
        locationId: data.locationId || locationId,
        status: data.status || 'PENDING_VERIFICATION',
      };
      const receivedToken = data.token || data.accessToken;
      const requiresApproval = Boolean(data.requiresApproval || !receivedToken);
      const message = data.message || (requiresApproval
        ? 'Your account request has been received. Please wait for approval by the administrator. You will receive an email once your account is approved.'
        : 'Account created successfully!');

      if (!requiresApproval && receivedToken) {
        setUser(newUser);
        setToken(receivedToken);
        localStorage.setItem('vetlink_user', JSON.stringify(newUser));
        localStorage.setItem('vetlink_token', receivedToken);
      }

      return { requiresApproval, message };
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
        loginWithPhone,
        verifyOtp,
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
