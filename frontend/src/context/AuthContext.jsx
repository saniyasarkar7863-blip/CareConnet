import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { apiRequest } from '../services/api';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Checks current session via /api/auth/me
  const checkAuth = useCallback(async () => {
    try {
      const res = await apiRequest('/auth/me');
      if (res && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setAuthError(null);
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res && res.data) {
      setUser(res.data);
    }
    return res;
  };

  const register = async (data) => {
    setAuthError(null);
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const verifyEmail = async (email, otp) => {
    setAuthError(null);
    return await apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  };

  const resendOtp = async (email) => {
    setAuthError(null);
    return await apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout network errors
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        login,
        register,
        verifyEmail,
        resendOtp,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
