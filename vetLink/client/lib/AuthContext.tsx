import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8888/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'farmer' | 'veterinarian' | 'cahw' | 'admin';
  locationId?: number;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string, locationId?: number, sector?: string, district?: string, phone?: string, specialization?: string, licenseNumber?: string) => Promise<void>;
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
        // Log status for debugging
        console.log('Login failed with status:', response.status);

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorJson = await response.json();
          throw new Error(errorJson.message || 'Login failed');
        } else {
          const errorText = await response.text();
          throw new Error(errorText || 'Login failed');
        }
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
        const error = await response.text();
        throw new Error(error || 'Failed to send OTP');
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
        const error = await response.text();
        throw new Error(error || 'OTP Verification failed');
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
  ) => {
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
        const error = await response.text();
        throw new Error(error || 'Signup failed');
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

      // Don't auto-login pending users
      // setUser(newUser);
      // setToken(data.token || data.accessToken);
      // localStorage.setItem('vetlink_user', JSON.stringify(newUser));
      // localStorage.setItem('vetlink_token', data.token || data.accessToken);

      // If the backend returns a token, we could theoretically log them in,
      // but for pending status, maybe we want them to go to login page first?
      // Actually, standard flow is auto-login.
      // If we auto-login, they go to dashboard -> hits pending check -> shows pending screen.
      // If we DON'T auto-login, they go to /login -> login -> dashboard -> pending check.
      // The user issue: "when i'm sign up it shows me that there's an error... but works"
      // The error is "Email already exists". This is likely due to double submission which I fixed in Signup.tsx.

      // But "when i logged in with that credentials works properly ... active in users whithin admin dashboard"
      // Wait, if they are active in admin dashboard, that means they are NOT pending?
      // Ah! In `authService.java` (backend), I changed the logic:
      /*
        if (userRole == User.UserRole.FARMER) { active=true; status=ACTIVE; }
        else { active=false; status=PENDING; }
      */

      // So Vets/CAHWs should be PENDING.
      // If Admin sees them as active, maybe the Admin UI is misinterpreting something?
      // In `Users.tsx`:
      /*
       <span className={`... ${user.status === 'ACTIVE' || user.active === true ? 'bg-green...' : ...}`}>
         {user.status ? user.status... : (user.active ? 'ACTIVE' : 'INACTIVE')}
       </span>
      */

      // If `user.status` is "PENDING_VERIFICATION", it should show that.
      // `user.active` is false.

      // The user said "i'm seeing that are active in users whithin admin dashboard".
      // Maybe my previous fetch (active users) was ONLY fetching active users, so pending ones weren't showing up?
      // But now I fixed the fetch to return ALL users.

      // I will proceed with fixing the Signup auto-login anyway to provide a cleaner flow if desired,
      // but the main issue "active in users" might be resolved by the fetch fix I just did (showing ALL users instead of just active, so now we can see pending ones correctly distinugished).

      // Actually, if I remove auto-login, I must update Signup.tsx to NOT redirect to /login immediately but show success message. 
      // Signup.tsx already redirects to /login.
      // If I remove setUser/setToken here, the context won't be updated.
      // Then navigate('/login') happens.
      // This is fine.

      // BUT, let's keep auto-login for better UX, they will just land on "Pending Verification".
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
