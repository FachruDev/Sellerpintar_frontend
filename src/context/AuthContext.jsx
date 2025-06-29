'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, userAPI } from '@/lib/api';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

// Buat konteks autentikasi
const AuthContext = createContext({});

// Custom hook untuk menggunakan konteks autentikasi
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Cek apakah user sudah login pada mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        setLoading(true);
        const token = getCookie('token');
        
        if (token) {
          // Ambil data user jika token ada
          const userData = await userAPI.getProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Hapus token yang ga valid
        deleteCookie('token');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Buat user baru
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      // Simpan token di cookie dan localStorage
      setCookie('token', response.token, { maxAge: 60 * 60 * 24 * 7 }); // 7 hari
      localStorage.setItem('token', response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      
      // Simpan token di cookie dan localStorage
      setCookie('token', response.token, { maxAge: 60 * 60 * 24 * 7 }); // 7 hari
      localStorage.setItem('token', response.token);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    deleteCookie('token');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // Update data user
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.updateProfile(userData);
      
      // Update data user
      setUser(prev => ({ ...prev, ...response.user }));
      
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  //  Konteks autentikasi
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 