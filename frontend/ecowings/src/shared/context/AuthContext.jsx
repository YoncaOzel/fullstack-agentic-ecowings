import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../domains/auth/services/authService';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [jwToken, setJwToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndMergeProfile = async () => {
    try {
      const res = await apiClient.get('/api/User/me');
      if (res.data?.email || res.data?.id) {
        setUser(prev => {
          const merged = { ...prev, ...res.data };
          localStorage.setItem('user', JSON.stringify(merged));
          return merged;
        });
      }
    } catch {
      // profil yüklenemedi, mevcut user ile devam et
    }
  };

  // Sayfa yenilenince localStorage'dan yükle
  useEffect(() => {
    const storedToken = localStorage.getItem('jwToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setJwToken(storedToken);
        setRefreshToken(storedRefresh);
        setRoles(parsedUser.roles || []);
      } catch {
        // geçersiz veri
      }
    }
    setIsLoading(false);
  }, []);

  // Token gelince profil detaylarını çek (firstName/lastName için)
  useEffect(() => {
    if (jwToken) fetchAndMergeProfile();
  }, [jwToken]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    // Backend doğrudan AuthenticationResponse döndürür (succeeded/data sarması yok)
    const data = res.data;
    if (data?.jwToken) {
      localStorage.setItem('jwToken', data.jwToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setJwToken(data.jwToken);
      setRefreshToken(data.refreshToken || null);
      setRoles(data.roles || []);
      return { success: true, roles: data.roles || [] };
    }
    return { success: false, message: res.data?.message || 'Giriş başarısız. E-posta veya şifrenizi kontrol edin.', errors: res.data?.errors };
  };

  const register = async (formData) => {
    try {
      const res = await authService.register(formData);
      return { succeeded: true, message: res.data };
    } catch (err) {
      const data = err.response?.data || {};
      return {
        succeeded: false,
        message: data.Message || data.message || 'Registration failed. Please try again.',
        errors: data.Errors || data.errors || [],
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('jwToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setJwToken(null);
    setRefreshToken(null);
    setRoles([]);
  };

  const updateUser = (patch) => {
    setUser(prev => {
      const merged = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const isAuthenticated = !!jwToken;
  const isAdmin = roles.some(r => r === 'Admin' || r === 'SuperAdmin');

  return (
    <AuthContext.Provider value={{ user, jwToken, refreshToken, roles, isLoading, isAuthenticated, isAdmin, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
