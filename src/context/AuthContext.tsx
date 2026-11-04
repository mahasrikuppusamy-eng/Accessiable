import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  login: (email: string, role?: 'user' | 'admin' | 'volunteer') => void;
  logout: () => void;
  switchDemoRole: (role: 'user' | 'admin' | 'guest') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'usr-101',
  name: 'Preethi Raman',
  email: 'preethi@example.com',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  specialNeeds: ['Wheelchair user', 'Prefers step-free entrances'],
};

const DEMO_ADMIN: UserProfile = {
  id: 'adm-001',
  name: 'Officer Rajesh Kumar',
  email: 'rajesh.admin@coimbatore.gov.in',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  specialNeeds: [],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cbe_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USER;
      }
    }
    return DEMO_USER; // Default to demo user for seamless UX
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('cbe_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cbe_user');
    }
  }, [user]);

  const login = (email: string, role: 'user' | 'admin' | 'volunteer' = 'user') => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchDemoRole = (role: 'user' | 'admin' | 'guest') => {
    if (role === 'admin') {
      setUser(DEMO_ADMIN);
    } else if (role === 'user') {
      setUser(DEMO_USER);
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
