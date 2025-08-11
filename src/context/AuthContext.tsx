import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Family, User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [family, setFamily] = useState<Family | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);

  useEffect(() => {
    // Load from localStorage on mount
    const savedFamily = localStorage.getItem('family');
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedMembers = localStorage.getItem('familyMembers');

    if (savedFamily) setFamily(JSON.parse(savedFamily));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken) setToken(savedToken);
    if (savedMembers) setFamilyMembers(JSON.parse(savedMembers));
  }, []);

  const login = (family: Family, members: User[]) => {
    setFamily(family);
    setFamilyMembers(members);
    localStorage.setItem('family', JSON.stringify(family));
    localStorage.setItem('familyMembers', JSON.stringify(members));
  };

  const userLogin = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setFamily(null);
    setUser(null);
    setToken(null);
    setFamilyMembers([]);
    localStorage.removeItem('family');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('familyMembers');
  };

  return (
    <AuthContext.Provider value={{
      family,
      user,
      token,
      familyMembers,
      login,
      userLogin,
      logout
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