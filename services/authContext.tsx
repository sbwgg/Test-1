import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState, UserRole } from '../types';
import { db } from './db';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('streamai_user');
      const token = localStorage.getItem('streamai_token');
      
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password || 'password' })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('streamai_token', data.token);
    localStorage.setItem('streamai_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (email: string, name: string, password?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password: password || 'password' })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    localStorage.setItem('streamai_token', data.token);
    localStorage.setItem('streamai_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const updateProfile = async (data: Partial<User> & { password?: string }) => {
    const result = await db.updateProfile(data);
    // Update local storage and state with new token and user data
    localStorage.setItem('streamai_token', result.token);
    localStorage.setItem('streamai_user', JSON.stringify(result.user));
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem('streamai_token');
    localStorage.removeItem('streamai_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};