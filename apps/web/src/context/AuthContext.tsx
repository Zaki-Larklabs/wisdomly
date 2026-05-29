'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  schoolId: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const hydrateSession = async () => {
      const token = localStorage.getItem('wisdomly_token');
      const savedUser = localStorage.getItem('wisdomly_user');
      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Ensure cookies are synced if localStorage exists
        document.cookie = `wisdomly_token=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;
        document.cookie = `wisdomly_role=${userData.role}; path=/; max-age=604800; SameSite=Lax; Secure`;
      }
      setLoading(false);
    };
    hydrateSession();
  }, []);

  const login = async (payload: Record<string, unknown>) => {
    const response = await api.post('/auth/login', payload);
    const { accessToken, user: userData } = response.data.data;

    localStorage.setItem('wisdomly_token', accessToken);
    localStorage.setItem('wisdomly_user', JSON.stringify(userData));
    
    // Set Edge-level readable cookies
    document.cookie = `wisdomly_token=${accessToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
    document.cookie = `wisdomly_role=${userData.role}; path=/; max-age=604800; SameSite=Lax; Secure`;

    setUser(userData);

    // Dynamic Client-Side Role Redirection Matrix
    if (userData.role === 'ADMIN') router.push('/dashboard/admin');
    else if (userData.role === 'TEACHER') router.push('/dashboard/teacher');
    else if (userData.role === 'STUDENT') router.push('/dashboard/student');
    else router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('wisdomly_token');
    localStorage.removeItem('wisdomly_user');
    
    // Delete cookies
    document.cookie = 'wisdomly_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'wisdomly_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be executed within an AuthProvider wrapper');
  return context;
};