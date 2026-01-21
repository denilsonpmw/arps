import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('@arps:token');
    const storedUser = localStorage.getItem('@arps:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Verificar se o token ainda é válido
      axios
        .get(`${API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((response) => {
          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;
        
        setToken(newToken);
        setUser(newUser);
        
        localStorage.setItem('@arps:token', newToken);
        localStorage.setItem('@arps:user', JSON.stringify(newUser));
      } else {
        throw new Error(response.data.error?.message || 'Erro ao fazer login');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Erro ao fazer login');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('@arps:token');
    localStorage.removeItem('@arps:user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
